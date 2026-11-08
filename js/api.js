const api={
    last:0 ,
    cache:{},
    async throttle(){
        const gap=Date.now()-this.last;
        if(gap<limits.wait){
            await new Promise(r=>setTimeout(r,limits.wait-gap));
        }
        this.last=Date.now();
    },
    
async pull(tier="top"){
    const cfg=limits.pools[tier]||limits.pools.top;
    const pg=Math.floor(Math.random()* cfg.pages)+1;
    if(this.cache[pg]?.length) return this.cache[pg];
    await this.throttle();
    const res=await fetch(`${limits.url}/top/anime?page=${pg}&limit=${limits.perPage}`);
    if (!res.ok) throw new Error(res.status);
    const {data=[]}=await res.json();
    const list=data.filter(x => x.score && x.images?.jpg?.large_image_url)
    .map( x=> ({
        id: x.mal_id,
        title: x.title_english || x.title,
        score:Number(x.score.toFixed(2)),
        year:x.year|| x.aired?.prop?.from?.year || "-",
        studio: x.studios?.[0]?.name||"unknown",
        img:x.images.jpg.large_image_url,
        episodes:x.episodes || "?",
        genres: (x.genres || []).map(g=>g.name).join(", "),
    }));
    this.cache[pg]=list;
    return list;
},
async pair(tier="top"){
    const list=await this.pull(tier);
    const a=Math.floor(Math.random()*list.length);
    let b=Math.floor(Math.random()*list.length);
    while(b===a && list.length>1){
        b=Math.floor(Math.random()*list.length);
    }
    return [list[a],list[b]];
}
};