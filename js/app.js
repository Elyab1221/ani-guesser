const app={
    pool: "easy",
    mode:"h1",

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
        document.getElementById("cl-unlock").addEventListener("click",()=>clues.unlock());
        document.getElementById("cl-next").addEventListener("click",()=>clues.start());
        document.getElementById("dy-next").addEventListener("click",()=>daily.next());
        document.querySelectorAll(".tab").forEach(btn => {
        btn.addEventListener("click", ()=> {
            document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
           this.moveGlider(btn);
           const m=btn.dataset.mode;
           this.mode=m;
           this.syncBest();
           document.querySelectorAll(".panel").forEach(p=>{
            p.classList.toggle("active", p.id===`panel-${m}`);
           });
           if(m==="px"){
            if(!px.ans) px.start();
           }else{
            px.stop();
           }
           if (m==="cl" && !clues.target) clues.start();
           if(m==="px") px.start();
           if(m==="cl" && !clues.target) clues.start();
           if(m==="dy") daily.start();
        //    if (m==="px"){
        //     if(!px.ans) px.start();
        //    }else{
        //     px.stop();
        //    }
        });      
        });
        window.addEventListener("resize",()=>{
            this.moveGlider(document.querySelector(".tab.active"));
        });
        document.getElementById("pool").addEventListener("change",e=>{
            px.stop();
            px.newRun();
            this.pool=e.target.value;
            clues.total=0;
            clues.target=null;
            document.getElementById("cl-total").textContent=0;
            e.target.blur();
            this.syncBest();
            h1.start();
            if (document.getElementById("panel-px").classList.contains("active")) px.start();
            if (document.getElementById("panel-cl").classList.contains("active")) clues.start();
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
