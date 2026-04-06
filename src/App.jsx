import React, { useState, useEffect, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const TEAM_LOGOS = {
  t1:"https://static.wixstatic.com/media/4877d6_e293da9b5c374495864511964d6dd921~mv2.jpg",
  t2:"https://static.wixstatic.com/media/4877d6_d49e5298427146faa1a5e22be776a2ec~mv2.jpg",
  t3:"https://static.wixstatic.com/media/4877d6_9973532eb7e5406682fb091353a111ad~mv2.jpg",
  t4:"https://static.wixstatic.com/media/4877d6_87f5f6f53d31470eb025f6ea35f8b632~mv2.jpg",
  t5:"https://static.wixstatic.com/media/4877d6_5d6cb7ce14b54374a5dddb18a4173500~mv2.jpg",
  t6:"https://static.wixstatic.com/media/4877d6_0d2034b959604f6fa1e66df62e31f49f~mv2.jpg",
  t7:"https://static.wixstatic.com/media/4877d6_0711c82df47f4dc797de9abf523ffc50~mv2.jpg",
  t8:"https://static.wixstatic.com/media/4877d6_a01acbcd8df24c9ba467e564706e34f9~mv2.jpg",
};
const FC_LOGO = "https://static.wixstatic.com/media/4877d6_4bad42a571ec47e982d9b2ec2b4c9a22~mv2.jpeg";
const TEAMS = [
  {id:"t1",name:"Durban Central",sub:"United",  branch:"Durban Central"},
  {id:"t2",name:"Wakanda",       sub:"OT",       branch:"Wakanda"},
  {id:"t3",name:"Cape Town",     sub:"Team",     branch:"Cape Town"},
  {id:"t4",name:"Swacunda",      sub:"Team",     branch:"Swacunda"},
  {id:"t5",name:"Mighty",        sub:"West",     branch:"West"},
  {id:"t6",name:"Zululand",      sub:"Warriors", branch:"Zululand"},
  {id:"t7",name:"Mlungwane",     sub:"Club",     branch:"Mlungwane"},
  {id:"t8",name:"Durban South",  sub:"Big Cats", branch:"Durban South"},
];
const DEFAULT_CATS = ["Harmony","Presentation","Repertoire","Rhythm","Diction"];
const POS_SOCCER   = ["Goalkeeper","Defender","Midfielder","Striker","Captain"];
const POS_NETBALL  = ["Goal Shooter","Goal Attack","Wing Attack","Centre","Wing Defence","Goal Defence","Goal Keeper","Captain"];
const VOICES       = ["Soprano","Alto","Tenor","Bass"];
const ORG_PIN      = "1234";
const STORE_KEY    = "fc_v6_state";
const uid = () => Math.random().toString(36).slice(2,9);

// ─── STATE ────────────────────────────────────────────────────────────────────
const freshState = () => ({
  announcements: [],
  sports: {
    Soccer:  {teams:TEAMS.map(t=>({...t,players:[]})),matches:[],published:false,votingOpen:false},
    Netball: {teams:TEAMS.map(t=>({...t,players:[]})),matches:[],published:false,votingOpen:false},
  },
  choir: {groups:TEAMS.map(t=>({...t,members:[]})),scores:[],published:false,categories:[...DEFAULT_CATS]},
  votes:{}, voters:{}, teamAdmins:[], judges:[],
  lastSeenNews: 0,
});

function loadState() {
  try {
    const s = localStorage.getItem(STORE_KEY);
    if (s) {
      const p = JSON.parse(s);
      const f = freshState();
      return {
        ...f, ...p,
        sports: {
          Soccer:  {...f.sports.Soccer,  ...p.sports?.Soccer,  teams: p.sports?.Soccer?.teams  || f.sports.Soccer.teams},
          Netball: {...f.sports.Netball, ...p.sports?.Netball, teams: p.sports?.Netball?.teams || f.sports.Netball.teams},
        },
        choir: {...f.choir, ...p.choir, groups: p.choir?.groups || f.choir.groups},
      };
    }
  } catch(e){}
  return freshState();
}
function saveState(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch(e){}
}

function buildBracket(teams) {
  const sh = [...teams].sort(()=>Math.random()-.5);
  return sh.reduce((acc,t,i)=>{
    if(i%2===0 && sh[i+1]) acc.push({id:uid(),round:1,teamA:t.id,teamB:sh[i+1].id,scoreA:null,scoreB:null,winner:null,status:"pending"});
    return acc;
  },[]);
}
function rankChoir(choir) {
  return choir.groups.map(g=>{
    const gs = choir.scores.filter(s=>s.groupId===g.id);
    const cats = choir.categories || DEFAULT_CATS;
    const catAvgs = cats.map(cat=>{
      const vals = gs.filter(s=>s.category===cat).map(s=>s.score);
      return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    });
    const overall = catAvgs.length ? catAvgs.reduce((a,b)=>a+b,0)/catAvgs.length : 0;
    return {group:g, catAvgs, overall, judgeCount:[...new Set(gs.map(s=>s.judgeId))].length};
  }).sort((a,b)=>b.overall-a.overall);
}

// ─── PWA MANIFEST INJECTION ───────────────────────────────────────────────────
function injectPWA() {
  if (document.getElementById("fc-pwa-manifest")) return;
  const manifest = {
    name:"Founder's Cup — CHG",short_name:"Founders Cup",
    description:"Church of the Holy Ghost Annual Championship",
    start_url:"/",display:"standalone",
    background_color:"#0d1b3e",theme_color:"#0d1b3e",orientation:"portrait-primary",
    icons:[
      {src:FC_LOGO,sizes:"192x192",type:"image/jpeg",purpose:"any maskable"},
      {src:FC_LOGO,sizes:"512x512",type:"image/jpeg",purpose:"any maskable"},
    ],
  };
  const blob = new Blob([JSON.stringify(manifest)],{type:"application/json"});
  const url  = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("link"),{id:"fc-pwa-manifest",rel:"manifest",href:url});
  document.head.appendChild(link);
  [
    ["apple-touch-icon",null,FC_LOGO],
    [null,"apple-mobile-web-app-capable","yes"],
    [null,"apple-mobile-web-app-status-bar-style","black-translucent"],
    [null,"apple-mobile-web-app-title","Founders Cup"],
    [null,"theme-color","#0d1b3e"],
  ].forEach(([rel,name,val])=>{
    const el = rel ? document.createElement("link") : document.createElement("meta");
    if(rel){el.rel=rel;el.href=val;}else{el.name=name;el.content=val;}
    document.head.appendChild(el);
  });
}

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
async function requestPush() {
  if(!("Notification" in window)) return false;
  if(Notification.permission === "granted") return true;
  const p = await Notification.requestPermission();
  return p === "granted";
}
function pushNotify(title, body) {
  if(!("Notification" in window) || Notification.permission !== "granted") return;
  try { new Notification(title, {body, icon:FC_LOGO, badge:FC_LOGO, tag:"fc-news"}); }
  catch(e){}
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({name,size=22,stroke="currentColor",sw=1.5}) => {
  const p = {fill:"none",stroke,strokeWidth:sw,strokeLinecap:"round",strokeLinejoin:"round"};
  const v = {width:size,height:size,display:"block",flexShrink:0};
  const d = {
    home:    <><path {...p} d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path {...p} d="M9 21V12h6v9"/></>,
    soccer:  <><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 3l1.5 3.5h-3L12 3zM5 8l2 1-1 3-2.5-1.5L5 8zM19 8l-2 1 1 3 2.5-1.5L19 8z"/></>,
    netball: <><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 3c2.5 4 2.5 14 0 18M3 12c4-2.5 14-2.5 18 0M5.5 6.5c2 2 11 2 13 0M5.5 17.5c2-2 11-2 13 0"/></>,
    choir:   <><path {...p} d="M9 18V5l12-2v13"/><circle {...p} cx="6" cy="18" r="3"/><circle {...p} cx="18" cy="16" r="3"/></>,
    news:    <><path {...p} d="M18 8a6 6 0 010 8M22 5a10 10 0 010 14M3 10v4a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1z"/></>,
    admin:   <><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    trophy:  <><path {...p} d="M8 21h8M12 17v4M5 3H3a2 2 0 000 4c0 3 2 5 4 6M19 3h2a2 2 0 010 4c0 3-2 5-4 6"/><path {...p} d="M8 3h8v8a4 4 0 01-8 0V3z"/></>,
    plus:    <><path {...p} d="M12 5v14M5 12h14"/></>,
    check:   <><path {...p} d="M20 6L9 17l-5-5"/></>,
    lock:    <><rect {...p} x="3" y="11" width="18" height="11" rx="2"/><path {...p} d="M7 11V7a5 5 0 0110 0v4"/></>,
    eye:     <><path {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle {...p} cx="12" cy="12" r="3"/></>,
    eyeoff:  <><path {...p} d="M17.9 17.9A10.9 10.9 0 0112 20C5 20 1 12 1 12a18 18 0 015.1-6.9M9.9 4.2A10.5 10.5 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.1 3.1M1 1l22 22"/><path {...p} d="M14.1 14.1a3 3 0 01-4.2-4.2"/></>,
    trash:   <><path {...p} d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path {...p} d="M10 11v6M14 11v6"/></>,
    publish: <><path {...p} d="M12 19V5M5 12l7-7 7 7"/></>,
    bracket: <><path {...p} d="M3 6h4v12H3M17 6h4v12h-4M7 12h10"/></>,
    users:   <><circle {...p} cx="9" cy="8" r="3"/><path {...p} d="M2 20c0-3 2.7-5.5 7-5.5"/><circle {...p} cx="17" cy="8" r="3"/><path {...p} d="M22 20c0-3-2.7-5.5-7-5.5s-7 2.5-7 5.5"/></>,
    mic:     <><rect {...p} x="9" y="2" width="6" height="12" rx="3"/><path {...p} d="M5 10a7 7 0 0014 0M12 19v3M8 22h8"/></>,
    vote:    <><path {...p} d="M9 11l3 3L22 4"/><path {...p} d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    bell:    <><path {...p} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></>,
    x:       <><path {...p} d="M18 6L6 18M6 6l12 12"/></>,
    tag:     <><path {...p} d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line {...p} x1="7" y1="7" x2="7.01" y2="7"/></>,
    shield:  <><path {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    cal:     <><rect {...p} x="3" y="4" width="18" height="18" rx="2"/><path {...p} d="M16 2v4M8 2v4M3 10h18"/></>,
    signal:  <><path {...p} d="M2 20h.01M7 20v-4M12 20V10M17 20V4M22 20v-8"/></>,
    phone:   <><path {...p} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></>,
    download:<><path {...p} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></>,
  };
  return <svg style={v} viewBox="0 0 24 24">{d[name]||d.signal}</svg>;
};

// ─── TEAM LOGO ────────────────────────────────────────────────────────────────
const TL = ({teamId,size=48,cls="",style={}}) => (
  <img src={TEAM_LOGOS[teamId]||""} alt="" className={cls}
    style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(240,180,41,.3)",flexShrink:0,...style}}
    onError={e=>{e.target.style.opacity=".2";}}/>
);

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{
  --navy:#0d1b3e;--navy2:#122044;--navy3:#1a2a54;--navy4:#223060;
  --gold:#f0b429;--gold2:#ffd166;--gold-dim:rgba(240,180,41,.12);--gold-border:rgba(240,180,41,.28);
  --white:#fff;--muted:#8899cc;--muted2:#4a5a8a;
  --red:#e53e3e;--green:#38a169;
  --border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.14);
  --nav-h:64px;--safe-b:env(safe-area-inset-bottom,0px);
}
body{background:var(--navy);color:#fff;font-family:'Barlow',sans-serif;min-height:100vh;overscroll-behavior:none;background-image:radial-gradient(ellipse at 20% 0%,rgba(240,180,41,.04) 0%,transparent 50%);}
::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}

/* ─── SPLASH ─── */
.splash{position:fixed;inset:0;z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;background:var(--navy);background-image:radial-gradient(ellipse at 50% 35%,rgba(240,180,41,.13) 0%,transparent 65%);}
.sp-rings{position:relative;display:flex;align-items:center;justify-content:center;margin-bottom:28px;}
.sp-ring{position:absolute;border-radius:50%;border:1px solid rgba(240,180,41,.15);}
.sp-ring-1{width:220px;height:220px;animation:ringPulse 2.4s ease-in-out infinite;}
.sp-ring-2{width:270px;height:270px;animation:ringPulse 2.4s ease-in-out infinite .4s;}
.sp-ring-3{width:320px;height:320px;animation:ringPulse 2.4s ease-in-out infinite .8s;}
.sp-logo{width:160px;height:160px;border-radius:50%;object-fit:cover;border:3px solid var(--gold);box-shadow:0 0 60px rgba(240,180,41,.45),0 0 120px rgba(240,180,41,.1);position:relative;z-index:1;animation:logoSpin 1.1s cubic-bezier(.34,1.56,.64,1) both;}
.sp-title{font-family:'Barlow Condensed',sans-serif;font-size:46px;font-weight:900;letter-spacing:5px;text-transform:uppercase;line-height:1;animation:slideUp .8s ease .6s both;}
.sp-title em{color:var(--gold);font-style:normal;}
.sp-sub{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--muted);margin-top:7px;animation:slideUp .8s ease .8s both;}
.sp-bar{height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:22px auto 0;animation:barGrow 1s ease 1s both;}
.sp-hint{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.25);margin-top:24px;animation:slideUp .6s ease 1.4s both;}
.sp-dots{display:flex;gap:8px;margin-top:14px;animation:slideUp .5s ease 1.6s both;}
.sp-dot{width:6px;height:6px;border-radius:50%;background:rgba(240,180,41,.35);animation:dotBounce 1.6s ease-in-out infinite;}
.sp-dot:nth-child(2){animation-delay:.2s;}.sp-dot:nth-child(3){animation-delay:.4s;}
@keyframes logoSpin{from{opacity:0;transform:scale(.2) rotate(-20deg);}60%{transform:scale(1.1) rotate(4deg);}to{opacity:1;transform:scale(1) rotate(0);}}
@keyframes slideUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
@keyframes barGrow{from{width:0;opacity:0;}to{width:80px;opacity:1;}}
@keyframes ringPulse{0%,100%{transform:scale(1);opacity:.5;}50%{transform:scale(1.06);opacity:.15;}}
@keyframes dotBounce{0%,100%{transform:translateY(0);opacity:.4;}50%{transform:translateY(-5px);opacity:1;}}

