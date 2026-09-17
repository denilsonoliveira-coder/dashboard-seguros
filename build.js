const fs=require('fs'),path=require('path');
const root=__dirname,dist=path.join(root,'dist');
fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
for(const name of ['index.html','styles.css','app.js'])fs.copyFileSync(path.join(root,'src',name),path.join(dist,name));
fs.copyFileSync(path.join(root,'public','dashboard.json'),path.join(dist,'dashboard.json'));
for(const name of ['index.html','styles.css','app.js','dashboard.json'])if(!fs.existsSync(path.join(dist,name)))throw new Error('Arquivo ausente: '+name);
JSON.parse(fs.readFileSync(path.join(dist,'dashboard.json'),'utf8'));
console.log('Build concluido: dist/');
