const esc=s=>String(s).replace(/[&<>"']/g,c=>({
    "&":"&amp;",
    "<":"&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'":"&#39;"
}[c]));
const shuffle=list=>{
    for(let i=list.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
    [list[i],list[j]]=[list[j],list[i]];
    }
    return list;
};
const buzz=p=>{
    if (navigator.vibrate) navigator.vibrate(p);
    const ok=!Array.isArray(p);
    sfx.play(Array.isArray(p)?"bad":"good");
    stats.record(ok);
};
const dailySeed=()=>{
    const d=new Date();
    const s=`${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`;
    let h=0;
    for(let i=0;i<s.length;i++){
        h=(h*31+s.charCodeAt(i))>>>0;
    }
    return h;
};
const seeded=seed=>{
    let a=seed>>>0;
    return()=>{
        a=(a+0x6D2B79F5)>>>0;
        let t=a;
        t=Math.imul(t^(t>>>15),t|1);
        t^=t+Math.imul(t^(t>>>7),t|61);
        return ((t^(t>>>14))>>>0)/4294967296;
    };
};
const shareText=async text=>{
    try{
        if(navigator.share){
            await navigator.share({text});
            return "shared";
        }
        await navigator.clipboard.writeText(text);
        return "copied";
    }catch(err){
        alert((err&&err.name)+": "+(err&&err.message));
        if(err && err.name==="AbortError") return "share";
        window.prompt("copy this: ",text);
        return "share";
    }
};