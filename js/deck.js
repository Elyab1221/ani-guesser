const deck={
    pool:[],
    tiers: {S:[],A:[],B:[],C:[]},
    selectedId: null,
    async init(){
        this.pool = await api.pull(app.pool);
        if(!this.selectedId && this.pool[0]){
            this.selectedId=this.pool[0].id;
        }
        this.draw();
    },
    selectChip(id){
        this.selectedId=id
        this.draw();
    },
    placeInTier(tierKey){
        if(!this.selectedId) return;
        const item=this.pool.find(p => p.id === this.selectedId);
        if (!item) return;
        Object.keys(this.tiers).forEach(k =>{
            this.tiers[k] =this.tiers[k].filter(x => x.id !== item.id);
        });
        this.tiers[tierKey].push(item);
        
        const remaining= this.unranked();
        this.selectedId=remaining[0]?.id || null;
        this.draw();
    },
    unranked(){
        const used= new Set(
            Object.values(this.tiers).flat().map(x => x.id)
        );
        return this.pool.filter(p => !used.has(p.id));
    },
    reset(){
        this.tiers={S:[],A:[],B:[],C:[]};
        this.selectedId=this.pool[0]?.id || null;
        this.draw();
    },
    draw(){
        const rowsEl=document.getElementById("dk-rows");
        const trayEl=document.getElementById("dk-tray");
        if(!rowsEl || !trayEl) return;
        rowsEl.innerHTML=["S","A","B","C"]
        .map(t =>`
            <div class="dk-row" onclick="deck.placeInTier('${t}')">
            <div class="dk-tag"> ${t}</div>
            <div class="dk-items">
            ${this.tiers[t].map(item => 
                `<div class="dk-chip" onClick="event.stopPropagation();deck.selectChip(${item.id})">
                    <img src="${item.img}" alt="${item.title}"/>
                    <span>${item.title}</span>
                </div>`
            ).join("")}
            </div>
            </div>`)
            .join("");
            trayEl.innerHTML=this.unranked()
            .map(item => `
                <button class="dk-chip ${this.selectedId === item.id ? "sel" : ""}" onclick="deck.selectChip(${item.id})">
                <img src="${item.img}" alt="${item.title}"/>
                <span> ${item.title}</span>
                </button>`).join("");
    }
}