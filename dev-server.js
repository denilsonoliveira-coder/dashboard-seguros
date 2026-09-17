const http=require('http'),fs=require('fs'),path=require('path');
const root=fs.existsSync(path.join(__dirname,'dist'))?path.join(__dirname,'dist'):path.join(__dirname,'src');
const map={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
http.createServer((req,res)=>{let p=req.url==='/'?'/index.html':req.url.split('?')[0];if(p==='/dashboard.json'&&!fs.existsSync(path.join(root,p)))p='../public/dashboard.json';const f=path.normalize(path.join(root,p));fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end('Not found')}res.setHeader('Content-Type',map[path.extname(f)]||'application/octet-stream');res.end(b)})}).listen(3000,()=>console.log('http://localhost:3000'));
