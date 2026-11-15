const sfx={
    ctx:null,
    muted:false,
    load(){
        try{
            this.muted=localStorage.getItem("ag_muted_v1")==="1";
        }catch{}
    },
    toggle(){
        this.muted=!this.muted;
        try{
            localStorage.setItem("ag_muted_v1",this.muted?"1":"0");
        }catch{}
        this.sync();
        if(!this.muted) this.play("good");
    },
    sync(){
        const b=document.getElementById("mute");
        if(b) b.textContent=this.muted?"sound off":"sound on";
    },
    tone(freq,start,dur,type="sine",vol=0.15){
        const t0=this.ctx.currentTime+start;
        const o=this.ctx.createOscillator();
        const g=this.ctx.createGain();
        o.type=type;
        o.frequency.value=freq;
        g.gain.setValueAtTime(vol,t0);
        g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(t0);
        o.stop(t0+dur);
    },
    play(kind){
        if(this.muted) return;
        try{
            if(!this.ctx){
                const AC=window.AudioContext||window.webkitAudioContext;
                if(!AC) return;
                this.ctx=new AC();
            }
            if(this.ctx.state==="suspended") this.ctx.resume();
            if(kind==="good"){
                this.tone(660,0,0.12);
                this.tone(880,0.1,0.18);
            }else{
                this.tone(220,0,0.2,"sawtooth",0.1);
                this.tone(165,0.18,0.28,"sawtooth",0.1);
            }
        }catch{}
    }
};
sfx.load();
window.addEventListener("DOMContentLoaded",()=>sfx.sync());