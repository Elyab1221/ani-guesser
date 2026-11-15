const daily={
    rounds:5,
    list:[],
    idx:0,
    score:0,
    marks:"",
    answered:false,
    loading:false,
    day:"",
    img:null,
    streakKey:"ag_daily_streak_v1",
    histKey:"ag_daily_hist_v1",

    key(offset=0){
        const d=new Date(Date.now()+offset*86400000);
        return `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`;
    },
    today(){
        return this.key(0);
    },
    load(){
        try{
            const s=JSON.parse(localStorage.getItem("ag_daily_v1_"+this.today()));
            if(s) return {done:Number(s.done)||0,score:Number(s.score)||0,marks:String(s.marks||"")};
        }catch{}
        return {done:0,score:0,marks:""};
    },
    save(done){
        try{
            localStorage.setItem("ag_daily_v1_"+this.today(),JSON.stringify({done,score:this.score,marks:this.marks}));
        }catch{}
    },
    streakData(){
        try{
            const s=JSON.parse(localStorage.getItem(this.streakKey));
            if(s) return {last:String(s.last||""),streak:Number(s.streak)||0,best:Number(s.best)||0};
        }catch{}
        return {last:"",streak:0,best:0};
    },
    currentStreak(){
        const s=this.streakData();
        return (s.last===this.today()||s.last===this.key(-1))?s.streak:0;
    },
    finishStreak(){
         this.saveHistory();
        const s=this.streakData();
        if(s.last===this.today()) return;
        s.streak=(s.last===this.key(-1))?s.streak+1:1;
        s.best=Math.max(s.best,s.streak);
        s.last=this.today();
        try{
            localStorage.setItem(this.streakKey,JSON.stringify(s));
        }catch{}
    },
    showStreak(){
        const a=document.getElementById("dy-streak");
        const b=document.getElementById("dy-best");
        if(a) a.textContent=this.currentStreak();
        if(b) b.textContent=this.streakData().best;
        this.drawHistory();
    },
        history(){
        try{
            const h=JSON.parse(localStorage.getItem(this.histKey));
            if(h && typeof h==="object") return h;
        }catch{}
        return {};
    },
    saveHistory(){
        const h=this.history();
        h[this.today()]=this.score;
        const keep={};
        for(let i=0;i<60;i++){
            const k=this.key(-i);
            if(h[k]!==undefined) keep[k]=h[k];
        }
        try{
            localStorage.setItem(this.histKey,JSON.stringify(keep));
        }catch{}
    },
    drawHistory(){
        const box=document.getElementById("dy-history");
        if(!box) return;
        const h=this.history();
        let html="";
        for(let i=13;i>=0;i--){
            const k=this.key(-i);
            const s=h[k];
            let cls="hist-cell";
            let tip=k;
            if(s!==undefined){
                cls+=s>=500?" perfect":(s>=300?" good":" low");
                tip+=`: ${s}/500`;
            }
            html+=`<div class="${cls}" title="${tip}"></div>`;
        }
        box.innerHTML=html;
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
        const names=["clues","pixel","hl"];
        const kinds=[...names];
        while(kinds.length<this.rounds){
            kinds.push(names[Math.floor(rnd()*names.length)]);
        }
        for(let k=kinds.length-1;k>0;k--){
            const j=Math.floor(rnd()*(k+1));
            const tmp=kinds[k];
            kinds[k]=kinds[j];
            kinds[j]=tmp;
        }
        const picks=[];
        for(let r=0;r<this.rounds;r++){
            const kind=kinds[r];
            const i=Math.floor(rnd()*pool.length);
            const target=pool.splice(i,1)[0];
            const others=all.filter(x=>x.id!==target.id);
            if(kind==="hl"){
                const close=others.filter(x=>Math.abs(x.score-target.score)<=0.6);
                const from=close.length?close:others;
                const other=from[Math.floor(rnd()*from.length)];
                picks.push({kind,target,other});
                continue;
            }
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
            picks.push({kind,target,opts});
        }
        this.list=picks;
    },

    async start(){
        if(this.loading) return;
        if(this.list.length && this.day===this.today()) return;
        this.loading=true;
        this.list=[];
        document.getElementById("dy-share").style.display="none";
        this.say("loading today's challenge...");
        try{
            await this.build();
        }catch(err){
            this.loading=false;
            this.say(`network error (${err.message}). open the tab again.`);
            return;
        }
        this.loading=false;
        this.day=this.today();
        const s=this.load();
        this.idx=Math.min(s.done,this.rounds);
        this.score=s.score;
        this.marks=s.marks;
        this.show();
    },
    paint(size){
        const c=document.getElementById("dy-canvas");
        if(!this.img || !this.img.naturalWidth) return;
        const ctx=c.getContext("2d");
        const w=Math.max(1,Math.floor(c.width/size));
        const h=Math.max(1,Math.floor(c.height/size));
        const off=document.createElement("canvas");
        off.width=w;
        off.height=h;
        off.getContext("2d").drawImage(this.img,0,0,w,h);
        ctx.imageSmoothingEnabled=false;
        ctx.clearRect(0,0,c.width,c.height);
        ctx.drawImage(off,0,0,w,h,0,0,c.width,c.height);
    },
    show(){
        if(this.idx>=this.rounds){
            this.finished();
            return;
        }
        this.answered=false;
        this.showStreak();
        const r=this.list[this.idx];
        const t=r.target;
        const canvas=document.getElementById("dy-canvas");
        const grid=document.getElementById("dy-grid");
        const box=document.getElementById("dy-choices");
        const card=(label,val)=>`<div class="cl-card"><span>${esc(label)}</span><strong>${esc(val)}</strong></div>`;
        document.getElementById("dy-round").textContent=`${this.idx+1}/${this.rounds}`;
        document.getElementById("dy-score").textContent=this.score;
        canvas.style.display="none";

        if(r.kind==="hl"){
            const a=r.other;
            grid.innerHTML=card(`anime 1 - rating ${a.score.toFixed(2)}`,a.title)+card("anime 2 - rating ?",t.title);
            box.innerHTML=`<button class="btn" data-id="up" onclick="daily.guess('up')">higher</button>`
                +`<button class="btn" data-id="down" onclick="daily.guess('down')">lower</button>`;
            this.say("is anime 2 rated higher or lower than anime 1? (100 pts each)");
            return;
        }

        box.innerHTML=r.opts
            .map(o=>`<button class="btn" data-id="${o.id}" onclick="daily.guess(${o.id})">${esc(o.title)}</button>`)
            .join("");

        if(r.kind==="pixel"){
            grid.innerHTML=card("hint",`${t.year} . ${t.studio}`);
            canvas.style.display="block";
            const at=this.idx;
            this.img=new Image();
            this.img.onload=()=>{
                if(this.idx===at) this.paint(this.answered?1:18);
            };
            this.img.onerror=()=>{
                if(this.idx===at && !this.answered) this.say("poster failed to load - guess from the hint");
            };
            this.img.src=t.img;
            this.say("guess the pixelated poster (100 pts each)");
            return;
        }

        grid.innerHTML=card("release year",t.year)
            +card("animation studio",t.studio)
            +card("format & genres",`${t.episodes} eps · ${t.genres}`);
        this.say("guess the anime from the clues (100 pts each)");
    },
    guess(pick){
        if(this.answered || this.idx>=this.rounds) return;
        this.answered=true;
        const r=this.list[this.idx];
        const t=r.target;
        let ok;
        let goodId;
        let detail;
        if(r.kind==="hl"){
            const a=r.other.score;
            const b=t.score;
            ok=b===a || (pick==="up" ? b>a : b<a);
            goodId=b===a ? pick : (b>a ? "up" : "down");
            detail=`${b.toFixed(2)} vs ${a.toFixed(2)}`;
        }else{
            ok=pick===t.id;
            goodId=String(t.id);
            detail=ok ? t.title : `it was ${t.title}`;
        }
        this.marks+=ok ? "🟩" : "🟥";
        if(ok){
            this.score+=100;
            buzz(40);
        }else{
            buzz([80,60,80]);
        }
        document.getElementById("dy-score").textContent=this.score;
        document.querySelectorAll("#dy-choices button").forEach(b=>{
            b.disabled=true;
            if(b.dataset.id===goodId) b.classList.add("ok");
            else if(b.dataset.id===String(pick)) b.classList.add("err");
        });
        if(r.kind==="pixel") this.paint(1);
        this.save(this.idx+1);
        const result=ok ? `correct +100 - ${detail}` : `wrong - ${detail}`;
        if(this.idx+1>=this.rounds){
            this.idx=this.rounds;
            store.save(0,this.score,"dy");
            app.syncBest();
            this.finishStreak();
            this.showStreak();
            document.getElementById("dy-share").style.display="";
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
        this.finishStreak();
        this.showStreak();
        document.getElementById("dy-round").textContent=`${this.rounds}/${this.rounds}`;
        document.getElementById("dy-score").textContent=this.score;
        document.getElementById("dy-share").style.display="";
        document.getElementById("dy-canvas").style.display="none";
        document.getElementById("dy-grid").innerHTML="";
        document.getElementById("dy-choices").innerHTML="";
        this.say(`you already played today: ${this.score}/${this.rounds*100}. come back tomorrow!`);
    },
    async share(){
        const n=this.currentStreak();
        const fire=n>0 ? ` 🔥${n}` : "";
        const text=`ani guesser daily ${this.today()}${fire}\n${this.marks} ${this.score}/${this.rounds*100}`;
        const btn=document.getElementById("dy-share");
        const res=await shareText(text);
        btn.textContent=res;
        setTimeout(()=>{btn.textContent="share";},1500);
    }
};