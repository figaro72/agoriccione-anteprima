const http=require('http'),fs=require('fs');
http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end(fs.readFileSync('index.html'))}).listen(8765,'127.0.0.1',()=>console.log('ok'));
