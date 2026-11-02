import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
const files=JSON.parse(await readFile('source-map.json','utf8'));
for(const file of files){
 const destination='public/'+file.destination;
 await mkdir(dirname(destination),{recursive:true});
 let local=true;try{await access(file.source)}catch{local=false}
 if(local){await copyFile(file.source,destination)}
 else if(file.destination.startsWith('video/')){
  const url='https://github.com/Th3M0narchMoon/bdjl/releases/download/video-v1/'+encodeURIComponent(file.source);
  const response=await fetch(url);if(!response.ok)throw Error('No se pudo descargar '+file.source+': '+response.status);
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('El vídeo no coincide: '+file.source);
  await writeFile(destination,bytes);
 }else{throw Error('Falta '+file.source)}
}
await import('./prepare.mjs');
console.log('Web completa preparada con vídeo 1440p.');
