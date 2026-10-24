import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {assemble,root} from './build.mjs';
try{
 const expected=await assemble(),actual=await readFile(join(root,'index.html'),'utf8');
 if(expected!==actual)throw Error('index.html is out of date. Run npm run build and commit the result.');
 console.log('Source syntax and generated index.html: OK');
}catch(e){console.error(e.message);process.exitCode=1}
