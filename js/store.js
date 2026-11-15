const store={
    all(){
        try{
            const raw=localStorage.getItem(limits.key);
            if(raw) return JSON.parse(raw);
            const old=localStorage.getItem(limits.oldkey);
            if(old){
                const o=JSON.parse(old);
                return {h1:{streak:Number(o.streak)||0,pts:Number(o.pts)||0}};
            }
        }catch{}
        return{};
    },
    get(mode=app.mode){
        const cur=this.all()[mode]||{};
        return {streak:Number(cur.streak)||0,pts:Number(cur.pts)||0};
    },
    save(streak,pts,mode=app.mode){
        const all=this.all();
        const cur=this.get(mode);
        const isBest=streak>cur.streak;
        if(isBest) cur.streak=streak;
        if(pts>cur.pts) cur.pts=pts;
        all[mode]=cur;
        try{
            localStorage.setItem(limits.key.JSON.stringify(all));
        }catch{}
        return {cur,isBest};
    }
};