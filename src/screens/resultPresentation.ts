import { findLevel, findPuzzle } from '../game/content';
import type { GameResult } from '../game/types';
import { zoneForLevel } from '../lore/content';
export function resultPresentation(result:GameResult) {
  const puzzle=findPuzzle(result.levelId);
  const level=result.mode==='level'?findLevel(result.levelId):undefined;
  // Never substitute a newer authored revision or reach around the runtime loader.
  const matching=puzzle?.revision===result.puzzleRevision&&puzzle.locale===result.locale;
  return {level,zone:level&&result.locale==='fr'?zoneForLevel(level.number):undefined,
    groups:result.outcome==='won'&&matching?puzzle.groups.map(group=>({id:group.id,label:group.label,words:group.cardIds.map(id=>puzzle.cards.find(c=>c.id===id)!.text)})):[],
  };
}
