/* DuoStatic — estudo offline. Mude a versão ao atualizar a lista de arquivos. */
const CACHE_PREFIX="duostatic-app-";
const CACHE_VERSION="duostatic-app-v2026-11-20-6";
const OFFLINE_ASSETS=[
 "./",
 "./index.html",
 "./manifest.webmanifest",
 "./css/style.css",
 "./css/fluxo.css",
 "./js/dados.js",
 "./js/excel.js",
 "./js/guiado.js",
 "./js/conceitos.js",
 "./js/ajuda.js",
 "./css/ajuda.css",
 "./css/conceitos.css",
 "./css/guiado.css",
 "./js/fluxo.js",
 "./js/app.js",
 "./js/offline.js",
 "./assets/app-icon.svg",
 "./assets/mascote.svg",
 "./assets/arle-calma.webp",
 "./assets/arle-sentada.webp",
 "./assets/arle-pensativa.webp",
 "./assets/arle-vitoria.webp",
 "./assets/arle-irritada.webp"
];

self.addEventListener("install",event=>{
 event.waitUntil(
   caches.open(CACHE_VERSION)
    .then(cache=>cache.addAll(OFFLINE_ASSETS))
    .then(()=>self.skipWaiting())
 );
});

self.addEventListener("activate",event=>{
 event.waitUntil(
   caches.keys()
     .then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_VERSION).map(k=>caches.delete(k))))
     .then(()=>self.clients.claim())
 );
});

self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET")return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 if(url.pathname.endsWith("/sw.js"))return;
 event.respondWith((async()=>{
   const cache=await caches.open(CACHE_VERSION);
   try{
     const response=await fetch(req);
     if(response.ok&&response.type!=="opaque"){
       // Falha por falta de espaço no cache não pode derrubar uma página online.
       try{await cache.put(req,response.clone())}catch(error){console.warn("Cache sem espaço:",error)}
     }
     return response;
   }catch(_networkError){
     const saved=await cache.match(req,{ignoreSearch:true});
     if(saved)return saved;
     if(req.mode==="navigate"){
       const entry=await cache.match("./index.html");
       if(entry)return entry;
     }
     return new Response("Arquivo indisponível sem internet. Conecte-se para carregar novos recursos.",{
       status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}
     });
   }
 })());
});
