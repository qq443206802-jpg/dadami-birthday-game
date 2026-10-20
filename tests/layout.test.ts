import {it,expect} from 'vitest';
import {placeSceneLabel,overlaps} from '../src/layout';

it('moves a label away from building signs and other labels',()=>{
 const obstacles=[{x:190,y:330,width:300,height:105},{x:50,y:270,width:200,height:28}];
 const label=placeSceneLabel(105,350,160,28,obstacles,2200);
 expect(label).not.toBeNull();
 for(const r of obstacles)expect(overlaps(label!,r)).toBe(false);
});
it('hides labels when no clear space exists and keeps long names inside the world',()=>{
 expect(placeSceneLabel(100,350,180,30,[{x:0,y:0,width:2200,height:720}],2200)).toBeNull();
 expect(placeSceneLabel(20,350,180,30,[],2200)!.x).toBeGreaterThanOrEqual(8);
});
