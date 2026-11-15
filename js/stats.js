const stats={
    key:"ag_stats_v1",
    names:{h1:"higher/lower",px:"pixel rush",cl:"clues",dy:"daily"},
    all(){
        try{
            return JSON.parse(localStorage.getItem(this.key))||{};
        }catch{}
        return {};
    },
    record(ok,mode=app.mode){
        const all=this.all();
        const cur=all[mode]||{right:0,wrong:0};
        if(ok) cur.right=(Number(cur.right)||0)+1;
        else cur.wrong=(Number(cur.wrong)||0)+1;
        all[mode]=cur;
        try{
            localStorage.setItem(this.key,JSON.stringify(all));
        }catch{}
    },
    open(){
        const all=this.all();
        const rows=Object.keys(this.names).map(m=>{
            const s=all[m]||{};
            const right=Number(s.right)||0;
            const wrong=Number(s.wrong)||0;
            const total=right+wrong;
            const acc=total?Math.round(right/total*100)+"%":"-";
            const b=store.get(m);
            return `<tr><td>${this.names[m]}</td><td>${total}</td><td>${acc}</td><td>${b.streak} / ${b.pts}</td></tr>`;
        }).join("");
        document.getElementById("stats-body").innerHTML=
            `<table><tr><th>mode</th><th>answers</th><th>accuracy</th><th>best</th></tr>${rows}</table>`;
        document.getElementById("stats-back").classList.add("open");
    },
    close(){
        document.getElementById("stats-back").classList.remove("open");
    },
    reset(){
        if(!confirm("reset all stats?")) return;
        try{
            localStorage.removeItem(this.key);
        }catch{}
        this.open();
    }
};