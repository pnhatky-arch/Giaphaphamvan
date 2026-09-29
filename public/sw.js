const CACHE='giaphaphamvan-v23';
const ASSETS=['/','/index.html','/styles.css?v=12','/target-ui.css?v=3','/reference-polish.css?v=1','/parchment-v4.css?v=4','/reference-exact.css?v=1','/liquid-menu.css?v=4','/app.js?v=12','/data.js?v=3','/backup-engine.js?v=3','/storage-engine.js?v=3','/cloud-adapter.js?v=3','/manifest.webmanifest','/icon.svg','/crest.svg?v=4','/reference-crest.webp?v=1','/reference-hero.webp?v=1','/reference-tree.webp?v=1','/dongson-header.svg?v=3','/hero-parchment.svg?v=4','/tree-parchment.svg?v=4','/heritage-bg.svg?v=4','/avatar-ancestor.svg','/avatar-1.svg','/avatar-2.svg','/avatar-3.svg','/avatar-4.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
    const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;
  }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('/index.html'))));
});
