import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join,resolve} from 'node:path';
import {Script} from 'node:vm';
export const root=dirname(dirname(fileURLToPath(import.meta.url)));
export const parts=['1_head.html','2_core.js','3_draw.js','4_ui.js','6_sandbox.js','5_boot.js'];
export async function assemble(){
 const text=(await Promise.all(parts.map(p=>readFile(join(root,'src',p),'utf8')))).join('\n')+'\n</script>\n</body>\n</html>\n';
 const start=text.indexOf('<script>')+8,end=text.lastIndexOf('</script>');
 if(start<8||end<start)throw new Error('Missing application script');
 new Script(text.slice(start,end),{filename:'kartograf.js'});
 return text;
}
export async function build(){const html=await assemble();await writeFile(join(root,'index.html'),html);return html}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 try{const html=await build();console.log(`Built index.html · ${Buffer.byteLength(html)} bytes`)}catch(e){console.error(e.message);process.exitCode=1}
}
