import type { State } from '../game/engine/engine';
import type { ReactionKind } from './content';
import { loreConfig } from './model';
// Presentation-only observer. Never mutates gameplay or emits gameplay events.
export function createGameplayReactionGate() {
  let previous:Pick<State,'sessionId'|'mistakes'|'usedHints'|'continueUsed'>|undefined;let lastWrong=-Infinity;
  return {observe(state:State,now:number):ReactionKind|undefined {
    const prior=previous;previous={sessionId:state.sessionId,mistakes:state.mistakes,usedHints:[...state.usedHints],continueUsed:state.continueUsed};
    if(!prior||prior.sessionId!==state.sessionId){lastWrong=-Infinity;return;}
    if(state.continueUsed&&!prior.continueUsed)return 'rewardedContinue';
    if(state.usedHints.length>prior.usedHints.length){const hint=state.puzzle.hints.find(h=>h.id===state.usedHints.at(-1));return hint?.kind==='pair'?'hintPair':hint?.kind==='category'?'hintCategory':undefined;}
    if(state.mistakes>prior.mistakes&&!state.timedOut&&state.mistakes%loreConfig.wrongReactionEvery===0&&now-lastWrong>=loreConfig.wrongReactionCooldownMs){lastWrong=now;return 'wrongAnswer';}
  }};
}
