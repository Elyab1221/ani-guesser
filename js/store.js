const store={
    all(){
        try{
            const raw=localStorage.getItem(limits.key);
            if(raw) return JSON.parse(raw);
            const old=localStorage.getItem(limits.oldkey);
            if(old){
                const o=JSON.parse(old);
                return {"h1:easy":{streak:Number(o.streak)||0,pts:Number(o.pts)||0}};
            }
        }catch{}
        return{};
    },
    slot(mode,pool){
        return mode==="dy" ? "dy" : `${mode}:${pool}`;
    },
    get(mode=app.mode,pool=app.pool){
        const cur=this.all()[this.slot(mode,pool)]||{};
        return {streak:Number(cur.streak)||0,pts:Number(cur.pts)||0};
    },
    save(streak,pts,mode=app.mode,pool=app.pool){
        const all=this.all();
        const key=this.slot(mode,pool);
        const cur=this.get(mode,pool);
        const isBest=streak>cur.streak;
        if(isBest) cur.streak=streak;
        if(pts>cur.pts) cur.pts=pts;
        all[key]=cur;
        try{
            localStorage.setItem(limits.key,JSON.stringify(all));
        }catch{}
        return {cur,isBest};
    }
};