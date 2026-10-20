import {it,expect} from 'vitest';
import {makeGraduateGrid,isGraduateMatch} from '../src/puzzles';

it('has nine different daily scenes and exactly one different bird in any position',()=>{
 for(let target=0;target<9;target++){
  const cards=makeGraduateGrid(target);
  expect(cards).toHaveLength(9);
  expect(new Set(cards.map(c=>c.title)).size).toBe(9);
  expect(cards.filter(c=>c.bird==='yellow')).toHaveLength(1);
  for(let i=0;i<9;i++)expect(isGraduateMatch(cards,i)).toBe(i===target);
  expect(isGraduateMatch(cards,-1)).toBe(false);
 }
});
