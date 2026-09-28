const CACHE='giaphaphamvan-v13';
const ASSETS=['/','/index.html','/styles.css?v=12','/app.js?v=12','/data.js?v=3','/backup-engine.js?v=3','/storage-engine.js?v=3','/cloud-adapter.js?v=3','/manifest.webmanifest','/icon.svg','/crest.svg','/dongson-header.svg','/hero-parchment.svg','/tree-parchment.svg','/heritage-bg.svg','/avatar-ancestor.svg','/avatar-1.svg','/avatar-2.svg','/avatar-3.svg','/avatar-4.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{
    const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;
  }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('/index.html'))));
});
