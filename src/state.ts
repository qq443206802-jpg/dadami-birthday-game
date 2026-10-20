export type LevelId = 'gate' | 'library' | 'approach' | 'lab' | 'cell' | 'lounge' | 'dorm';
export type ItemId = 'invite' | 'bookmark' | 'card' | 'star' | 'key';
export interface GameConfig { blueName: string; yellowName: string; recipient: string; wish: string; volume: number }
export interface Progress { version: 1; level: LevelId; items: ItemId[]; done: string[]; montageSeen: boolean }
export const LEVEL_IDS: LevelId[] = ['gate','library','approach','lab','cell','lounge','dorm'];
export const defaultConfig: GameConfig = { blueName:'小蓝', yellowName:'小黄', recipient:'亲爱的你', wish:'生日快乐，今天的快乐属于你。\n愿你的每一天，都有小小的惊喜和大大的拥抱。',volume:0.3 };
export const freshProgress = (): Progress => ({version:1,level:'gate',items:[],done:[],montageSeen:false});
export const hasProgress=(p:Progress)=>p.level!=='gate'||p.items.length>0||p.done.length>0||p.montageSeen;
export function collect(p: Progress, id: ItemId) { if (!p.items.includes(id)) p.items.push(id); }
export function complete(p: Progress, id: string) { if (!p.done.includes(id)) p.done.push(id); }
export function openChest(p:Progress,id:string,item:ItemId,requirements:string[],needsKey=false){
  if(p.done.includes(id)||!requirements.every(r=>p.done.includes(r))||(needsKey&&!p.items.includes('key')))return false;
  collect(p,item);complete(p,id);return true;
}
export function canExit(level: LevelId, p: Progress): boolean {
  const item = (id: ItemId) => p.items.includes(id), done = (id:string) => p.done.includes(id);
  switch(level) {
    case 'gate': return item('invite') && done('guard-puzzle');
    case 'library': return item('bookmark') && done('differences');
    case 'approach': return done('elevator');
    case 'lab': return item('card') && done('drawer') && done('bridge') && done('lab-quiz');
    case 'cell': return item('star') && done('cell-lock') && done('cell-quiz');
    case 'lounge': return item('invite') && item('card') && item('star') && done('party') && done('boss') && done('clockout');
    case 'dorm': return done('home');
  }
}
export function finishMontage(p:Progress) {p.montageSeen=true;p.level='lounge';}
export function finishJourney(p:Progress) {
  if(p.level!=='dorm'||!canExit('lounge',p)||p.done.includes('home'))return false;
  complete(p,'home');return true;
}
const SAVE_KEY='chirp-birthday-v1';
export type StoragePort = Pick<Storage,'getItem'|'setItem'>;
export function loadProgress(storage:StoragePort):Progress {
  try {
    const p = JSON.parse(storage.getItem(SAVE_KEY)||'null');
    if(!p || p.version!==1 || !LEVEL_IDS.includes(p.level) || !Array.isArray(p.items) || !Array.isArray(p.done) || typeof p.montageSeen!=='boolean') return freshProgress();
    if(!p.items.every((i:unknown)=>['invite','bookmark','card','star','key'].includes(String(i))) || !p.done.every((i:unknown)=>typeof i==='string')) return freshProgress();
    return {version:1,level:p.level,items:[...new Set(p.items)] as ItemId[],done:[...new Set(p.done)] as string[],montageSeen:p.montageSeen};
  } catch {return freshProgress();}
}
export function saveProgress(p:Progress,storage:StoragePort) {try {storage.setItem(SAVE_KEY,JSON.stringify(p));return true;}catch{return false;}}
