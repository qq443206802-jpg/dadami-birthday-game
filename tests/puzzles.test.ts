import {it,expect} from 'vitest';
import {findMatches,swapTiles,makeBoard,legalMoves} from '../src/puzzles';
it('finds horizontal and vertical triples without treating diagonals as matches',()=>{
 expect([...findMatches([0,0,0,1,2,1,2,1,2],3)].sort()).toEqual([0,1,2]);
 expect([...findMatches([1,0,2,1,2,0,1,0,2],3)].sort()).toEqual([0,3,6]);
 expect(findMatches([0,1,2,1,0,2,2,1,0],3).size).toBe(0);
});
it('only swaps adjacent match-3 tiles and retains the source board',()=>{
 const b=[0,1,0,2,0,1,1,2,2];expect(swapTiles(b,0,8,3)).toBeNull();
 expect(swapTiles(b,1,4,3)).toEqual([0,0,0,2,1,1,1,2,2]);expect(b[1]).toBe(1);
});
it('creates boards with no free matches and at least one legal move',()=>{
 for(let i=0;i<25;i++){const b=makeBoard();expect(b).toHaveLength(25);expect(findMatches(b,5).size).toBe(0);expect(legalMoves(b,5).length).toBeGreaterThan(0);}
});
