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