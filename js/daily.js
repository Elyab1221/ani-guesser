const daily={
    rounds:5,
    list:[],
    idx:0,
    score:0,
    answered:false,
    loading:false,

    today(){
        const d=new Date();
        return `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`;
    },
    load(){
        try{
            const s=JSON.parse(localStorage.getItem("ag_daily_v1_"+this.today()));
            if(s) return {done:Number(s.done)||0,score:Number(s.score)||0};
        }catch{}
        return {done:0,score:0};
    },
    save(done){
        try{
            localStorage.setItem("ag_daily_v1_"+this.today(),JSON.stringify({done,score:this.score}));
        }catch{}
    },
    say(text){
        document.getElementById("dy-msg").textContent=text;
    },

    async build(){
        const p1=await api.loadPage(1);
        const p2=await api.loadPage(2);
        const byId=new Map();
        [...p1,...p2].forEach(x=>byId.set(x.id,x));
        const all=[...byId.values()].sort((x,y)=>x.id-y.id);
        const rnd=seeded(dailySeed());
        const pool=all.slice();
        const picks=[];
        for(let r=0;r<this.rounds;r++){
            const i=Math.floor(rnd()*pool.length);
            const target=pool.splice(i,1)[0];
            const others=all.filter(x=>x.id!==target.id);
            const opts=[target];
            while(opts.length<4){
                const j=Math.floor(rnd()*others.length);
                opts.push(others.splice(j,1)[0]);
            }
            for(let k=opts.length-1;k>0;k--){
                const j=Math.floor(rnd()*(k+1));
                const tmp=opts[k];
                opts[k]=opts[j];
                opts[j]=tmp;
            }
            picks.push({target,opts});
        }
        this.list=picks;
    },

    async start(){
        if(this.loading) return;
        if(!this.list.length){
            this.loading=true;
            this.say("loading today's challenge...");
            try{
                await this.build();
            }catch(err){
                this.loading=false;
                this.say(`network error (${err.message}). open the tab again.`);
                return;
            }
            this.loading=false;
            const s=this.load();
            this.idx=Math.min(s.done,this.rounds);
            this.score=s.score;
        }
        this.show();
    },
    show(){
        if(this.idx>=this.rounds){
            this.finished();
            return;
        }
        this.answered=false;
        const r=this.list[this.idx];
        const t=r.target;
        document.getElementById("dy-round").textContent=`${this.idx+1}/${this.rounds}`;
        document.getElementById("dy-score").textContent=this.score;
        const clues=[
            ["release year",t.year],
            ["animation studio",t.studio],
            ["format & genres",`${t.episodes} eps · ${t.genres}`]
        ];
        document.getElementById("dy-grid").innerHTML=clues
            .map(c=>`<div class="cl-card"><span>${esc(c[0])}</span><strong>${esc(c[1])}</strong></div>`)
            .join("");
        document.getElementById("dy-choices").innerHTML=r.opts
            .map(o=>`<button class="btn" data-id="${o.id}" onclick="daily.guess(${o.id})">${esc(o.title)}</button>`)
            .join("");
        this.say("guess the anime from the clues (100 pts each)");
    },
    guess(id){
        if(this.answered || this.idx>=this.rounds) return;
        this.answered=true;
        const t=this.list[this.idx].target;
        const ok=id===t.id;
        if(ok){
            this.score+=100;
            buzz(40);
        }else{
            buzz([80,60,80]);
        }
        document.getElementById("dy-score").textContent=this.score;
        document.querySelectorAll("#dy-choices button").forEach(b=>{
            const bid=Number(b.dataset.id);
            b.disabled=true;
            if(bid===t.id) b.classList.add("ok");
            else if(bid===id) b.classList.add("err");
        });
        this.save(this.idx+1);
        const result=ok?`correct +100 - ${t.title}`:`wrong - it was ${t.title}`;
        if(this.idx+1>=this.rounds){
            this.idx=this.rounds;
            store.save(0,this.score,"dy");
            app.syncBest();
            this.say(`${result}. daily finished: ${this.score}/${this.rounds*100}. come back tomorrow!`);
        }else{
            this.say(`${result}. press next.`);
        }
    },
    next(){
        if(!this.answered || this.idx>=this.rounds) return;
        this.idx++;
        this.show();
    },
    finished(){
        document.getElementById("dy-round").textContent=`${this.rounds}/${this.rounds}`;
        document.getElementById("dy-score").textContent=this.score;
        document.getElementById("dy-grid").innerHTML="";
        document.getElementById("dy-choices").innerHTML="";
        this.say(`you already played today: ${this.score}/${this.rounds*100}. come back tomorrow!`);
    }
};