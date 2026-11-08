const hl={
    left:null,
    right:null,
    streak:0,
    pts:0,
    busy:false,

    async start(){
        this.streak=0;
        this.pts=0;
        this.busy=true;
        this.hud();
        this.say("fetching titles.....");
        try{
            [this.left,this.right]=await api.pair(app.pool);
            this.draw(false);
            this.say("higher to lower ratting on the right?");
            this.busy=false;
        }catch{
            this.say("network error.press reset.");
        }
    },
    guess(dir){
        if (this.busy || !this.left || !this.right) return;
        this.busy= true;
        const a=this.left.score;
        const b=this.right.score;
        const ok=b===a|| (dir==="up" ? b>a: b<a);
        this.draw(true,ok);
        this.roll("r-val",b);

        if(ok){
            const mult=limits.pools[app.pool].mult;
            this.streak+=1;
            this.pts+=Math.round(limits.hl.pts*mult);
            this.hud();
            this.say(`correct (${b} vs ${a})`);
            setTimeout(() => this.next(),limits.h1.pause);
        }else{
            const rec=store.save(this.streak,this.pts);
            app.syncBest();
            this.say(`game over -${this.right.title} scored ${b}${rec ? " (new best)": ""}`);
        }
    },
    async next(){
        const list=await api.pull(app.pool);
        this.left=this.right;
        let pick=list[Math.floor(Math.random()* list.length)];
        while (pick.id === this.left.id &&  list.length>1){
            pick=list[Math.floor(Math.random()* list.length)];
        }
        this.right=pick;
        this.draw(false,null,true);
        this.busy=false;
    },
    roll(id,target){
        const el=document.getElementById(id);
        if (!el) return;
        const t0=performance.now();
        const step= now=>{
            const p=Math.min((now-t0)/420,1);
            el.textContent=(target*(1-mMath.pow(!-p,3))).toFixed(2);
            if(p<1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    },
    spot(e,card){
        const r=card.getBoundingClientRect();
        card.style.setProperty("--mx",`${e.clientX- r.left}px`);
        card.style.setProperty("--my",`${e.clientY-r.top}px`);
    },
    draw(show,ok=null,slide=false){
        const box=document.getElementById("board");
        box.innerHTML=`
        <article class="card ${slide ? "slide" : "" }" onmousemove="hl.spot(event,this)">
        <img src="${this.left.img}" alt="{this.left.title}"/>
        div class="shade">
        <small> ${this.left.year} . ${this.left.studio}</small>
        <h3> ${this.left.title}</h3>
        <div class="score"> ${this.left.score.toFixed(2)}</div>
        </div>
        </article>
        <article class="card ${slide ? "slide" : "" }" onmousemove="hl.spot(event,this)">
        <img src="${this.right.img}" alt="${this.right.title}"/>
        <div class="shade">
        <small> ${this.right.year} . ${this.right.studio}</small>
        <h3> ${this.right.title}</h3>
        ${show
            ? `<div class="score ${ok ? "ok" : "err"}" id="r-val"> 0.00</div>`
            : `<div class="btns">
                <button onclick="hl.guess('up')"> higher </button>
                <button onclick="hl.guess('down')"> lower </button>
                </div>`
        }
        </div>
        </article>`;
    },
    hud(){
        document.getElementById("streak").textContent=this.streak;
        document.getElementById("pts").textContent=this.pts;
    },
    say(text){
        document.getElementById("msg").textContent=text;
    }
};