/* ─── SHELL ─── */
.app{display:flex;flex-direction:column;min-height:100vh;max-width:480px;margin:0 auto;background:var(--navy);}
.app-content{flex:1;overflow-y:auto;padding-bottom:calc(var(--nav-h) + var(--safe-b) + 8px);}

/* ─── PAGE ENTRY ANIMATION ─── */
.page-wrap{animation:pageIn .42s cubic-bezier(.25,.46,.45,.94) both;}
@keyframes pageIn{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}

/* ─── STAGGER ─── */
@keyframes fu{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
.fu{animation:fu .38s ease both;}
.fu1{animation-delay:.05s;}.fu2{animation-delay:.1s;}.fu3{animation-delay:.15s;}
.fu4{animation-delay:.2s;}.fu5{animation-delay:.26s;}.fu6{animation-delay:.32s;}
.fu7{animation-delay:.38s;}.fu8{animation-delay:.44s;}

/* ─── HEADER ─── */
.hdr{background:rgba(13,27,62,.96);border-bottom:2px solid var(--gold);padding:11px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;backdrop-filter:blur(16px);}
.hdr-brand{display:flex;align-items:center;gap:10px;}
.hdr-logo{width:34px;height:34px;border-radius:50%;object-fit:cover;border:1.5px solid var(--gold);}
.hdr-title{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:800;letter-spacing:2px;color:var(--gold);text-transform:uppercase;line-height:1;}
.hdr-sub{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:1px;}
.adm-btn{display:flex;align-items:center;gap:6px;padding:7px 12px;border:1px solid var(--gold-border);border-radius:20px;background:var(--gold-dim);color:var(--gold);font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.adm-btn.on{background:var(--gold);color:var(--navy);}
.role-pill{padding:5px 10px;border:1px solid var(--gold-border);border-radius:20px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);background:var(--gold-dim);font-family:'Barlow Condensed',sans-serif;font-weight:700;}

/* ─── BOTTOM NAV ─── */
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:rgba(13,27,62,.97);border-top:1px solid var(--gold-border);display:flex;padding-bottom:var(--safe-b);z-index:100;height:var(--nav-h);backdrop-filter:blur(20px);}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;padding:6px 2px;color:var(--muted2);transition:color .2s;border:none;background:none;position:relative;}
.nav-item.on{color:var(--gold);}
.nav-item.on::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:28px;height:2px;background:var(--gold);border-radius:0 0 3px 3px;}
.nav-lbl{font-size:9px;letter-spacing:.8px;text-transform:uppercase;font-weight:700;font-family:'Barlow Condensed',sans-serif;}
.nav-badge{position:absolute;top:5px;right:calc(50% - 17px);min-width:17px;height:17px;background:#e53e3e;border-radius:9px;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid var(--navy);animation:badgePop .35s cubic-bezier(.34,1.56,.64,1);}
@keyframes badgePop{from{transform:scale(0);}to{transform:scale(1);}}

/* ─── PAGE ─── */
.pg{padding:0 0 16px;}
.pg-banner{background:linear-gradient(160deg,var(--navy3) 0%,var(--navy2) 100%);border-bottom:1px solid var(--border);padding:20px 18px 16px;position:relative;overflow:hidden;}
.pg-banner::after{content:'';position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,var(--gold-dim) 0%,transparent 70%);pointer-events:none;}
.pg-lbl{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:3px;font-weight:700;font-family:'Barlow Condensed',sans-serif;}
.pg-title{font-family:'Barlow Condensed',sans-serif;font-size:34px;font-weight:900;letter-spacing:2px;text-transform:uppercase;line-height:1;}
.pg-title .acc{color:var(--gold);}
.pg-sub{font-size:12px;color:var(--muted);margin-top:5px;}
.inner{padding:16px 18px 4px;}

/* ─── HERO ─── */
.hero{background:linear-gradient(180deg,var(--navy3) 0%,var(--navy) 100%);padding:28px 20px 22px;text-align:center;border-bottom:1px solid var(--border);position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(240,180,41,.1) 0%,transparent 60%);pointer-events:none;}
.hero-logo{width:88px;height:88px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);box-shadow:0 0 30px rgba(240,180,41,.28);margin-bottom:12px;position:relative;animation:heroIn .7s cubic-bezier(.34,1.56,.64,1) .1s both;}
@keyframes heroIn{from{opacity:0;transform:scale(.6);}to{opacity:1;transform:scale(1);}}
.hero-title{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:900;letter-spacing:3px;text-transform:uppercase;line-height:1;}
.hero-title em{color:var(--gold);font-style:normal;}
.hero-sub{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-top:6px;font-family:'Barlow Condensed',sans-serif;}

/* ─── CARDS ─── */
.card{background:var(--navy3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;}
.card-gold{border-color:var(--gold-border);background:linear-gradient(135deg,rgba(240,180,41,.07) 0%,var(--navy3) 60%);}
.card-sm{padding:12px 14px;}

/* ─── STATS ─── */
.stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.stat-box{background:var(--navy3);border:1px solid var(--border);border-radius:10px;padding:12px 6px;text-align:center;}
.stat-n{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:700;color:var(--gold);line-height:1;}
.stat-l{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-top:3px;font-family:'Barlow Condensed',sans-serif;}

/* ─── TEAM GRID ─── */
.tgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;}
.tgrid-item{display:flex;flex-direction:column;align-items:center;gap:6px;}
.tgrid-logo{width:54px;height:54px;border-radius:50%;object-fit:cover;border:2px solid var(--border2);}
.tgrid-name{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;text-align:center;letter-spacing:.3px;line-height:1.2;}

/* ─── BUTTONS ─── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 16px;border-radius:8px;border:none;font-family:'Barlow',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;width:100%;letter-spacing:.5px;text-transform:uppercase;}
.btn:active{transform:scale(.97);}
.btn-p{background:var(--gold);color:var(--navy);}
.btn-p:hover{background:var(--gold2);}
.btn-o{background:transparent;border:1px solid var(--border2);color:#fff;}
.btn-o:hover{border-color:var(--gold);color:var(--gold);}
.btn-d{background:rgba(229,62,62,.12);border:1px solid rgba(229,62,62,.25);color:#fc8181;}
.btn-g{background:rgba(56,161,105,.1);border:1px solid rgba(56,161,105,.25);color:#68d391;}
.btn-sm{padding:8px 13px;font-size:11px;border-radius:6px;width:auto;}
.btn-row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}

/* ─── FORMS ─── */
.fg{margin-bottom:13px;}
.fl{display:block;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;font-family:'Barlow Condensed',sans-serif;font-weight:700;}
.fi{width:100%;padding:11px 13px;background:rgba(0,0,0,.25);border:1px solid var(--border);border-radius:8px;color:#fff;font-family:'Barlow',sans-serif;font-size:14px;transition:border-color .2s;-webkit-appearance:none;}
.fi:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(240,180,41,.1);}
.fi::placeholder{color:var(--muted2);}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.fsec{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin:16px 0 10px;font-weight:700;padding-bottom:5px;border-bottom:1px solid var(--gold-border);}

/* ─── SECTION HDR ─── */
.sec-hd{display:flex;align-items:center;justify-content:space-between;margin:16px 0 10px;}
.sec-hd-t{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);font-weight:700;}
.gline{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.gline::before,.gline::after{content:'';flex:1;height:1px;background:var(--border);}
.gline-t{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);font-weight:700;white-space:nowrap;}

