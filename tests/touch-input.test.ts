import {afterEach,expect,it,vi} from 'vitest';
import {bindInput,InputState} from '../src/input';

class Button extends EventTarget {
 dataset:{action:string};classes=new Set<string>();
 classList={add:(name:string)=>this.classes.add(name),remove:(name:string)=>this.classes.delete(name)};
 setPointerCapture(_id:number){}
 constructor(action:string){super();this.dataset={action};}
}
function setup(){
 const buttons=[new Button('right'),new Button('jump'),new Button('switch')];
 const win=new EventTarget(),doc=Object.assign(new EventTarget(),{querySelectorAll:(selector:string)=>selector==='.held'?buttons.filter(b=>b.classes.has('held')):buttons});
 vi.stubGlobal('window',win);vi.stubGlobal('document',doc);
 const input=new InputState();bindInput(input);return {buttons,win,doc,input};
}
function pointer(target:EventTarget,type:string,id:number){target.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),{pointerId:id,button:0}));}
afterEach(()=>vi.unstubAllGlobals());
it('keeps movement held while a second finger jumps, including a release outside the button',()=>{
 const {buttons,win,input}=setup();
 pointer(buttons[0],'pointerdown',1);pointer(buttons[1],'pointerdown',2);
 expect(input.isDown('right')).toBe(true);expect(input.take('jump')).toBe(true);
 pointer(win,'pointerup',2);expect(input.isDown('jump')).toBe(false);expect(input.isDown('right')).toBe(true);
 pointer(win,'pointerup',1);expect(input.isDown('right')).toBe(false);
});
it('keeps a button highlighted until the last finger on it is released',()=>{
 const {buttons,input}=setup();pointer(buttons[0],'pointerdown',1);pointer(buttons[0],'pointerdown',2);
 pointer(buttons[0],'pointerup',1);expect(input.isDown('right')).toBe(true);expect(buttons[0].classes.has('held')).toBe(true);
 pointer(buttons[0],'pointercancel',2);expect(input.isDown('right')).toBe(false);expect(buttons[0].classes.has('held')).toBe(false);
});
it('clears all held fingers on backgrounding and allows a fresh press',()=>{
 const {buttons,doc,input}=setup();pointer(buttons[0],'pointerdown',1);pointer(buttons[1],'pointerdown',2);
 doc.dispatchEvent(new Event('visibilitychange'));expect(input.isDown('right')).toBe(false);expect(input.isDown('jump')).toBe(false);
 expect(buttons.every(b=>!b.classes.has('held'))).toBe(true);
 pointer(buttons[1],'pointerdown',3);expect(input.take('jump')).toBe(true);
});
it('releases held fingers when rotating or resizing the game',()=>{
 const {buttons,win,input}=setup();pointer(buttons[0],'pointerdown',1);pointer(buttons[1],'pointerdown',2);
 win.dispatchEvent(new Event('resize'));expect(input.isDown('right')).toBe(false);expect(input.isDown('jump')).toBe(false);
 expect(buttons.every(b=>!b.classes.has('held'))).toBe(true);
});
