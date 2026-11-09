const hl={
    left:null,
    right:null,
    streak:0,
    pts:0,
    busy:false,
    run: 0, 

    async start(){
        const run=++ this.run;
        this.streak=0;
        this.pts=0;
        this.busy=true;
        this.hud();
        this.say("fetching titles.....");
        try{
            const pair=await api.pair(app.pool)
            if(run!==this.run) return;
            [this.left,this.right]= pair;
            this.draw(false);
            this.say("is the rating on the right higher or lower??");
            this.busy=false;
        }catch(err){
            if(run!==this.run) return;
            console.error(err);
            this.say(`network error.(${err.message})`);
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
            const run=this.run;
            const mult=limits.pools[app.pool].mult;
            this.streak+=1;
            this.pts+=Math.round(limits.h1.pts*mult);
            this.hud();
            this.say(`correct (${b.toFixed(2)} vs ${a.toFixed(2)})`);
            setTimeout(() =>{ 
                if(run===this.run) this.next();
            },limits.h1.holdMs);
        }else{
            const rec=store.save(this.streak,this.pts);
            app.syncBest();
            this.say(`game over -${this.right.title} scored ${b.toFixed(2)}${rec.isBest ? " (new best)": ""}.press reset.`);
        }
    },
    async next(){
        const run=this.run;
        try{
            const list=await api.pull(app.pool);
            if(run!==this.run) return;
            this.left=this.right;
            let pick=list[Math.floor(Math.random()* list.length)];
            while (pick.title===this.right.title && list.length>1){
                pick=list[Math.floor(Math.random()*list.length)];
            }
            this.left=pick;
            this.draw(false,null,true);
            this.busy=false;
        }catch(err){
            if(run!==this.run) return;
            console.error(err);
            this.say(`network error. (${err.message})`);
        }
    },
    roll(id,target){
        const el=document.getElementById(id);
        if (!el) return;
        const t0=performance.now();
        const step= now=>{
            const p=Math.min((now-t0)/limits.h1.rollMs,1);
            el.textContent=(target*(1-Math.pow(1-p,3))).toFixed(2);
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
        <img src="${esc(this.left.img)}" alt="${esc(this.left.title)}"/>
        <div class="info">
        <small> ${esc(this.left.year)} . ${esc(this.left.studio)}</small>
        <h3> ${esc(this.left.title)}</h3>
        <div class="rate"> ${this.left.score.toFixed(2)}</div>
        </div>
        </article>
        <article class="card ${slide ? "slide" : "" }" onmousemove="hl.spot(event,this)">
        <img src="${esc(this.right.img)}" alt="${esc(this.right.title)}"/>
        <div class="info">
        <small> ${esc(this.right.year)} . ${esc(this.right.studio)}</small>
        <h3> ${esc(this.right.title)}</h3>
        ${show
            ? `<div class="rate ${ok ? "ok" : "err"}" id="r-val"> 0.00</div>`
            : `<div class="btns">
                <button onclick="hl.guess('up')" class="btn"> higher </button>
                <button onclick="hl.guess('down')" class="btn"> lower </button>
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