const px={
    ans:null,
    timer:null,
    left:15,
    img: null,
    round:0,
    streak:0,
    pts:0,
    lost:false,
    say(text){
        document.getElementById("px-msg").textContent=text;
    },
    hud(){
        document.getElementById("px-streak").textContent=this.streak;
        document.getElementById("px-pts").textContent=this.pts;
    },
    newRun(){
        store.save(this.streak,this.pts,"px");
        app.syncBest();
        this.streak=0;
        this.pts=0;
        this.lost=false;
        this.hud();
    },
    stop(){
        this.round++;
        clearInterval(this.timer);
        this.timer=null;
        this.ans=null;
    },
    async start(){
        const round=++this.round;
        if(this.timer||this.lost) this.newRun();
        clearInterval(this.timer);
        this.timer=null;
        this.say("loading poster...");
        document.getElementById("px-list").innerHTML="";
        document.getElementById("px-hint").textContent="";
        document.getElementById("px-time").textContent=`${limits.px.time}s`;
        document.getElementById("px-grid").textContent=`${limits.px.startPx}px`;
        try{
            const {answer,options}=await api.choices(app.pool,4);
            if(round!==this.round) return;
            this.ans=answer;
            document.getElementById("px-hint").textContent=`hint: ${this.ans.year} . ${this.ans.studio}`;
            document.getElementById("px-list").innerHTML=options
            .map(x=>`<button class="btn" data-id="${x.id}" onclick="px.pick(${x.id})">
                 ${esc(x.title)}</button>`).join("");
            this.img=new Image();
            this.img.onload=()=>{
                if(round==this.round) this.loop();
            };
            this.img.onerror=()=>{
                if(round===this.round) this.say("poster failed to load.press next.");
            };
            this.img.src=this.ans.img;
        }catch(err){
            if(round!==this.round) return;
            console.error(err);
            this.ans=null;
            this.say(`network error (${err.message}). press next.`);
        }
    },
    loop(){
        this.left=limits.px.time;
        this.paint(limits.px.startPx);
        this.say("guess the pixelated poster");
        this.timer=setInterval(()=>{
            this.left=Math.max(0,+(this.left-0.25).toFixed(2));
            const ratio=this.left/limits.px.time;
            const block=Math.max(1,Math.round(limits.px.startPx*ratio));
            this.paint(block);
            document.getElementById("px-time").textContent=`${this.left.toFixed(1)}s`;
            document.getElementById("px-grid").textContent=`${block}px`;
            if(this.left<=0){
                this.finish(null);
                this.lose(`time's up - answer was ${this.ans.title}`);
            }
        },250);
    },
    paint(size){
        const c=document.getElementById("px-canvas");
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
    finish(chosen){
        clearInterval(this.timer);
        this.timer=null;
        this.paint(1);
        document.getElementById("px-time").textContent=`${this.left.toFixed(1)}s`;
        document.querySelectorAll("#px-list button").forEach(b=>{
            const id=Number(b.dataset.id);
            b.disabled=true;
            if(id===this.ans.id) b.classList.add("ok");
            else if(id===chosen) b.classList.add("err");
        });
    },
    lose(text){
        const rec=store.save(this.streak,this.pts,"px");
        app.syncBest();
        this.lost=true;
        this.say(`${text}${rec.isBest ? "(new best)" : ""}. press next.`);
    },
    pick(id){
        if (!this.timer) return;
        const left=this.left;
        this.finish(id);
        if (id===this.ans.id){
            const gain=Math.round(left*limits.px.pts*limits.pools[app.pool].mult);
            this.streak+=1;
            this.pts+=gain;
            this.hud();
            this.say(`correct - ${this.ans.title} (+${gain}). press next.`);
        }else{
            this.lose(`wrong - answer was ${this.ans.title}`);
        }
    }
};