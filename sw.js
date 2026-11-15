const CACHE = "ani-guesser-v1";
const SHELL =[
    "./",
    "index.html",
    "style.css",
    "manifest.json",
    "icons/icon-192.png",
    "icons/icon-512.png",
    "js/util.js",
    "js/sfx.js",
    "js/limits.js",
    "js/store.js",
    "js/stats.js",
    "js/api.js",
    "js/hl.js",
    "js/px.js",
    "js/clues.js",
    "js/daily.js",
    "js/app.js"
];
self.addEventListener("install",e=>{
    e.waitUntil(
        caches.open(CACHE)
        .then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{}))))
        .then(()=> self.skipWaiting())
    );
});
self.addEventListener("activate", e=>{
    e.waitUntil(
        caches.keys()
        .then(keys=>Promise.all(keys.filter(k => k !==CACHE).map(k=>caches.delete(k))))
        .then(()=>self.clients.claim())
    );
});
self.addEventListener("fetch", e=>{
    const req=e.request;
    if(req.method !== "GET") return;
    const url=new URL(req.url);
    if(url.origin !== location.orign) return;
    e.respondWith(
        fetch(req)
        .then(res=>{
            if(res.ok){
                const copy=res.clone();
                caches.open(CACHE).then(c=> c.put(req,copy));
            }
            return res;
        })
        .catch(()=> caches.match(req).then(r=>r||caches.match("index.html")))
    );
});