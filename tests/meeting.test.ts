import {it,expect} from 'vitest';
import {teacherQuiz} from '../src/puzzles';

it('has exactly three four-choice biomechanics questions',()=>{
 expect(teacherQuiz).toHaveLength(3);
 for(const q of teacherQuiz){expect(q.options).toHaveLength(4);expect(q.answer).toBeGreaterThanOrEqual(0);expect(q.answer).toBeLessThan(4);expect(q.explanation.length).toBeGreaterThan(20);}
});
it('uses consistent force units for the AFM calculation',()=>{
 const forceInNanoNewtons=.1*100e-9/1e-9;
 expect(forceInNanoNewtons).toBeCloseTo(10);
 expect(teacherQuiz[1].options[teacherQuiz[1].answer]).toBe('10 nN');
});
