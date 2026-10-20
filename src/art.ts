import Phaser from 'phaser';
export const palette={ink:0x42523d,green:0x73835a,cream:0xf4edcf,wood:0xa08c62,rose:0xc9927f};
export function makeBirdTextures(scene:Phaser.Scene) {
 const image=scene.textures.get('bird-sheet').getSourceImage() as HTMLImageElement;
 for(const [row,color] of ['blue','yellow'].entries()) for(let pose=0;pose<4;pose++) {
  const tex=scene.textures.createCanvas(`bird-${color}-${pose}`,128,128)!;
  const ctx=tex.context, sw=image.width/4,sh=image.height/2;
  const probe=document.createElement('canvas');probe.width=sw;probe.height=sh;
  const pc=probe.getContext('2d')!;pc.drawImage(image,pose*sw,row*sh,sw,sh,0,0,sw,sh);
  const pixels=pc.getImageData(0,0,sw,sh).data;let minX=sw,minY=sh,maxX=0,maxY=0;
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++)if(pixels[(y*sw+x)*4+3]>25){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
  if(maxX>minX){const w=maxX-minX+1,h=maxY-minY+1;const scale=Math.min(112/w,112/h);ctx.drawImage(probe,minX,minY,w,h,64-w*scale/2,116-h*scale,w*scale,h*scale);}
  tex.refresh();
 }
}
export function makeNpcTextures(scene:Phaser.Scene){
 const image=scene.textures.get('npc-sheet').getSourceImage() as HTMLImageElement;
 for(let role=0;role<4;role++){
  const sw=Math.floor(image.width/4),sh=image.height,probe=document.createElement('canvas');probe.width=sw;probe.height=sh;const ctx=probe.getContext('2d')!;ctx.drawImage(image,role*sw,0,sw,sh,0,0,sw,sh);
  const pixels=ctx.getImageData(0,0,sw,sh).data;let x0=sw,y0=sh,x1=0,y1=0;for(let y=0;y<sh;y++)for(let x=0;x<sw;x++)if(pixels[(y*sw+x)*4+3]>30){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  const tex=scene.textures.createCanvas(`npc-${role}`,200,300)!;if(x1>x0){const w=x1-x0+1,h=y1-y0+1,s=Math.min(190/w,290/h);tex.context.drawImage(probe,x0,y0,w,h,100-w*s/2,295-h*s,w*s,h*s);}tex.refresh();
 }
}
export function platformArt(scene:Phaser.Scene,x:number,y:number,w:number,h:number,kind='stone') {
 const g=scene.add.graphics();const wood=kind==='wood',books=kind==='books';
 const fill=wood?0xb79b6c:books?0x969d7a:0xb7b99b;
 g.fillStyle(fill).fillRoundedRect(x-w/2,y-h/2,w,h,5);g.lineStyle(3,0x263c40,.95).strokeRoundedRect(x-w/2,y-h/2,w,h,5);
 g.fillStyle(0xffe8ad).fillRoundedRect(x-w/2,y-h/2,w,7,3);g.lineStyle(1,0xfff7d5,.9).lineBetween(x-w/2+5,y-h/2,x+w/2-5,y-h/2);
 g.fillStyle(0x526b63).fillCircle(x-w/2+12,y+h/2-9,3).fillCircle(x+w/2-12,y+h/2-9,3);
 g.lineStyle(1,0x727c5c,.4);for(let a=x-w/2+25;a<x+w/2;a+=49){g.lineBetween(a,y-h/2+9,a+3,y+h/2-4);}
 if(!wood&&!books){g.lineStyle(2,0x6a8151,.7);for(let a=x-w/2+13;a<x+w/2;a+=28){g.lineBetween(a,y-h/2+1,a-5,y-h/2-5);g.lineBetween(a,y-h/2+1,a+4,y-h/2-8);}}
 return g;
}
export function propArt(scene:Phaser.Scene,kind:string,x:number,y:number) {
 const c=scene.add.container(x,y);const g=scene.add.graphics();c.add(g);
 const rect=(a:number,b:number,w:number,h:number,fill:number)=>{g.fillStyle(fill).fillRoundedRect(a,b,w,h,4);g.lineStyle(1.5,0x4f6049,.8).strokeRoundedRect(a,b,w,h,4);};
 const line=(x1:number,y1:number,x2:number,y2:number)=>g.lineStyle(2,0x53634b).lineBetween(x1,y1,x2,y2);
 if(kind.startsWith('npc-')){const role=Number(kind.slice(4));c.add(scene.add.image(0,35,`npc-${role}`).setDisplaySize(150,225).setOrigin(.5,1));}
 else if(kind==='chest'){g.fillStyle(0xf0d283,.15).fillCircle(0,-10,57);rect(-47,-19,94,49,0xa9804c);g.fillStyle(0xc39b5b).fillRoundedRect(-47,-49,94,34,{tl:16,tr:16,bl:0,br:0});g.lineStyle(2,0x68543b).strokeRoundedRect(-47,-49,94,34,10);g.fillStyle(0xe0c77b).fillRect(-31,-45,9,72).fillRect(24,-45,9,72);rect(-9,-15,18,25,0xe8cd7b);g.fillStyle(0x665c41).fillCircle(0,-4,3);}
 else if(kind==='door') {rect(-40,-100,80,150,0x9caa8e);rect(-29,-87,58,76,0xd6e0ce);g.fillStyle(0xe3cf8d).fillCircle(23,10,5);}
 else if(kind==='drawer'||kind==='cart'||kind==='box') {
  const h=kind==='cart'?62:48;rect(-55,-h,110,h+25,kind==='box'?0xd5bb85:0xb49c73);
  if(kind==='cart'){for(let i=0;i<5;i++){rect(-46+i*18,-55,15,38,[0x8a9c82,0xb98572,0xd5bf84][i%3]);}g.fillStyle(0x52634b).fillCircle(-35,34,8).fillCircle(35,34,8);line(-60,-70,-60,28);line(-70,-70,-55,-70);}
  else {line(-50,-8,50,-8);rect(-13,-27,26,8,0x776e51);if(kind==='box')rect(-22,-42,44,21,0xf2ebcf);}
 }
 else if(kind==='microscope'){rect(-50,15,100,13,0x6a7c68);line(-10,15,-10,-80);g.lineStyle(15,0x8b9b88).beginPath().moveTo(5,14).lineTo(35,-22).lineTo(10,-70).strokePath();rect(-23,-43,67,9,0xaebba2);g.lineStyle(13,0x516a5d).lineBetween(-10,-75,28,-99);rect(-23,-111,32,17,0xe1dfbb);}
 else if(kind==='rope'){g.lineStyle(4,0xa58a57).lineBetween(0,-67,0,20);g.lineStyle(2,0x606c45).strokeCircle(0,22,13);rect(-25,-78,50,16,0xc1b888);}
 else if(kind==='plate'){rect(-58,-5,116,12,0xd6a35f);g.lineStyle(2,0xffebac).lineBetween(-44,-8,44,-8);for(let a=-35;a<50;a+=22)g.lineStyle(2,0x876541).lineBetween(a,0,a+7,5);}
 else if(kind==='stand'){rect(-32,10,64,12,0xc6b28c);line(-20,22,-25,60);line(20,22,25,60);rect(-28,-38,56,45,0xf8efd0);g.lineStyle(2,0xb3bc94).lineBetween(-18,-22,18,-22);g.lineBetween(-18,-12,10,-12);}
 else if(kind==='curtain'){rect(-85,-130,170,195,0x71856e);for(let a=-70;a<80;a+=20)g.lineStyle(2,0x4c6858,.5).lineBetween(a,-122,a,60);g.lineStyle(5,0xc2a36d).lineBetween(-96,-137,96,-137);g.lineStyle(3,0xd8bb77).lineBetween(78,-125,94,28);g.lineStyle(2,0x51604a).strokeCircle(94,35,8);}
 else if(kind==='bench'){rect(-80,-18,160,16,0xbca579);rect(-80,-65,160,14,0xc9b486);rect(-80,-44,160,14,0xc9b486);line(-63,-50,-63,45);line(63,-50,63,45);}
 else if(kind==='item'){g.fillStyle(0xf7e7a1,.2).fillCircle(0,-5,34);rect(-22,-27,44,39,0xfff4d6);g.lineStyle(1.5,0xb7a36c).lineBetween(-20,-25,0,-7).lineBetween(0,-7,20,-25);g.fillStyle(0xc89381).fillCircle(0,-8,5);}
 return c;
}
export function deco(scene:Phaser.Scene,width:number,indoor:boolean) {
 const g=scene.add.graphics().setDepth(4);const random=new Phaser.Math.RandomDataGenerator(['birthday-flowers']);
 if(!indoor)for(let x=10;x<width;x+=34){const y=611+random.between(-4,8);g.lineStyle(1.4,0x607e4a).lineBetween(x,y,x+3,y-15);g.fillStyle(0x82945c).fillEllipse(x-3,y-9,10,4);if(x%3===0){g.fillStyle([0xf1e3b4,0xddb1a2,0xe9d07f][random.between(0,2)]).fillCircle(x+3,y-16,4);g.fillStyle(0xb8984e).fillCircle(x+3,y-16,1.5);}}
}
export function buildingSign(scene:Phaser.Scene,label:string,x:number,y:number) {
 const t=scene.add.text(x,y,label,{fontFamily:'"Microsoft YaHei",sans-serif',fontSize:'20px',color:'#465b43',backgroundColor:'#f7eed9',padding:{x:18,y:10}}).setOrigin(.5).setDepth(3);
 return t;
}
