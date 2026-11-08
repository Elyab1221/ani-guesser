 const store={
    get(){
        try{
            const raw=localStorage.getItem(limits.key);
            const cur=raw?JSON.parse(raw):{};
            return raw? JSON.parse(raw):{streak:0,pts:0};
        }catch{
            return {streak:0, pts:0};
        }
    },
    save(streak,pts){
        const cur=this.get();
        const isBest=streak>cur.streak;
        if(isBest) cur.streak=streak;
        if(pts>cur.pts) cur.pts=pts;

        try{
            localStorage.setItem(limits.key,JSON.stringify(cur));
        }catch{}
        return {cur,isBest};
    }
 };