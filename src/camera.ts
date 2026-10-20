// Adapted from Cendric Camera.cpp / SpeedupPullCamera.cpp (MIT).
// Copyright (c) 2018 Isa Roesch & Tizian Zeltner. See public/licenses/Cendric-MIT.txt.
// A smaller focus window leaves more of the next platform visible for our birds.
export function cameraScroll(left:number,focus:number,width:number,worldWidth:number,seconds:number){
 let target=left;
 if(focus<left+width*.30)target=focus-width*.30;
 else if(focus>left+width*.55)target=focus-width*.55;
 const next=left+(target-left)*Math.min(1,seconds*5);
 return Math.max(0,Math.min(worldWidth-width,next));
}
