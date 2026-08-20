const CACHE="building-manager-shell-v2";
const PRECACHE=["/offline","/icon.png","/icon-192.png","/icon-maskable.png","/apple-icon.png"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("push",event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{data={body:event.data?event.data.text():""}}
  const title=data.title||"Building Community";
  const options={
    body:data.body||"You have a new update.",
    icon:"/icon-192.png",
    badge:"/icon-192.png",
    tag:`${data.tag||"building-manager-update"}-${Date.now()}`,
    renotify:true,
    data:{url:data.url||"/"}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||"/",self.location.origin).href;
  event.waitUntil((async()=>{
    const windows=await clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of windows){
      if("focus" in client){
        if("navigate" in client)await client.navigate(target);
        return client.focus();
      }
    }
    return clients.openWindow(target);
  })());
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
