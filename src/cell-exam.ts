import {complete,type Progress} from './state';
import type {QuizQuestion} from './puzzles';

export const cellExamCases:{id:string;record:string;note:string;image:number;questions:QuizQuestion[]}[]=[
 {id:'msc',record:'观察记录 A',note:'常规二维培养 · 先看轮廓，再看排列',image:0,questions:[
  {question:'在本关的三类候选细胞中，这个典型培养视野更接近哪一种？',options:['T细胞的悬浮培养','上皮细胞的铺路石样单层','MSC的成纤维样贴壁培养','凭这一张图已经能确认细胞真实身份'],answer:2,explanation:'MSC在常规贴壁培养中常见梭形、成纤维样外观。本图是教学示意，形态相似不能代替身份和表型鉴定。'},
  {question:'师兄问：“你选MSC，主要依据是什么？”',options:['细胞伸展贴壁，多呈长梭形，方向并不完全一致','细胞都是规则圆球，漂浮在培养液里','细胞一定越大，干性就越强','图像越亮，细胞身份就越确定'],answer:0,explanation:'本视野的线索是贴壁伸展与长梭形。不能根据细胞大小或图像亮度判断干性；MSC的来源、表型与功能还需相应记录和检测。'}
 ]},
 {id:'t-cell',record:'观察记录 B',note:'常规悬浮培养示意 · 不同视野并非同一比例',image:1,questions:[
  {question:'与MSC、上皮细胞相比，这个视野更符合哪种常见培养情境？',options:['上皮样细胞形成连续单层','MSC在瓶底充分铺展','看到圆形就能判定细胞全部死亡','T细胞常规悬浮培养，圆形细胞散在或小团聚集'],answer:3,explanation:'常规T细胞悬浮培养中常可见圆形细胞，散在或成小团。圆形本身不等于死亡，也不是T细胞特有的形态。'},
  {question:'只凭这种圆形悬浮外观，能进一步判断什么？',options:['能直接区分CD4和CD8','不能确认亚群；需结合来源、标志物和相应检测','能直接证明这些细胞都是TSCM','能确定每个细胞的杀伤功能都很强'],answer:1,explanation:'不能通过这种形态直接识别CD4/CD8、TSCM或杀伤功能。真实样本需结合培养记录、表面标志物及对应的功能检测。'}
 ]},
 {id:'epithelial',record:'观察记录 C',note:'常规贴壁培养示意 · 留意细胞之间的连接',image:2,questions:[
  {question:'视野中多角形细胞彼此接近，呈铺路石样排列，更符合哪类典型形态？',options:['上皮样细胞单层','常规悬浮T细胞','只有长梭形的稀疏MSC','可以凭图直接判定具体组织来源'],answer:0,explanation:'许多上皮样细胞在常规贴壁条件下可呈多角形、铺路石样单层。这是典型形态线索，不能仅凭它判定组织来源或具体细胞系。'},
  {question:'准备给这瓶细胞写观察记录，哪句话最合适？',options:['密集，所以一定已经分化成熟','图里没有空隙，所以不需要再观察','记录铺展、细胞间边界和覆盖程度，再结合具体培养要求判断','长成一片，说明所有细胞身份都一样'],answer:2,explanation:'客观描述形态和覆盖程度，再结合具体细胞的培养要求。致密或连成片并不自动证明分化成熟、身份一致或状态良好。'}
 ]},
 {id:'interpretation',record:'观察记录 D',note:'记录提示：与此前相比，这瓶MSC更宽、更扁，颗粒感增加',image:3,questions:[
  {question:'师妹着急问：“是不是都衰老了，还是污染了？”你会怎样回答？',options:['变扁就证明全部衰老，直接下结论','仅记录形态变化，结合培养史、增殖/活性及针对性检测再判断','看到颗粒就能断定是哪一种污染','和T细胞一样圆就说明都健康'],answer:1,explanation:'不能仅凭变大、变扁或颗粒感就诊断衰老、死亡或污染。先记录变化，再结合培养历史、增殖/活性及所怀疑问题的相应检测核实。'}
 ]}
];
const flag=(caseIndex:number,questionIndex:number)=>`cell-v2-${caseIndex}-${questionIndex}`;
export function nextCellQuestion(p:Progress){
 for(let caseIndex=0;caseIndex<cellExamCases.length;caseIndex++)for(let questionIndex=0;questionIndex<cellExamCases[caseIndex].questions.length;questionIndex++)if(!p.done.includes(flag(caseIndex,questionIndex)))return {caseIndex,questionIndex};
 return undefined;
}
export function answerCellCase(p:Progress,caseIndex:number,questionIndex:number,choice:number){
 const next=nextCellQuestion(p);
 if(!next||next.caseIndex!==caseIndex||next.questionIndex!==questionIndex||cellExamCases[caseIndex].questions[questionIndex].answer!==choice)return false;
 complete(p,flag(caseIndex,questionIndex));
 if(!nextCellQuestion(p)){complete(p,'cell-lock');complete(p,'cell-exam-v2');}
 return true;
}
