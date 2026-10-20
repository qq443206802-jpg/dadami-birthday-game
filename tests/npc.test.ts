import {it,expect} from 'vitest';
import {freshProgress,canExit,collect,complete} from '../src/state';
it('requires the guard puzzle before leaving the gate',()=>{const p=freshProgress();collect(p,'invite');expect(canExit('gate',p)).toBe(false);complete(p,'guard-puzzle');expect(canExit('gate',p)).toBe(true);});
it('requires junior and senior NPC quizzes before leaving their rooms',()=>{
 const p=freshProgress();for(const i of ['invite','bookmark','card','star','key'] as const)collect(p,i);
 for(const d of ['drawer','bridge','cell-lock'])complete(p,d);
 expect(canExit('lab',p)).toBe(false);complete(p,'lab-quiz');expect(canExit('lab',p)).toBe(true);
 expect(canExit('cell',p)).toBe(false);complete(p,'cell-quiz');expect(canExit('cell',p)).toBe(true);
});
it('requires the teacher meeting and off-work checklist before the birthday exit',()=>{const p=freshProgress();for(const i of ['invite','card','star'] as const)collect(p,i);complete(p,'party');expect(canExit('lounge',p)).toBe(false);complete(p,'boss');complete(p,'clockout');expect(canExit('lounge',p)).toBe(true);});
