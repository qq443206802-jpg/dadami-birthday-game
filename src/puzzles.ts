export function findMatches(board:number[],size:number):Set<number>{
 const found=new Set<number>();
 for(let r=0;r<size;r++)for(let c=0;c<size;c++){
  const i=r*size+c;if(c+2<size&&board[i]===board[i+1]&&board[i]===board[i+2]){found.add(i);found.add(i+1);found.add(i+2);}
  if(r+2<size&&board[i]===board[i+size]&&board[i]===board[i+2*size]){found.add(i);found.add(i+size);found.add(i+2*size);}
 }return found;
}
export function swapTiles(board:number[],a:number,b:number,size:number):number[]|null{
 if(a<0||b<0||a>=board.length||b>=board.length||Math.abs(Math.floor(a/size)-Math.floor(b/size))+Math.abs(a%size-b%size)!==1)return null;
 const next=[...board];[next[a],next[b]]=[next[b],next[a]];return next;
}
export function legalMoves(board:number[],size:number):[number,number][]{
 const moves:[number,number][]=[];for(let i=0;i<board.length;i++)for(const j of [i+1,i+size]){
  const next=swapTiles(board,i,j,size);if(next&&findMatches(next,size).size)moves.push([i,j]);
 }return moves;
}
export function makeBoard():number[]{
 for(let attempt=0;attempt<100;attempt++){
  const b:number[]=[];for(let i=0;i<25;i++){let n=Math.floor(Math.random()*5);while((i%5>=2&&b[i-1]===n&&b[i-2]===n)||(i>=10&&b[i-5]===n&&b[i-10]===n))n=(n+1)%5;b.push(n);}
  if(legalMoves(b,5).length)return b;
 }return [0,1,0,2,3,2,0,2,1,4,1,2,3,4,0,2,3,4,0,1,3,4,0,1,2];
}
export interface QuizQuestion {question:string;options:[string,string,string,string];answer:number;explanation:string}
export function makeGraduateGrid(different:number){
 const scenes=[
  {title:'起床',line:'再睡五分钟，就五分钟。',scene:'bed'},
  {title:'去工位去工位',line:'灵魂还在被窝里。',scene:'desk'},
  {title:'接受所有小饼干',line:'今天也要吃饱饱。',scene:'cookie'},
  {title:'证明自己是人',line:'可我们明明是鸟啊？',scene:'robot'},
  {title:'高雅人士品鉴文献中',line:'摘要看完，电量归零。',scene:'paper'},
  {title:'吃饭啦',line:'饭点到了，啾！',scene:'meal'},
  {title:'实验终于有了新的退展',line:'细胞挺好，我们未知。',scene:'lab'},
  {title:'刷一会儿，就一会儿',line:'已经过去一小时了。',scene:'phone'},
  {title:'I Love You 被被',line:'被窝，研究生充电站。',scene:'sleep'}
 ];
 return scenes.map((s,i)=>({...s,bird:i===different?'yellow' as const:'blue' as const}));
}
export function isGraduateMatch(cards:ReturnType<typeof makeGraduateGrid>,choice:number){return cards[choice]?.bird==='yellow';}
export const labQuiz:QuizQuestion[]=[
 {question:'把10×缓冲液稀释成10 mL的1×工作液，应取多少母液？',options:['0.1 mL','1 mL','5 mL','10 mL'],answer:1,explanation:'用C₁V₁=C₂V₂计算：10×V₁=1×10 mL，所以母液是1 mL，再补稀释液至总量10 mL。这里是纯粹的稀释计算题。'},
 {question:'在线弹性、小应变的相同条件下，杨氏模量更大的材料通常怎样？',options:['一定更柔软','一定没有弹性','更难产生同样的弹性应变','颜色一定更深'],answer:2,explanation:'杨氏模量是应力与弹性应变之比。相同小应变下，模量更大需要更大的应力。'},
 {question:'用F=kx描述AFM悬臂梁的小变形，弹簧常数k的SI单位是什么？',options:['牛顿/米（N/m）','帕斯卡（Pa）','秒（s）','毫升（mL）'],answer:0,explanation:'F的单位是N，x的单位是m，所以k的单位是N/m；材料杨氏模量的单位才是Pa。'}
];
export const cellQuiz:QuizQuestion[]=[
 {question:'细胞培养中，无菌操作最主要是为了什么？',options:['让培养瓶更好看','让细胞不再分裂','避免记录实验','降低微生物污染的风险'],answer:3,explanation:'无菌操作用于减少微生物污染；培养基、器具、工作区与操作习惯都需要重视。'},
 {question:'用倒置显微镜检查贴壁细胞时，首先应该留意什么？',options:['实验服的颜色','细胞形态、贴壁状态及异常迹象','仪器外壳是否反光','电脑壁纸'],answer:1,explanation:'细胞形态、贴壁状态及培养液中的异常颗粒等信息有助于识别生长状态和潜在污染。'},
 {question:'培养条件（例如CO₂浓度、培养基）应该如何确定？',options:['所有细胞都用同一套条件','只看旁边同学怎么做','依据具体细胞系、培养基说明和实验室规程','温度越高长得越快'],answer:2,explanation:'不同细胞和培养基可能需要不同条件，应以具体产品资料与实验室规程为准，不能把某个常用条件当作全部细胞的标准。'}
];
export const teacherQuiz:QuizQuestion[]=[
 {question:'组会PPT上，A、B是两个试样在线弹性小应变范围内的应力—应变曲线。A的斜率更大，通常说明什么？',options:['A的杨氏模量更小','A的杨氏模量更大，产生相同应变需要更大应力','A一定更容易断裂','只凭斜率就能确定细胞是否存活'],answer:1,explanation:'在线弹性、小应变的一维情境下，σ=Eε，应力—应变曲线的斜率是杨氏模量E。斜率更大意味着同样应变需要更大应力；它不能直接说明断裂性能或细胞活性。'},
 {question:'把AFM悬臂梁的小挠曲近似为线性弹簧：k=0.1 N/m，挠曲δ=100 nm。按F=kδ估算，力的大小是多少？',options:['1 nN','10 nN','100 nN','1000 nN'],answer:1,explanation:'100 nm=100×10⁻⁹ m。F=0.1×100×10⁻⁹ N=10×10⁻⁹ N=10 nN。这里的δ是悬臂梁挠曲，不是直接把样品压入深度代进去。'},
 {question:'给一个黏弹性样品施加小变形，并保持应变不变，测得应力随时间逐渐下降。这个现象叫什么？',options:['蠕变：保持应力，观察应变变化','纯弹性：应力始终不变','应力松弛：保持应变，观察应力下降','仅凭这条曲线就能判断细胞死亡'],answer:2,explanation:'保持应变、观察应力随时间减小，叫应力松弛。蠕变通常是保持应力、观察应变随时间增加。先说清楚控制条件，再解释曲线。老师：“概念讲清楚啦，今天早点去过生日。”'}
];
