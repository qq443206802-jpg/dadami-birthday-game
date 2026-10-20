import {expect,it} from 'vitest';
import {finishJourney,freshProgress,loadProgress,saveProgress} from '../src/state';

it('only finishes at the dorm after collecting the birthday items and completing the party',()=>{
 const p=freshProgress();
 expect(finishJourney(p)).toBe(false);
 p.level='dorm';expect(finishJourney(p)).toBe(false);
 p.items=['invite','card','star'];p.done=['party','boss'];expect(finishJourney(p)).toBe(false);
 p.done.push('clockout');expect(finishJourney(p)).toBe(true);
 expect(finishJourney(p)).toBe(false);expect(p.done.filter(id=>id==='home')).toHaveLength(1);
 let saved='';const storage={getItem:()=>saved,setItem:(_key:string,value:string)=>{saved=value;}};
 saveProgress(p,storage);expect(finishJourney(loadProgress(storage))).toBe(false);
});
