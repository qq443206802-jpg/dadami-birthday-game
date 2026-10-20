export interface LabelRect {x:number;y:number;width:number;height:number}
export function overlaps(a:LabelRect,b:LabelRect){return a.x<b.x+b.width+6&&a.x+a.width+6>b.x&&a.y<b.y+b.height+6&&a.y+a.height+6>b.y;}
export function placeSceneLabel(x:number,y:number,width:number,height:number,obstacles:LabelRect[],worldWidth:number):LabelRect|null{
 const left=Math.max(8,Math.min(worldWidth-width-8,x-width/2));
 for(const offset of [0,-36,36,-72,72,-108,108,-144]){
  const candidate={x:left,y:y-height/2+offset,width,height};
  if(candidate.y<185||candidate.y+height>530)continue;
  if(!obstacles.some(r=>overlaps(candidate,r)))return candidate;
 }
 return null;
}
