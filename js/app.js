const app={
    pool: "top",

    init(){
        this.syncBest();
        this.bind();
        this.moveGlider(document.querySelector(".tab.active"));
        hl.start();
    },
    moveGlider(btn){
        const glider=document.getElementById("glider");
        glider.style.width= `${btn.offsetWidth}px`;
        glider.style.transform=`translateX(${btn.offsetLeft-3}px)`;
    },
    bind(){
        const glider=document.getElementById("glider");
        document.querySelectorAll(".tab").forEach(btn => {
        btn.addEventListener("click", ()=> {
            document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
           this.moveGlider(btn);
           const m=btn.dataset.mode;
           document.querySelectorAll(".panel").forEach(p=>{
            p.classList.toggle("active", p.id===`panel - ${m}`);
           });
           if (m==="px"){
            if(!px.ans) px.start();
           }else{
            px.stop();
           }
        });      
        });
        window.addEventListener("resize",()=>{
            this.moveGlider(document.querySelector(".tab.active"));
        });
        document.getElementById("pool").addEventListener("change",e=>{
            this.pool=e.target.value;
            e.target.blur();
            hl.start();
            px.stop();
            if (document.getElementById("panel-px").classList.contains("active")) px.start();
        });
        document.getElementById("reset").addEventListener("click",()=>hl.start());
        document.getElementById("px-next").addEventListener("click",()=>px.start());

        window.addEventListener("keydown",e=>{
            if (!document.getElementById("panel-h1").classList.contains("active")) return;
            if (e.target.tagName==="SELECT") return;
            const k=e.key.toLowerCase();
            if (k==="arrowup" || k==="w"){
                e.preventDefault();
                hl.guess("up");
            }
            if (k==="arrowdown" || k==="s"){
                e.preventDefault();
                hl.guess("down");
            }
        });
    },
    syncBest(){
        const s=store.get();
        document.getElementById("best-streak").textContent=s.streak;
        document.getElementById("best-pts").textContent=s.pts;
    }
};
window.addEventListener("DOMContentLoaded",()=>app.init());
