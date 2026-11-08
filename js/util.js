const esc=s=>String(S).replace(/[&<>""]/g,c=>({
    "&":"&amp;",
    "<":"&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'":"&#39;"
}[c]));