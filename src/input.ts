export type Action='left'|'right'|'jump'|'interact'|'switch';
export class InputState {
  private held=new Map<Action,Set<string>>();
  private pressed=new Set<Action>();
  down(action:Action,source:string) {const set=this.held.get(action)||new Set<string>();if(!set.size)this.pressed.add(action);set.add(source);this.held.set(action,set);}
  up(action:Action,source:string) {this.held.get(action)?.delete(source);}
  isDown(action:Action){return !!this.held.get(action)?.size;}
  take(action:Action){const yes=this.pressed.has(action);this.pressed.delete(action);return yes;}
  clear(){this.held.clear();this.pressed.clear();}
  endFrame(){this.pressed.clear();}
}
export function bindInput(input:InputState) {
 const map:Record<string,Action>={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyE:'interact',KeyQ:'switch'};
 window.addEventListener('keydown',e=>{if((e.target as HTMLElement)?.matches('input,textarea'))return;const a=map[e.code];if(a){e.preventDefault();if(!e.repeat)input.down(a,e.code);}});
 window.addEventListener('keyup',e=>{const a=map[e.code];if(a){input.up(a,e.code);}});
 const clear=()=>{input.clear();document.querySelectorAll('.held').forEach(el=>el.classList.remove('held'));};
 window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
 for(const button of document.querySelectorAll<HTMLButtonElement>('[data-action]')) {
  const a=button.dataset.action as Action;
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);input.down(a,`pointer-${e.pointerId}`);button.classList.add('held');});
  const release=(e:PointerEvent)=>{input.up(a,`pointer-${e.pointerId}`);button.classList.remove('held');};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
  button.addEventListener('contextmenu',e=>e.preventDefault());
 }
}
