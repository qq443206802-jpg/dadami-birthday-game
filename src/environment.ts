import type Phaser from 'phaser';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export function environmentAt(seconds:number,night=false){
 const minutes=night?1200+(Math.max(0,seconds)/3)%240:(420+Math.max(0,seconds)*2)%1440,hour=minutes/60;
 const phase=hour>=5&&hour<7?'日出':hour>=7&&hour<17?'白天':hour>=17&&hour<19?'日落':'黑夜';
 const dark=hour<5||hour>=19?1:hour<7?1-(hour-5)/2:hour<17?0:(hour-17)/2;
 const slot=Math.floor(seconds/90)%4,part=seconds%90,blend=clamp(Math.min(part/8,(90-part)/8));
 const weather=slot===0?'晴天':slot===2?'下雨':'多云';
 return {clock:`${String(Math.floor(hour)).padStart(2,'0')}:${String(Math.floor(minutes%60)).padStart(2,'0')}`,phase,weather,dark,rain:slot===2?blend:0,cloud:slot===0?0:blend,warm:phase==='日出'||phase==='日落'?Math.sin((hour-(phase==='日出'?5:17))/2*Math.PI)*.22:0};
}
export class CampusAtmosphere {
 private sky:Phaser.GameObjects.Graphics;private rain:Phaser.GameObjects.Graphics;private glow:Phaser.GameObjects.Graphics;private shade:Phaser.GameObjects.Rectangle;private warm:Phaser.GameObjects.Rectangle;private label:HTMLElement;
 constructor(private scene:Phaser.Scene,private indoor:boolean){
  this.sky=scene.add.graphics().setScrollFactor(0).setDepth(-7);
  this.shade=scene.add.rectangle(640,360,1280,720,0x233e61,0).setScrollFactor(0).setDepth(24);
  this.warm=scene.add.rectangle(640,360,1280,720,0xefae77,0).setScrollFactor(0).setDepth(25);
  this.glow=scene.add.graphics().setScrollFactor(0).setDepth(26);
  this.rain=scene.add.graphics().setScrollFactor(0).setDepth(27);
  this.label=document.getElementById('campus-clock')!;
  if(!scene.textures.exists('paper-grain')){
   const tex=scene.textures.createCanvas('paper-grain',256,256)!;const ctx=tex.context;
   let seed=33;for(let n=0;n<8500;n++){seed=(seed*16807)%2147483647;const x=seed%256;seed=(seed*16807)%2147483647;const y=seed%256;ctx.fillStyle=n%2?'rgba(69,62,42,.06)':'rgba(255,253,227,.12)';ctx.fillRect(x,y,1,1);}tex.refresh();
  }
  scene.add.tileSprite(640,360,1280,720,'paper-grain').setScrollFactor(0).setDepth(28).setAlpha(.7);
 }
 update(seconds:number){
  const e=environmentAt(seconds,true);this.label.textContent=`☾ ${e.clock} · 夜游校园 · ${this.indoor?'窗外':''}${e.weather}`;
  this.label.title='本版设定为20:00至午夜的校园夜游；天气自动切换，离开页面时暂停。';
  this.shade.setAlpha(e.dark*(this.indoor?.05:.04)+e.cloud*.06);this.warm.setAlpha(0);
  this.sky.clear();this.glow.clear();this.rain.clear();if(this.indoor)return;
  const g=this.sky;
  if(e.dark>.2){g.fillStyle(0xfff4cf,.6);for(let i=0;i<15;i++)g.fillCircle(65+(i*173)%1150,35+(i*79)%170,1);}
  if(e.cloud>0){for(let i=0;i<5;i++){const x=((i*321-seconds*6)%1650+1650)%1650-180,y=60+(i%3)*47;g.fillStyle(0xc4cbbd,e.cloud*.45);for(let j=0;j<5;j++)g.fillEllipse(x+j*42,y+Math.sin(j)*9,95,38+j%2*12);}}
  if(e.dark>.15){for(const x of [120,1060]){this.glow.fillStyle(0xffe9a4,e.dark*.05);for(let r=60;r>10;r-=10)this.glow.fillCircle(x,435,r);this.glow.fillStyle(0xffe9ab,e.dark*.8).fillEllipse(x,435,10,16);}}
  if(e.rain>0){this.rain.lineStyle(1.5,0xdbebdf,e.rain*.55);for(let i=0;i<70;i++){const x=((i*137-seconds*95)%1400+1400)%1400-40,y=(i*89+seconds*450)%760-30;this.rain.lineBetween(x,y,x-7,y+20);}this.rain.lineStyle(1,0xe6eed9,e.rain*.4);for(let i=0;i<12;i++){const r=(seconds*12+i*7)%27;this.rain.strokeEllipse(60+i*103,620+(i%3)*20,r*2,r*.34);}}
 }
}
