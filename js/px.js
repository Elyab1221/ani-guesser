const px={
    ans: null,
    timer: null,
    left: 15,
    img: null,

async start(){
    clearInterval(this.timer);
    const list=await api.pull(app.pool);
    const picks=[...list].sort(()=> 0.5 -Math.random()).slice(0,4);
    this.ans= picks[Math.floor(Math.random()* picks.length)];

    document.getElementById("px-hint").textContent=
    `hint:${this.ans.year}. ${this.ans.studio}`;
    const box=document.getElementById("px-list");
    box.innerHTML=picks
    .map(x =>`<button onclick="px.pick(${x.id}, this)"> ${x.title}</button>`)
    .join("");
    this.img=new Image();
    this.img.crossOrigin ="anonymous";
    this.img.onload= ()=> this.loop();
    this.img.src= this.ans.img;
},
loop(){
    this.left=limits.px.time;
    this.paint(limits.px.startPx);
    this.timer= setInterval(()=>{
        this.left=Math.max(0, +(this.left-0.25).toFixed(2));
        const ratio=this.left/limits.px.time;
        const  block= Math.max(1, Math.round(limits.px.startPx * ratio));
        this.paint(block);
        document.getElementById("px-time").textContent= `${this.left.toFixed(1)}s`;
        document.getElementById("px-grid").textContent=`${block}px`;

        if (this.left <=0){
            clearInterval(this.timer);
            this.paint(1);
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
pick(id){
    clearInterval(this.timer);
    this.paint(1);
    const ok= id === this.ans.id;
    document.getElementById("px-msg").textContent=ok
    ? `correct - ${this.ans.title}`
    : `wrong - answer was ${this.ans.title}`;
}
};