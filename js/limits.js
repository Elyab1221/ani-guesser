const env= window.ENV||{};
const limits={
    url: env.API_URL || "https://api.jikan.moe/v4",
    wait: env.wait || 1200,
    perPage:25,
    pools:{
        top:{pages:2,mult:1},
        deep:{pages:5 , mult:1.5}
    },
    h1:{
        pts: 100,
        rollMd: 480,
        holdMs:950
    },
    px:{
        sec: 15,
        block: 28
    },
    key :"ag_best_v1"
};