/* ─── TAGS ─── */
.tag{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;font-family:'Barlow Condensed',sans-serif;}
.tg{background:var(--gold-dim);color:var(--gold);border:1px solid var(--gold-border);}
.tgn{background:rgba(56,161,105,.1);color:#68d391;border:1px solid rgba(56,161,105,.2);}
.tgr{background:rgba(229,62,62,.1);color:#fc8181;border:1px solid rgba(229,62,62,.2);}
.tgm{background:rgba(255,255,255,.05);color:var(--muted);border:1px solid var(--border);}

/* ─── BRACKET ─── */
.bscroll{overflow-x:auto;padding:0 0 16px;}
.binner{display:flex;gap:14px;min-width:max-content;}
.bcol{display:flex;flex-direction:column;gap:12px;width:170px;}
.brlbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:2px;font-weight:700;}
.mcard{background:var(--navy3);border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.mteam{display:flex;align-items:center;gap:7px;padding:9px 11px;border-bottom:1px solid var(--border);}
.mteam:last-of-type{border-bottom:none;}
.mteam.win{background:rgba(240,180,41,.1);color:var(--gold);}
.mteam.los{color:var(--muted2);}
.mtn{flex:1;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;}
.msc{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;color:var(--gold);min-width:22px;text-align:right;}
.msc.dim{color:var(--muted2);}
.mfoot{padding:5px 11px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);background:rgba(0,0,0,.2);text-align:center;font-family:'Barlow Condensed',sans-serif;}

/* ─── CHOIR ─── */
.ccard{background:var(--navy3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;position:relative;}
.sbar-row{display:flex;align-items:center;gap:9px;margin-bottom:6px;}
.sbar-lbl{font-size:11px;color:var(--muted);width:84px;flex-shrink:0;font-family:'Barlow Condensed',sans-serif;font-weight:600;}
.sbar-track{flex:1;height:3px;background:rgba(255,255,255,.07);border-radius:2px;}
.sbar-fill{height:100%;background:var(--gold);border-radius:2px;transition:width .6s ease;}
.sbar-val{font-family:'Barlow Condensed',sans-serif;font-size:12px;color:var(--gold);font-weight:700;width:26px;text-align:right;flex-shrink:0;}
.drow{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);}
.drow:last-child{border-bottom:none;}
.dlbl{font-size:13px;flex:1;font-weight:500;}
.dots{display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end;}
.dot{width:25px;height:25px;border-radius:50%;border:1px solid var(--muted2);background:transparent;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;color:var(--muted);display:flex;align-items:center;justify-content:center;transition:all .15s;}
.dot:hover{border-color:var(--gold);color:var(--gold);}
.dot.on{background:var(--gold);border-color:var(--gold);color:var(--navy);}

/* ─── CHAMPION ─── */
.champ{position:relative;overflow:hidden;background:linear-gradient(135deg,#1a2800 0%,#0d1400 50%,#1a2800 100%);border:1px solid var(--gold-border);border-radius:14px;padding:20px;text-align:center;margin-bottom:12px;}
.champ::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(240,180,41,.15) 0%,transparent 60%);}
.champ-lbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);opacity:.8;margin-bottom:6px;position:relative;font-weight:700;}
.champ-name{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:900;color:var(--gold);position:relative;letter-spacing:1px;text-transform:uppercase;line-height:1.1;}
.champ-sub{font-size:11px;color:var(--muted);margin-top:5px;position:relative;}
.champ-logo{width:68px;height:68px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);margin-bottom:10px;box-shadow:0 0 20px rgba(240,180,41,.3);position:relative;}

/* ─── ANNOUNCEMENTS ─── */
.ann{padding:14px 14px 14px 16px;background:var(--navy3);border-left:3px solid var(--gold);border-radius:0 10px 10px 0;margin-bottom:10px;display:flex;gap:10px;}
.ann.urgent{border-left-color:#fc8181;background:rgba(229,62,62,.04);}
.ann.new-item{animation:newFlash .6s ease;}
@keyframes newFlash{0%,100%{background:var(--navy3);}50%{background:rgba(240,180,41,.08);}}
.ann-body-wrap{flex:1;}
.ann-time{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:5px;display:flex;align-items:center;gap:6px;}
.ann-body{font-size:14px;line-height:1.6;}

/* ─── PLAYER ─── */
.pcard{display:flex;align-items:center;gap:11px;padding:10px 13px;background:rgba(0,0,0,.2);border:1px solid var(--border);border-radius:8px;margin-bottom:7px;}
.pavatar{width:36px;height:36px;border-radius:50%;background:var(--navy3);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;color:var(--muted);flex-shrink:0;}
.pname{font-size:14px;font-weight:500;}
.pmeta{font-size:11px;color:var(--muted);margin-top:1px;}

/* ─── USER ROW ─── */
.urow{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--navy3);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;}
.uavatar{width:38px;height:38px;border-radius:50%;background:var(--gold-dim);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:var(--gold);flex-shrink:0;}

/* ─── TABS ─── */
.tabs{display:flex;border-bottom:1px solid var(--border);padding:0 18px;overflow-x:auto;}
.tab{padding:10px 13px;background:none;border:none;border-bottom:2px solid transparent;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;color:var(--muted);white-space:nowrap;transition:color .2s,border-color .2s;}
.tab.on{color:var(--gold);border-bottom-color:var(--gold);}

/* ─── EMPTY ─── */
.empty{display:flex;flex-direction:column;align-items:center;padding:48px 24px;text-align:center;gap:12px;}
.empty-icon{color:rgba(255,255,255,.09);}
.empty-txt{font-size:13px;color:var(--muted);line-height:1.6;max-width:240px;}

/* ─── TOAST ─── */
.toast{position:fixed;top:72px;left:50%;transform:translateX(-50%);background:var(--navy3);border:1px solid var(--gold-border);border-radius:8px;padding:10px 18px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gold);z-index:999;white-space:nowrap;pointer-events:none;animation:toastIn .25s ease;}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

