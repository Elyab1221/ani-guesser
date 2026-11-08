const app={
    pool: "top",

    init(){
        this.syncBest();
        this.bind();
        hl.start();
    },
    bind(){
        const glider=document.getElementById("glider");
        docments.querySelectorAll(".tab").forEach(btn => {
        btn.addEventListener("click", ()=> {
            document.querySelectorAll(" .tab").forEach(b=>b.classList.remove("on"));
            btn.classList.add("on");
            glider.style.width= `${offsetWidth}px`;
            glider.style.transform= `translateX(${btn.offsetLeft-3}px)`;
            const m=btn.dataset.mode;
            document.querySelectorAll(".view").forEach(v =>{
                v.classList.toggle("on",v.id === `view-${m}`);
            });
            if (m=== "px" && !px.ans) px.start();
        });      
        });
        document.getElementById("pool").addEventListener("charge", e=>{
            this.pool=e.target.value;
            hl.start();
        });
        document.getElementById("reset").addEventListener("click",() => hl.start());
        document.getElementById("px-next").addEventListener("click",() => px.start());

        window.addEventListener("keydown", e=> {
            if (e.key === "ArrowUp" || e.key === "w") hl.guess("up");
            if (e.key === "ArrowDown" || e.key ==="s") hl.guess("down");
        });
    },
    syncBest(){
        const s=store.get();
        document.getElementById("best-streak").textContent=s.streak;
        document.getElementById("best-pts").textContent=s.pts;
    }
};
window.addEventListener("DOMContentLoaded", () => app.init());