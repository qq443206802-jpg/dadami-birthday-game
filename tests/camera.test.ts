import {it,expect} from 'vitest';
import {cameraScroll} from '../src/camera';
it('keeps the route visible, converges at the same speed, and never leaves world bounds',()=>{
 expect(cameraScroll(0,400,1280,2500,1/60)).toBe(0);
 expect(cameraScroll(0,1000,1280,2500,1/30)).toBeGreaterThan(cameraScroll(0,1000,1280,2500,1/60));
 expect(cameraScroll(1200,2800,1280,2500,1)).toBe(1220);
 expect(cameraScroll(0,-100,1280,2500,1)).toBe(0);
});