/* ─── MODALS ─── */
.overlay{position:fixed;inset:0;background:rgba(5,10,25,.9);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(8px);animation:fadeIn .2s ease;}
.msheet{background:var(--navy2);border-radius:16px;border:1px solid var(--border2);width:100%;max-width:400px;padding:28px 22px;max-height:88vh;overflow-y:auto;}
.mhandle{width:36px;height:3px;background:var(--border2);border-radius:3px;margin:0 auto 20px;}
.mtitle{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;color:#fff;}
.msub{font-size:13px;color:var(--muted);margin-bottom:20px;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}

/* ─── PIN DIALOG ─── */
.pin-overlay{position:fixed;inset:0;background:rgba(5,10,25,.92);z-index:300;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(10px);animation:fadeIn .2s ease;}
.pin-box{background:var(--navy2);border:1px solid var(--border2);border-radius:16px;padding:28px 24px;width:100%;max-width:320px;text-align:center;}
.pin-icon{margin-bottom:12px;color:var(--gold);}
.pin-title{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;}
.pin-desc{font-size:12px;color:var(--muted);margin-bottom:20px;line-height:1.5;}
.pin-err{font-size:12px;color:#fc8181;margin-bottom:10px;font-family:'Barlow Condensed',sans-serif;}
.pin-inp{width:100%;padding:14px;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:10px;color:var(--gold);font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:700;letter-spacing:12px;text-align:center;margin-bottom:12px;transition:border-color .2s;}
.pin-inp:focus{outline:none;border-color:var(--gold);}

/* ─── PWA BANNER ─── */
.pwa-banner{margin:0 18px 14px;padding:14px 16px;background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:10px;display:flex;align-items:center;gap:12px;animation:fu .4s ease;}
.pwa-logo{width:40px;height:40px;border-radius:10px;object-fit:cover;flex-shrink:0;}
.pwa-title{font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;color:var(--gold);letter-spacing:.5px;}
.pwa-sub{font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4;}

/* ─── VOTE ─── */
.vcard{background:var(--navy3);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:12px;}
.vmhdr{padding:12px 14px;background:rgba(240,180,41,.06);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.vprow{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;}
.vprow:last-child{border-bottom:none;}
.vradio{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--muted2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;}
.vradio.on{border-color:var(--gold);background:var(--gold);}
.vbar-wrap{display:flex;align-items:center;gap:6px;min-width:70px;}
.vbar-track{flex:1;height:3px;background:rgba(255,255,255,.08);border-radius:2px;}
.vbar-fill{height:100%;background:var(--gold);border-radius:2px;transition:width .4s ease;}
.vcount{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:var(--gold);min-width:22px;text-align:right;}

/* ─── SCORE ENTRY ─── */
.svs{display:flex;align-items:center;margin-bottom:14px;}
.sside{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;}
.sside-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;text-align:center;}
.ssep{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:var(--muted);letter-spacing:2px;padding:0 6px;margin-top:20px;}

/* ─── MISC ─── */
.since-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:4px;background:rgba(240,180,41,.06);border:1px solid var(--gold-border);font-size:11px;color:var(--muted);}
.judge-hdr{background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
hr{border:none;border-top:1px solid var(--border);margin:14px 0;}
`;

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState(null);
  const show = m => { setMsg(m); setTimeout(()=>setMsg(null), 2400); };
  return [msg ? <div className="toast">{msg}</div> : null, show];
}

// ─── PIN CONFIRM ──────────────────────────────────────────────────────────────
function PinDialog({ title, desc, onOk, onCancel }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const go = () => { if(pin===ORG_PIN){onOk();}else{setErr("Incorrect PIN.");setPin("");} };
  return (
    <div className="pin-overlay">
      <div className="pin-box">
        <div className="pin-icon"><Icon name="lock" size={28}/></div>
        <div className="pin-title">{title||"Confirm"}</div>
        <div className="pin-desc">{desc||"Enter the organizer PIN to continue."}</div>
        {err && <div className="pin-err">{err}</div>}
        <input className="pin-inp" type="password" placeholder="····" autoFocus value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
        <button className="btn btn-d" style={{marginBottom:8}} onClick={go}><Icon name="check" size={14}/> Confirm Delete</button>
        <button className="btn btn-o" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function usePinDialog() {
  const [cfg, setCfg] = useState(null);
  const ask = (title, desc, onOk) => setCfg({title,desc,onOk});
  const el = cfg ? <PinDialog title={cfg.title} desc={cfg.desc} onOk={()=>{cfg.onOk();setCfg(null);}} onCancel={()=>setCfg(null)}/> : null;
  return [el, ask];
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3400); return()=>clearTimeout(t); },[]);
  return (
    <div className="splash" onClick={onDone}>
      <div className="sp-rings">
        <div className="sp-ring sp-ring-1"/><div className="sp-ring sp-ring-2"/><div className="sp-ring sp-ring-3"/>
        <img src={FC_LOGO} className="sp-logo" alt=""/>
      </div>
      <div className="sp-title">Founder's <em>Cup</em></div>
      <div className="sp-sub">Church of the Holy Ghost</div>
      <div className="sp-bar"/>
      <div className="sp-hint">Tap to enter</div>
      <div className="sp-dots"><div className="sp-dot"/><div className="sp-dot"/><div className="sp-dot"/></div>
    </div>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
function AdminModal({ state, onLogin, onClose }) {
  const [step, setStep]    = useState("role");
  const [selRole, setSelRole] = useState(null);
  const [selUser, setSelUser] = useState("");
  const [pin, setPin]      = useState("");
  const [err, setErr]      = useState("");
  const roles = [
    {id:"organizer",label:"Tournament Organizer",desc:"Full control of the event",icon:"trophy"},
    {id:"judge",    label:"Choir Judge",          desc:"Score performances on your tablet",icon:"mic"},
    {id:"teamadmin",label:"Team Admin",           desc:"Manage your team & roster",icon:"users"},
  ];
  const users = selRole==="judge" ? state.judges : selRole==="teamadmin" ? state.teamAdmins : [];
  const attempt = () => {
    if(selRole==="organizer"){
      if(pin!==ORG_PIN){setErr("Incorrect PIN.");return;}
      onLogin({id:"organizer",name:"Organizer",role:"organizer"});
    } else {
      const u=(selRole==="judge"?state.judges:state.teamAdmins).find(x=>x.id===selUser&&x.pin===pin);
      if(!u){setErr("Incorrect PIN.");return;}
      onLogin({...u,role:selRole});
    }
  };
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="msheet">
        <div className="mhandle"/>
        <div className="mtitle">Admin Login</div>
        <div className="msub">Select your role to continue</div>
        {step==="role" && roles.map(r=>(
          <button key={r.id} onClick={()=>{setSelRole(r.id);setSelUser("");setPin("");setErr("");setStep("pin");}}
            style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,.04)",border:"1px solid var(--border)",borderRadius:10,marginBottom:10,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12,color:"#fff",transition:"border-color .2s"}}
            onMouseOver={e=>e.currentTarget.style.borderColor="var(--gold)"}
            onMouseOut={e=>e.currentTarget.style.borderColor="var(--border)"}>
            <div style={{width:40,height:40,borderRadius:9,background:"var(--gold-dim)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--gold)"}}>
              <Icon name={r.icon} size={18}/>
            </div>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{r.label}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{r.desc}</div>
            </div>
          </button>
        ))}
        {step==="pin" && (
          <div>
            <button onClick={()=>setStep("role")} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:11,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",marginBottom:16,fontWeight:700}}>← Back</button>
            {users.length>0 && (
              <div className="fg">
                <label className="fl">Your Profile</label>
                <select className="fi" value={selUser} onChange={e=>setSelUser(e.target.value)}>
                  <option value="">— Select —</option>
                  {users.map(u=><option key={u.id} value={u.id}>{u.name}{u.teamId?" — "+TEAMS.find(t=>t.id===u.teamId)?.name:""}</option>)}
                </select>
              </div>
            )}
            {users.length===0 && selRole!=="organizer" && (
              <div style={{fontSize:13,color:"var(--muted)",padding:"12px",background:"rgba(255,255,255,.03)",borderRadius:8,border:"1px solid var(--border)",marginBottom:14,lineHeight:1.5}}>
                No {selRole==="judge"?"judges":"team admins"} created yet. Ask the organizer.
              </div>
            )}
            {(selRole==="organizer"||(selUser&&selRole!=="organizer")) && (
              <>
                {err && <div style={{fontSize:12,color:"#fc8181",textAlign:"center",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif"}}>{err}</div>}
                <div className="fg">
                  <label className="fl">PIN</label>
                  <input className="fi" type="password" placeholder="····" style={{fontSize:24,letterSpacing:10,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif"}} value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()}/>
                </div>
                <button className="btn btn-p" onClick={attempt}><Icon name="check" size={15}/> Enter</button>
              </>
            )}
            <div style={{marginTop:16,textAlign:"center",fontSize:11,color:"var(--muted)",cursor:"pointer",letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={onClose}>
              <Icon name="eye" size={13}/> Continue as spectator
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PWA INSTALL PROMPT ───────────────────────────────────────────────────────
function PWABanner() {
  const [deferredPrompt, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(()=>!!localStorage.getItem("fc_pwa_dismissed"));
  useEffect(()=>{
    const h = e => { e.preventDefault(); setDeferred(e); setShow(true); };
    window.addEventListener("beforeinstallprompt", h);
    return ()=>window.removeEventListener("beforeinstallprompt",h);
  },[]);
  if(!show||dismissed) return null;
  const install = async () => {
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    const {outcome} = await deferredPrompt.userChoice;
    setShow(false);
    if(outcome==="accepted") localStorage.setItem("fc_pwa_dismissed","1");
  };
  return (
    <div className="pwa-banner">
      <img src={FC_LOGO} className="pwa-logo" alt=""/>
      <div style={{flex:1}}>
        <div className="pwa-title">Add to Home Screen</div>
        <div className="pwa-sub">Install the Founders Cup app with the tournament logo as your icon</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        <button className="btn btn-p btn-sm" onClick={install}><Icon name="download" size={13}/> Install</button>
        <button className="btn btn-o btn-sm" onClick={()=>{setShow(false);setDismissed(true);localStorage.setItem("fc_pwa_dismissed","1");}}>Later</button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function FoundersCup() {
  const [splash,  setSplash]  = useState(true);
  const [adminModal, setAdminModal] = useState(false);
  const [user, setUser]       = useState(null);
  const [state, setState]     = useState(loadState);
  const [tab,  setTab]        = useState("home");
  const [toast, showToast]    = useToast();
  const [pinEl, askPin]       = usePinDialog();

  // Persist on every state change
  useEffect(()=>{ saveState(state); },[state]);
  // PWA + push setup
  useEffect(()=>{ injectPWA(); },[]);

  const update = useCallback(fn => setState(s => {
    const n = JSON.parse(JSON.stringify(s)); fn(n); return n;
  }),[]);

  const role = user?.role || "spectator";
  const isOrg = role==="organizer";

  // Unread news count
  const unread = state.announcements.filter(a => a.ts > (state.lastSeenNews||0)).length;

  const handleTabChange = t => {
    setTab(t);
    if(t==="news") update(s=>{ s.lastSeenNews = Date.now(); });
  };

  const navItems = [
    {id:"home",   lbl:"Home",   icon:"home"  },
    {id:"soccer", lbl:"Soccer", icon:"soccer"},
    {id:"netball",lbl:"Netball",icon:"netball"},
    {id:"choir",  lbl:"Choir",  icon:"choir" },
    {id:"vote",   lbl:"Vote",   icon:"vote"  },
    {id:"news",   lbl:"News",   icon:"news", badge: unread},
    ...(isOrg?[{id:"admin",lbl:"Admin",icon:"admin"}]:[]),
  ];

  if(splash) return <><style>{CSS}</style><Splash onDone={()=>setSplash(false)}/></>;

  return (
    <>
      <style>{CSS}</style>
      {toast}
      {pinEl}
      {adminModal && <AdminModal state={state} onLogin={u=>{setUser(u);setAdminModal(false);showToast(`Welcome, ${u.name}`);if(u.role==="organizer")setTab("admin");else if(u.role==="judge")setTab("choir");else setTab("soccer");}} onClose={()=>setAdminModal(false)}/>}
      <div className="app">
        <header className="hdr">
          <div className="hdr-brand">
            <img src={FC_LOGO} className="hdr-logo" alt=""/>
            <div><div className="hdr-title">Founder's Cup</div><div className="hdr-sub">Church of the Holy Ghost</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {user ? (
              <><span className="role-pill">{user.name}</span>
              <button className="adm-btn on" onClick={()=>{setUser(null);setTab("home");showToast("Signed out");}}><Icon name="lock" size={13}/> Out</button></>
            ) : (
              <button className="adm-btn" onClick={()=>setAdminModal(true)}><Icon name="admin" size={13}/> Admin</button>
            )}
          </div>
        </header>

        <div className="app-content">
          {tab==="home"    && <HomePage    state={state} update={update} askPin={askPin} showToast={showToast}/>}
          {tab==="soccer"  && <SportPage   sport="Soccer"  state={state} update={update} role={role} user={user} askPin={askPin} showToast={showToast}/>}
          {tab==="netball" && <SportPage   sport="Netball" state={state} update={update} role={role} user={user} askPin={askPin} showToast={showToast}/>}
          {tab==="choir"   && <ChoirPage   state={state} update={update} role={role} user={user} askPin={askPin} showToast={showToast}/>}
          {tab==="vote"    && <VotePage    state={state} update={update} role={role} user={user} showToast={showToast}/>}
          {tab==="news"    && <NewsPage    state={state} update={update} role={role} showToast={showToast}/>}
          {tab==="admin"   && isOrg && <AdminPage state={state} update={update} askPin={askPin} showToast={showToast}/>}
        </div>

        <nav className="nav">
          {navItems.map(n=>(
            <button key={n.id} className={`nav-item ${tab===n.id?"on":""}`} onClick={()=>handleTabChange(n.id)}>
              {n.badge>0 && <span className="nav-badge">{n.badge>9?"9+":n.badge}</span>}
              <Icon name={n.icon} size={20} sw={tab===n.id?1.8:1.3} stroke={tab===n.id?"var(--gold)":"currentColor"}/>
              <span className="nav-lbl">{n.lbl}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ state }) {
  const getChamp = sport => {
    const {matches,teams,published} = state.sports[sport];
    if(!published||!matches.length) return null;
    const maxR = Math.max(...matches.map(m=>m.round));
    const f = matches.find(m=>m.round===maxR&&m.winner);
    return f ? teams.find(t=>t.id===f.winner) : null;
  };
  const sc=getChamp("Soccer"), nc=getChamp("Netball");
  const cc = state.choir.published ? rankChoir(state.choir)[0]?.group : null;
  const totalM  = Object.values(state.sports).reduce((a,s)=>a+s.matches.length,0);
  const doneM   = Object.values(state.sports).reduce((a,s)=>a+s.matches.filter(m=>m.winner).length,0);
  const players = Object.values(state.sports).reduce((a,s)=>a+s.teams.reduce((b,t)=>b+(t.players?.length||0),0),0);

  return (
    <div className="page-wrap">
      <div className="hero">
        <img src={FC_LOGO} className="hero-logo" alt="Founders Cup"/>
        <div className="hero-title fu fu1">Founder's <em>Cup</em></div>
        <div className="hero-sub fu fu2">Church of the Holy Ghost · Annual Championship</div>
      </div>
      <PWABanner/>
      <div className="inner">
        <div className="stat-row">
          <div className="stat-box fu fu1"><div className="stat-n">8</div><div className="stat-l">Teams</div></div>
          <div className="stat-box fu fu2"><div className="stat-n">{doneM}</div><div className="stat-l">Played</div></div>
          <div className="stat-box fu fu3"><div className="stat-n">{players}</div><div className="stat-l">Players</div></div>
        </div>
        <div className="sec-hd fu fu2"><span className="sec-hd-t">The 8 Teams</span></div>
        <div className="tgrid fu fu3">
          {TEAMS.map((t,i)=>(
            <div key={t.id} className="tgrid-item fu" style={{animationDelay:`${.1+i*.04}s`}}>
              <img src={TEAM_LOGOS[t.id]} className="tgrid-logo" alt={t.name} onError={e=>e.target.style.opacity=".2"}/>
              <div className="tgrid-name">{t.name}</div>
            </div>
          ))}
        </div>
        {(sc||nc||cc) && (
          <>
            <div className="gline fu fu4"><span className="gline-t">Champions</span></div>
            {sc && <ChampBanner sport="Soccer"  team={sc}/>}
            {nc && <ChampBanner sport="Netball" team={nc}/>}
            {cc && <ChampBanner sport="Choir"   team={cc}/>}
          </>
        )}
        {state.announcements.length>0 && (
          <>
            <div className="sec-hd fu fu4"><span className="sec-hd-t">Latest News</span></div>
            {state.announcements.slice(0,2).map((a,i)=>(
              <div key={a.id} className={`ann fu`} style={{animationDelay:`${.2+i*.06}s`}}>
                <div className="ann-body-wrap">
                  <div className="ann-time">{a.time}{a.urgent&&<span className="tag tgr" style={{fontSize:9,padding:"1px 6px"}}>Urgent</span>}</div>
                  <div className="ann-body">{a.body}</div>
                </div>
              </div>
            ))}
          </>
        )}
        {!sc&&!nc&&!cc&&state.announcements.length===0 && (
          <div className="empty fu fu3">
            <div className="empty-icon"><Icon name="signal" size={38} sw={1}/></div>
            <div className="empty-txt">Live results will appear here as the competition progresses.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChampBanner({sport,team}) {
  return (
    <div className="champ fu">
      <img src={TEAM_LOGOS[team.id]} className="champ-logo" alt={team.name}/>
      <div className="champ-lbl">{sport} Champion</div>
      <div className="champ-name">{team.name}</div>
      <div className="champ-sub">{team.sub}</div>
    </div>
  );
}

// ─── SPORT PAGE ───────────────────────────────────────────────────────────────
function SportPage({sport,state,update,role,user,askPin,showToast}) {
  const [tab,setTab] = useState("bracket");
  const sd=state.sports[sport], isOrg=role==="organizer", isTA=role==="teamadmin";
  const getTeam = id => sd.teams.find(t=>t.id===id);
  const champ = (() => {
    if(!sd.published||!sd.matches.length) return null;
    const maxR=Math.max(...sd.matches.map(m=>m.round));
    const f=sd.matches.find(m=>m.round===maxR&&m.winner);
    return f?getTeam(f.winner):null;
  })();
  const tabs=[
    {id:"bracket",lbl:"Bracket"},
    {id:"teams",  lbl:"Teams & Players"},
    ...(isOrg?[{id:"scores",lbl:"Scores"},{id:"register",lbl:"Register"}]:[]),
    ...(isTA?[{id:"register",lbl:"My Roster"}]:[]),
  ];
  return (
    <div className="page-wrap pg">
      <div className="pg-banner">
        <div className="pg-lbl fu">{sport==="Soccer"?"⚽":"🏐"} Tournament</div>
        <div className="pg-title fu fu1">{sport}</div>
        <div className="pg-sub fu fu2">Single Elimination · 8 Teams · {sd.published?"Results Live":"Awaiting"}</div>
      </div>
      {champ&&<div className="inner" style={{paddingBottom:0}}><ChampBanner sport={sport} team={champ}/></div>}
      <div className="tabs">{tabs.map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.lbl}</button>)}</div>
      <div className="inner">
        {tab==="bracket"  && <BracketView sd={sd} getTeam={getTeam} isOrg={isOrg}/>}
        {tab==="teams"    && <TeamsView   sd={sd} isOrg={isOrg} sport={sport} update={update} askPin={askPin} showToast={showToast}/>}
        {tab==="scores"   && isOrg && <ScoresView sport={sport} sd={sd} update={update} showToast={showToast} askPin={askPin}/>}
        {tab==="register" && (isOrg||isTA) && <RegisterView sport={sport} sd={sd} update={update} role={role} user={user} askPin={askPin} showToast={showToast}/>}
      </div>
    </div>
  );
}

function BracketView({sd,getTeam,isOrg}) {
  const visible = isOrg ? sd.matches : (sd.published?sd.matches:[]);
  if(!visible.length) return <div className="empty fu"><div className="empty-icon"><Icon name="bracket" size={38} sw={1}/></div><div className="empty-txt">{isOrg?"Generate a bracket to begin.":"Bracket will appear once published."}</div></div>;
  const rounds = [...new Set(visible.map(m=>m.round))].sort((a,b)=>a-b);
  const rL = {1:"Quarter Finals",2:"Semi Finals",3:"Final"};
  return (
    <div className="bscroll">
      <div className="binner">
        {rounds.map(r=>(
          <div key={r} className="bcol fu" style={{animationDelay:`${r*.08}s`}}>
            <div className="brlbl">{rL[r]||`Round ${r}`}</div>
            {visible.filter(m=>m.round===r).map(m=>{
              const tA=getTeam(m.teamA), tB=getTeam(m.teamB==="tbd"?null:m.teamB);
              return (
                <div key={m.id} className="mcard">
                  {[{t:tA,sc:m.scoreA,id:m.teamA},{t:tB,sc:m.scoreB,id:m.teamB}].map((s,i)=>(
                    <div key={i} className={`mteam ${m.winner===s.id?"win":m.winner?"los":""}`}>
                      {s.t&&<TL teamId={s.t.id} size={22}/>}
                      <span className="mtn">{s.t?.name||"TBD"}</span>
                      <span className={`msc ${s.sc===null?"dim":""}`}>{s.sc??"—"}</span>
                    </div>
                  ))}
                  <div className="mfoot">{m.winner?`${getTeam(m.winner)?.name} advances`:"Upcoming"}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamsView({sd,isOrg,sport,update,askPin,showToast}) {
  return (
    <div>
      {sd.teams.map((t,ti)=>(
        <div key={t.id} className="card fu" style={{animationDelay:`${ti*.05}s`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <TL teamId={t.id} size={50}/>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800}}>{t.name}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{t.sub} · {t.branch}</div>
            </div>
            <span className="tag tgm">{t.players?.length||0} players</span>
          </div>
          {(t.players||[]).map(p=>(
            <div key={p.id} className="pcard">
              <div className="pavatar">{p.firstName?.charAt(0)||"?"}</div>
              <div style={{flex:1}}>
                <div className="pname">{p.firstName} {p.lastName}</div>
                <div className="pmeta">#{p.jersey} · {p.position} · {p.ageGroup}</div>
              </div>
              {isOrg && (
                <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>
                  askPin("Remove Player","Enter organizer PIN to remove this player.",()=>{
                    update(s=>{const team=s.sports[sport].teams.find(x=>x.id===t.id);if(team)team.players=team.players.filter(x=>x.id!==p.id);});
                    showToast("Player removed.");
                  })
                }><Icon name="trash" size={14}/></button>
              )}
            </div>
          ))}
          {!t.players?.length && <div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"12px 0"}}>No players yet.</div>}
        </div>
      ))}
    </div>
  );
}

function ScoresView({sport,sd,update,showToast,askPin}) {
  const getTeam = id => sd.teams.find(t=>t.id===id);
  const generate = () => { update(s=>{s.sports[sport].matches=buildBracket(s.sports[sport].teams);}); showToast("Bracket generated!"); };
  const setScore = (mid,field,val) => update(s=>{const m=s.sports[sport].matches.find(x=>x.id===mid);if(m)m[field]=parseInt(val)||0;});
  const confirm  = mid => {
    update(s=>{
      const ms=s.sports[sport].matches, m=ms.find(x=>x.id===mid); if(!m)return;
      const w=(m.scoreA??0)>=(m.scoreB??0)?m.teamA:m.teamB;
      m.winner=w;m.status="completed";s.sports[sport].votingOpen=true;
      const nR=m.round+1, rMs=ms.filter(x=>x.round===m.round), idx=rMs.findIndex(x=>x.id===mid);
      if(idx%2===0){const nx=ms.find(x=>x.round===nR&&x.teamB==="tbd");if(nx)nx.teamA=w;else ms.push({id:uid(),round:nR,teamA:w,teamB:"tbd",scoreA:null,scoreB:null,winner:null,status:"pending"});}
      else{const nm=ms.find(x=>x.round===nR&&(x.teamB==="tbd"||!x.teamB));if(nm)nm.teamB=w;}
    });
    showToast("Confirmed — voting opened!");
  };
  const removeMatch = mid => askPin("Remove Match","Enter organizer PIN to delete this match.",()=>{
    update(s=>{s.sports[sport].matches=s.sports[sport].matches.filter(x=>x.id!==mid);}); showToast("Match removed.");
  });
  const togglePublish = () => { update(s=>{s.sports[sport].published=!s.sports[sport].published;}); showToast(sd.published?"Hidden.":"Published!"); };
  return (
    <div>
      <div className="btn-row" style={{marginBottom:16}}>
        <button className="btn btn-o btn-sm" onClick={generate}><Icon name="bracket" size={13}/> Generate</button>
        <button className={`btn btn-sm ${sd.published?"btn-d":"btn-g"}`} onClick={togglePublish}><Icon name={sd.published?"eyeoff":"publish"} size={13}/>{sd.published?"Unpublish":"Publish"}</button>
      </div>
      {!sd.matches.length&&<div className="empty"><div className="empty-icon"><Icon name="bracket" size={38} sw={1}/></div><div className="empty-txt">Generate a bracket to begin.</div></div>}
      {sd.matches.map((m,i)=>{
        const tA=getTeam(m.teamA), tB=getTeam(m.teamB==="tbd"?null:m.teamB);
        return (
          <div key={m.id} className="card card-sm fu" style={{opacity:m.winner?.6:1,marginBottom:12,animationDelay:`${i*.04}s`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span className="tag tg">Round {m.round}</span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {m.winner&&<span className="tag tgn"><Icon name="check" size={10}/> Done</span>}
                <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:2}} onClick={()=>removeMatch(m.id)}><Icon name="trash" size={14}/></button>
              </div>
            </div>
            <div className="svs">
              <div className="sside"><TL teamId={tA?.id} size={40}/><div className="sside-name">{tA?.name||"TBD"}</div>
                <input className="fi" type="number" min="0" value={m.scoreA??""} onChange={e=>setScore(m.id,"scoreA",e.target.value)} disabled={!!m.winner} style={{width:60,height:48,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:700,color:"var(--gold)",padding:"0 6px"}}/>
              </div>
              <div className="ssep">VS</div>
              <div className="sside"><TL teamId={tB?.id} size={40}/><div className="sside-name">{tB?.name||"TBD"}</div>
                <input className="fi" type="number" min="0" value={m.scoreB??""} onChange={e=>setScore(m.id,"scoreB",e.target.value)} disabled={!!m.winner} style={{width:60,height:48,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:700,color:"var(--gold)",padding:"0 6px"}}/>
              </div>
            </div>
            {!m.winner&&<button className="btn btn-p" onClick={()=>confirm(m.id)}><Icon name="check" size={14}/> Confirm & Open Voting</button>}
            {m.winner&&<div style={{textAlign:"center",color:"var(--gold)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,marginTop:6}}>🏆 {getTeam(m.winner)?.name} advances</div>}
          </div>
        );
      })}
    </div>
  );
}

function RegisterView({sport,sd,update,role,user,askPin,showToast}) {
  const isOrg=role==="organizer";
  const avail = isOrg ? sd.teams : sd.teams.filter(t=>t.id===user?.teamId);
  const [sel,setSel]=useState(avail[0]?.id||"");
  const [f,setF]=useState({firstName:"",lastName:"",idNumber:"",jersey:"",position:"",ageGroup:"Open",phone:"",memberSince:""});
  const sf=(k,v)=>setF(x=>({...x,[k]:v}));
  const positions=sport==="Soccer"?POS_SOCCER:POS_NETBALL;
  const team=sd.teams.find(t=>t.id===sel);
  const submit=()=>{
    if(!f.firstName.trim()||!f.lastName.trim()){showToast("Name required.");return;}
    update(s=>{const t=s.sports[sport].teams.find(x=>x.id===sel);if(t)t.players.push({id:uid(),...f});});
    showToast("Player registered!");
    setF({firstName:"",lastName:"",idNumber:"",jersey:"",position:"",ageGroup:"Open",phone:"",memberSince:""});
  };
  return (
    <div className="page-wrap">
      <div className="card" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          {team&&<TL teamId={team.id} size={44}/>}
          <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800}}>{team?.name||"Select Team"}</div><div style={{fontSize:11,color:"var(--muted)"}}>{team?.sub}</div></div>
        </div>
        {isOrg&&<div className="fg"><label className="fl">Select Team</label><select className="fi" value={sel} onChange={e=>setSel(e.target.value)}>{avail.map(t=><option key={t.id} value={t.id}>{t.name} — {t.sub}</option>)}</select></div>}
      </div>
      <div className="fsec">Personal Details</div>
      <div className="fgrid"><div className="fg"><label className="fl">First Name</label><input className="fi" value={f.firstName} onChange={e=>sf("firstName",e.target.value)} placeholder="e.g. Sipho"/></div><div className="fg"><label className="fl">Last Name</label><input className="fi" value={f.lastName} onChange={e=>sf("lastName",e.target.value)} placeholder="e.g. Dlamini"/></div></div>
      <div className="fgrid"><div className="fg"><label className="fl">ID Number</label><input className="fi" value={f.idNumber} onChange={e=>sf("idNumber",e.target.value)} placeholder="SA ID"/></div><div className="fg"><label className="fl">Phone</label><input className="fi" value={f.phone} onChange={e=>sf("phone",e.target.value)} placeholder="082 000 0000" type="tel"/></div></div>
      <div className="fsec">Sport Details</div>
      <div className="fgrid"><div className="fg"><label className="fl">Jersey #</label><input className="fi" value={f.jersey} onChange={e=>sf("jersey",e.target.value)} placeholder="10"/></div><div className="fg"><label className="fl">Age Group</label><select className="fi" value={f.ageGroup} onChange={e=>sf("ageGroup",e.target.value)}>{["Under 13","Under 17","Under 21","Open"].map(a=><option key={a}>{a}</option>)}</select></div></div>
      <div className="fg"><label className="fl">Position</label><select className="fi" value={f.position} onChange={e=>sf("position",e.target.value)}><option value="">— Select —</option>{positions.map(p=><option key={p}>{p}</option>)}</select></div>
      <div className="fsec">Church Membership <span style={{fontSize:9,color:"var(--muted)",letterSpacing:0,textTransform:"none",fontFamily:"'Barlow',sans-serif"}}>(Internal only — not shown publicly)</span></div>
      <div className="fg">
        <label className="fl"><Icon name="cal" size={11} stroke="var(--gold)"/> Member Since</label>
        <input className="fi" type="date" value={f.memberSince} onChange={e=>sf("memberSince",e.target.value)} max={new Date().toISOString().split("T")[0]} style={{colorScheme:"dark"}}/>
        {f.memberSince&&<div style={{marginTop:6}}><div className="since-badge"><Icon name="shield" size={11} stroke="var(--gold)"/>Member for {Math.floor((new Date()-new Date(f.memberSince))/(1000*60*60*24*365))} years</div></div>}
      </div>
      <button className="btn btn-p" onClick={submit}><Icon name="plus" size={15}/> Register Player</button>
      {team?.players?.length>0&&(
        <><div className="sec-hd" style={{marginTop:18}}><span className="sec-hd-t">{team.name} · {team.players.length} registered</span></div>
        {team.players.map(p=>(
          <div key={p.id} className="pcard">
            <div className="pavatar">{p.firstName?.charAt(0)||"?"}</div>
            <div style={{flex:1}}><div className="pname">{p.firstName} {p.lastName}</div><div className="pmeta">#{p.jersey} · {p.position}</div></div>
            <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>askPin("Remove Player","Enter organizer PIN.",()=>{update(s=>{const t=s.sports[sport].teams.find(x=>x.id===sel);if(t)t.players=t.players.filter(x=>x.id!==p.id);});showToast("Removed.");})}><Icon name="trash" size={14}/></button>
          </div>
        ))}</>
      )}
    </div>
  );
}

// ─── CHOIR PAGE ───────────────────────────────────────────────────────────────
function ChoirPage({state,update,role,user,askPin,showToast}) {
  const [tab,setTab]=useState(role==="judge"?"score":"leaderboard");
  const isJudge=role==="judge", isOrg=role==="organizer", isTA=role==="teamadmin";
  const tabs=[
    ...(isOrg||role==="spectator"||isTA?[{id:"leaderboard",lbl:"Leaderboard"}]:[]),
    ...(isOrg||isTA?[{id:"register",lbl:"Registration"}]:[]),
    ...(isJudge?[{id:"score",lbl:"Score"}]:[]),
    ...(isOrg?[{id:"manage",lbl:"Manage"},{id:"allscores",lbl:"All Scores"}]:[]),
  ];
  return (
    <div className="page-wrap pg">
      <div className="pg-banner">
        <div className="pg-lbl fu">Competition</div>
        <div className="pg-title fu fu1">Choir <span className="acc">2026</span></div>
        <div className="pg-sub fu fu2">{state.choir.categories.length} scoring categories · Independent judges</div>
      </div>
      <div className="tabs">{tabs.map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.lbl}</button>)}</div>
      <div className="inner">
        {tab==="leaderboard"&&<ChoirLeaderboard state={state}/>}
        {tab==="register"&&(isOrg||isTA)&&<ChoirRegister state={state} update={update} role={role} user={user} askPin={askPin} showToast={showToast}/>}
        {tab==="score"&&isJudge&&<ChoirScore state={state} update={update} user={user} showToast={showToast}/>}
        {tab==="manage"&&isOrg&&<ChoirManage state={state} update={update} askPin={askPin} showToast={showToast}/>}
        {tab==="allscores"&&isOrg&&<ChoirAllScores state={state}/>}
      </div>
    </div>
  );
}

function ChoirLeaderboard({state}) {
  if(!state.choir.published) return <div className="empty fu"><div className="empty-icon"><Icon name="mic" size={38} sw={1}/></div><div className="empty-txt">The choir leaderboard will be published once scoring is complete.</div></div>;
  const ranked=rankChoir(state.choir);
  return (
    <div>
      {ranked.map((r,i)=>(
        <div key={r.group.id} className={`ccard fu ${i===0?"card-gold":""}`} style={{animationDelay:`${i*.07}s`}}>
          <div style={{position:"absolute",right:14,top:10,fontFamily:"'Barlow Condensed',sans-serif",fontSize:52,fontWeight:800,color:"rgba(255,255,255,.05)",lineHeight:1}}>#{i+1}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <TL teamId={r.group.id} size={52} style={{border:`2px solid ${i===0?"var(--gold)":"rgba(240,180,41,.2)"}`}}/>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:700}}>{r.group.name}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{r.group.branch} · {r.judgeCount} judge{r.judgeCount!==1?"s":""}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:40,fontWeight:800,color:i===0?"var(--gold)":"#fff",lineHeight:1}}>{r.overall>0?r.overall.toFixed(1):"—"}</div>
              <div style={{fontSize:10,color:"var(--muted)"}}>avg</div>
            </div>
          </div>
          {state.choir.categories.map((cat,ci)=>(
            <div key={cat} className="sbar-row">
              <div className="sbar-lbl">{cat}</div>
              <div className="sbar-track"><div className="sbar-fill" style={{width:`${((r.catAvgs[ci]||0)/10)*100}%`}}/></div>
              <div className="sbar-val">{r.catAvgs[ci]>0?r.catAvgs[ci].toFixed(1):"—"}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ChoirRegister({state,update,role,user,askPin,showToast}) {
  const isOrg=role==="organizer";
  const avail=isOrg?state.choir.groups:state.choir.groups.filter(g=>g.id===user?.teamId);
  const [sel,setSel]=useState(avail[0]?.id||"");
  const [f,setF]=useState({firstName:"",lastName:"",idNumber:"",phone:"",voice:"Soprano",role:"Member",memberSince:""});
  const sf=(k,v)=>setF(x=>({...x,[k]:v}));
  const group=state.choir.groups.find(g=>g.id===sel);
  const submit=()=>{
    if(!f.firstName.trim()||!f.lastName.trim()){showToast("Name required.");return;}
    update(s=>{const g=s.choir.groups.find(x=>x.id===sel);if(g){if(!g.members)g.members=[];g.members.push({id:uid(),...f});}});
    showToast("Member registered!");
    setF({firstName:"",lastName:"",idNumber:"",phone:"",voice:"Soprano",role:"Member",memberSince:""});
  };
  return (
    <div className="page-wrap">
      <div className="card" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>{group&&<TL teamId={group.id} size={44}/>}<div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800}}>{group?.name||"Select Group"}</div><div style={{fontSize:11,color:"var(--muted)"}}>{group?.branch}</div></div></div>
        {isOrg&&<div className="fg"><label className="fl">Select Group</label><select className="fi" value={sel} onChange={e=>setSel(e.target.value)}>{avail.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>}
      </div>
      <div className="fsec">Personal Details</div>
      <div className="fgrid"><div className="fg"><label className="fl">First Name</label><input className="fi" value={f.firstName} onChange={e=>sf("firstName",e.target.value)} placeholder="e.g. Nomsa"/></div><div className="fg"><label className="fl">Last Name</label><input className="fi" value={f.lastName} onChange={e=>sf("lastName",e.target.value)} placeholder="e.g. Khumalo"/></div></div>
      <div className="fgrid"><div className="fg"><label className="fl">ID Number</label><input className="fi" value={f.idNumber} onChange={e=>sf("idNumber",e.target.value)} placeholder="SA ID"/></div><div className="fg"><label className="fl">Phone</label><input className="fi" value={f.phone} onChange={e=>sf("phone",e.target.value)} placeholder="082 000 0000" type="tel"/></div></div>
      <div className="fsec">Choir Details</div>
      <div className="fgrid">
        <div className="fg"><label className="fl">Singing Voice</label><select className="fi" value={f.voice} onChange={e=>sf("voice",e.target.value)}>{VOICES.map(v=><option key={v}>{v}</option>)}</select></div>
        <div className="fg"><label className="fl">Role</label><select className="fi" value={f.role} onChange={e=>sf("role",e.target.value)}>{["Member","Choir Leader","Deputy Leader","Soloist","Accompanist"].map(r=><option key={r}>{r}</option>)}</select></div>
      </div>
      <div className="fsec">Church Membership <span style={{fontSize:9,color:"var(--muted)",letterSpacing:0,textTransform:"none",fontFamily:"'Barlow',sans-serif"}}>(Internal only)</span></div>
      <div className="fg">
        <label className="fl"><Icon name="cal" size={11} stroke="var(--gold)"/> Member Since</label>
        <input className="fi" type="date" value={f.memberSince} onChange={e=>sf("memberSince",e.target.value)} max={new Date().toISOString().split("T")[0]} style={{colorScheme:"dark"}}/>
        {f.memberSince&&<div style={{marginTop:6}}><div className="since-badge"><Icon name="shield" size={11} stroke="var(--gold)"/>Member for {Math.floor((new Date()-new Date(f.memberSince))/(1000*60*60*24*365))} years</div></div>}
      </div>
      <button className="btn btn-p" onClick={submit}><Icon name="plus" size={15}/> Register Member</button>
      {group?.members?.length>0&&(
        <><div className="sec-hd" style={{marginTop:18}}><span className="sec-hd-t">{group.name} · {group.members.length} members</span></div>
        {group.members.map(m=>(
          <div key={m.id} className="pcard">
            <div className="pavatar">{m.firstName?.charAt(0)||"?"}</div>
            <div style={{flex:1}}><div className="pname">{m.firstName} {m.lastName}</div><div className="pmeta">{m.voice} · {m.role}</div></div>
            {isOrg&&<button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>askPin("Remove Member","Enter organizer PIN.",()=>{update(s=>{const g=s.choir.groups.find(x=>x.id===sel);if(g)g.members=g.members.filter(x=>x.id!==m.id);});showToast("Removed.");})}><Icon name="trash" size={14}/></button>}
            <span className="tag tg" style={{marginLeft:6}}>{m.voice?.charAt(0)}</span>
          </div>
        ))}</>
      )}
    </div>
  );
}

function ChoirScore({state,update,user,showToast}) {
  const [local,setLocal]=useState({});
  const get=(gid,cat)=>local[`${gid}_${cat}`]||null;
  const set=(gid,cat,v)=>setLocal(s=>({...s,[`${gid}_${cat}`]:v}));
  const submit=gid=>{
    const cats=state.choir.categories||DEFAULT_CATS;
    if(!cats.every(c=>get(gid,c))){showToast("Score all categories.");return;}
    update(s=>{cats.forEach(cat=>{const idx=s.choir.scores.findIndex(x=>x.groupId===gid&&x.judgeId===user?.id&&x.category===cat);const e={id:uid(),groupId:gid,judgeId:user?.id,judgeName:user?.name,category:cat,score:local[`${gid}_${cat}`]};if(idx>=0)s.choir.scores[idx]=e;else s.choir.scores.push(e);});});
    showToast("Scores submitted!");
  };
  const cats=state.choir.categories||DEFAULT_CATS;
  return (
    <div className="page-wrap">
      <div className="judge-hdr"><Icon name="mic" size={18} stroke="var(--gold)"/><div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700}}>{user?.name}</div><div style={{fontSize:11,color:"var(--muted)"}}>Choir Judge · Score 1–10 per category</div></div></div>
      {state.choir.groups.map((g,gi)=>{
        const done=cats.every(cat=>state.choir.scores.find(x=>x.groupId===g.id&&x.judgeId===user?.id&&x.category===cat));
        return (
          <div key={g.id} className="ccard fu" style={{animationDelay:`${gi*.06}s`}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <TL teamId={g.id} size={46}/><div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:19,fontWeight:700}}>{g.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{g.branch}</div></div>
              {done&&<span className="tag tgn"><Icon name="check" size={10}/> Submitted</span>}
            </div>
            {cats.map(cat=>(
              <div key={cat} className="drow">
                <div className="dlbl">{cat}</div>
                <div className="dots">{[1,2,3,4,5,6,7,8,9,10].map(n=><button key={n} className={`dot ${get(g.id,cat)===n?"on":""}`} onClick={()=>set(g.id,cat,n)}>{n}</button>)}</div>
              </div>
            ))}
            <div style={{marginTop:13}}><button className="btn btn-p" onClick={()=>submit(g.id)}><Icon name="check" size={14}/> Submit Scores</button></div>
          </div>
        );
      })}
    </div>
  );
}

function ChoirManage({state,update,askPin,showToast}) {
  const [newCat,setNewCat]=useState("");
  const togglePublish=()=>{update(s=>{s.choir.published=!s.choir.published;});showToast(state.choir.published?"Hidden.":"Published!");};
  const addCat=()=>{if(!newCat.trim())return;update(s=>{if(!s.choir.categories.includes(newCat))s.choir.categories.push(newCat);});showToast("Category added!");setNewCat("");};
  const removeCat=cat=>askPin("Remove Category","Enter organizer PIN.",()=>{update(s=>{s.choir.categories=s.choir.categories.filter(c=>c!==cat);});showToast("Category removed.");});
  return (
    <div className="page-wrap">
      <button className={`btn ${state.choir.published?"btn-d":"btn-g"}`} style={{marginBottom:18}} onClick={togglePublish}><Icon name={state.choir.published?"eyeoff":"publish"} size={14}/>{state.choir.published?"Unpublish":"Publish Leaderboard"}</button>
      <div className="sec-hd"><span className="sec-hd-t">Scoring Categories</span></div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <input className="fi" value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="Add new category..." style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&addCat()}/>
          <button className="btn btn-p btn-sm" style={{width:"auto"}} onClick={addCat}><Icon name="plus" size={14}/></button>
        </div>
        {state.choir.categories.map(cat=>(
          <div key={cat} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><Icon name="tag" size={14} stroke="var(--gold)"/><span style={{fontSize:14}}>{cat}</span></div>
            <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>removeCat(cat)}><Icon name="x" size={15}/></button>
          </div>
        ))}
      </div>
      <div className="sec-hd"><span className="sec-hd-t">Groups</span></div>
      {state.choir.groups.map(g=>(
        <div key={g.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"var(--navy3)",border:"1px solid var(--border)",borderRadius:10,marginBottom:8}}>
          <TL teamId={g.id} size={40}/>
          <div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700}}>{g.name}</div><div style={{fontSize:11,color:"var(--muted)"}}>{g.branch} · {g.members?.length||0} members</div></div>
          <span className={`tag ${state.choir.scores.filter(s=>s.groupId===g.id).length>0?"tgn":"tgm"}`}>{state.choir.scores.filter(s=>s.groupId===g.id).length>0?"Scored":"Pending"}</span>
        </div>
      ))}
    </div>
  );
}

function ChoirAllScores({state}) {
  const ranked=rankChoir(state.choir);
  return (
    <div className="page-wrap">
      <div className="card">
        {ranked.map((r,i)=>(
          <div key={r.group.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 0",borderBottom:"1px solid var(--border)"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:i<3?"var(--gold)":"var(--muted2)",width:26}}>#{i+1}</div>
            <TL teamId={r.group.id} size={30}/>
            <div style={{flex:1,marginLeft:6}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700}}>{r.group.name}</div>
              <div style={{fontSize:10,color:"var(--muted)"}}>{r.judgeCount} judges · {(state.choir.categories||DEFAULT_CATS).map((c,ci)=>`${c.charAt(0)}: ${(r.catAvgs[ci]||0).toFixed(1)}`).join(" · ")}</div>
            </div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,color:"var(--gold)"}}>{r.overall>0?r.overall.toFixed(1):"—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VOTE PAGE ────────────────────────────────────────────────────────────────
function VotePage({state,update,role,user,showToast}) {
  const [vname,setVname]=useState("");
  const [vid,setVid]=useState(user?.id||null);
  const [registered,setRegistered]=useState(!!user);
  const [picked,setPicked]=useState({});
  const isPlayer=role==="teamadmin";
  const weight=isPlayer?3:1;
  const completed=[];
  ["Soccer","Netball"].forEach(sport=>{state.sports[sport].matches.filter(m=>m.winner).forEach(m=>completed.push({...m,sport}));});
  const register=()=>{if(!vname.trim()){showToast("Enter your name.");return;}const id=uid();setVid(id);setRegistered(true);update(s=>{s.voters[id]={name:vname,role,weight};});showToast("Registered!");};
  const castVote=(mid,gender,pid)=>{
    if(!registered){showToast("Register first.");return;}
    const key=`${mid}_${gender}`;
    const already=state.votes[mid]&&Object.values(state.votes[mid]).some(v=>v.voterId===vid&&v.gender===gender);
    if(already){showToast("Already voted for this award.");return;}
    setPicked(p=>({...p,[key]:pid}));
    update(s=>{if(!s.votes[mid])s.votes[mid]={};s.votes[mid][`${vid}_${gender}`]={voterId:vid,playerId:pid,gender,weight};});
    showToast(`Vote cast! (${weight}× weight)`);
  };
  const tally=(mid,gender)=>{const mv=state.votes[mid]||{};const t={};Object.values(mv).filter(v=>v.gender===gender).forEach(v=>{t[v.playerId]=(t[v.playerId]||0)+v.weight;});return t;};
  const getPlayers=m=>{const sd=state.sports[m.sport];const tA=sd.teams.find(t=>t.id===m.teamA);const tB=sd.teams.find(t=>t.id===m.teamB);return[...(tA?.players||[]).map(p=>({...p,teamName:tA.name,teamId:tA.id})),...(tB?.players||[]).map(p=>({...p,teamName:tB.name,teamId:tB.id}))];};

  return (
    <div className="page-wrap pg">
      <div className="pg-banner">
        <div className="pg-lbl fu">Public Voting</div>
        <div className="pg-title fu fu1">MOM / <span className="acc">WOM</span></div>
        <div className="pg-sub fu fu2">Man & Woman of the Match · Team admin votes count 3×</div>
      </div>
      <div className="inner">
        {!completed.length&&<div className="empty fu"><div className="empty-icon"><Icon name="vote" size={38} sw={1}/></div><div className="empty-txt">Voting opens automatically after each confirmed match result.</div></div>}
        {!registered&&completed.length>0&&(
          <div className="card card-gold fu" style={{marginBottom:16}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,marginBottom:4}}>Register to Vote</div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:14,lineHeight:1.5}}>One vote per award per match.{isPlayer?" Your vote counts 3× as a team admin.":""}</div>
            <div className="fg"><label className="fl">Your Full Name</label><input className="fi" value={vname} onChange={e=>setVname(e.target.value)} placeholder="e.g. Sipho Dlamini" onKeyDown={e=>e.key==="Enter"&&register()}/></div>
            <button className="btn btn-p" onClick={register}><Icon name="vote" size={15}/> Register & Vote</button>
          </div>
        )}
        {registered&&<div className="card card-sm card-gold fu" style={{marginBottom:14}}><div style={{display:"flex",alignItems:"center",gap:8}}><Icon name="check" size={14} stroke="var(--gold)"/><span style={{fontSize:13}}>Voting as <strong>{user?.name||vname}</strong></span>{isPlayer&&<span className="tag tg">3× weight</span>}</div></div>}
        {completed.map((match,mi)=>{
          const players=getPlayers(match);
          const sd=state.sports[match.sport];
          const tA=sd.teams.find(t=>t.id===match.teamA), tB=sd.teams.find(t=>t.id===match.teamB);
          return (
            <div key={match.id} className="vcard fu" style={{animationDelay:`${mi*.06}s`}}>
              <div className="vmhdr">
                <div>
                  <div style={{fontSize:10,color:"var(--gold)",letterSpacing:2,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,marginBottom:3}}>{match.sport} · Round {match.round}</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700}}>{tA?.name} {match.scoreA} — {match.scoreB} {tB?.name}</div>
                </div>
                <span className="tag tgn"><Icon name="check" size={10}/> Final</span>
              </div>
              <div style={{padding:14}}>
                {[{gender:"m",label:"Man of the Match"},{gender:"f",label:"Woman of the Match"}].map(({gender,label})=>{
                  const t=tally(match.id,gender), maxV=Math.max(1,...Object.values(t));
                  const myVote=picked[`${match.id}_${gender}`];
                  return (
                    <div key={gender} style={{marginBottom:gender==="m"?16:0}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2.5,textTransform:"uppercase",color:"var(--muted)",marginBottom:10,fontWeight:700}}>{label}</div>
                      {!players.length&&<div style={{fontSize:12,color:"var(--muted)",padding:"8px 0"}}>No players registered yet.</div>}
                      {players.map(p=>{
                        const votes=t[p.id]||0, pct=Math.round((votes/maxV)*100), isMy=myVote===p.id;
                        return (
                          <div key={p.id} className="vprow" onClick={()=>registered&&castVote(match.id,gender,p.id)}>
                            <div className={`vradio ${isMy?"on":""}`}>{isMy&&<Icon name="check" size={10} stroke="var(--navy)"/>}</div>
                            <TL teamId={p.teamId} size={28}/>
                            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500}}>{p.firstName} {p.lastName}</div><div style={{fontSize:11,color:"var(--muted)"}}>{p.teamName} · {p.position}</div></div>
                            {votes>0&&<div className="vbar-wrap"><div className="vbar-track"><div className="vbar-fill" style={{width:`${pct}%`,background:gender==="f"?"#f06292":"var(--gold)"}}/></div><div className="vcount">{votes}</div></div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── NEWS PAGE ────────────────────────────────────────────────────────────────
function NewsPage({state,update,role,showToast}) {
  const [body,setBody]=useState("");
  const [urgent,setUrgent]=useState(false);
  const [pushEnabled,setPushEnabled]=useState(false);
  const isOrg=role==="organizer";

  useEffect(()=>{
    if("Notification" in window) setPushEnabled(Notification.permission==="granted");
  },[]);

  const enablePush=async()=>{const ok=await requestPush();setPushEnabled(ok);showToast(ok?"Push notifications enabled!":"Permission denied.");};

  const post=()=>{
    if(!body.trim())return;
    const ts=Date.now();
    const ann={id:uid(),body,time:new Date().toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"}),ts,urgent};
    update(s=>{s.announcements.unshift(ann);});
    if(pushEnabled) pushNotify(urgent?"🚨 Urgent — Founders Cup":"📢 Founders Cup Update",body);
    showToast("Posted!");setBody("");setUrgent(false);
  };

  const removeAnn=id=>update(s=>{s.announcements=s.announcements.filter(x=>x.id!==id);});

  return (
    <div className="page-wrap pg">
      <div className="pg-banner">
        <div className="pg-lbl fu">Updates</div>
        <div className="pg-title fu fu1">News</div>
        <div className="pg-sub fu fu2">Official tournament announcements</div>
      </div>
      <div className="inner">
        {/* Push notification opt-in for spectators */}
        {!isOrg&&!pushEnabled&&(
          <div className="card card-gold fu fu1" style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Icon name="bell" size={22} stroke="var(--gold)"/>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:"var(--gold)"}}>Enable Notifications</div>
                <div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>Get notified instantly when the organizer posts an update</div>
              </div>
              <button className="btn btn-p btn-sm" onClick={enablePush}>Enable</button>
            </div>
          </div>
        )}

        {/* Organizer post form */}
        {isOrg&&(
          <div className="card fu fu1" style={{marginBottom:16}}>
            <div className="fg"><label className="fl">Post Announcement</label><textarea className="fi" rows={3} value={body} onChange={e=>setBody(e.target.value)} placeholder="Type your message..." style={{resize:"vertical",lineHeight:1.5}}/></div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <div style={{width:40,height:22,borderRadius:11,background:urgent?"#e53e3e":"var(--border2)",position:"relative",transition:"background .2s",cursor:"pointer"}} onClick={()=>setUrgent(u=>!u)}>
                  <div style={{position:"absolute",top:2,left:urgent?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                </div>
                <span style={{fontSize:12,color:urgent?"#fc8181":"var(--muted)"}}>Mark as urgent</span>
              </label>
              {!pushEnabled&&<button className="btn btn-o btn-sm" onClick={enablePush}><Icon name="bell" size={13}/> Enable Push</button>}
            </div>
            <button className="btn btn-p" onClick={post}><Icon name="news" size={14}/> {pushEnabled?"Post & Notify":"Post Announcement"}</button>
          </div>
        )}

        {!state.announcements.length&&<div className="empty fu"><div className="empty-icon"><Icon name="news" size={38} sw={1}/></div><div className="empty-txt">No announcements yet.</div></div>}
        {state.announcements.map((a,i)=>(
          <div key={a.id} className={`ann fu ${a.urgent?"urgent":""}`} style={{animationDelay:`${i*.05}s`}}>
            <div className="ann-body-wrap">
              <div className="ann-time">
                {a.time}
                {a.urgent&&<span className="tag tgr" style={{fontSize:9,padding:"1px 6px"}}>🚨 Urgent</span>}
              </div>
              <div className="ann-body">{a.body}</div>
            </div>
            {isOrg&&(
              <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4,alignSelf:"flex-start"}} onClick={()=>removeAnn(a.id)}><Icon name="trash" size={14}/></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({state,update,askPin,showToast}) {
  const [tab,setTab]=useState("users");
  return (
    <div className="page-wrap pg">
      <div className="pg-banner">
        <div className="pg-lbl fu">Organizer</div>
        <div className="pg-title fu fu1">Admin <span className="acc">Panel</span></div>
      </div>
      <div className="tabs">
        {[{id:"users",lbl:"Users"},{id:"publish",lbl:"Publish"},{id:"overview",lbl:"Overview"}].map(t=>(
          <button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.lbl}</button>
        ))}
      </div>
      <div className="inner">
        {tab==="users"   &&<UserMgmt   state={state} update={update} showToast={showToast} askPin={askPin}/>}
        {tab==="publish" &&<PublishMgmt state={state} update={update} showToast={showToast}/>}
        {tab==="overview"&&<Overview   state={state} update={update} showToast={showToast} askPin={askPin}/>}
      </div>
    </div>
  );
}

function UserMgmt({state,update,showToast,askPin}) {
  const [sec,setSec]=useState("judges");
  const [jName,setJName]=useState("");const [jPin,setJPin]=useState("");const [jTablet,setJTablet]=useState("");
  const [aName,setAName]=useState("");const [aPin,setAPin]=useState("");const [aTeam,setATeam]=useState(TEAMS[0].id);

  const addJudge=()=>{if(!jName.trim()||!jPin.trim()){showToast("Name & PIN required.");return;}update(s=>{s.judges.push({id:uid(),name:jName,pin:jPin,tablet:jTablet});});showToast("Judge added!");setJName("");setJPin("");setJTablet("");};
  const removeJudge=id=>askPin("Remove Judge","Enter organizer PIN.",()=>{update(s=>{s.judges=s.judges.filter(j=>j.id!==id);});showToast("Removed.");});
  const addAdmin=()=>{if(!aName.trim()||!aPin.trim()){showToast("Name & PIN required.");return;}update(s=>{s.teamAdmins.push({id:uid(),name:aName,pin:aPin,teamId:aTeam});});showToast("Team admin added!");setAName("");setAPin("");};
  const removeAdmin=id=>askPin("Remove Team Admin","Enter organizer PIN.",()=>{update(s=>{s.teamAdmins=s.teamAdmins.filter(a=>a.id!==id);});showToast("Removed.");});

  return (
    <div className="page-wrap">
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        <button className={`btn btn-sm ${sec==="judges"?"btn-p":"btn-o"}`} onClick={()=>setSec("judges")}><Icon name="mic" size={13}/> Judges ({state.judges.length})</button>
        <button className={`btn btn-sm ${sec==="admins"?"btn-p":"btn-o"}`} onClick={()=>setSec("admins")}><Icon name="users" size={13}/> Team Admins ({state.teamAdmins.length})</button>
      </div>

      {sec==="judges"&&(
        <>
          <div className="card" style={{marginBottom:14}}>
            <div className="fsec" style={{marginTop:0}}>Add Choir Judge</div>
            <div className="fgrid"><div className="fg"><label className="fl">Full Name</label><input className="fi" value={jName} onChange={e=>setJName(e.target.value)} placeholder="Judge name"/></div><div className="fg"><label className="fl">Assign PIN</label><input className="fi" value={jPin} onChange={e=>setJPin(e.target.value)} placeholder="e.g. 5678" type="password"/></div></div>
            <div className="fg"><label className="fl">Tablet / Device (optional)</label><input className="fi" value={jTablet} onChange={e=>setJTablet(e.target.value)} placeholder="e.g. Tablet 1"/></div>
            <button className="btn btn-p" onClick={addJudge}><Icon name="plus" size={15}/> Add Judge</button>
          </div>
          {!state.judges.length&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"16px 0"}}>No judges added yet.</div>}
          {state.judges.map((j,i)=>(
            <div key={j.id} className="urow fu" style={{animationDelay:`${i*.04}s`}}>
              <div className="uavatar">{j.name.charAt(0)}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{j.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{j.tablet||"No device"} · PIN: {"·".repeat(j.pin.length)}</div></div>
              <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>removeJudge(j.id)}><Icon name="trash" size={14}/></button>
            </div>
          ))}
        </>
      )}

      {sec==="admins"&&(
        <>
          <div className="card" style={{marginBottom:14}}>
            <div className="fsec" style={{marginTop:0}}>Add Team Admin</div>
            <div className="fgrid"><div className="fg"><label className="fl">Full Name</label><input className="fi" value={aName} onChange={e=>setAName(e.target.value)} placeholder="Admin name"/></div><div className="fg"><label className="fl">Assign PIN</label><input className="fi" value={aPin} onChange={e=>setAPin(e.target.value)} placeholder="e.g. 9012" type="password"/></div></div>
            <div className="fg"><label className="fl">Assign Team</label><select className="fi" value={aTeam} onChange={e=>setATeam(e.target.value)}>{TEAMS.map(t=><option key={t.id} value={t.id}>{t.name} — {t.sub}</option>)}</select></div>
            <button className="btn btn-p" onClick={addAdmin}><Icon name="plus" size={15}/> Add Team Admin</button>
          </div>
          {!state.teamAdmins.length&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"16px 0"}}>No team admins yet.</div>}
          {state.teamAdmins.map((a,i)=>{
            const team=TEAMS.find(t=>t.id===a.teamId);
            return (
              <div key={a.id} className="urow fu" style={{animationDelay:`${i*.04}s`}}>
                {team&&<TL teamId={team.id} size={38}/>}
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{a.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{team?.name} · PIN: {"·".repeat(a.pin.length)}</div></div>
                <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>removeAdmin(a.id)}><Icon name="trash" size={14}/></button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function PublishMgmt({state,update,showToast}) {
  const toggle=sport=>{update(s=>{s.sports[sport].published=!s.sports[sport].published;});showToast(state.sports[sport].published?"Hidden.":"Published!");};
  const toggleChoir=()=>{update(s=>{s.choir.published=!s.choir.published;});showToast(state.choir.published?"Hidden.":"Published!");};
  return (
    <div className="page-wrap">
      <div className="sec-hd fu"><span className="sec-hd-t">Publish Controls</span></div>
      {["Soccer","Netball"].map((sport,i)=>(
        <div key={sport} className="card card-sm fu" style={{marginBottom:10,animationDelay:`${i*.05}s`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700}}>{sport}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{state.sports[sport].matches.filter(m=>m.winner).length} of {state.sports[sport].matches.length} matches complete</div>
              <div style={{marginTop:4}}><span className={`tag ${state.sports[sport].published?"tgn":"tgm"}`}>{state.sports[sport].published?"Published":"Hidden"}</span></div>
            </div>
            <button className={`btn btn-sm ${state.sports[sport].published?"btn-d":"btn-g"}`} onClick={()=>toggle(sport)}>
              <Icon name={state.sports[sport].published?"eyeoff":"publish"} size={13}/>{state.sports[sport].published?"Unpublish":"Publish"}
            </button>
          </div>
        </div>
      ))}
      <div className="card card-sm fu fu3">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700}}>Choir</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{[...new Set(state.choir.scores.map(s=>s.judgeId))].length} judges scored</div>
            <div style={{marginTop:4}}><span className={`tag ${state.choir.published?"tgn":"tgm"}`}>{state.choir.published?"Published":"Hidden"}</span></div>
          </div>
          <button className={`btn btn-sm ${state.choir.published?"btn-d":"btn-g"}`} onClick={toggleChoir}>
            <Icon name={state.choir.published?"eyeoff":"publish"} size={13}/>{state.choir.published?"Unpublish":"Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Overview({state,update,showToast,askPin}) {
  const reset=comp=>askPin(`Reset ${comp}`,"This will permanently delete all match and registration data. Enter organizer PIN.",()=>{
    update(s=>{
      if(comp==="Choir"){s.choir.scores=[];s.choir.published=false;s.choir.groups=s.choir.groups.map(g=>({...g,members:[]}));}
      else{s.sports[comp].matches=[];s.sports[comp].published=false;s.sports[comp].votingOpen=false;s.sports[comp].teams=s.sports[comp].teams.map(t=>({...t,players:[]}));}
    });
    showToast(`${comp} data reset.`);
  });
  const resetAll=()=>askPin("Reset ALL Data","This deletes everything — matches, players, scores, votes. This cannot be undone.",()=>{
    update(()=>freshState()); showToast("All data reset.");
  });
  const totalP=Object.values(state.sports).reduce((a,s)=>a+s.teams.reduce((b,t)=>b+(t.players?.length||0),0),0);
  const totalM=state.choir.groups.reduce((a,g)=>a+(g.members?.length||0),0);
  return (
    <div className="page-wrap">
      <div className="stat-row fu fu1">
        <div className="stat-box"><div className="stat-n">{totalP}</div><div className="stat-l">Players</div></div>
        <div className="stat-box"><div className="stat-n">{totalM}</div><div className="stat-l">Choir</div></div>
        <div className="stat-box"><div className="stat-n">{Object.keys(state.voters).length}</div><div className="stat-l">Voters</div></div>
      </div>
      <div className="sec-hd fu fu2"><span className="sec-hd-t">Organizer PIN Reference</span></div>
      <div className="card fu fu2" style={{marginBottom:16}}>
        {[["Organizer",ORG_PIN],["Judges","Set per judge"],["Team Admins","Set per admin"]].map(([r,p])=>(
          <div key={r} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
            <span style={{fontSize:13,color:"#fff"}}>{r}</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:r==="Organizer"?20:13,fontWeight:700,color:"var(--gold)",letterSpacing:r==="Organizer"?6:0}}>{p}</span>
          </div>
        ))}
      </div>
      <div className="sec-hd fu fu3"><span className="sec-hd-t" style={{color:"#fc8181"}}>Danger Zone — PIN Required</span></div>
      <div className="card fu fu3" style={{borderColor:"rgba(229,62,62,.2)"}}>
        <div className="btn-row">
          {["Soccer","Netball"].map(s=><button key={s} className="btn btn-d btn-sm" onClick={()=>reset(s)}><Icon name="trash" size={12}/> Reset {s}</button>)}
          <button className="btn btn-d btn-sm" onClick={()=>reset("Choir")}><Icon name="trash" size={12}/> Reset Choir</button>
        </div>
        <button className="btn btn-d" style={{marginTop:12,borderColor:"rgba(229,62,62,.5)"}} onClick={resetAll}><Icon name="trash" size={14}/> Reset ALL Data</button>
      </div>
      <div className="card fu fu4" style={{borderColor:"var(--gold-border)",marginTop:4}}>
        <div style={{display:"flex",gap:9,alignItems:"flex-start"}}><Icon name="signal" size={15} stroke="var(--gold)" sw={1.5}/><div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6}}>Data is saved locally on this device. Connect to Supabase to sync across all devices in real time.</div></div>
      </div>
    </div>
  );
}
