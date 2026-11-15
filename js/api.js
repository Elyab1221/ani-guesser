const api={
    last:0 ,
    cache:{},
    skipJikanUntil:0,
    jikanError: "",
    seen:{},
    growPauseUntil:0,

    async throttle(){
        const gap=Date.now()-this.last;
        if(gap<limits.wait){
            await new Promise(r=>setTimeout(r,limits.wait-gap));
        }
        this.last=Date.now();
    },
    
async request(url,options={}){
    let lastErr=new Error("request failed");
    for(let attempt=0;attempt<limits.tries;attempt++){
        await this.throttle();
        const ctrl=new AbortController();
        const timer=setTimeout(()=>ctrl.abort(),limits.timeoutMs);
        try{
            const res=await fetch(url,{...options,signal:ctrl.signal});
            if(res.ok) return await res.json();
            lastErr=new Error(`http ${res.status}`);
            if(res.status!==429 && res.status<500) break;
        }catch(err){
            lastErr=err.name==="AbortError"?new Error("timeout"):err;
        }finally{
            clearTimeout(timer);
        }
    }
    throw lastErr;
},

    async fromJikan(pg){
        const json=await this.request(`${limits.url}/top/anime?page=${pg}&limit=${limits.perPage}`);
        const list=(json.data||[])
            .filter(x=>x.score && x.images?.jpg?.large_image_url)
            .map(x=>({
                id:x.mal_id,
                title:x.title_english||x.title,
                score:Number(x.score.toFixed(2)),
                year:x.year||x.aired?.prop?.from?.year||"-",
                studio:x.studios?.[0]?.name||"unknown",
                img:x.images.jpg.large_image_url,
                episodes:x.episodes||"?",
                genres:(x.genres||[]).map(g=>g.name).join(", ")
            }));
        if(!list.length) throw new Error("empty list");
        return list;
    },

    async fromBackup(pg){
        const query=`query($page:Int,$perPage:Int){
            Page(page:$page,perPage:$perPage){
                media(type:ANIME,sort:SCORE_DESC){
                    id
                    title{romaji english}
                    averageScore
                    seasonYear
                    startDate{year}
                    studios(isMain:true){nodes{name}}
                    coverImage{extraLarge large}
                    episodes
                    genres
                }
            }
        }`;
        const json=await this.request(limits.backupUrl,{
            method:"POST",
            headers:{"Content-Type":"application/json",Accept:"application/json"},
            body:JSON.stringify({query,variables:{page:pg,perPage:limits.perPage}})
        });
        const list=(json.data?.Page?.media||[])
            .filter(x=>x.averageScore && x.coverImage?.large)
            .map(x=>({
                id:x.id,
                title:x.title?.english||x.title?.romaji||"unknown",
                score:Number((x.averageScore/10).toFixed(2)),
                year:x.seasonYear||x.startDate?.year||"-",
                studio:x.studios?.nodes?.[0]?.name||"unknown",
                img:x.coverImage.large,
                episodes:x.episodes||"?",
                genres:(x.genres||[]).join(", ")
            }));
        if(!list.length) throw new Error("empty list");
        return list;
    },

    load(pg){
        try{
            const saved=JSON.parse(localStorage.getItem(limits.pageKey+pg));
            if(saved && Array.isArray(saved.list) && saved.list.length) return saved;
        }catch{}
        return null;
    },

    anyPage(total){
        for(let p=1;p<=total;p++){
            if(this.cache[p]?.length) return this.cache[p];
            const saved=this.load(p);
            if(saved) return saved.list;
        }
        return null;
    },

    save(pg,list){
        try{
            localStorage.setItem(limits.pageKey+pg,JSON.stringify({t:Date.now(),list}));
        }catch{}
    },

    async fromAnySource(pg){
        if(Date.now()>=this.skipJikanUntil){
            try{
                return await this.fromJikan(pg);
            }catch(err){
                console.warn("jikan failed:",err);
                this.jikanError=err.message;
                this.skipJikanUntil=Date.now()+limits.skipMs;
            }
        }
        try{
            return await this.fromBackup(pg);
        }catch(err){
            console.warn("backup failed:",err);
            throw new Error(`jikan ${this.jikanError||"skipped"}, backup ${err.message}`);
        }
    },

async loadPage(pg){
    if(this.cache[pg]?.length) return this.cache[pg];
    const saved=this.load(pg);
    if(saved && Date.now()-saved.t<limits.cacheMs){
        this.cache[pg]=saved.list;
        return saved.list;
    }
    let list;
    try{
        list=await this.fromAnySource(pg);
    }catch(err){
        const fallback=saved?saved.list:this.anyPage(this.maxPages());
        if(fallback){
            this.cache[pg]=fallback;
            return fallback;
        }
        throw err;   
    }
    this.cache[pg]=list;
    this.save(pg,list);
    return list;
},
maxPages(){
    return Math.max(...Object.values(limits.pools).map(p=>p.pages));
},
async pull(level="easy"){
    const cfg=limits.pools[level]||limits.pools.easy;
    const pg=Math.floor(Math.random()*cfg.pages+1);
    return this.loadPage(pg)
},
seenSet(level){
    if(!this.seen[level]) this.seen[level]=new Set();
    return this.seen[level];
},
loaded(level){
    const cfg=limits.pools[level]||limits.pools.easy;
    const byId=new Map();
    for(let pg=1;pg<=cfg.pages;pg++){
        (this.cache[pg]||[]).forEach(x=>byId.set(x.id,x));
    }
    return [...byId.values()];
},
async grow(level){
    const cfg=limits.pools[level]||limits.pools.easy;
    const missing=[];
    for(let pg=1;pg<=cfg.pages;pg++){
        if(!this.cache[pg]) missing.push(pg);
    }
    if(!missing.length) return;
    if(Date.now()<this.growPauseUntil && this.loaded(level).length) return;
    const pg=missing[Math.floor(Math.random()*missing.length)];
    try{
        await this.loadPage(pg);
    }catch(err){
        if(!this.loaded(level).length) throw err;
        console.warn("could not load another page: ", err);
        this.growPauseUntil=Date.now()+limits.skipMs;
    }
},
choose(level,near=null,avoid=null){
    const cfg=limits.pools[level]||limits.pools.easy;
    const seen=this.seenSet(level);
    const all=this.loaded(level).filter(x=>x.id!==avoid);
    if(!all.length) throw new Error("not enough anime");
    let fresh=all.filter(x=>!seen.has(x.id));
    if(!fresh.length){
        seen.clear();
        fresh=all;
    }
    let list=fresh;
    if(near!==null){
        const close=fresh.filter(x=>Math.abs(x.score-near)<=cfg.maxGap);
        list=close.length?close:[...fresh].sort((p,q)=>Math.abs(p.score-near)-Math.abs(q.score-near)).slice(0,3);
    }
    const pick=list[Math.floor(Math.random()*list.length)];
    seen.add(pick.id);
    return pick;
},
async pick(level="easy",near=null,avoid=null){
    await this.grow(level);
    return this.choose(level,near,avoid);
},
async pair(level="easy"){
    await this.grow(level);
    const a=this.choose(level);
    const b=this.choose(level,a.score,a.id);
    return [a,b];
},
async choices(level="easy",count=4){
    await this.grow(level);
    const answer=this.choose(level);
    const others=this.loaded(level).filter(x=>x.id!==answer.id);
    const options=[answer];
    while (options.length<count && others.length){
        const i=Math.floor(Math.random()*others.length);
        options.push(others.splice(i,1)[0]);
    }
    shuffle(options);
    return {answer,options};
}
};