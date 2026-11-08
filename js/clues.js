const clues = {
  pool: [],
  target: null,
  step: 1,
  stake: 400,
  total: 0,
  over: false,

  async start() {
    this.over = false;
    this.step = 1;
    this.stake = limits.clues.startPts;
    this.pool = await api.pull(app.pool);
    this.target = this.pool[Math.floor(Math.random() * this.pool.length)];
    this.draw();
    this.drawChoices();
    document.getElementById("cl-pts").textContent = this.stake;
    document.getElementById("cl-msg").textContent = "clue 1 unlocked — guess now for 400 pts or unlock more clues";
  },
  unlock() {
    if (this.over || this.step >= 4) return;
    this.step += 1;
    this.stake = Math.max(100, this.stake - limits.clues.stepCost);
    document.getElementById("cl-pts").textContent = this.stake;
    this.draw();
  },
  draw() {
    const box = document.getElementById("cl-grid");
    if (!box || !this.target) return;
    const items = [
      { label: "01 / release year", val: this.target.year },
      { label: "02 / animation studio", val: this.target.studio },
      { label: "03 / format & genres", val: `${this.target.episodes} eps · ${this.target.genres}` },
      { label: "04 / mal rating", val: `${this.target.score} / 10` }
    ];
    box.innerHTML = items
      .map((it, idx) => {
        const open = idx < this.step || this.over;
        return `
          <div class="cl-card ${open ? "" : "locked"}">
            <span>${it.label}</span>
            <strong>${open ? it.val : "locked"}</strong>
          </div>
        `;
      })
      .join("");
  },
  drawChoices() {
    const box = document.getElementById("cl-choices");
    if (!box) return;
    const opts = [this.target];
    while (opts.length < Math.min(4, this.pool.length)) {
      const c = this.pool[Math.floor(Math.random() * this.pool.length)];
      if (!opts.some(o => o.id === c.id)) opts.push(c);
    }
    opts.sort(() => Math.random() - 0.5);

    box.innerHTML = opts
      .map(o => `<button class="px-item" onclick="clues.guess(${o.id})">${o.title}</button>`)
      .join("");
  },
  guess(id) {
    if (this.over) return;
    this.over = true;
    this.draw();
    if (id === this.target.id) {
      this.total += this.stake;
      store.save(0, this.total);
      app.syncBest();
      document.getElementById("cl-total").textContent = this.total;
      document.getElementById("cl-msg").textContent = `correct +${this.stake} pts — ${this.target.title}`;
    } else {
      document.getElementById("cl-msg").textContent = `missed — it was ${this.target.title}`;
    }
  }
};