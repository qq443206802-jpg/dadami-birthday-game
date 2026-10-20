import {describe,it,expect} from 'vitest';
import {environmentAt} from '../src/environment';
describe('campus clock',()=>{
 it('starts in the morning and passes sunset, night, and sunrise',()=>{
  expect(environmentAt(0).phase).toBe('白天');
  expect(environmentAt(330).phase).toBe('日落');
  expect(environmentAt(390).phase).toBe('黑夜');
  expect(environmentAt(690).phase).toBe('日出');
  expect(environmentAt(720).clock).toBe('07:00');
 });
 it('cycles clear skies, clouds, rain and back without negative intensities',()=>{
  expect(environmentAt(30).weather).toBe('晴天');expect(environmentAt(120).weather).toBe('多云');
  expect(environmentAt(210).weather).toBe('下雨');expect(environmentAt(390).weather).toBe('晴天');
  for(let s=0;s<720;s++){const e=environmentAt(s);expect(e.dark).toBeGreaterThanOrEqual(0);expect(e.dark).toBeLessThanOrEqual(1);expect(e.rain).toBeGreaterThanOrEqual(0);expect(e.rain).toBeLessThanOrEqual(1);}
 });
});
