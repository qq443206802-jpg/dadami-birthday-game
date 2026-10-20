import {describe,it,expect} from 'vitest';
import {getLevel} from '../src/levels';

describe('relaxed campus routes',()=>{
 it('keeps solid ground throughout both rooms, with no timed or bird-specific route',()=>{
  for(const id of ['library','lab'] as const){
   const level=getLevel(id);
   expect(level.platforms.some(p=>p.h>=80&&p.w===level.width)).toBe(true);
   expect(level).not.toHaveProperty('lifts');
   expect(level.props.some(p=>p.bird||p.kind==='rope')).toBe(false);
  }
 });
 it('uses a box switch only in 524, and a different challenge in the library',()=>{
  expect(getLevel('library').props.some(p=>p.target!==undefined||p.kind==='plate')).toBe(false);
  for(const [id,boxId,opens] of [['lab','drawer','bridge']] as const){
   const level=getLevel(id),box=level.props.find(p=>p.id===boxId)!;
   expect(box.kind).toBe('box');
   expect(box).toMatchObject({opens,target:650});
   expect(level.props.some(p=>p.kind==='plate'&&p.x===650&&p.y===609&&!p.bird)).toBe(true);
  }
  expect(getLevel('lab').props.find(p=>p.id==='lab-chest')?.needsKey).toBe(true);
 });
 it('keeps the guard to the left of the gate pillars',()=>{
  expect(getLevel('gate').props.find(p=>p.id==='guard-puzzle')!.x+75).toBeLessThan(190);
 });
 it('places safe checkpoints before and after the difficult sections',()=>{
  for(const id of ['library','lab'] as const){
   const level=getLevel(id);
   expect(level.checkpoints?.length).toBeGreaterThanOrEqual(2);
   expect(level.checkpoints?.every(c=>c.x<level.exit)).toBe(true);
  }
 });
});
