import { describe, it, expect } from 'vitest';
import { freshProgress, hasProgress, collect, complete, canExit, loadProgress, saveProgress, finishMontage, openChest } from '../src/state';

describe('birthday journey', () => {
  it('offers continue after the gate puzzle before the first collectible',()=>{
    const p=freshProgress();expect(hasProgress(p)).toBe(false);complete(p,'guard-puzzle');expect(hasProgress(p)).toBe(true);
  });
  it('does not allow an aerial exit to bypass the fifth-floor elevator',()=>{
    const p=freshProgress();expect(canExit('approach',p)).toBe(false);
    complete(p,'elevator');expect(canExit('approach',p)).toBe(true);
  });
  it('only opens a locked chest after the mechanism and key are both present',()=>{
    const p=freshProgress();expect(openChest(p,'lab-chest','card',['bridge'],true)).toBe(false);
    complete(p,'bridge');expect(openChest(p,'lab-chest','card',['bridge'],true)).toBe(false);
    collect(p,'key');expect(openChest(p,'lab-chest','card',['bridge'],true)).toBe(true);
    expect(p.items).toContain('card');expect(openChest(p,'lab-chest','card',['bridge'],true)).toBe(false);
    expect(p.items.filter(i=>i==='card')).toHaveLength(1);
  });
  it('requires the library observation challenge and reward, without a box switch', () => {
    const p=freshProgress(); expect(canExit('library',p)).toBe(false);
    collect(p,'bookmark'); expect(canExit('library',p)).toBe(false);
    complete(p,'differences');expect(canExit('library',p)).toBe(true);
  });
  it('blocks exits before required items and mechanisms', () => {
    const p = freshProgress();
    expect(canExit('gate', p)).toBe(false);
    collect(p, 'invite');complete(p,'guard-puzzle'); expect(canExit('gate', p)).toBe(true);
    expect(canExit('lab', p)).toBe(false);
    collect(p, 'card'); complete(p, 'drawer'); complete(p, 'bridge');
    complete(p,'lab-quiz');expect(canExit('lab', p)).toBe(true);
    expect(canExit('lounge', p)).toBe(false);
    complete(p, 'party'); expect(canExit('lounge', p)).toBe(false);
    collect(p, 'star');complete(p,'boss');complete(p,'clockout');expect(canExit('lounge', p)).toBe(true);
  });
  it('collects items and mechanisms only once', () => {
    const p = freshProgress(); collect(p, 'invite'); collect(p, 'invite');
    complete(p, 'drawer'); complete(p, 'drawer');
    expect(p.items).toEqual(['invite']); expect(p.done).toEqual(['drawer']);
  });
  it('round trips progress and survives broken or unavailable storage', () => {
    const p = freshProgress(); p.level = 'cell'; collect(p, 'card');
    let value = ''; const storage = { getItem: () => value, setItem: (_k: string, v: string) => { value = v; } };
    expect(saveProgress(p, storage)).toBe(true); expect(loadProgress(storage)).toEqual(p);
    value = '{bad'; expect(loadProgress(storage)).toEqual(freshProgress());
    value = JSON.stringify({version:1,level:'made-up',items:[],done:[],montageSeen:false});
    expect(loadProgress(storage)).toEqual(freshProgress());
    const denied = { getItem: () => { throw Error('denied'); }, setItem: () => { throw Error('denied'); } };
    expect(saveProgress(p, denied)).toBe(false); expect(loadProgress(denied)).toEqual(freshProgress());
  });
  it('normal completion and skipping the montage have the same destination', () => {
    const a = freshProgress(), b = freshProgress();
    finishMontage(a); finishMontage(b); expect(a).toEqual(b);
    expect(a.level).toBe('lounge'); expect(a.montageSeen).toBe(true);
  });

});
