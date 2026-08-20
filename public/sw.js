const CACHE="building-manager-shell-v1";
const PRECACHE=["/offline","/icon.png","/icon-192.png","/icon-maskable.png","/apple-icon.png"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE)));
  self.skipWaiting();
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==="navigate"){
    event.respondWith(fetch(request).catch(()=>caches.match("/offline")));
    return;
  }
  if(url.pathname.startsWith("/_next/static/")||["/icon.png","/icon-192.png","/icon-maskable.png","/apple-icon.png"].includes(url.pathname)){
    event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      const clone=response.clone();
      caches.open(CACHE).then(cache=>cache.put(request,clone));
      return response;
    })));
  }
});
