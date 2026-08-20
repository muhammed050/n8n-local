const CACHE='who-v10';
const CORE=['./','./index.html'];
const timeout=(p,ms)=>Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(new Error('network-timeout')),ms))]);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(async cache=>{for(const url of CORE){try{await cache.add(url)}catch(e){}}}).then(()=>self.skipWaiting()))});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;event.respondWith(timeout(fetch(event.request,{cache:'no-store'}),5000).then(response=>{if(response.ok)event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,response.clone())).catch(()=>{}));return response}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html').then(fallback=>fallback||Response.error()))))});