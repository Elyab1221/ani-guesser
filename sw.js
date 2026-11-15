const CACHE = "ani-guesser-v2";
const IMG_CACHE = "ani-guesser-img-v1";
const IMG_MAX = 40;
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
async function trimImages(){
    const c = await caches.open(IMG_CACHE);
    const keys = await c.keys();
    for(let i = 0; i < keys.length - IMG_MAX; i++){
        await c.delete(keys[i]);
    }
}
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
        .then(keys=>Promise.all(keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k=>caches.delete(k))))
        .then(()=>self.clients.claim())
    );
});
self.addEventListener("fetch", e=>{
    const req=e.request;
    if(req.method !== "GET") return;
    const url=new URL(req.url);
        if(req.destination === "image" && url.origin !== location.origin){
        e.respondWith(
            caches.open(IMG_CACHE).then(c =>
                c.match(req).then(hit => {
                    if(hit) return hit;
                    return fetch(req).then(res => {
                        if(res.ok || res.type === "opaque"){
                            c.put(req, res.clone()).then(trimImages);
                        }
                        return res;
                    }).catch(() => Response.error());
                })
            )
        );
        return;
    }
    if(url.origin !== location.origin) return;
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