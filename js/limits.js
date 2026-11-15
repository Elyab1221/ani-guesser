// const env= window.ENV||{};
const limits={
    url:"https://api.jikan.moe/v4",
    backupUrl: "https://graphql.anilist.co",
    wait: 1200,
    tries: 2,
    timeoutMs:8000,
    skipMs:60000,
    cacheMs: 6*60*60*1000,
    perPage:25,
    pools:{
        easy: {pages:2,mult:1,maxGap:10},
        medium: {pages:6,mult:1.5,maxGap10},
        hard: {pages:12,mult:2,maxGa10},
        brutal: {pages:20,mult:3,maxGap:0.1}
    },
    h1:{
        pts: 100,
        rollMs: 480,
        holdMs:950
    },
    clues:{startPts:400,stepCost:100},
    px:{
        time: 15,
        startPx: 28,
        pts:10
    },
    key :"ag_best_v2",
    oldkey:"ag_best_v1",
    pageKey: "ag_page_v1_"
};