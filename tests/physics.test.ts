import {it,expect} from 'vitest';
import {isGrounded} from '../src/physics';
it('allows jumping again after landing on an immovable dynamic lift',()=>{
 expect(isGrounded({blocked:{down:false},touching:{down:true}})).toBe(true);
 expect(isGrounded({blocked:{down:true},touching:{down:false}})).toBe(true);
 expect(isGrounded({blocked:{down:false},touching:{down:false}})).toBe(false);
});
