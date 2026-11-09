const px={
    ans: null,
    timer: null,
    left: 15,
    img: null,
    round:0,

    say(text){
        document.getElementById("px-msg").textContent=text;
    },
    stop(){
        this.round++;
        clearInterval(this.timer);
        this.timer=null;
        this.ans=null;
    },
async start(){
    const round=++this.round;
    clearInterval(this.timer);
    this.timer=null;
    this.say("loading poster...");
    document.getElementById("px-list").innerHTML="";
    document.getElementById("px-hint").textContent="";
    document.getElementById("px-time").textContent=`${limits.px.time}s`;
    document.getElementById("px-grid").textContent=`${limits.px.startPx}px`;
    try{
        const list=await api.pull(app.pool);
        if(round!==this.round) return;
        const picks=[...list].sort(()=>0.5-Math.random()).slice(0,4);
        this.ans=picks[Math.floor(Math.random()*picks.length)];
        document.getElementById("px-hint").textContent=`hint: ${this.ans.year} . ${this.ans.studio}`;
        document.getElementById("px-list").innerHTML=picks
        .map(x=>`<button class="btn" data-id=${x.id}" onclick="px.pick(${x.id})">${esc(x.title)}</button>`)
        .join("");
        this.img=new Image();
        this.img.onload= ()=>{
            if(round===this.round) this.loop();
        };
        this.img.onerror= ()=>{
            if(round===this.round) this.say("poster failed to load. press next.");
        };
        this.img.src=this.ans.img;
    }catch(err){
        if(round!==this.round) return;
        console.error(err);
        this.ans=null;
        this.say(`network error (${err.message}).press next.`);
    }
},
loop(){
    this.left=limits.px.time;
    this.paint(limits.px.startPx);
    this.say("guess the pixelated poster");
    this.timer= setInterval(()=>{
        this.left=Math.max(0, +(this.left-0.25).toFixed(2));
        const ratio=this.left/limits.px.time;
        const  block= Math.max(1, Math.round(limits.px.startPx * ratio));
        this.paint(block);
        document.getElementById("px-time").textContent= `${this.left.toFixed(1)}s`;
        document.getElementById("px-grid").textContent=`${block}px`;

        if (this.left <=0){
            this.finish(null);
            this.say(`time's up - answer was ${this.ans.title}`);
            }
    }, 250);
},
paint(size){
    const c=document.getElementById("px-canvas");
    const ctx=c.getContext("2d");
    const w=Math.max(1,Math.floor(c.width/size));
    const h=Math.max(1,Math.floor(c.height/size));

    const off= document.createElement("canvas");
    off.width=w;
    off.height=h;
    off.getContext("2d").drawImage(this.img,0,0,w,h);
    ctx.imageSmoothingEnabled = false;
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
pick(id){
    if (!this.timer) return;
    this.finish(id);
    this.say(id===this.ans.id
        ?`correct - ${this.ans.title}`
        :` wrong - answer was ${this.ans.title}`)
}
};