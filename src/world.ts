import Phaser from 'phaser';
import {CampusAtmosphere} from './environment';
import {InputState} from './input';
import {UI} from './ui';
import {getLevel, type LevelDefinition, type Prop} from './levels';
import {canExit,collect,complete,openChest,finishJourney,type LevelId} from './state';
import {makeBirdTextures,makeNpcTextures,platformArt,propArt,deco,buildingSign} from './art';
import {labQuiz,cellQuiz,teacherQuiz} from './puzzles';
import {cameraScroll} from './camera';
import {isGrounded} from './physics';
import {placeSceneLabel,type LabelRect} from './layout';

const base=import.meta.env.BASE_URL;
type Color='blue'|'yellow';
interface Bird {body:Phaser.Physics.Arcade.Sprite;visual:Phaser.GameObjects.Image;shadow:Phaser.GameObjects.Ellipse;name:Phaser.GameObjects.Text;color:Color;flapped:boolean;groundedAt:number}
interface WorldProp {spec:Prop;art:Phaser.GameObjects.Container;label:Phaser.GameObjects.Text;pushBody?:Phaser.GameObjects.Rectangle;target?:number;lamp?:Phaser.GameObjects.Arc}
export class World extends Phaser.Scene {
 private ui:UI;private controls:InputState;private level!:LevelDefinition;private startData:{levelId?:LevelId;intro?:boolean}={};
 private birds:Bird[]=[];private active=0;private platforms!:Phaser.Physics.Arcade.StaticGroup;private props:WorldProp[]=[];
 private indicator?:Phaser.GameObjects.Triangle;private nearest?:WorldProp;private busy=false;private safe={x:150,y:530};private trail:{x:number;y:number}[]=[];private still=0;private banner?:Phaser.GameObjects.Text;
 private atmosphere!:CampusAtmosphere;private gateBarrier?:Phaser.GameObjects.Rectangle;private gateBars?:Phaser.GameObjects.Graphics;
 private routeGate?:{id:string;body:Phaser.GameObjects.Rectangle;art:Phaser.GameObjects.Container};private checkpoint=-1;private jumpAt=-Infinity;
 private signs:Phaser.GameObjects.Text[]=[];
 constructor(ui:UI,input:InputState){super('world');this.ui=ui;this.controls=input;}
 init(data:{levelId?:LevelId;intro?:boolean}){this.startData=data;this.birds=[];this.props=[];this.signs=[];this.active=0;this.trail=[];this.still=0;this.busy=false;this.routeGate=undefined;this.checkpoint=-1;this.jumpAt=-Infinity;}
 preload(){for(const id of ['campus','lab','lab524','cell','party','library'])this.load.image(id,`${base}assets/${id}${["campus","library"].includes(id)?"-night":""}.webp`);this.load.image('bird-sheet',`${base}assets/birds.webp`);this.load.image('npc-sheet',`${base}assets/npcs.webp`);}
 create(){
  if(!this.textures.exists('bird-blue-0'))makeBirdTextures(this);
  if(!this.textures.exists('npc-0'))makeNpcTextures(this);
  if(!this.textures.exists('body')){const t=this.textures.createCanvas('body',64,64)!;t.context.fillStyle='white';t.context.fillRect(0,0,64,64);t.refresh();}
  this.ui.onStart=()=>this.changeLevel(this.ui.progress.level,true);
  this.ui.onRefresh=()=>{this.ui.setBird(this.birds[this.active].color);this.refreshProps();};
  this.ui.onHome=()=>{this.controls.clear();this.birds.forEach(b=>b.body.setVelocity(0));};
  this.ui.onEndingChange=open=>{this.controls.clear();if(open){this.birds.forEach(b=>b.body.setVelocity(0));this.game.loop.sleep();}else this.game.loop.wake();};
  this.ui.birdData=color=>this.textures.getBase64(`bird-${color}-0`);
  this.ui.npcData=role=>this.textures.getBase64(`npc-${role}`);
  this.level=getLevel(this.startData.levelId||this.ui.progress.level);this.safe={...this.level.spawn};
  for(const p of this.level.props)if(p.opens&&this.ui.progress.done.includes(p.id))complete(this.ui.progress,p.opens);
  this.physics.world.setBounds(0,-350,this.level.width,1200);this.physics.world.gravity.y=1000;
  this.cameras.main.setBounds(0,0,this.level.width,720);
  const image=this.textures.get(this.level.bg).getSourceImage() as HTMLImageElement;
  const bgScale=Math.max(1280/image.width,720/image.height),bgWidth=image.width*bgScale,bgHeight=image.height*bgScale;
  const background=this.add.image(bgWidth/2,360,this.level.bg).setDisplaySize(bgWidth,bgHeight).setScrollFactor(Math.min(1,Math.max(0,(bgWidth-1280)/(this.level.width-1280))),0).setDepth(-10);
  if(this.level.id==='dorm')background.setTint(0xcbb6af);
  const shade=this.add.rectangle(640,360,1280,720,0x10283d,['lab','cell','lounge'].includes(this.level.id)?.44:.12).setScrollFactor(0).setDepth(-9);shade.setBlendMode(Phaser.BlendModes.NORMAL);
  this.platforms=this.physics.add.staticGroup();
  if(this.level.checkpoints){const g=this.add.graphics().setDepth(2);const ground=this.level.platforms.filter(p=>p.h>=80).sort((a,b)=>a.x-b.x);for(let i=0;i<ground.length-1;i++){const left=ground[i].x+ground[i].w/2,right=ground[i+1].x-ground[i+1].w/2;g.fillStyle(0x485a54,.9).fillRect(left,609,right-left,130);g.lineStyle(3,0x283d39,.7).lineBetween(left,613,right,613);for(let x=left+30;x<right;x+=75)g.lineStyle(1,0x9bb3a1,.3).lineBetween(x,638,x+20,650);}}
  for(const p of this.level.platforms)if(!p.requires||this.ui.progress.done.includes(p.requires))this.addPlatform(p.x,p.y,p.w,p.h,p.kind);
  const box=this.level.props.find(p=>p.opens);if(box?.opens&&!this.ui.progress.done.includes(box.opens)){const body=this.add.rectangle(900,359,24,500,0xffffff,0);this.platforms.add(body);const art=this.add.container(900,609).setDepth(5),bars=this.add.graphics();bars.fillStyle(0x80958d).fillRoundedRect(-18,-360,36,360,5);bars.lineStyle(2,0xf6dc9c).strokeRoundedRect(-18,-360,36,360,5);for(let y=-340;y<0;y+=30)bars.lineStyle(2,0xd6b86b).lineBetween(-15,y,15,y);art.add(bars);art.add(this.add.text(0,-380,'箱子压住开关 → 开门',{fontFamily:'"Microsoft YaHei",sans-serif',fontSize:'14px',color:'#fff5d0',backgroundColor:'#435d60',padding:{x:10,y:7}}).setOrigin(.5));this.routeGate={id:box.opens,body,art};}
  if(this.level.id==='gate'&&!this.ui.progress.done.includes('guard-puzzle')){this.gateBarrier=this.add.rectangle(470,440,14,340,0x73846c,.55).setDepth(4);this.platforms.add(this.gateBarrier);this.gateBars=this.add.graphics().setDepth(4);for(let y=305;y<603;y+=19)this.gateBars.lineStyle(2,0x839475,.7).lineBetween(425,y,470,y);}
  this.decorateScene();
  for(const spec of this.level.props){
   const art=propArt(this,spec.kind,spec.x,spec.y).setDepth(5);
   const label=this.add.text(spec.x,spec.y-(spec.kind.startsWith('npc-')?210:spec.kind==='door'?120:95),spec.label,{fontFamily:'"Microsoft YaHei",sans-serif',fontSize:'13px',color:'#40523d',backgroundColor:'#faf5e1',padding:{x:9,y:5},wordWrap:{width:180}}).setOrigin(.5).setDepth(6);
   const p:WorldProp={spec,art,label};
   if(spec.target!==undefined){p.target=spec.target;const done=this.ui.progress.done.includes(spec.id),x=done?p.target:spec.x;art.setX(x);label.setX(x);p.pushBody=this.add.rectangle(x,575,110,68,0xffffff,0);this.platforms.add(p.pushBody);const dock=this.add.graphics().setDepth(4);dock.lineStyle(3,0xe8c276,.9).strokeRect(p.target-59,602,118,5);this.add.text(p.target,640,'箱子推到这里',{fontFamily:'"Microsoft YaHei",sans-serif',fontSize:'12px',color:'#fff2bf'}).setOrigin(.5).setDepth(5);}
   if(spec.kind==='plate')p.lamp=this.add.circle(spec.x,589,7,0xf5c768).setDepth(6);
   this.props.push(p);
  }
  for(const [i,color] of (['blue','yellow'] as Color[]).entries()){
   const x=this.ui.title?900+i*145:this.level.spawn.x+i*75,y=this.level.spawn.y;
   const body=this.physics.add.sprite(x,y,'body').setAlpha(0).setCollideWorldBounds(true);
   body.body!.setSize(32,38);body.body!.setOffset(16,20);body.setDragX(1800).setMaxVelocity(400,760);
   this.physics.add.collider(body,this.platforms);
   const visual=this.add.image(x,y,`bird-${color}-0`).setDisplaySize(106,106).setOrigin(.5,1).setDepth(10);
   const shadow=this.add.ellipse(x,609,54,10,0x3e4d35,.17).setDepth(4);
   const name=this.add.text(x,y+22,color==='blue'?this.ui.config.blueName:this.ui.config.yellowName,{fontFamily:'"Microsoft YaHei",sans-serif',fontSize:'11px',color:'#41573d',backgroundColor:'#f8f5e3c9',padding:{x:7,y:3}}).setOrigin(.5).setDepth(11);
   this.birds.push({body,visual,shadow,name,color,flapped:false,groundedAt:-Infinity});
  }
  this.indicator=this.add.triangle(0,0,0,0,12,0,6,7,0xf5e5ab).setStrokeStyle(1,0x778755).setDepth(12);
  if(!this.ui.title){this.ui.enter(this.level.id,this.startData.intro!==false);}
  this.atmosphere=new CampusAtmosphere(this,['lab','cell','lounge'].includes(this.level.id));
  this.ui.setBird('blue');this.refreshProps();this.ui.ready();
 }
 private addPlatform(x:number,y:number,w:number,h:number,kind?:string){
  const body=this.add.rectangle(x,y,w,h,0xffffff,0);this.platforms.add(body);if(h<80){const b=body.body as Phaser.Physics.Arcade.StaticBody;b.checkCollision.down=false;b.checkCollision.left=false;b.checkCollision.right=false;}
  if(h>=80){const g=this.add.graphics().setDepth(3);const road=['gate','approach','dorm'].includes(this.level.id);g.fillStyle(road?0xa5aa9b:this.level.id==='cell'?0x8aacc0:0xc4b99b).fillRect(x-w/2,y-h/2,w,170);g.fillStyle(road?0xd7d6bc:0xe0d6b9).fillRect(x-w/2,y-h/2,w,10);g.lineStyle(1,0x66785f,.5).lineBetween(x-w/2,y-h/2,x+w/2,y-h/2);if(road){g.fillStyle(0xece2b2,.7);for(let a=30;a<w;a+=105)g.fillRect(a,675,56,4);}else{g.lineStyle(1,0x8f927b,.3);for(let a=0;a<w;a+=130)g.lineBetween(a,620,a+80,720);}}else platformArt(this,x,y,w,h,kind||(['lab','cell','lounge'].includes(this.level.id)?'wood':'stone')).setDepth(3);
 }
 private decorateScene(){
  const id=this.level.id,indoor=['lab','cell','lounge'].includes(id);if(!this.level.checkpoints)deco(this,this.level.width,indoor);
  for(const c of this.level.checkpoints||[]){const g=this.add.graphics().setDepth(5);g.lineStyle(3,0x7a8e62).lineBetween(c.x,609,c.x,565);g.fillStyle(0xe9d08e).fillTriangle(c.x,565,c.x+26,575,c.x,586);this.add.text(c.x,652,'安全点',{fontFamily:'"Microsoft YaHei",sans-serif',fontSize:'12px',color:'#f9f1d2'}).setOrigin(.5).setDepth(5);}
  if(id==='gate'){
   const g=this.add.graphics().setDepth(1);g.fillStyle(0xa97765).fillRect(170,330,40,280).fillRect(420,330,40,280);g.fillStyle(0xe0d4b3).fillRect(162,323,56,13).fillRect(412,323,56,13);g.fillStyle(0x6b806c).fillRect(160,307,310,16);this.sign('中山大学 · 深圳校区',315,357);this.sign('西南门',315,403);
  }
  if(id==='library'){this.sign('中山大学深圳校区图书馆',650,200);this.sign('生日观察员 · 找出三处不同',650,247);this.sign('生日书签，藏在前面的宝箱里 →',1570,280);}
  if(id==='approach'){this.sign('药学院 · 深圳校区',590,215);this.sign('524 实验室  →',1210,380);this.sign('5F',930,340);}
  if(id==='lab'){this.sign('524',185,250);this.sign('箱子压住开关，两只鸟一起出发',650,245);this.sign('把今天的小努力，换一份生日惊喜 →',1720,285);}
  if(id==='cell'){this.sign('细胞房',190,250);const g=this.add.graphics().setDepth(1);g.fillStyle(0xc1cdb9).fillRoundedRect(1340,280,170,300,6);g.lineStyle(2,0x7c8c73).strokeRoundedRect(1340,280,170,300,6);g.fillStyle(0x718477).fillRoundedRect(1360,304,132,85,3);g.fillStyle(0xe0bd79).fillCircle(1470,418,5);this.sign('培养箱',1425,450);}
  if(id==='lounge')this.sign('526 · 休息室',190,250);
  if(id==='dorm'){
   const g=this.add.graphics().setDepth(0);g.fillStyle(0xc58d78).fillRect(1190,145,480,420);g.fillStyle(0x678175).fillRect(1176,131,508,20);
   for(let r=0;r<7;r++)for(let c=0;c<7;c++){g.fillStyle(r%3===0?0xd9c79c:0x889b8d).fillRect(1220+c*60,170+r*51,27,36);g.lineStyle(2,0xe4d1b8).strokeRect(1220+c*60,170+r*51,27,36);}
   this.sign('西园 · 五栋',1430,550);
  }
  if(['gate','library','dorm'].includes(id))for(const x of [350,1390]){
   const g=this.add.graphics().setDepth(2);g.lineStyle(1.2,0x748267,.8).beginPath().moveTo(x,605).lineTo(x+6,536).lineTo(x-2,490).strokePath();g.fillStyle(id==='dorm'?0xe6c881:0xc6b7a7).fillEllipse(x,471,29,37);g.lineStyle(1,0x8b9675).strokeEllipse(x,471,29,37);g.fillStyle(0xf5ecc6,.55).fillEllipse(x-7,463,6,10);
  }
  if(this.level.next&&id!=='approach')this.add.text(this.level.exit,540,`→\n${getLevel(this.level.next).name}`,{fontFamily:'"Microsoft YaHei",sans-serif',fontSize:'16px',color:'#405c40',align:'center',backgroundColor:'#f4edd3',padding:{x:13,y:12}}).setOrigin(.5).setDepth(5);
 }
 private changeLevel(id:LevelId,intro=true){this.controls.clear();this.ui.prompt('');this.ui.progress.level=id;this.ui.save();this.scene.restart({levelId:id,intro});}
 private sign(label:string,x:number,y:number){const text=buildingSign(this,label,x,y);this.signs.push(text);return text;}
 private layoutLabels(){
  const lead=this.birds[this.active],obstacles:LabelRect[]=this.signs.map(s=>s.getBounds());
  obstacles.push({x:this.cameras.main.scrollX,y:0,width:1280,height:180});
  for(const p of this.props)if(p.spec.kind.startsWith('npc-'))obstacles.push(p.art.getBounds());
  for(const b of this.birds)if(b.name.visible)obstacles.push(b.name.getBounds());
  const ordered=[...this.props].sort((a,b)=>Number(b===this.nearest)-Number(a===this.nearest));
  for(const p of ordered){
   const done=this.ui.progress.done.includes(p.spec.id)||(p.spec.item&&p.spec.kind==='item'&&this.ui.progress.items.includes(p.spec.item));
   if(this.ui.title||done||Math.abs(p.art.x-lead.body.x)>380){p.label.setVisible(false);continue;}
   const y=p.spec.y-(p.spec.kind.startsWith('npc-')?235:p.spec.kind==='door'?130:95);
   const position=placeSceneLabel(p.art.x,y,p.label.width,p.label.height,obstacles,this.level.width);
   p.label.setVisible(!!position);if(position){p.label.setPosition(position.x+position.width/2,position.y+position.height/2);obstacles.push(position);}
  }
 }
 private refreshProps(){
  for(const p of this.props){const done=this.ui.progress.done.includes(p.spec.id)||(p.spec.kind==='item'&&p.spec.item&&this.ui.progress.items.includes(p.spec.item));p.art.setAlpha(done?.85:1);if(done&&['cart','drawer'].includes(p.spec.id)){const x=p.target??p.spec.x+80;p.art.setX(x);p.label.setX(x);}p.label.setText(done?`✓ ${p.spec.kind==='chest'?'宝箱已打开':p.spec.label}`:p.spec.label);if(p.spec.kind==='item'&&done){p.art.setVisible(false);p.label.setVisible(false);}}
  for(const p of this.props)if(p.lamp){const open=!!p.spec.requires&&this.ui.progress.done.includes(p.spec.requires);p.lamp.setFillStyle(open?0xa1dda1:0xf5c768);p.label.setText(open?'✓ 箱子已压住开关 · 通路保持开启':p.spec.label);}else if(p.pushBody&&this.ui.progress.done.includes(p.spec.id))p.label.setText('✓ 箱子已固定 · 可以跳过去');
  this.ui.updateQuest();
  if(this.level.id==='lounge'&&this.ui.progress.done.includes('party'))this.props.find(p=>p.spec.id==='party')?.art.setVisible(false);
 }
 private solved(id:string){complete(this.ui.progress,id);this.ui.save();this.refreshProps();this.ui.chirp();this.sparkle(this.birds[this.active].body.x,this.birds[this.active].body.y-40);
  if(this.routeGate?.id===id){const gate=this.routeGate;this.platforms.remove(gate.body,true,true);this.routeGate=undefined;this.tweens.add({targets:gate.art,y:200,alpha:0,duration:650,onComplete:()=>gate.art.destroy()});}
  if(id==='guard-puzzle'){if(this.gateBarrier)this.platforms.remove(this.gateBarrier,true,true);this.gateBarrier=undefined;this.gateBars?.destroy();this.gateBars=undefined;}
  for(const p of this.level.platforms)if(p.requires===id)this.addPlatform(p.x,p.y,p.w,p.h,p.kind);
 }
 private sparkle(x:number,y:number){for(let i=0;i<10;i++){const s=this.add.star(x,y,4,2,5,[0xf1d584,0xe6b8a4,0xc7d7a4][i%3]).setDepth(20);this.tweens.add({targets:s,x:x+Math.cos(i)*55,y:y-40+Math.sin(i)*35,alpha:0,angle:90,duration:800,onComplete:()=>s.destroy()});}}
 private interact(p:WorldProp){
  const s=p.spec,progress=this.ui.progress,bird=this.birds[this.active];
  if(s.kind==='item')return;
  if(progress.done.includes(s.id)&&s.id!=='home'){if(s.id==='party')this.ui.showBirthday();else this.ui.toast('这里已经完成啦，继续向前吧。');return;}
  if(s.bird&&s.bird!==bird.color){this.ui.toast(`这个需要${s.bird==='blue'?this.ui.config.blueName+'扑翼到这里':this.ui.config.yellowName+'来推动'}，按 Q / ⇄ 切换。`);return;}
  if(s.requires&&!progress.done.includes(s.requires)){this.ui.toast('先完成前面的合作机关，再来这里吧。');return;}
  if(p.pushBody){this.ui.toast('贴住物件，按住左右方向实际推动，到金色停靠位才会解锁。');return;}
  if(s.kind==='plate'){this.ui.toast('把箱子推到开关上即可，两只小鸟都可以离开。');return;}
  if(s.id==='guard-puzzle'){this.ui.games.guard(()=>{this.solved('guard-puzzle');this.ui.toast('保安叔叔打开门禁：“生日快乐，进去吧！”');});return;}
  if(s.id==='lab-quiz'){this.ui.games.quiz(1,labQuiz,()=>{this.solved('lab-quiz');this.ui.toast('师妹：“答对啦！一起把那张生日贺卡找出来吧。”');});return;}
  if(s.id==='cell-quiz'){this.ui.games.quiz(2,cellQuiz,()=>{this.solved('cell-quiz');this.ui.toast('师兄：“细胞好好长，你也好好睡。去找星星宝箱吧！”');});return;}
  if(s.id==='elevator'){this.ui.games.match3(()=>{this.solved('elevator');this.changeLevel('lab');});return;}
  if(s.kind==='chest'&&s.item){
   if(s.id==='library-chest'&&!progress.done.includes('differences')){this.ui.games.differences(()=>{this.solved('differences');this.interact(p);});return;}
   if(!openChest(progress,s.id,s.item,[...(s.requires?[s.requires]:[]),...(s.id==='library-chest'?['differences']:[])],s.needsKey)){this.ui.toast(s.needsKey?'需要在图书馆宝箱中找到的小钥匙。':'这个宝箱还没有解锁，先完成房间里的机关。');return;}
   if(s.id==='library-chest')collect(progress,'key');this.ui.save();this.refreshProps();this.sparkle(s.x,s.y);this.ui.chirp(920);this.ui.showReward(s.item);return;
  }
  if(s.id==='labdoor'){this.changeLevel('lab');return;}
  if(s.id==='microscope'){this.ui.showCells();return;}
  if(s.id.startsWith('place-')){if(!s.item||!progress.items.includes(s.item)){this.ui.toast('还没有找到这份心意，看看旅程手册吧。');return;}this.solved(s.id);this.ui.toast('一份心意，已经放好。');return;}
  if(s.id==='party'){
   if(!progress.done.includes('boss')||!progress.done.includes('clockout')){this.ui.toast('先收好今天的工作，才可以安心过生日。');return;}
   if(!['place-invite','place-card','place-star'].every(k=>progress.done.includes(k))){this.ui.toast('先摆好邀请卡、手写贺卡和星星贴纸，再拉开幕帘。');return;}
   const other=this.birds[1-this.active];if(Math.abs(other.body.x-bird.body.x)>210){this.ui.toast('这是两只小鸟的惊喜，等伙伴靠近，再一起拉开吧。');return;}
   this.solved('party');this.confetti();this.ui.showBirthday();return;
  }
  if(s.id==='home'){
   if(!progress.done.includes('home')&&!finishJourney(progress)){this.ui.toast('先到526完成生日派对，再把祝福带回宿舍。');return;}
   this.ui.save();this.refreshProps();this.birds.forEach(b=>b.body.setVelocity(0));this.ui.showEnding();return;
  }
  this.solved(s.id);
  const messages:Record<string,string>={elevator:'叮——五楼到了。沿走廊前往524实验室。'};
  this.ui.toast(messages[s.id]||'合作完成，继续出发！');
 }
 private confetti(){for(let i=0;i<65;i++){const x=this.cameras.main.scrollX+Math.random()*1280;const s=this.add.rectangle(x,-30-Math.random()*200,5+Math.random()*6,7,[0xc0d191,0xe6b5a3,0xf0d181,0x91bbbd][i%4]).setDepth(40);this.tweens.add({targets:s,y:750,x:x+Math.random()*200-100,angle:Math.random()*900,duration:4000+Math.random()*3000,onComplete:()=>s.destroy()});}}
 private updateMechanisms(delta:number,blocked:boolean){
  const seconds=Math.min(delta,40)/1000;
  if(blocked)return;
  const lead=this.birds[this.active];const move=(this.controls.isDown('right')?1:0)-(this.controls.isDown('left')?1:0);
  if(move&&isGrounded(lead.body.body!))for(const p of this.props){if(!p.pushBody||!p.target||this.ui.progress.done.includes(p.spec.id)||p.spec.requires&&!this.ui.progress.done.includes(p.spec.requires))continue;
   const dx=p.art.x-lead.body.x;if(Math.abs(dx)<90&&Math.sign(dx)===move&&Math.abs(lead.body.y-575)<65){const x=Phaser.Math.Clamp(p.art.x+move*115*seconds,p.spec.x-70,p.target);p.art.setX(x);p.label.setX(x);p.pushBody.setX(x);(p.pushBody.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();lead.body.setVelocityX(move*115);
    if(x>=p.target-1){this.solved(p.spec.id);if(p.spec.opens)this.solved(p.spec.opens);this.ui.toast('箱子压住开关，门打开啦！箱子会固定在这里，两只小鸟都可以离开。');}
   }
  }
  for(const [i,c] of (this.level.checkpoints||[]).entries())if(i>this.checkpoint&&(!c.requires||this.ui.progress.done.includes(c.requires))&&Math.abs(lead.body.x-c.x)<65&&isGrounded(lead.body.body!)){this.checkpoint=i;this.safe={x:c.x,y:c.y};this.sparkle(c.x,575);this.ui.toast('安全点已点亮。掉落后从这里继续，已开的机关会保留。');}
 }
 update(time:number,delta:number){
  if(!this.birds.length)return;const dt=Math.min(delta,40),lead=this.birds[this.active],other=this.birds[1-this.active];const blocked=this.ui.blocked||this.busy;
  if(!this.ui.title&&!document.hidden)this.ui.environmentSeconds+=Math.min(delta,100)/1000;
  this.atmosphere.update(this.ui.environmentSeconds);
  if(!blocked&&this.level.id==='lounge'&&!this.ui.progress.done.includes('boss')){this.ui.games.quiz(3,teacherQuiz,()=>{this.solved('boss');this.ui.games.clockout(()=>{this.solved('clockout');this.ui.toast('下班啦！现在可以安心布置生日派对。');});});return;}
  if(!blocked&&this.level.id==='lounge'&&!this.ui.progress.done.includes('clockout')){this.ui.games.clockout(()=>this.solved('clockout'));return;}
  if(blocked){this.birds.forEach(b=>b.body.setVelocityX(0));this.controls.clear();this.ui.prompt('');}
  else {
   const home=this.props.find(p=>p.spec.id==='home');
   if(home&&!this.ui.progress.done.includes('home')&&Math.abs(lead.body.x-home.spec.x)<70&&isGrounded(lead.body.body!)){this.interact(home);this.controls.endFrame();return;}
   if(this.controls.take('switch')){this.active=1-this.active;this.trail=[];this.still=0;this.jumpAt=-Infinity;this.ui.setBird(this.birds[this.active].color);this.controls.endFrame();return;}
   const move=(this.controls.isDown('right')?1:0)-(this.controls.isDown('left')?1:0);lead.body.setVelocityX(move*235);
   const grounded=isGrounded(lead.body.body!);
   if(grounded){lead.flapped=false;if(lead.body.body!.velocity.y>=0)lead.groundedAt=time;if(!this.level.checkpoints&&lead.body.y>515)this.safe={x:lead.body.x,y:530};}
   if(this.controls.take('jump')){this.jumpAt=time;if(!grounded&&time-lead.groundedAt>100&&lead.color==='blue'&&!lead.flapped){lead.body.setVelocityY(-355);lead.flapped=true;this.jumpAt=-Infinity;this.sparkle(lead.body.x,lead.body.y);}}
   if(time-this.jumpAt<130&&time-lead.groundedAt<100){lead.body.setVelocityY(-450);lead.groundedAt=-Infinity;this.jumpAt=-Infinity;this.ui.chirp(500,.04,.1);}
   this.updateMechanisms(delta,false);
   this.trail.push({x:lead.body.x,y:lead.body.y});if(this.trail.length>35)this.trail.shift();
   const target=this.trail[0]||{x:lead.body.x-70,y:lead.body.y};const dx=target.x-other.body.x;
   other.body.setVelocityX(Math.abs(dx)>52?Math.sign(dx)*Math.min(260,Math.abs(dx)*4):0);
   if(isGrounded(other.body.body!)&&((target.y<other.body.y-35&&Math.abs(dx)<220)||(Math.abs(dx)>100&&other.body.body!.blocked.right)))other.body.setVelocityY(-450);
   if(Math.abs(lead.body.x-other.body.x)>440)this.still+=dt;else this.still=0;
   if(this.still>1400){other.body.setPosition(Phaser.Math.Clamp(lead.body.x-65,70,this.level.width-70),lead.body.y-20);other.body.setVelocity(0);this.still=0;this.sparkle(other.body.x,other.body.y-20);}
   this.nearest=undefined;let best=120;
   for(const p of this.props){
    const s=p.spec;if(s.kind==='item'){
     if(s.item&&!this.ui.progress.items.includes(s.item)&&(!s.requires||this.ui.progress.done.includes(s.requires))&&Math.hypot(lead.body.x-s.x,lead.body.y-s.y)<85){collect(this.ui.progress,s.item);this.ui.save();this.refreshProps();this.sparkle(s.x,s.y);this.ui.showReward(s.item);this.ui.chirp(880);}
     continue;
    }
    const distance=Math.hypot(lead.body.x-p.art.x,lead.body.y-s.y);if(distance<best){best=distance;this.nearest=p;}
   }
   const nearExit=Math.abs(lead.body.x-this.level.exit)<105;
   this.ui.prompt(this.nearest?`E / 互动 · ${this.nearest.spec.label}`:nearExit&&this.level.next?'E / 互动 · 前往下一站':'');
   if(this.controls.take('interact')){
    if(this.nearest)this.interact(this.nearest);
    else if(nearExit&&this.level.next){if(canExit(this.level.id,this.ui.progress)){if(this.level.id==='cell'&&!this.ui.progress.montageSeen)this.ui.showMontage(false,()=>this.changeLevel('lounge'));else this.changeLevel(this.level.next);}else this.ui.toast(`还差一点点：${this.level.objective}`);}
   }
  }
  if(blocked)this.updateMechanisms(delta,true);
  for(const [i,b] of this.birds.entries()){
   const body=b.body.body as Phaser.Physics.Arcade.Body;if(b.body.y>790){b.body.setPosition(this.safe.x+i*45,this.safe.y);b.body.setVelocity(0);b.flapped=false;this.jumpAt=-Infinity;this.trail=[];if(i===this.active)this.ui.toast('回到安全点，再试一次。已经打开的机关不会重置。');}
   const moving=Math.abs(body.velocity.x)>10,air=!isGrounded(body);
   const pose=air?(b.flapped?3:2):moving?(Math.floor(time/150)%2):0;
   b.visual.setTexture(`bird-${b.color}-${pose}`).setPosition(b.body.x,b.body.y+27).setFlipX(body.velocity.x<-2);
   b.visual.setAngle(air?-5:moving?Math.sin(time/95)*3:Math.sin(time/1100+i)*1.4);
   b.visual.setScale(106/128,(106+(air?0:Math.sin(time/230+i)*1.2))/128);
   b.shadow.setPosition(b.body.x,Math.min(609,body.bottom+3)).setAlpha(air?.08:.18);
   b.name.setPosition(b.body.x,b.body.y-91).setText(b.color==='blue'?this.ui.config.blueName:this.ui.config.yellowName).setAlpha(i===this.active?1:.65).setVisible(!this.ui.title&&(i===this.active||Math.hypot(lead.body.x-b.body.x,lead.body.y-b.body.y)>130));
   if(!moving&&!air&&Math.floor(time/4500+i)%3===0)b.visual.setAngle(Math.sin(time/550)*5);
  }
  const active=this.birds[this.active];this.indicator?.setPosition(active.body.x,active.body.y-110+Math.sin(time/300)*3).setVisible(!this.ui.title);
  if(!this.ui.title)this.cameras.main.setScroll(cameraScroll(this.cameras.main.scrollX,active.body.x,1280,this.level.width,Math.min(delta,40)/1000),0);
  this.layoutLabels();
  this.controls.endFrame();
 }
}
