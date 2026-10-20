import type {UI} from './ui';
import {esc} from './ui';
import {findMatches,swapTiles,makeBoard,legalMoves,type QuizQuestion} from './puzzles';
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const badge=`data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="#f5efd6"/><circle cx="150" cy="150" r="135" fill="#dce3c6" stroke="#607b50" stroke-width="9"/><circle cx="150" cy="150" r="111" fill="#faf5e4" stroke="#8ca16c" stroke-width="2"/><path d="M150 181V88M150 145Q87 145 99 98Q150 95 150 145M150 120Q157 70 200 84Q208 128 150 141" stroke="#637c4a" stroke-width="7" fill="#aec38a"/><path d="M103 177h94l-16 28h-62z" fill="#ba9c67" stroke="#6e744f" stroke-width="3"/><text x="150" y="247" text-anchor="middle" fill="#486445" font-size="31" font-family="serif">药学院</text><text x="150" y="63" text-anchor="middle" fill="#60734e" font-size="14">BIRTHDAY CAMPUS PASS</text></svg>')}`;

export class MiniGames {
 constructor(private ui:UI){}
 private npc(role:number,title:string,line:string){return `<div class="npc-dialogue"><img src="${this.ui.npcData(role)}" alt="${esc(title)}"><div><div class="eyebrow">${esc(title)}</div><p>${esc(line)}</p></div></div>`;}
 guard(win:()=>void){
  this.ui.modal(`${this.npc(0,'西南门 · 保安叔叔','小朋友……咦，是两只小鸟？你们是哪个学院的呀？')}<h2>今天要去哪里？</h2><div class="quiz-options">${['药学院，去给朋友过生日','图书馆睡觉学院','小饼干研究院','今天不想上学'].map((a,i)=>`<button class="quiz-answer" data-college="${i}">${a}</button>`).join('')}</div><p id="guard-feedback">保安叔叔扶了扶帽子，等你们回答。</p>`);
  document.querySelectorAll<HTMLButtonElement>('[data-college]').forEach(b=>b.onclick=()=>{if(b.dataset.college==='0')this.jigsaw(win);else el('guard-feedback').textContent='“我看你们是来找药学院朋友的吧？再想想，啾。”';});
 }
 private jigsaw(win:()=>void){
  let order=[1,0,2,3,5,4,6,8,7],selected=-1;
  this.ui.modal(`${this.npc(0,'保安叔叔 · 门禁小考验','拼好这枚通行章，叔叔就给你们开门。')}<h2>拼好药学院通行章</h2><p>点选两块图案交换位置，拼成右侧完整图案。数字是图块原来的位置。</p><div class="jigsaw-layout"><div class="jigsaw-board" id="jigsaw-board"></div><div class="puzzle-reference"><img src="${badge}" alt="完整的原创药学院游戏通行章"><small>游戏通行章 · 非官方院徽</small></div></div><p id="jigsaw-feedback">先找四个角，慢慢拼就好。</p><div class="modal-actions" id="jigsaw-actions"></div>`);
  const render=()=>{el('jigsaw-board').innerHTML=order.map((n,i)=>`<button data-piece="${i}" class="jigsaw-piece ${i===selected?'selected':''}" aria-label="第${i+1}格，图块${n+1}" style="background-image:url('${badge}');background-position:${n%3*50}% ${Math.floor(n/3)*50}%"><span>${n+1}</span></button>`).join('');
   document.querySelectorAll<HTMLButtonElement>('[data-piece]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.piece);if(selected<0)selected=i;else{[order[selected],order[i]]=[order[i],order[selected]];selected=-1;this.ui.chirp(580);}
    render();if(order.every((n,i)=>n===i)){el('jigsaw-feedback').textContent='“拼对啦！药学院的小鸟，生日快乐，进门吧！”';el('jigsaw-actions').innerHTML='<button class="primary" id="guard-pass">打开门禁，继续出发 ↗</button>';el('guard-pass').onclick=()=>{this.ui.close();win();};}
   });};render();
 }
 match3(win:()=>void){
  let board=makeBoard(),selected=-1,score=0;const symbols=['🧪','📖','🌿','⭐','🧬'];
  this.ui.modal('<div class="eyebrow">药学院门口 · 电梯的小脾气</div><h2>先消消乐，再上五楼</h2><p>点击交换相邻的两格，让三个或更多相同图案连成一线。累计消除18格，电梯就到站。</p><div class="minigame-status"><span id="match-score">0 / 18</span><button class="secondary" id="match-hint">给我一点提示</button></div><div class="match-board" id="match-board"></div><p id="match-feedback">电梯：“叮，快乐电量不足，请补充一点好心情。”</p><div class="modal-actions" id="match-actions"></div>');
  const render=()=>{el('match-board').innerHTML=board.map((n,i)=>`<button class="match-tile ${selected===i?'selected':''}" data-match="${i}" aria-label="第${Math.floor(i/5)+1}行第${i%5+1}列 ${symbols[n]}">${symbols[n]}</button>`).join('');
   document.querySelectorAll<HTMLButtonElement>('[data-match]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.match);if(selected<0){selected=i;render();return;}const next=swapTiles(board,selected,i,5);selected=-1;if(!next||!findMatches(next,5).size){el('match-feedback').textContent='这两格还连不成三个，再换一对试试。';render();return;}board=next;
    for(let cascade=0;cascade<12;cascade++){const matches=findMatches(board,5);if(!matches.size)break;score+=matches.size;for(let c=0;c<5;c++){const values=[];for(let r=4;r>=0;r--)if(!matches.has(r*5+c))values.push(board[r*5+c]);while(values.length<5)values.push(Math.floor(Math.random()*5));for(let r=4;r>=0;r--)board[r*5+c]=values[4-r];}}
    if(findMatches(board,5).size||!legalMoves(board,5).length)board=makeBoard();this.ui.chirp(660);el('match-score').textContent=`${Math.min(score,18)} / 18`;render();
    if(score>=18){document.querySelectorAll<HTMLButtonElement>('[data-match]').forEach(b=>b.disabled=true);el('match-feedback').textContent='“叮——快乐电量已充满，五楼到了！”';el('match-actions').innerHTML='<button class="primary" id="elevator-pass">坐电梯上五楼 ↗</button>';el('elevator-pass').onclick=()=>{this.ui.close();win();};}else el('match-feedback').textContent=`消除成功！还差${18-score}格，电梯就到啦。`;
   });};render();el('match-hint').onclick=()=>{const move=legalMoves(board,5)[0];if(move){document.querySelectorAll('[data-match]').forEach(b=>b.classList.remove('hinted'));move.forEach(i=>document.querySelector(`[data-match="${i}"]`)?.classList.add('hinted'));el('match-feedback').textContent='交换这两格试试。';}};
 }
 private meetingScene(step:number){
  const titles=['应力与应变','AFM：从挠曲到力','时间，也是变量'];
  const figures=[
   '<path d="M35 10V105H245M35 105L150 15M35 105L220 55"/><g stroke="none" fill="#385b62"><text x="15" y="18">σ</text><text x="240" y="125">ε</text><text x="145" y="18">A</text><text x="221" y="53">B</text></g>',
   '<path d="M25 40H145L172 54M25 30V60M172 54V75M166 65L172 75L178 65M145 90H235"/><g stroke="none" fill="#385b62"><text x="42" y="23">k = 0.1 N/m</text><text x="44" y="119">δ = 100 nm</text><text x="187" y="70">δ</text></g>',
   '<path d="M30 10V105H250M30 22C60 70 90 85 240 88"/><g stroke="none" fill="#385b62"><text x="10" y="18">σ</text><text x="241" y="125">t</text><text x="115" y="26">ε 保持不变</text></g>'
  ];
  const notes=['线弹性 · 小应变','F = kδ','观察应力随时间的变化'];
  return `<div class="meeting-stage" role="img" aria-label="组会PPT汇报场景：女老师与两只汇报的小鸟"><div class="meeting-slide"><div class="meeting-slide-title">${titles[step]}</div><svg viewBox="0 0 270 135" aria-label="${titles[step]}教学示意图"><g fill="none" stroke="#63857b" stroke-width="3" stroke-linecap="round">${figures[step]}</g></svg><span>${notes[step]}</span><small>本周组会 · ${step+1} / 3</small></div><img class="meeting-teacher" src="${this.ui.npcData(3)}" alt="戴眼镜的女老师"><div class="meeting-presenters"><img src="${this.ui.birdData('blue')}" alt="正在汇报的小蓝"><img src="${this.ui.birdData('yellow')}" alt="陪着汇报的小黄"></div><span class="meeting-room-label">今天的汇报：把基础概念讲清楚</span></div>`;
 }
 quiz(role:number,questions:QuizQuestion[],win:()=>void){
  let step=0;const meeting=role===3,title=meeting?'组会汇报 · 老师提问':role===1?'524 · 师妹':'细胞房 · 师兄';
  const render=()=>{const q=questions[step];
   const content=`<h3>${esc(q.question)}</h3><div class="quiz-options">${q.options.map((a,i)=>`<button data-answer="${i}" class="quiz-answer"><span>${'ABCD'[i]}</span>${esc(a)}</button>`).join('')}</div><p id="quiz-feedback" aria-live="polite">${meeting?'老师：“慢慢说，不着急。注意图中的条件和单位。”':'不用紧张，我们一起想一想。'}</p><div class="modal-actions" id="quiz-actions"></div>`;
   this.ui.modal(meeting?`<div class="eyebrow">${title} · ${step+1} / 3 · 不计时</div><h2>今天的组会，三道小问题</h2><div class="meeting-layout">${this.meetingScene(step)}<div class="meeting-question">${content}</div></div>`:`${this.npc(role,title,role===1?'师兄师姐，帮我确认几个小问题，再一起找生日宝箱吧。':'先聊几个细胞培养的小常识，答完就放你去过生日。')}<div class="eyebrow">小问答 ${step+1} / ${questions.length} · 答错可重试</div>${content}`,!meeting);
   if(meeting)document.querySelector('.modal')!.classList.add('meeting-modal');
   document.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(b=>b.onclick=()=>{if(Number(b.dataset.answer)!==q.answer){b.classList.add('wrong');el('quiz-feedback').textContent=meeting?'老师：“再看看单位和控制条件，可以重新选。”':'再想想，没关系。这里没有扣分。';this.ui.chirp(250);return;}b.classList.add('correct');document.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(x=>x.disabled=true);el('quiz-feedback').textContent=q.explanation;this.ui.chirp(790);el('quiz-actions').innerHTML=`<button class="primary" id="quiz-next">${step===questions.length-1?(meeting?'汇报结束，准备过生日 ↗':'答完啦，继续找生日惊喜'):(meeting?'下一页PPT →':'下一道小问题 →')}</button>`;el('quiz-next').onclick=()=>{if(++step===questions.length){this.ui.close();win();}else render();};});};render();
 }
 differences(win:()=>void){
  const found=new Set<number>();const spots=[{x:22,y:31},{x:77,y:25},{x:55,y:76}];
  this.ui.modal('<div class="eyebrow">图书馆 · 生日观察员</div><h2>找出三处小不同</h2><p>左边是昨天，右边是今天。点出气球、彩旗和盆栽里悄悄发生的变化，就能打开书签宝箱。</p><div class="difference-pair"><div class="difference-picture" id="difference-left"><span class="picture-label">昨天</span><i class="spot-balloon left-version"></i><i class="spot-flags">⚑ ⚑</i><i class="spot-plant">❧</i></div><div class="difference-picture" id="difference-right"><span class="picture-label">今天</span><i class="spot-balloon right-version"></i><i class="spot-flags">⚑</i><i class="spot-plant changed">❀</i></div></div><p id="difference-feedback">找到 0 / 3 处不同</p><div class="modal-actions" id="difference-actions"></div>');
  for(const side of ['left','right'])el(`difference-${side}`).onclick=e=>{const rect=(e.currentTarget as HTMLElement).getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width*100,y=(e.clientY-rect.top)/rect.height*100;const index=spots.findIndex(s=>Math.hypot(s.x-x,s.y-y)<15);if(index<0){el('difference-feedback').textContent=`找到 ${found.size} / 3 处，再仔细看看。`;return;}found.add(index);for(const name of ['left','right']){if(!el(`difference-${name}`).querySelector(`[data-found="${index}"]`)){const circle=document.createElement('span');circle.className='difference-circle';circle.dataset.found=String(index);circle.style.left=`${spots[index].x}%`;circle.style.top=`${spots[index].y}%`;el(`difference-${name}`).append(circle);}}
   this.ui.chirp(700);el('difference-feedback').textContent=`找到 ${found.size} / 3 处不同${found.size===3?'，生日观察员认证成功！':''}`;if(found.size===3){el('difference-actions').innerHTML='<button class="primary" id="difference-pass">打开书签宝箱 ↗</button>';el('difference-pass').onclick=()=>{this.ui.close();win();};}
  };
 }
 clockout(win:()=>void){
  let remaining=30,timer=0;const checked=new Set<number>();
  this.ui.modal('<div class="eyebrow">17:29:30 · 下班前的小小仪式</div><h2>今天，准时去过生日</h2><p>倒计时结束前，把日常收好，把快乐带走。即使慢一点，生日惊喜也会等你。</p><div class="clock-face" id="clock-face">17:29:30</div><div class="clockout-tasks">'+['保存好今天的实验记录','整理工位，合上电脑','拿上礼物，和伙伴一起出发'].map((s,i)=>`<button data-clock-task="${i}" class="quiz-answer">○ ${s}</button>`).join('')+'</div><p id="clock-feedback">今天的最后一个实验：验证快乐可以被传递。</p><div class="modal-actions" id="clock-actions"></div>',false,()=>window.clearInterval(timer));
  timer=window.setInterval(()=>{if(document.hidden)return;remaining=Math.max(0,remaining-1);el('clock-face').textContent=remaining?`17:29:${String(60-remaining).padStart(2,'0')}`:'17:30:00';if(!remaining){clearInterval(timer);el('clock-feedback').textContent='下班铃响了。慢慢收好，今天的惊喜还在等你。';}},1000);
  document.querySelectorAll<HTMLButtonElement>('[data-clock-task]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.clockTask);checked.add(i);b.classList.add('correct');b.textContent=b.textContent!.replace('○','✓');b.disabled=true;this.ui.chirp(660+i*90);if(checked.size===3){clearInterval(timer);el('clock-feedback').textContent='记录已保存，工位已收好，快乐正在加载。';el('clock-actions').innerHTML='<button class="primary" id="clock-pass">下班！去526过生日 ↗</button>';el('clock-pass').onclick=()=>{this.ui.close();win();};}});
 }
}
