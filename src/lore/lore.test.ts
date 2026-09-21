import source from '../../nodi-brand-lore-content-pack-v1.json';
import { brand, openingCards, eligibleCards, approvedCard, cardReviewText, reaction, zones, zoneForLevel, currentZone, prototypeLoreAvailable, type LoreCard, type ReactionKind } from './content';
import { initialLore, localDate, openingVisit, saveCard, claimZone, decodeLore, loreConfig } from './model';
import { createLoreStore } from './store';
import { createGameplayReactionGate } from './reactions';
import { findPuzzle } from '../game/content';
import { startPuzzle, selectCard, submitSelection, applyHint } from '../game/engine/engine';
import { checkCountdown, continueCountdown } from '../game/engine/countdown';
jest.mock('@react-native-async-storage/async-storage',()=>({__esModule:true,default:{getItem:jest.fn(),setItem:jest.fn()}}));
const pool=eligibleCards('fr','tester');const day=new Date(2026,8,21,9);
test('canonical brand and all source text/fact-check flags remain intact',()=>{
 expect(brand).toMatchObject({publicName:'NODI',machineName:'N.O.D.I.',machineExpansion:'Neural Observation of Distant Ideas',taglineFr:'Tout est lié.',centralBelief:'Aucune idée n’existe seule.'});
 expect(openingCards.map(({locale:_,...card})=>card)).toEqual(source.openingCards);
 expect(openingCards.filter(c=>c.factCheckRequired)).toHaveLength(30);
 expect(new Set(openingCards.map(c=>c.id)).size).toBe(50);
});
test('prototype only uses 20 fictional cards; all current cards are unavailable in production',()=>{
 expect(pool).toHaveLength(20);expect(pool.every(c=>!c.factCheckRequired&&c.status==='draft')).toBe(true);
 expect(eligibleCards('fr','production')).toEqual([]);expect(eligibleCards('en','tester')).toEqual([]);expect(eligibleCards('es','development')).toEqual([]);
});
test('changing factual status alone cannot approve content; verification must cover exact text',()=>{
 const card:LoreCard={...openingCards[0],status:'approved'};expect(approvedCard(card)).toBe(false);
 card.review={reviewer:'Editor',reviewedAt:'2026-09-21T00:00:00Z',factChecked:false,approvedText:cardReviewText(card)};
 expect(approvedCard(card)).toBe(false);card.review.factChecked=true;expect(eligibleCards('fr','production',[card])).toEqual([card]);
 expect(approvedCard({...card,body:card.body+' edited'})).toBe(false);
});
test('opening ritual uses local calendar date, not a UTC day',()=>{
 const nearMidnight=new Date(2026,8,21,0,1);expect(localDate(nearMidnight)).toBe('2026-09-21');
 expect(openingVisit(initialLore(),nearMidnight,pool).state.lastShownLocalDate).toBe('2026-09-21');
});
test('one opening per local day, including same-day ordinary reopen',()=>{
 const first=openingVisit(initialLore(),day,pool);expect(first.card).toBeDefined();
 expect(openingVisit(first.state,new Date(2026,8,21,23,59),pool).card).toBeUndefined();
});
test('daily selection is deterministic and avoids yesterday when possible',()=>{
 const a=openingVisit(initialLore(),day,pool);expect(openingVisit(initialLore(),day,pool).card).toEqual(a.card);
 const b=openingVisit(a.state,new Date(2026,8,22,9),pool);expect(b.card).toBeDefined();expect(b.card?.id).not.toBe(a.card?.id);
});
test('empty/single card pools and calendar rollback behave safely',()=>{
 expect(openingVisit(initialLore(),day,[]).card).toBeUndefined();
 const a=openingVisit(initialLore(),day,[pool[0]]);expect(openingVisit(a.state,new Date(2026,8,22),[pool[0]]).card).toEqual(pool[0]);
 expect(openingVisit(a.state,new Date(2026,8,20),pool).card).toBeUndefined();
});
test('saved cards are idempotent, immutable, removable and survive decoding',()=>{
 const initial=initialLore();const once=saveCard(initial,pool[0].id,true);const twice=saveCard(once,pool[0].id,true);
 expect(twice.savedLoreCardIds).toEqual([pool[0].id]);expect(initial.savedLoreCardIds).toEqual([]);
 expect(decodeLore(JSON.stringify(twice))).toEqual(twice);expect(saveCard(twice,pool[0].id,false).savedLoreCardIds).toEqual([]);
});
test.each([[1,10,'Le Bureau'],[11,35,'Les Rayonnages'],[36,60,'Les Archives'],[61,80,'Le Cabinet des Curiosités'],[81,100,'La Réserve']] as const)('zone %i–%i maps to %s', (first,last,name)=>{
 expect(zoneForLevel(first)?.name).toBe(name);expect(zoneForLevel(last)?.name).toBe(name);
 const authored=source.zones.find(z=>z.name===name)!;expect(zoneForLevel(first)).toMatchObject({purpose:authored.purpose,entryLine:authored.entryLine,visualSeeds:authored.visualSeeds});
});
test('10 → 11 changes zone and introduces Rayonnages at most once',()=>{
 const bureau=claimZone(initialLore(),10,35,zones);expect(bureau.zone?.name).toBe('Le Bureau');
 const shelves=claimZone(bureau.state,11,35,zones);expect(shelves.zone?.name).toBe('Les Rayonnages');expect(claimZone(shelves.state,11,35,zones).zone).toBeUndefined();
 expect(currentZone(36,35)?.name).toBe('Les Rayonnages');
});
test('migrated tester gets only current zone, with no backlog',()=>{
 const r=claimZone(initialLore(),24,35,zones);expect(r.zone?.name).toBe('Les Rayonnages');expect(r.state.seenZoneEntryIds).toEqual(['zone-1','zone-11']);
 expect(claimZone(r.state,1,35,zones).zone).toBeUndefined();
});
test.each(Object.keys(source.gameplayReactions) as ReactionKind[])('%s reaction comes from the pack and is safely omitted without authored locale or in production',kind=>{
 expect(source.gameplayReactions[kind]).toContain(reaction(kind,'fr','seed','tester'));expect(reaction(kind,'en','seed','tester')).toBeUndefined();expect(reaction(kind,'es','seed','tester')).toBeUndefined();expect(reaction(kind,'fr','seed','production')).toBeUndefined();
});
test('ordinary reopen differs from a meaningful absence without clock rollback rewards',()=>{
 const a=openingVisit(initialLore(),day,pool);expect(a.returned).toBe(false);
 expect(openingVisit(a.state,new Date(day.getTime()+60000),pool).returned).toBe(false);
 expect(openingVisit(a.state,new Date(day.getTime()+loreConfig.meaningfulAbsenceMs),pool).returned).toBe(true);
 expect(openingVisit(a.state,new Date(day.getTime()-1000),pool).returned).toBe(false);
});
function memory(){const disk=new Map<string,string>();return{disk,getItem:async(key:string)=>disk.get(key)??null,setItem:async(key:string,value:string)=>{disk.set(key,value);}};}
test('store survives process restart, prevents duplicate concurrent rituals, and never writes game saves',async()=>{
 const storage=memory();storage.disk.set('tiny-game-starter:player','sentinel');storage.disk.set('tiny-game-starter:economy','lives');storage.disk.set('tiny-game-starter:active-session','attempt');
 const store=createLoreStore(storage,()=>day,'tester');const visits=await Promise.all([store.visit('fr'),store.visit('fr')]);expect(visits.filter(v=>v.card)).toHaveLength(1);
 await Promise.all([store.setSaved(pool[0].id,true,'fr'),store.setSaved(pool[0].id,true,'fr')]);await store.claimZone('fr',11,35);
 const reloaded=createLoreStore(storage,()=>day,'tester');await reloaded.refresh();expect(reloaded.snapshot().savedLoreCardIds).toEqual([pool[0].id]);expect((await reloaded.visit('fr')).card).toBeUndefined();expect(await reloaded.claimZone('fr',11,35)).toBeUndefined();
 expect(storage.disk.get('tiny-game-starter:player')).toBe('sentinel');expect(storage.disk.get('tiny-game-starter:economy')).toBe('lives');expect(storage.disk.get('tiny-game-starter:active-session')).toBe('attempt');
});
test('future or malformed saves are preserved; failed writes do not consume the opening',async()=>{
 const storage=memory();storage.disk.set('tiny-game-starter:lore','{"version":99}');const store=createLoreStore(storage,()=>day,'tester');await expect(store.visit('fr')).rejects.toThrow();expect(storage.disk.get('tiny-game-starter:lore')).toBe('{"version":99}');
 const writes=jest.fn().mockRejectedValueOnce(new Error('disk')).mockResolvedValue(undefined);
 const retry=createLoreStore({getItem:async()=>null,setItem:writes},()=>day,'tester');await expect(retry.visit('fr')).rejects.toThrow();expect((await retry.visit('fr')).card).toBeDefined();
 expect(()=>decodeLore('{broken')).toThrow();expect(decodeLore(null)).toEqual(initialLore());
});
test('unverified cards cannot be saved through prototype store',async()=>{
 const store=createLoreStore(memory(),()=>day,'tester');await expect(store.setSaved('opening-001',true,'fr')).rejects.toThrow('unavailable');expect(prototypeLoreAvailable('fr','production')).toBe(false);
});
test('reaction observer rate-limits errors and leaves engine state untouched',()=>{
 const p=findPuzzle('en-easy')!;let s=startPuzzle(p,{launch:{mode:'level',levelId:p.levelId,locale:'en',puzzleRevision:p.revision},position:1,sessionId:'flavor',seed:1,clock:{monotonicMs:0,utcMs:0}});
 const gate=createGameplayReactionGate();expect(gate.observe(s,0)).toBeUndefined();
 for(let n=1;n<=9;n++){
  for(const id of ['c0','c1','c2','c4'])s=selectCard(s,id).state;s=submitSelection(s,{monotonicMs:n,utcMs:n}).state;
  const before=JSON.stringify(s);const kind=gate.observe(s,n===9?40000:1000);expect(kind).toBe(n===3||n===9?'wrongAnswer':undefined);expect(JSON.stringify(s)).toBe(before);
 }
 s=applyHint(s,'pair0').state;expect(gate.observe(s,41000)).toBe('hintPair');s=applyHint(s,'category0').state;expect(gate.observe(s,42000)).toBe('hintCategory');
 const timed=checkCountdown({...s,countdownMs:1},{monotonicMs:100,utcMs:100});gate.observe(timed,43000);s=continueCountdown(timed,{monotonicMs:100,utcMs:100});expect(gate.observe(s,44000)).toBe('rewardedContinue');
});
