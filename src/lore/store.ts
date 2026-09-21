import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameConfig } from '../config/game';
import { eligibleCards, prototypeLoreAvailable, zones } from './content';
import { claimZone, decodeLore, initialLore, openingVisit, saveCard, type LoreState } from './model';
import type { Locale } from '../game/content/schema';
import { environment, type Environment } from '../config/environment';
export function createLoreStore(storage: { getItem(key:string):Promise<string|null>; setItem(key:string,value:string):Promise<void> }, now=()=>new Date(), mode:Environment=environment) {
  const key=`${gameConfig.id}:lore`; let state=initialLore(); let loaded=false; let queue=Promise.resolve();
  const listeners=new Set<()=>void>();
  function run<T>(action:()=>Promise<T>):Promise<T> { const work=queue.then(action,action); queue=work.then(()=>{},()=>{}); return work; }
  async function load() { if(!loaded){state=decodeLore(await storage.getItem(key));loaded=true;listeners.forEach(l=>l());} }
  async function commit(next:LoreState){await storage.setItem(key,JSON.stringify(next));state=next;listeners.forEach(l=>l());}
  return {
    subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};}, snapshot:()=>state,
    refresh:()=>run(load),
    visit:(locale:Locale)=>run(async()=>{await load();const result=openingVisit(state,now(),eligibleCards(locale,mode));await commit(result.state);return result;}),
    touch:()=>run(async()=>{await load();await commit({...state,lastSeenAt:Math.max(state.lastSeenAt??0,now().getTime())});}),
    setSaved:(id:string,saved:boolean,locale:Locale)=>run(async()=>{await load();if(saved&&!eligibleCards(locale,mode).some(c=>c.id===id))throw new Error('Card unavailable');await commit(saveCard(state,id,saved));}),
    claimZone:(locale:Locale,highest:number,available:number)=>run(async()=>{await load();if(!prototypeLoreAvailable(locale,mode))return undefined;const result=claimZone(state,highest,available,zones);if(result.state!==state)await commit(result.state);return result.zone;}),
  };
}
export const loreStore=createLoreStore(AsyncStorage);
