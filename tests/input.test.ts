import {it,expect} from 'vitest';
import {InputState} from '../src/input';
it('supports simultaneous fingers and does not release a key held by another source',()=>{
 const i=new InputState();i.down('right','finger-1');i.down('jump','finger-2');
 expect(i.isDown('right')).toBe(true);expect(i.take('jump')).toBe(true);expect(i.take('jump')).toBe(false);
 i.down('right','key');i.up('right','finger-1');expect(i.isDown('right')).toBe(true);
 i.clear();expect(i.isDown('right')).toBe(false);expect(i.isDown('jump')).toBe(false);expect(i.take('right')).toBe(false);
});
