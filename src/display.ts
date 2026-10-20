import type {InputState} from './input';

export function bindDisplay(input:InputState){
 const app=document.getElementById('app')!,button=document.getElementById('fullscreen-button')!;
 let fallback=false;
 const sync=()=>{const expanded=document.fullscreenElement===app||fallback;app.classList.toggle('expanded',expanded);button.textContent=expanded?'收起':'全屏';button.setAttribute('aria-label',expanded?'退出全屏':'全屏游玩');button.setAttribute('aria-pressed',String(expanded));input.clear();};
 button.onclick=async()=>{
  if(document.fullscreenElement===app){await document.exitFullscreen();return;}
  if(fallback){fallback=false;sync();return;}
  if(app.requestFullscreen){try{await app.requestFullscreen();return;}catch{/* Some mobile browsers only support filling the webpage. */}}
  fallback=true;sync();
 };
 document.addEventListener('fullscreenchange',()=>{fallback=false;sync();});
 document.addEventListener('keydown',e=>{if(e.code==='Escape'&&fallback){fallback=false;sync();}});
 sync();
}
