import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const root=resolve('dist'),files=[];
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files.push(p);}}
await walk(root);
const errors=[];
for(const file of files.filter(x=>/\.(html|css|js)$/.test(x))){
 const text=await readFile(file,'utf8');
 if(/(?:https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?|file:\/\/\/)/.test(text))errors.push(`${file}: local-only URL`);
 if(/["'`]\/assets\//.test(text))errors.push(`${file}: origin-root asset URL`);
 const urls=file.endsWith('.css')?[...text.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)].map(m=>m[1]):file.endsWith('.html')?[...text.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]):[];
 for(const url of urls){if(/^(?:data:|https?:|#)/.test(url))continue;const path=resolve(dirname(file),url.split('?')[0]);if(!files.includes(path))errors.push(`${file}: missing ${url}`);}
}
for(const name of ['birthday-cake.html','assets/birds.webp','assets/npcs.webp','assets/campus-night.webp','assets/library-night.webp','assets/lab524.webp','assets/cell.webp','assets/cell-morphology.webp','assets/group-meeting.webp','assets/dorm-room.webp','assets/birds-sleep.webp'])if(!files.includes(resolve(root,name)))errors.push(`Missing ${name}`);
const bytes=(await Promise.all(files.map(async f=>(await stat(f)).size))).reduce((a,b)=>a+b,0);
console.log(JSON.stringify({files:files.length,bytes,megabytes:+(bytes/1e6).toFixed(2),errors},null,2));
if(errors.length)process.exitCode=1;
