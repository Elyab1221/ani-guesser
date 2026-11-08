const app={
    pool: "top",

    init(){
        this.syncBest();
        this.bind();
        hl.start();
    },
    bind(){
        const glider=document.getElementById("glider");
        document.querySelectorAll(".tab").forEach(btn => {
        btn.addEventListener("click", ()=> {
            document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            glider.style.width= `${btn.offsetWidth}px`;
            glider.style.transform= `translateX(${btn.offsetLeft-3}px)`;
            const m=btn.dataset.mode;
            document.querySelectorAll(".panel").forEach(v =>{
                v.classList.toggle("active",v.id === `panel-${m}`);
            });
            if (m=== "px" && !px.ans) px.start();
        });      
        });
        const first=document.querySelector(".tab.active");
        glider.style.width=`${first.offsetWidth}px`;
        glider.style.transform=`translateX(${first.offsetLeft-3}px)`;
        document.getElementById("pool").addEventListener("change", e=>{
            this.pool=e.target.value;
            hl.start();
        });
        document.getElementById("reset").addEventListener("click",() => hl.start());
        document.getElementById("px-next").addEventListener("click",() => px.start());

        window.addEventListener("keydown", e=> {
            if(!document.getElementById("panel-h1").classList.contains("active")) return;
            if (e.key === "ArrowUp" || e.key === "W") hl.guess("up");
            if (e.key === "ArrowDown" || e.key ==="S") hl.guess("down");
        });
    },
    syncBest(){
        const s=store.get();
        document.getElementById("best-streak").textContent=s.streak;
        document.getElementById("best-pts").textContent=s.pts;
    }
};
window.addEventListener("DOMContentLoaded", () => app.init());