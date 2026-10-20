import {it,expect} from 'vitest';
import {cellExamCases,nextCellQuestion,answerCellCase} from '../src/cell-exam';
import {freshProgress,saveProgress,loadProgress,canExit,collect,complete} from '../src/state';
import {getLevel} from '../src/levels';

it('has no box or push requirement in the cell room',()=>{
 const level=getLevel('cell');
 expect(level.props.some(p=>p.kind==='box'||p.target!==undefined||p.kind==='plate')).toBe(false);
 expect(level.props.find(p=>p.id==='microscope')?.bird).toBeUndefined();
});
it('covers MSC, T and epithelial morphology plus a separate interpretation case',()=>{
 expect(cellExamCases.map(c=>c.id)).toEqual(['msc','t-cell','epithelial','interpretation']);
 expect(cellExamCases.slice(0,3).every(c=>c.questions.length===2)).toBe(true);
 expect(cellExamCases[3].questions[0].explanation).toContain('不能');
});
it('does not award progress for wrong, out-of-order or repeated answers',()=>{
 const p=freshProgress(),answer=cellExamCases[0].questions[0].answer;
 expect(answerCellCase(p,0,0,(answer+1)%4)).toBe(false);
 expect(answerCellCase(p,1,0,cellExamCases[1].questions[0].answer)).toBe(false);
 expect(p.done).toEqual([]);
 expect(answerCellCase(p,0,0,answer)).toBe(true);
 expect(answerCellCase(p,0,0,answer)).toBe(false);
 expect(p.done).toHaveLength(1);
});
it('resumes a saved question and opens the chest only after all observations',()=>{
 let p=freshProgress();complete(p,'cell-quiz');
 answerCellCase(p,0,0,cellExamCases[0].questions[0].answer);
 let value='';const storage={getItem:()=>value,setItem:(_k:string,v:string)=>{value=v;}};
 saveProgress(p,storage);p=loadProgress(storage);
 expect(nextCellQuestion(p)).toEqual({caseIndex:0,questionIndex:1});
 while(nextCellQuestion(p)){
  expect(p.done).not.toContain('cell-exam-v2');
  const next=nextCellQuestion(p)!;
  answerCellCase(p,next.caseIndex,next.questionIndex,cellExamCases[next.caseIndex].questions[next.questionIndex].answer);
 }
 expect(p.done).toContain('cell-lock');expect(p.done).toContain('cell-exam-v2');
 expect(p.items).not.toContain('star');expect(canExit('cell',p)).toBe(false);
 collect(p,'star');expect(canExit('cell',p)).toBe(true);
});
it('does not let the old geometric matching flags skip the new observation challenge',()=>{
 const p=freshProgress();for(const id of ['cell-0','cell-1','cell-2','cell-lock'])complete(p,id);
 expect(nextCellQuestion(p)).toEqual({caseIndex:0,questionIndex:0});
});
