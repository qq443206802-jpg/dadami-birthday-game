import Phaser from 'phaser';

// Only enabled by ?perf=1. Samples stay in this page and are never uploaded.
export function observePerformance(game:Phaser.Game,phase:()=>string){
 if(new URLSearchParams(location.search).get('perf')!=='1')return;
 const panel=document.createElement('details');panel.id='performance-panel';panel.open=true;
 panel.style.cssText='position:fixed;right:8px;bottom:8px;z-index:100;padding:9px 12px;background:#102737ef;color:#e5f0dd;border:1px solid #90a99a;border-radius:7px;font:10px/1.5 monospace;max-width:340px;max-height:38vh;overflow:auto';
 const summary=document.createElement('summary');summary.textContent='性能采样 · 本页临时记录';
 const output=document.createElement('pre');output.style.margin='8px 0 0';output.id='performance-results';output.textContent='进入关卡后采样；每个场景略过最初1秒。';
 panel.append(summary,output);document.body.append(panel);
 const records=new Map<string,{intervals:number[];longTasks:number;maxLongTask:number}>();
 let previous=0,lastPhase='',warmUntil=0,lastReport=0;
 const report=()=>{
  const result:Record<string,unknown>={};
  for(const [name,r] of records){const sorted=[...r.intervals].sort((a,b)=>a-b),duration=r.intervals.reduce((a,b)=>a+b,0);if(!sorted.length)continue;
   result[name]={seconds:+(duration/1000).toFixed(1),fps:+(sorted.length*1000/duration).toFixed(1),p95FrameMs:+sorted[Math.ceil(sorted.length*.95)-1].toFixed(1),framesOver50ms:r.intervals.filter(x=>x>50).length,longTasks:r.longTasks,maxLongTaskMs:+r.maxLongTask.toFixed(1)};
  }
  output.textContent=JSON.stringify(result,null,2);
 };
 const observer=new PerformanceObserver(list=>{const r=records.get(lastPhase);if(!r||document.hidden||performance.now()<warmUntil)return;for(const entry of list.getEntries()){r.longTasks++;r.maxLongTask=Math.max(r.maxLongTask,entry.duration);}});
 if(PerformanceObserver.supportedEntryTypes.includes('longtask'))observer.observe({type:'longtask',buffered:false});
 const sample=()=>{
  const now=performance.now(),current=phase();
  if(document.hidden){previous=0;return;}
  if(current!==lastPhase){lastPhase=current;previous=0;warmUntil=now+1000;}
  if(!previous||now<warmUntil){previous=now;return;}
  const dt=now-previous;previous=now;
  const r=records.get(current)||{intervals:[],longTasks:0,maxLongTask:0};r.intervals.push(dt);if(r.intervals.length>3600)r.intervals.shift();records.set(current,r);
  if(now-lastReport>1000){lastReport=now;report();}
 };
 game.events.on(Phaser.Core.Events.POST_STEP,sample);
 const clear=()=>{previous=0;};document.addEventListener('visibilitychange',clear);
 window.addEventListener('pagehide',()=>{game.events.off(Phaser.Core.Events.POST_STEP,sample);observer.disconnect();document.removeEventListener('visibilitychange',clear);},{once:true});
}
