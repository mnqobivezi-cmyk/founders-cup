import React, { useState, useEffect, useRef } from "react";

// ─── TEAM LOGOS (real images from Wix) ───────────────────────────────────────
const TEAM_LOGOS = {
  t1: "https://static.wixstatic.com/media/4877d6_e293da9b5c374495864511964d6dd921~mv2.jpg",
  t2: "https://static.wixstatic.com/media/4877d6_d49e5298427146faa1a5e22be776a2ec~mv2.jpg",
  t3: "https://static.wixstatic.com/media/4877d6_9973532eb7e5406682fb091353a111ad~mv2.jpg",
  t4: "https://static.wixstatic.com/media/4877d6_87f5f6f53d31470eb025f6ea35f8b632~mv2.jpg",
  t5: "https://static.wixstatic.com/media/4877d6_5d6cb7ce14b54374a5dddb18a4173500~mv2.jpg",
  t6: "https://static.wixstatic.com/media/4877d6_0d2034b959604f6fa1e66df62e31f49f~mv2.jpg",
  t7: "https://static.wixstatic.com/media/4877d6_0711c82df47f4dc797de9abf523ffc50~mv2.jpg",
  t8: "https://static.wixstatic.com/media/4877d6_a01acbcd8df24c9ba467e564706e34f9~mv2.jpg",
};
const FOUNDERS_CUP_LOGO = "https://static.wixstatic.com/media/4877d6_4bad42a571ec47e982d9b2ec2b4c9a22~mv2.jpeg";

const TEAMS = [
  { id:"t1", name:"Durban Central", sub:"United",   branch:"Durban Central" },
  { id:"t2", name:"Wakanda",        sub:"OT",        branch:"Wakanda"        },
  { id:"t3", name:"Cape Town",      sub:"Team",      branch:"Cape Town"      },
  { id:"t4", name:"Swacunda",       sub:"Team",      branch:"Swacunda"       },
  { id:"t5", name:"Mighty",         sub:"West",      branch:"West"           },
  { id:"t6", name:"Zululand",       sub:"Warriors",  branch:"Zululand"       },
  { id:"t7", name:"Mlungwane",      sub:"Club",      branch:"Mlungwane"      },
  { id:"t8", name:"Durban South",   sub:"Big Cats",  branch:"Durban South"   },
];

const DEFAULT_CHOIR_CATEGORIES = ["Harmony","Presentation","Repertoire","Rhythm","Diction"];
const POSITIONS_SOCCER  = ["Goalkeeper","Defender","Midfielder","Striker","Captain"];
const POSITIONS_NETBALL = ["Goal Shooter","Goal Attack","Wing Attack","Centre","Wing Defence","Goal Defence","Goal Keeper","Captain"];
const SINGING_VOICES    = ["Soprano","Alto","Tenor","Bass"];
const uid = () => Math.random().toString(36).slice(2,9);

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const makeState = () => ({
  announcements: [],
  sports: {
    Soccer:  { teams: TEAMS.map(t=>({...t,players:[]})), matches:[], published:false, votingOpen:false },
    Netball: { teams: TEAMS.map(t=>({...t,players:[]})), matches:[], published:false, votingOpen:false },
  },
  choir: {
    groups: TEAMS.map(t=>({...t,members:[]})),
    scores:[], published:false,
    categories: DEFAULT_CHOIR_CATEGORIES,
  },
  votes: {},
  voters: {},
  // User management
  teamAdmins: [], // { id, name, teamId, pin }
  judges: [],    // { id, name, pin, tablet }
});

function buildBracket(teams) {
  const sh = [...teams].sort(()=>Math.random()-.5);
  return sh.reduce((acc,t,i)=>{
    if(i%2===0&&sh[i+1]) acc.push({id:uid(),round:1,teamA:t.id,teamB:sh[i+1].id,scoreA:null,scoreB:null,winner:null,status:"pending"});
    return acc;
  },[]);
}

function rankChoir(choir) {
  return choir.groups.map(g=>{
    const gs = choir.scores.filter(s=>s.groupId===g.id);
    const cats = choir.categories;
    const catAvgs = cats.map(cat=>{
      const vals = gs.filter(s=>s.category===cat).map(s=>s.score);
      return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    });
    return { group:g, catAvgs, overall:catAvgs.length?catAvgs.reduce((a,b)=>a+b,0)/catAvgs.length:0, judgeCount:[...new Set(gs.map(s=>s.judgeId))].length };
  }).sort((a,b)=>b.overall-a.overall);
}

// ─── TEAM LOGO COMPONENT ──────────────────────────────────────────────────────
const TeamLogo = ({ teamId, size=48, style={} }) => (
  <img
    src={TEAM_LOGOS[teamId]}
    alt=""
    style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border:"2px solid rgba(240,180,41,.3)", flexShrink:0, ...style }}
    onError={e=>{ e.target.style.display="none"; }}
  />
);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({name,size=22,stroke="currentColor",sw=1.5})=>{
  const p={fill:"none",stroke,strokeWidth:sw,strokeLinecap:"round",strokeLinejoin:"round"};
  const v={width:size,height:size,display:"block",flexShrink:0};
  const d={
    home:     <><path {...p} d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path {...p} d="M9 21V12h6v9"/></>,
    soccer:   <><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 3l1.5 3.5h-3L12 3z"/></>,
    netball:  <><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 3c2.5 4 2.5 14 0 18M3 12c4-2.5 14-2.5 18 0"/></>,
    choir:    <><path {...p} d="M9 18V5l12-2v13"/><circle {...p} cx="6" cy="18" r="3"/><circle {...p} cx="18" cy="16" r="3"/></>,
    announce: <><path {...p} d="M18 8a6 6 0 010 8M22 5a10 10 0 010 14M3 10v4a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1z"/></>,
    admin:    <><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    trophy:   <><path {...p} d="M8 21h8M12 17v4M5 3H3a2 2 0 000 4c0 3 2 5 4 6M19 3h2a2 2 0 010 4c0 3-2 5-4 6"/><path {...p} d="M8 3h8v8a4 4 0 01-8 0V3z"/></>,
    plus:     <><path {...p} d="M12 5v14M5 12h14"/></>,
    check:    <><path {...p} d="M20 6L9 17l-5-5"/></>,
    lock:     <><rect {...p} x="3" y="11" width="18" height="11" rx="2"/><path {...p} d="M7 11V7a5 5 0 0110 0v4"/></>,
    eye:      <><path {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle {...p} cx="12" cy="12" r="3"/></>,
    "eye-off":<><path {...p} d="M17.9 17.9A10.9 10.9 0 0112 20C5 20 1 12 1 12a18 18 0 015.1-6.9M9.9 4.2A10.5 10.5 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.1 3.1M1 1l22 22"/><path {...p} d="M14.1 14.1a3 3 0 01-4.2-4.2"/></>,
    trash:    <><path {...p} d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></>,
    publish:  <><path {...p} d="M12 19V5M5 12l7-7 7 7"/></>,
    bracket:  <><path {...p} d="M3 6h4v12H3M17 6h4v12h-4M7 12h10"/></>,
    users:    <><circle {...p} cx="9" cy="8" r="3"/><path {...p} d="M2 20c0-3 2.7-5.5 7-5.5"/><circle {...p} cx="17" cy="8" r="3"/><path {...p} d="M22 20c0-3-2.7-5.5-7-5.5s-7 2.5-7 5.5"/></>,
    mic:      <><rect {...p} x="9" y="2" width="6" height="12" rx="3"/><path {...p} d="M5 10a7 7 0 0014 0M12 19v3M8 22h8"/></>,
    vote:     <><path {...p} d="M9 11l3 3L22 4"/><path {...p} d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    user:     <><circle {...p} cx="12" cy="8" r="4"/><path {...p} d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>,
    info:     <><circle {...p} cx="12" cy="12" r="10"/><path {...p} d="M12 16v-4M12 8h.01"/></>,
    signal:   <><path {...p} d="M2 20h.01M7 20v-4M12 20V10M17 20V4M22 20v-8"/></>,
    edit:     <><path {...p} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path {...p} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    calendar: <><rect {...p} x="3" y="4" width="18" height="18" rx="2"/><path {...p} d="M16 2v4M8 2v4M3 10h18"/></>,
    shield:   <><path {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    x:        <><path {...p} d="M18 6L6 18M6 6l12 12"/></>,
    tag:      <><path {...p} d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line {...p} x1="7" y1="7" x2="7.01" y2="7"/></>,
    list:     <><line {...p} x1="8" y1="6" x2="21" y2="6"/><line {...p} x1="8" y1="12" x2="21" y2="12"/><line {...p} x1="8" y1="18" x2="21" y2="18"/><line {...p} x1="3" y1="6" x2="3.01" y2="6"/><line {...p} x1="3" y1="12" x2="3.01" y2="12"/><line {...p} x1="3" y1="18" x2="3.01" y2="18"/></>,
  };
  return <svg style={v} viewBox="0 0 24 24">{d[name]||d.info}</svg>;
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{
  --navy:#0d1b3e;--navy2:#122044;--navy3:#1a2a54;--navy4:#223060;
  --gold:#f0b429;--gold2:#ffd166;--gold-dim:rgba(240,180,41,0.12);--gold-border:rgba(240,180,41,0.28);
  --white:#fff;--muted:#8899cc;--muted2:#4a5a8a;
  --red:#e53e3e;--green:#38a169;--pink:#e91e8c;
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.14);
  --nav-h:62px;--safe-b:env(safe-area-inset-bottom,0px);
}
body{background:var(--navy);color:#fff;font-family:'Barlow',sans-serif;min-height:100vh;}
::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}

/* ── SPLASH ── */
.splash{position:fixed;inset:0;background:var(--navy);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999;gap:0;}
.splash-logo{width:200px;height:200px;border-radius:50%;object-fit:cover;border:3px solid var(--gold);box-shadow:0 0 60px rgba(240,180,41,.4);animation:splashIn 1s cubic-bezier(.34,1.56,.64,1) both;}
.splash-title{font-family:'Barlow Condensed',sans-serif;font-size:42px;font-weight:900;letter-spacing:4px;text-transform:uppercase;color:#fff;animation:splashUp .8s ease .6s both;}
.splash-title span{color:var(--gold);}
.splash-sub{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:4px;text-transform:uppercase;color:var(--muted);animation:splashUp .8s ease .8s both;margin-top:4px;}
.splash-bar{width:60px;height:2px;background:var(--gold);margin-top:18px;animation:splashBar 1s ease 1s both;}
.splash-enter{animation:splashUp .6s ease 1.4s both;margin-top:32px;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);cursor:pointer;}
@keyframes splashIn{from{opacity:0;transform:scale(.5) rotate(-10deg);}to{opacity:1;transform:scale(1) rotate(0deg);}}
@keyframes splashUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
@keyframes splashBar{from{width:0;opacity:0;}to{width:60px;opacity:1;}}
@keyframes splashFade{to{opacity:0;pointer-events:none;}}

/* ── APP SHELL ── */
.app{display:flex;flex-direction:column;min-height:100vh;max-width:480px;margin:0 auto;position:relative;background:var(--navy);background-image:radial-gradient(ellipse at 20% 0%,rgba(240,180,41,.05) 0%,transparent 50%);}
.app-content{flex:1;padding-bottom:calc(var(--nav-h) + var(--safe-b) + 8px);overflow-y:auto;}

/* ── HEADER ── */
.header{background:rgba(13,27,62,.95);border-bottom:2px solid var(--gold);padding:11px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);}
.header-brand{display:flex;align-items:center;gap:10px;}
.header-logo{width:34px;height:34px;border-radius:50%;object-fit:cover;border:1.5px solid var(--gold);}
.h-title{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:800;letter-spacing:2px;color:var(--gold);text-transform:uppercase;line-height:1;}
.h-sub{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:1px;}
.admin-login-btn{display:flex;align-items:center;gap:6px;padding:7px 12px;border:1px solid var(--gold-border);border-radius:20px;background:var(--gold-dim);color:var(--gold);font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.admin-login-btn:hover{background:rgba(240,180,41,.2);}
.admin-login-btn.logged-in{background:var(--gold);color:var(--navy);}
.role-pill{padding:5px 10px;border:1px solid var(--gold-border);border-radius:20px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);background:var(--gold-dim);font-family:'Barlow Condensed',sans-serif;font-weight:700;}

/* ── BOTTOM NAV ── */
.bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:rgba(13,27,62,.97);border-top:1px solid var(--gold-border);display:flex;padding-bottom:var(--safe-b);z-index:100;height:var(--nav-h);backdrop-filter:blur(16px);}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;padding:6px 2px;color:var(--muted2);transition:color .2s;border:none;background:none;position:relative;}
.nav-item.active{color:var(--gold);}
.nav-item.active::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:28px;height:2px;background:var(--gold);border-radius:0 0 3px 3px;}
.nav-label{font-size:9px;letter-spacing:.8px;text-transform:uppercase;font-weight:700;font-family:'Barlow Condensed',sans-serif;}

/* ── ADMIN MODAL ── */
.modal-overlay{position:fixed;inset:0;background:rgba(5,10,25,.9);z-index:200;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(6px);animation:fadeIn .2s ease;}
.modal-sheet{background:var(--navy2);border-radius:20px 20px 0 0;border-top:1px solid var(--border2);width:100%;max-width:480px;padding:24px 20px calc(24px + var(--safe-b));max-height:92vh;overflow-y:auto;}
.modal-handle{width:36px;height:3px;background:var(--border2);border-radius:3px;margin:0 auto 20px;}
.modal-title{font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;}
.modal-sub{font-size:13px;color:var(--muted);margin-bottom:20px;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}

/* ── PAGE ── */
.page{padding:0 0 16px;}
.page-banner{background:linear-gradient(160deg,var(--navy3) 0%,var(--navy2) 100%);border-bottom:1px solid var(--border);padding:20px 18px 16px;position:relative;overflow:hidden;}
.page-banner::after{content:'';position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,var(--gold-dim) 0%,transparent 70%);pointer-events:none;}
.page-label{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:3px;font-weight:700;font-family:'Barlow Condensed',sans-serif;}
.page-title{font-family:'Barlow Condensed',sans-serif;font-size:36px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#fff;line-height:1;}
.page-title .acc{color:var(--gold);}
.page-sub{font-size:12px;color:var(--muted);margin-top:5px;}
.inner{padding:16px 18px 4px;}

/* ── PUBLIC DASHBOARD HERO ── */
.dash-hero{
  background:linear-gradient(180deg,var(--navy3) 0%,var(--navy) 100%);
  padding:28px 20px 24px;text-align:center;
  border-bottom:1px solid var(--border);
  position:relative;overflow:hidden;
}
.dash-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(240,180,41,.1) 0%,transparent 60%);pointer-events:none;}
.dash-hero-logo{width:90px;height:90px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);box-shadow:0 0 30px rgba(240,180,41,.25);margin-bottom:14px;position:relative;}
.dash-hero-title{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#fff;line-height:1;}
.dash-hero-title span{color:var(--gold);}
.dash-hero-sub{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-top:6px;font-family:'Barlow Condensed',sans-serif;}

/* ── TEAM GRID ── */
.team-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}
.team-grid-item{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:default;}
.team-grid-logo{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid var(--border2);}
.team-grid-name{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;text-align:center;color:#fff;letter-spacing:.3px;line-height:1.2;}

/* ── CARDS ── */
.card{background:var(--navy3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;}
.card-gold{border-color:var(--gold-border);background:linear-gradient(135deg,rgba(240,180,41,.07) 0%,var(--navy3) 60%);}
.card-sm{padding:12px 14px;}

/* ── STATS ── */
.stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.stat-box{background:var(--navy3);border:1px solid var(--border);border-radius:10px;padding:12px 6px;text-align:center;}
.stat-n{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:700;color:var(--gold);line-height:1;}
.stat-l{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-top:3px;font-family:'Barlow Condensed',sans-serif;}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 16px;border-radius:8px;border:none;font-family:'Barlow',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;width:100%;letter-spacing:.5px;text-transform:uppercase;}
.btn:active{transform:scale(.97);}
.btn-primary{background:var(--gold);color:var(--navy);}
.btn-primary:hover{background:var(--gold2);}
.btn-outline{background:transparent;border:1px solid var(--border2);color:#fff;}
.btn-outline:hover{border-color:var(--gold);color:var(--gold);}
.btn-danger{background:rgba(229,62,62,.12);border:1px solid rgba(229,62,62,.25);color:#fc8181;}
.btn-success{background:rgba(56,161,105,.1);border:1px solid rgba(56,161,105,.25);color:#68d391;}
.btn-sm{padding:8px 13px;font-size:11px;border-radius:6px;width:auto;}
.btn-row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}

/* ── FORMS ── */
.form-group{margin-bottom:13px;}
.form-label{display:block;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;font-family:'Barlow Condensed',sans-serif;font-weight:700;}
.form-input{width:100%;padding:11px 13px;background:rgba(0,0,0,.25);border:1px solid var(--border);border-radius:8px;color:#fff;font-family:'Barlow',sans-serif;font-size:14px;transition:border-color .2s;-webkit-appearance:none;}
.form-input:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(240,180,41,.1);}
.form-input::placeholder{color:var(--muted2);}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.form-section{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin:16px 0 10px;font-weight:700;padding-bottom:5px;border-bottom:1px solid var(--gold-border);}

/* ── SECTION HEADER ── */
.sec-hd{display:flex;align-items:center;justify-content:space-between;margin:16px 0 10px;}
.sec-hd-title{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);font-weight:700;}
.gold-line{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.gold-line::before,.gold-line::after{content:'';flex:1;height:1px;background:var(--border);}
.gold-line-text{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);font-weight:700;white-space:nowrap;}

/* ── TAGS ── */
.tag{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;font-family:'Barlow Condensed',sans-serif;}
.tag-gold{background:var(--gold-dim);color:var(--gold);border:1px solid var(--gold-border);}
.tag-green{background:rgba(56,161,105,.1);color:#68d391;border:1px solid rgba(56,161,105,.2);}
.tag-red{background:rgba(229,62,62,.1);color:#fc8181;border:1px solid rgba(229,62,62,.2);}
.tag-muted{background:rgba(255,255,255,.05);color:var(--muted);border:1px solid var(--border);}

/* ── BRACKET ── */
.bracket-scroll{overflow-x:auto;padding:0 0 16px;}
.bracket-inner{display:flex;gap:14px;min-width:max-content;}
.bracket-col{display:flex;flex-direction:column;gap:12px;width:168px;}
.b-round-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:2px;font-weight:700;}
.match-card{background:var(--navy3);border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.match-team{display:flex;align-items:center;gap:7px;padding:9px 11px;border-bottom:1px solid var(--border);}
.match-team:last-of-type{border-bottom:none;}
.match-team.winner{background:rgba(240,180,41,.1);color:var(--gold);}
.match-team.loser{color:var(--muted2);}
.match-team-name{flex:1;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;}
.match-score{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;color:var(--gold);min-width:22px;text-align:right;}
.match-score.dim{color:var(--muted2);}
.match-footer{padding:5px 11px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);background:rgba(0,0,0,.2);text-align:center;font-family:'Barlow Condensed',sans-serif;}

/* ── CHOIR ── */
.choir-card{background:var(--navy3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;position:relative;}
.score-bar-row{display:flex;align-items:center;gap:9px;margin-bottom:6px;}
.score-bar-label{font-size:11px;color:var(--muted);width:82px;flex-shrink:0;font-family:'Barlow Condensed',sans-serif;font-weight:600;}
.score-bar-track{flex:1;height:3px;background:rgba(255,255,255,.07);border-radius:2px;}
.score-bar-fill{height:100%;background:var(--gold);border-radius:2px;transition:width .6s ease;}
.score-bar-val{font-family:'Barlow Condensed',sans-serif;font-size:12px;color:var(--gold);font-weight:700;width:26px;text-align:right;flex-shrink:0;}
.dots-row{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);}
.dots-row:last-child{border-bottom:none;}
.dots-label{font-size:13px;color:#fff;flex:1;font-weight:500;}
.dots{display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end;}
.dot{width:25px;height:25px;border-radius:50%;border:1px solid var(--muted2);background:transparent;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;color:var(--muted);display:flex;align-items:center;justify-content:center;transition:all .15s;}
.dot:hover{border-color:var(--gold);color:var(--gold);}
.dot.on{background:var(--gold);border-color:var(--gold);color:var(--navy);font-weight:800;}

/* ── CHAMPION ── */
.champ-banner{position:relative;overflow:hidden;background:linear-gradient(135deg,#1a2800 0%,#0d1400 50%,#1a2800 100%);border:1px solid var(--gold-border);border-radius:14px;padding:20px;text-align:center;margin-bottom:12px;}
.champ-banner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(240,180,41,.15) 0%,transparent 60%);}
.champ-sport-lbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);opacity:.8;margin-bottom:6px;position:relative;font-weight:700;}
.champ-name{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:900;color:var(--gold);position:relative;letter-spacing:1px;text-transform:uppercase;line-height:1.1;}
.champ-branch{font-size:11px;color:var(--muted);margin-top:5px;position:relative;}
.champ-logo{width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);position:relative;margin-bottom:12px;box-shadow:0 0 20px rgba(240,180,41,.3);}

/* ── ANNOUNCEMENTS ── */
.ann-card{padding:14px;background:var(--navy3);border-left:3px solid var(--gold);border-radius:0 10px 10px 0;margin-bottom:10px;}
.ann-time{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:5px;}
.ann-body{font-size:14px;line-height:1.6;}

/* ── PLAYER ── */
.player-card{display:flex;align-items:center;gap:11px;padding:10px 13px;background:rgba(0,0,0,.2);border:1px solid var(--border);border-radius:8px;margin-bottom:7px;}
.player-avatar{width:36px;height:36px;border-radius:50%;background:var(--navy3);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;color:var(--muted);flex-shrink:0;}
.player-name{font-size:14px;font-weight:500;}
.player-meta{font-size:11px;color:var(--muted);margin-top:1px;}

/* ── USER ROW ── */
.user-row{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--navy3);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;}
.user-avatar{width:38px;height:38px;border-radius:50%;background:var(--gold-dim);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:var(--gold);flex-shrink:0;}
.user-name{font-size:14px;font-weight:600;}
.user-meta{font-size:11px;color:var(--muted);margin-top:1px;}

/* ── TABS ── */
.tabs{display:flex;border-bottom:1px solid var(--border);padding:0 18px;overflow-x:auto;}
.tab-btn{padding:10px 13px;background:none;border:none;border-bottom:2px solid transparent;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;color:var(--muted);white-space:nowrap;transition:color .2s,border-color .2s;}
.tab-btn.active{color:var(--gold);border-bottom-color:var(--gold);}

/* ── EMPTY ── */
.empty{display:flex;flex-direction:column;align-items:center;padding:48px 24px;text-align:center;gap:12px;}
.empty-icon{color:rgba(255,255,255,.09);}
.empty-text{font-size:13px;color:var(--muted);line-height:1.6;max-width:240px;}

/* ── TOAST ── */
.toast{position:fixed;top:72px;left:50%;transform:translateX(-50%);background:var(--navy3);border:1px solid var(--gold-border);border-radius:8px;padding:10px 18px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gold);z-index:999;white-space:nowrap;animation:toastIn .25s ease;}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

/* ── ANIMS ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
.fu{animation:fadeUp .32s ease both;}.fu1{animation-delay:.04s;}.fu2{animation-delay:.08s;}.fu3{animation-delay:.12s;}.fu4{animation-delay:.16s;}
hr{border:none;border-top:1px solid var(--border);margin:14px 0;}

/* ── VOTING ── */
.vote-card{background:var(--navy3);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:12px;}
.vote-match-header{padding:12px 14px;background:rgba(240,180,41,.06);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.vote-player-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;}
.vote-player-row:last-child{border-bottom:none;}
.vote-radio{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--muted2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;}
.vote-radio.checked{border-color:var(--gold);background:var(--gold);}
.vote-bar-wrap{display:flex;align-items:center;gap:6px;min-width:70px;}
.vote-bar-track{flex:1;height:3px;background:rgba(255,255,255,.08);border-radius:2px;}
.vote-bar-fill{height:100%;background:var(--gold);border-radius:2px;transition:width .4s ease;}
.vote-count{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:var(--gold);min-width:22px;text-align:right;}

/* ── SCORE ENTRY ── */
.score-vs-wrap{display:flex;align-items:center;gap:0;margin-bottom:14px;}
.score-side{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;}
.score-side-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;text-align:center;}
.score-vs-sep{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:var(--muted);letter-spacing:2px;padding:0 6px;margin-top:20px;}

/* ── SINCE BADGE ── */
.since-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:4px;background:rgba(240,180,41,.06);border:1px solid var(--gold-border);font-size:11px;color:var(--muted);}

/* ── JUDGE SCORE HEADER ── */
.judge-header{background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
`;

// ─── TOAST HOOK ────────────────────────────────────────────────────────────────
function useToast() {
  const [msg,setMsg]=useState(null);
  const show=m=>{setMsg(m);setTimeout(()=>setMsg(null),2400);};
  return [msg?<div className="toast">{msg}</div>:null,show];
}

// ─── SPLASH SCREEN ────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  useEffect(()=>{
    const t = setTimeout(onDone, 3000);
    return ()=>clearTimeout(t);
  },[]);
  return (
    <div className="splash" onClick={onDone}>
      <img src={FOUNDERS_CUP_LOGO} className="splash-logo" alt="Founders Cup" />
      <div className="splash-title">Founder's <span>Cup</span></div>
      <div className="splash-sub">Church of the Holy Ghost</div>
      <div className="splash-bar" />
      <div className="splash-enter">Tap to enter</div>
    </div>
  );
}

// ─── ADMIN LOGIN MODAL ────────────────────────────────────────────────────────
function AdminLoginModal({ state, onLogin, onClose }) {
  const [step, setStep]   = useState("role"); // role | pin
  const [selRole, setSelRole] = useState(null);
  const [selUser, setSelUser] = useState(null);
  const [pin, setPin]     = useState("");
  const [err, setErr]     = useState("");

  const roles = [
    { id:"organizer", label:"Tournament Organizer", desc:"Full control of the event",        pin:"1234" },
    { id:"judge",     label:"Choir Judge",          desc:"Score performances on your tablet", pin:null   },
    { id:"teamadmin", label:"Team Admin",           desc:"Manage your team & roster",         pin:null   },
  ];

  const attempt = () => {
    if (selRole === "organizer") {
      if (pin !== "1234") { setErr("Incorrect PIN."); return; }
      onLogin({ id:"organizer", name:"Organizer", role:"organizer" });
    } else if (selRole === "judge") {
      const judge = state.judges.find(j => j.id === selUser && j.pin === pin);
      if (!judge) { setErr("Incorrect PIN."); return; }
      onLogin({ ...judge, role:"judge" });
    } else if (selRole === "teamadmin") {
      const admin = state.teamAdmins.find(a => a.id === selUser && a.pin === pin);
      if (!admin) { setErr("Incorrect PIN."); return; }
      onLogin({ ...admin, role:"teamadmin" });
    }
  };

  const usersForRole = selRole === "judge" ? state.judges : selRole === "teamadmin" ? state.teamAdmins : [];

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title">Admin Login</div>
        <div className="modal-sub">Select your role to continue</div>

        {step === "role" && (
          <div>
            {roles.map(r=>(
              <button key={r.id} onClick={()=>{setSelRole(r.id);setSelUser(null);setPin("");setErr("");setStep("pin");}}
                style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,.04)",border:"1px solid var(--border)",borderRadius:10,marginBottom:10,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12,transition:"border-color .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--gold)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                <div style={{width:40,height:40,borderRadius:9,background:"var(--gold-dim)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--gold)"}}>
                  <Icon name={r.id==="organizer"?"trophy":r.id==="judge"?"mic":"users"} size={18}/>
                </div>
                <div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{r.label}</div>
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === "pin" && (
          <div>
            <button onClick={()=>setStep("role")} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:12,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",marginBottom:16,display:"flex",alignItems:"center",gap:6}}>
              ← Back
            </button>

            {(selRole==="judge"||selRole==="teamadmin") && usersForRole.length > 0 && (
              <div className="form-group">
                <label className="form-label">Select your profile</label>
                <select className="form-input" value={selUser||""} onChange={e=>setSelUser(e.target.value)}>
                  <option value="">— Choose —</option>
                  {usersForRole.map(u=><option key={u.id} value={u.id}>{u.name}{u.teamId?" — "+TEAMS.find(t=>t.id===u.teamId)?.name:""}</option>)}
                </select>
              </div>
            )}

            {(selRole==="judge"||selRole==="teamadmin") && usersForRole.length===0 && (
              <div style={{fontSize:13,color:"var(--muted)",marginBottom:16,padding:"12px",background:"rgba(255,255,255,.03)",borderRadius:8,border:"1px solid var(--border)"}}>
                No {selRole==="judge"?"judges":"team admins"} have been created yet. Ask the organizer to set up your profile.
              </div>
            )}

            {(selRole==="organizer"||(selUser&&(selRole==="judge"||selRole==="teamadmin"))) && (
              <>
                {err&&<div style={{fontSize:12,color:"#fc8181",textAlign:"center",marginBottom:10}}>{err}</div>}
                <div className="form-group">
                  <label className="form-label">Enter your PIN</label>
                  <input className="form-input" type="password" placeholder="····"
                    style={{fontSize:24,letterSpacing:10,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif"}}
                    value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()}/>
                </div>
                <button className="btn btn-primary" onClick={attempt}><Icon name="check" size={15}/> Enter</button>
              </>
            )}
          </div>
        )}

        <div style={{marginTop:20,textAlign:"center",fontSize:11,color:"var(--muted)",cursor:"pointer",letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={onClose}>
          <Icon name="eye" size={13}/> Continue as spectator
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function FoundersCup() {
  const [showSplash, setShowSplash] = useState(()=>!localStorage.getItem("fc_visited"));
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [state, setState] = useState(makeState);
  const [tab, setTab] = useState("home");
  const [toast, showToast] = useToast();
  const update = fn=>setState(s=>{const n=JSON.parse(JSON.stringify(s));fn(n);return n;});

  const handleSplashDone = () => {
    localStorage.setItem("fc_visited","1");
    setShowSplash(false);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setShowAdminModal(false);
    showToast(`Welcome, ${user.name}`);
    if(user.role==="organizer") setTab("admin");
    else if(user.role==="judge") setTab("choir");
    else if(user.role==="teamadmin") setTab("soccer");
  };

  const handleLogout = () => { setCurrentUser(null); setTab("home"); showToast("Signed out"); };

  const role = currentUser?.role || "spectator";

  const navItems = [
    {id:"home",    label:"Home",   icon:"home"    },
    {id:"soccer",  label:"Soccer", icon:"soccer"  },
    {id:"netball", label:"Netball",icon:"netball" },
    {id:"choir",   label:"Choir",  icon:"choir"   },
    {id:"vote",    label:"Vote",   icon:"vote"    },
    {id:"news",    label:"News",   icon:"announce"},
    ...(role==="organizer"?[{id:"admin",label:"Admin",icon:"admin"}]:[]),
  ];

  if(showSplash) return <><style>{CSS}</style><SplashScreen onDone={handleSplashDone}/></>;

  return (
    <>
      <style>{CSS}</style>
      {toast}
      {showAdminModal && <AdminLoginModal state={state} onLogin={handleLogin} onClose={()=>setShowAdminModal(false)}/>}
      <div className="app">
        <header className="header">
          <div className="header-brand">
            <img src={FOUNDERS_CUP_LOGO} className="header-logo" alt=""/>
            <div>
              <div className="h-title">Founder's Cup</div>
              <div className="h-sub">Church of the Holy Ghost</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {currentUser ? (
              <>
                <span className="role-pill">{currentUser.name}</span>
                <button className="admin-login-btn logged-in" onClick={handleLogout}><Icon name="lock" size={13}/> Out</button>
              </>
            ) : (
              <button className="admin-login-btn" onClick={()=>setShowAdminModal(true)}><Icon name="admin" size={13}/> Admin</button>
            )}
          </div>
        </header>

        <div className="app-content">
          {tab==="home"    && <HomePage state={state} />}
          {tab==="soccer"  && <SportPage sport="Soccer"  state={state} update={update} role={role} currentUser={currentUser} showToast={showToast}/>}
          {tab==="netball" && <SportPage sport="Netball" state={state} update={update} role={role} currentUser={currentUser} showToast={showToast}/>}
          {tab==="choir"   && <ChoirPage state={state} update={update} role={role} currentUser={currentUser} showToast={showToast}/>}
          {tab==="vote"    && <VotePage  state={state} update={update} role={role} currentUser={currentUser} showToast={showToast}/>}
          {tab==="news"    && <NewsPage  state={state} update={update} role={role} showToast={showToast}/>}
          {tab==="admin"   && role==="organizer" && <AdminPage state={state} update={update} showToast={showToast}/>}
        </div>

        <nav className="bottom-nav">
          {navItems.map(n=>(
            <button key={n.id} className={`nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
              <Icon name={n.icon} size={20} sw={tab===n.id?1.8:1.3} stroke={tab===n.id?"var(--gold)":"currentColor"}/>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// ─── HOME PAGE (spectator-first) ──────────────────────────────────────────────
function HomePage({ state }) {
  const getChamp = sport=>{
    const {matches,teams,published}=state.sports[sport];
    if(!published||!matches.length)return null;
    const maxR=Math.max(...matches.map(m=>m.round));
    const f=matches.find(m=>m.round===maxR&&m.winner);
    return f?teams.find(t=>t.id===f.winner):null;
  };
  const sc=getChamp("Soccer"),nc=getChamp("Netball");
  const cc=state.choir.published?rankChoir(state.choir)[0]?.group:null;
  const totalM=Object.values(state.sports).reduce((a,s)=>a+s.matches.length,0);
  const doneM=Object.values(state.sports).reduce((a,s)=>a+s.matches.filter(m=>m.winner).length,0);
  const totalPlayers=Object.values(state.sports).reduce((a,s)=>a+s.teams.reduce((b,t)=>b+(t.players?.length||0),0),0);

  return (
    <div className="page">
      {/* Hero */}
      <div className="dash-hero fu">
        <img src={FOUNDERS_CUP_LOGO} className="dash-hero-logo" alt="Founders Cup"/>
        <div className="dash-hero-title">Founder's <span>Cup</span></div>
        <div className="dash-hero-sub">Church of the Holy Ghost · Annual Championship</div>
      </div>

      <div className="inner">
        {/* Live stats */}
        <div className="stat-row fu fu1">
          <div className="stat-box"><div className="stat-n">8</div><div className="stat-l">Teams</div></div>
          <div className="stat-box"><div className="stat-n">{doneM}</div><div className="stat-l">Played</div></div>
          <div className="stat-box"><div className="stat-n">{totalPlayers}</div><div className="stat-l">Players</div></div>
        </div>

        {/* Team grid with real logos */}
        <div className="sec-hd fu fu1"><span className="sec-hd-title">The 8 Teams</span></div>
        <div className="team-grid fu fu2">
          {TEAMS.map(t=>(
            <div key={t.id} className="team-grid-item">
              <img src={TEAM_LOGOS[t.id]} className="team-grid-logo" alt={t.name}
                onError={e=>{e.target.style.background="var(--navy3)";e.target.src="";}}/>
              <div className="team-grid-name">{t.name}</div>
            </div>
          ))}
        </div>

        {/* Champions */}
        {(sc||nc||cc) && (
          <>
            <div className="gold-line fu fu2"><span className="gold-line-text">Champions</span></div>
            {sc && <ChampBanner sport="Soccer"  team={sc}/>}
            {nc && <ChampBanner sport="Netball" team={nc}/>}
            {cc && <ChampBanner sport="Choir"   team={cc}/>}
          </>
        )}

        {/* Announcements */}
        {state.announcements.length>0 && (
          <>
            <div className="sec-hd fu fu3"><span className="sec-hd-title">Latest News</span></div>
            {state.announcements.slice(0,2).map(a=>(
              <div key={a.id} className="ann-card fu fu4">
                <div className="ann-time">{a.time}</div>
                <div className="ann-body">{a.body}</div>
              </div>
            ))}
          </>
        )}

        {!sc&&!nc&&!cc&&state.announcements.length===0 && (
          <div className="empty fu fu2">
            <div className="empty-icon"><Icon name="signal" size={38} sw={1}/></div>
            <div className="empty-text">Live results will appear here as the competition progresses.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChampBanner({sport,team}) {
  return (
    <div className="champ-banner fu">
      <img src={TEAM_LOGOS[team.id]} className="champ-logo" alt={team.name}/>
      <div className="champ-sport-lbl">{sport} Champion</div>
      <div className="champ-name">{team.name}</div>
      <div className="champ-branch">{team.sub}</div>
    </div>
  );
}

// ─── SPORT PAGE ───────────────────────────────────────────────────────────────
function SportPage({sport,state,update,role,currentUser,showToast}) {
  const [tab,setTab]=useState("bracket");
  const sd=state.sports[sport];
  const isOrg=role==="organizer";
  const isTeamAdmin=role==="teamadmin";
  const getTeam=id=>sd.teams.find(t=>t.id===id);
  const champ=(()=>{
    if(!sd.published||!sd.matches.length)return null;
    const maxR=Math.max(...sd.matches.map(m=>m.round));
    const f=sd.matches.find(m=>m.round===maxR&&m.winner);
    return f?getTeam(f.winner):null;
  })();

  const tabs=[
    {id:"bracket",label:"Bracket"},
    {id:"teams",  label:"Teams"},
    ...(isOrg?[{id:"scores",label:"Scores"},{id:"register",label:"Register"}]:[]),
    ...(isTeamAdmin?[{id:"register",label:"My Roster"}]:[]),
  ];

  return (
    <div className="page">
      <div className="page-banner fu">
        <div className="page-label">{sport==="Soccer"?"⚽":"🏐"} Tournament</div>
        <div className="page-title">{sport}</div>
        <div className="page-sub">Single Elimination · 8 Teams · {sd.published?"Results Live":"Awaiting Results"}</div>
      </div>
      {champ&&<div className="inner" style={{paddingBottom:0}}><ChampBanner sport={sport} team={champ}/></div>}
      <div className="tabs">{tabs.map(t=><button key={t.id} className={`tab-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>
      <div className="inner">
        {tab==="bracket"  && <BracketView sd={sd} getTeam={getTeam} isOrg={isOrg}/>}
        {tab==="teams"    && <TeamsView sd={sd}/>}
        {tab==="scores"   && isOrg && <ScoresView sport={sport} sd={sd} update={update} showToast={showToast}/>}
        {tab==="register" && (isOrg||isTeamAdmin) && <RegisterView sport={sport} sd={sd} update={update} role={role} currentUser={currentUser} showToast={showToast}/>}
      </div>
    </div>
  );
}

function BracketView({sd,getTeam,isOrg}) {
  const visible=isOrg?sd.matches:(sd.published?sd.matches:[]);
  if(!visible.length)return<div className="empty"><div className="empty-icon"><Icon name="bracket" size={38} sw={1}/></div><div className="empty-text">{isOrg?"Generate a bracket to begin.":"Bracket will appear once published."}</div></div>;
  const rounds=[...new Set(visible.map(m=>m.round))].sort((a,b)=>a-b);
  const rL={1:"Quarter Finals",2:"Semi Finals",3:"Final"};
  return (
    <div className="bracket-scroll">
      <div className="bracket-inner">
        {rounds.map(r=>(
          <div key={r} className="bracket-col">
            <div className="b-round-label">{rL[r]||`Round ${r}`}</div>
            {visible.filter(m=>m.round===r).map(m=>{
              const tA=getTeam(m.teamA),tB=getTeam(m.teamB==="tbd"?null:m.teamB);
              return (
                <div key={m.id} className="match-card">
                  {[{t:tA,sc:m.scoreA,id:m.teamA},{t:tB,sc:m.scoreB,id:m.teamB}].map((s,i)=>(
                    <div key={i} className={`match-team ${m.winner===s.id?"winner":m.winner?"loser":""}`}>
                      {s.t&&<TeamLogo teamId={s.t.id} size={22}/>}
                      <span className="match-team-name">{s.t?.name||"TBD"}</span>
                      <span className={`match-score ${s.sc===null?"dim":""}`}>{s.sc??"—"}</span>
                    </div>
                  ))}
                  <div className="match-footer">{m.winner?`${getTeam(m.winner)?.name} advances`:"Upcoming"}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamsView({sd}) {
  return (
    <div>
      {sd.teams.map(t=>(
        <div key={t.id} className="card">
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <TeamLogo teamId={t.id} size={52}/>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800}}>{t.name}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{t.sub} · {t.branch}</div>
            </div>
            <span className="tag tag-muted">{t.players?.length||0} players</span>
          </div>
          {(t.players||[]).map(p=>(
            <div key={p.id} className="player-card">
              <div className="player-avatar">{p.firstName?.charAt(0)||"?"}</div>
              <div style={{flex:1}}>
                <div className="player-name">{p.firstName} {p.lastName}</div>
                <div className="player-meta">#{p.jersey} · {p.position} · {p.ageGroup}</div>
              </div>
              <div className="since-badge"><Icon name="calendar" size={11} stroke="var(--muted)"/>{p.memberSince?new Date(p.memberSince).getFullYear():"—"}</div>
            </div>
          ))}
          {!t.players?.length&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"12px 0"}}>No players yet.</div>}
        </div>
      ))}
    </div>
  );
}

function ScoresView({sport,sd,update,showToast}) {
  const getTeam=id=>sd.teams.find(t=>t.id===id);
  const generate=()=>{update(s=>{s.sports[sport].matches=buildBracket(s.sports[sport].teams);});showToast("Bracket generated!");};
  const setScore=(mid,field,val)=>update(s=>{const m=s.sports[sport].matches.find(x=>x.id===mid);if(m)m[field]=parseInt(val)||0;});
  const confirm=mid=>{
    update(s=>{
      const matches=s.sports[sport].matches;
      const m=matches.find(x=>x.id===mid);if(!m)return;
      const winner=(m.scoreA??0)>=(m.scoreB??0)?m.teamA:m.teamB;
      m.winner=winner;m.status="completed";s.sports[sport].votingOpen=true;
      const nextR=m.round+1;
      const rM=matches.filter(x=>x.round===m.round);
      const idx=rM.findIndex(x=>x.id===mid);
      if(idx%2===0){const nx=matches.find(x=>x.round===nextR&&x.teamB==="tbd");if(nx)nx.teamA=winner;else matches.push({id:uid(),round:nextR,teamA:winner,teamB:"tbd",scoreA:null,scoreB:null,winner:null,status:"pending"});}
      else{const nm=matches.find(x=>x.round===nextR&&(x.teamB==="tbd"||!x.teamB));if(nm)nm.teamB=winner;}
    });
    showToast("Confirmed — voting opened!");
  };
  const togglePublish=()=>{update(s=>{s.sports[sport].published=!s.sports[sport].published;});showToast(sd.published?"Hidden.":"Published!");};

  return (
    <div>
      <div className="btn-row" style={{marginBottom:16}}>
        <button className="btn btn-outline btn-sm" onClick={generate}><Icon name="bracket" size={13}/> Generate</button>
        <button className={`btn btn-sm ${sd.published?"btn-danger":"btn-success"}`} onClick={togglePublish}><Icon name={sd.published?"eye-off":"publish"} size={13}/>{sd.published?"Unpublish":"Publish"}</button>
      </div>
      {!sd.matches.length&&<div className="empty"><div className="empty-icon"><Icon name="bracket" size={38} sw={1}/></div><div className="empty-text">Generate a bracket to begin.</div></div>}
      {sd.matches.map(m=>{
        const tA=getTeam(m.teamA),tB=getTeam(m.teamB==="tbd"?null:m.teamB);
        return (
          <div key={m.id} className="card card-sm" style={{opacity:m.winner?.6:1,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span className="tag tag-gold">Round {m.round}</span>
              {m.winner&&<span className="tag tag-green"><Icon name="check" size={10}/> Done</span>}
            </div>
            <div className="score-vs-wrap">
              <div className="score-side">
                <TeamLogo teamId={tA?.id} size={40}/>
                <div className="score-side-name">{tA?.name||"TBD"}</div>
                <input className="form-input" type="number" min="0" value={m.scoreA??""} onChange={e=>setScore(m.id,"scoreA",e.target.value)} disabled={!!m.winner} style={{width:60,height:48,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:700,color:"var(--gold)",padding:"0 6px"}}/>
              </div>
              <div className="score-vs-sep">VS</div>
              <div className="score-side">
                <TeamLogo teamId={tB?.id} size={40}/>
                <div className="score-side-name">{tB?.name||"TBD"}</div>
                <input className="form-input" type="number" min="0" value={m.scoreB??""} onChange={e=>setScore(m.id,"scoreB",e.target.value)} disabled={!!m.winner} style={{width:60,height:48,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:700,color:"var(--gold)",padding:"0 6px"}}/>
              </div>
            </div>
            {!m.winner&&<button className="btn btn-primary" onClick={()=>confirm(m.id)}><Icon name="check" size={14}/> Confirm & Open Voting</button>}
            {m.winner&&<div style={{textAlign:"center",color:"var(--gold)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,marginTop:6,letterSpacing:1}}>🏆 {getTeam(m.winner)?.name} advances</div>}
          </div>
        );
      })}
    </div>
  );
}

function RegisterView({sport,sd,update,role,currentUser,showToast}) {
  const isOrg=role==="organizer";
  // Team admins can only see their own team
  const availableTeams = isOrg ? sd.teams : sd.teams.filter(t=>t.id===currentUser?.teamId);
  const [selTeam,setSelTeam]=useState(availableTeams[0]?.id||"");
  const [form,setForm]=useState({firstName:"",lastName:"",idNumber:"",jersey:"",position:"",ageGroup:"Open",phone:"",memberSince:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const positions=sport==="Soccer"?POSITIONS_SOCCER:POSITIONS_NETBALL;
  const team=sd.teams.find(t=>t.id===selTeam);

  const submit=()=>{
    if(!form.firstName.trim()||!form.lastName.trim()){showToast("Name required.");return;}
    update(s=>{const t=s.sports[sport].teams.find(x=>x.id===selTeam);if(t)t.players.push({id:uid(),...form});});
    showToast("Player registered!");
    setForm({firstName:"",lastName:"",idNumber:"",jersey:"",position:"",ageGroup:"Open",phone:"",memberSince:""});
  };

  return (
    <div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          {team&&<TeamLogo teamId={team.id} size={46}/>}
          <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:19,fontWeight:800}}>{team?.name||"Select Team"}</div><div style={{fontSize:11,color:"var(--muted)"}}>{team?.sub}</div></div>
        </div>
        {isOrg&&(
          <div className="form-group">
            <label className="form-label">Select Team</label>
            <select className="form-input" value={selTeam} onChange={e=>setSelTeam(e.target.value)}>
              {availableTeams.map(t=><option key={t.id} value={t.id}>{t.name} — {t.sub}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="form-section">Personal Details</div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={form.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="e.g. Sipho"/></div>
        <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="e.g. Dlamini"/></div>
      </div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">ID Number</label><input className="form-input" value={form.idNumber} onChange={e=>set("idNumber",e.target.value)} placeholder="SA ID"/></div>
        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="082 000 0000" type="tel"/></div>
      </div>

      <div className="form-section">Sport Details</div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">Jersey #</label><input className="form-input" value={form.jersey} onChange={e=>set("jersey",e.target.value)} placeholder="10"/></div>
        <div className="form-group"><label className="form-label">Age Group</label>
          <select className="form-input" value={form.ageGroup} onChange={e=>set("ageGroup",e.target.value)}>
            {["Under 13","Under 17","Under 21","Open"].map(a=><option key={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group"><label className="form-label">Position</label>
        <select className="form-input" value={form.position} onChange={e=>set("position",e.target.value)}>
          <option value="">— Select —</option>
          {positions.map(p=><option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="form-section">Church Membership <span style={{fontSize:9,color:"var(--muted)",letterSpacing:0,textTransform:"none",fontFamily:"'Barlow',sans-serif"}}>(Internal only)</span></div>
      <div className="form-group">
        <label className="form-label"><Icon name="calendar" size={11} stroke="var(--gold)"/> Member Since</label>
        <input className="form-input" type="date" value={form.memberSince} onChange={e=>set("memberSince",e.target.value)} max={new Date().toISOString().split("T")[0]} style={{colorScheme:"dark"}}/>
        {form.memberSince&&<div style={{marginTop:6}}><div className="since-badge"><Icon name="shield" size={11} stroke="var(--gold)"/>Member for {Math.floor((new Date()-new Date(form.memberSince))/(1000*60*60*24*365))} years</div></div>}
      </div>
      <button className="btn btn-primary" style={{marginTop:4}} onClick={submit}><Icon name="plus" size={15}/> Register Player</button>

      {team?.players?.length>0&&(
        <>
          <div className="sec-hd" style={{marginTop:18}}><span className="sec-hd-title">{team.name} · {team.players.length} registered</span></div>
          {team.players.map(p=>(
            <div key={p.id} className="player-card">
              <div className="player-avatar">{p.firstName?.charAt(0)||"?"}</div>
              <div style={{flex:1}}><div className="player-name">{p.firstName} {p.lastName}</div><div className="player-meta">#{p.jersey} · {p.position}</div></div>
              {isOrg&&<button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>{update(s=>{const t=s.sports[sport].teams.find(x=>x.id===selTeam);if(t)t.players=t.players.filter(x=>x.id!==p.id);});showToast("Removed.");}}><Icon name="trash" size={14}/></button>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── CHOIR PAGE ───────────────────────────────────────────────────────────────
function ChoirPage({state,update,role,currentUser,showToast}) {
  const [tab,setTab]=useState(role==="judge"?"score":"leaderboard");
  const isJudge=role==="judge",isOrg=role==="organizer",isTeamAdmin=role==="teamadmin";
  const tabs=[
    ...(isOrg||role==="spectator"||isTeamAdmin?[{id:"leaderboard",label:"Leaderboard"}]:[]),
    ...(isOrg||isTeamAdmin?[{id:"register",label:"Registration"}]:[]),
    ...(isJudge?[{id:"score",label:"Score"}]:[]),
    ...(isOrg?[{id:"manage",label:"Manage"},{id:"allscores",label:"All Scores"}]:[]),
  ];
  return (
    <div className="page">
      <div className="page-banner fu"><div className="page-label">Competition</div><div className="page-title">Choir <span className="acc">2025</span></div><div className="page-sub">{state.choir.categories.length} scoring categories · Independent judges</div></div>
      <div className="tabs">{tabs.map(t=><button key={t.id} className={`tab-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>
      <div className="inner">
        {tab==="leaderboard"&&<ChoirLeaderboard state={state}/>}
        {tab==="register"&&(isOrg||isTeamAdmin)&&<ChoirRegister state={state} update={update} role={role} currentUser={currentUser} showToast={showToast}/>}
        {tab==="score"&&isJudge&&<ChoirScore state={state} update={update} currentUser={currentUser} showToast={showToast}/>}
        {tab==="manage"&&isOrg&&<ChoirManage state={state} update={update} showToast={showToast}/>}
        {tab==="allscores"&&isOrg&&<ChoirAllScores state={state}/>}
      </div>
    </div>
  );
}

function ChoirLeaderboard({state}) {
  if(!state.choir.published)return<div className="empty"><div className="empty-icon"><Icon name="mic" size={38} sw={1}/></div><div className="empty-text">The choir leaderboard will be published once scoring is complete.</div></div>;
  const ranked=rankChoir(state.choir);
  return (
    <div>
      {ranked.map((r,i)=>(
        <div key={r.group.id} className={`choir-card fu ${i===0?"card-gold":""}`} style={{animationDelay:`${i*.06}s`}}>
          <div style={{position:"absolute",right:14,top:10,fontFamily:"'Barlow Condensed',sans-serif",fontSize:52,fontWeight:800,color:"rgba(255,255,255,.05)",lineHeight:1}}>#{i+1}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <TeamLogo teamId={r.group.id} size={52} style={{border:`2px solid ${i===0?"var(--gold)":"rgba(240,180,41,.2)"}`}}/>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:700}}>{r.group.name}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{r.group.branch} · {r.judgeCount} judge{r.judgeCount!==1?"s":""}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:40,fontWeight:800,color:i===0?"var(--gold)":"#fff",lineHeight:1}}>{r.overall>0?r.overall.toFixed(1):"—"}</div>
              <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1}}>avg</div>
            </div>
          </div>
          {state.choir.categories.map((cat,ci)=>(
            <div key={cat} className="score-bar-row">
              <div className="score-bar-label">{cat}</div>
              <div className="score-bar-track"><div className="score-bar-fill" style={{width:`${(r.catAvgs[ci]||0)/10*100}%`}}/></div>
              <div className="score-bar-val">{r.catAvgs[ci]>0?r.catAvgs[ci].toFixed(1):"—"}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ChoirRegister({state,update,role,currentUser,showToast}) {
  const isOrg=role==="organizer";
  const availableGroups=isOrg?state.choir.groups:state.choir.groups.filter(g=>g.id===currentUser?.teamId);
  const [selGroup,setSelGroup]=useState(availableGroups[0]?.id||"");
  const [form,setForm]=useState({firstName:"",lastName:"",idNumber:"",phone:"",voice:"Soprano",role:"Member",memberSince:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const group=state.choir.groups.find(g=>g.id===selGroup);

  const submit=()=>{
    if(!form.firstName.trim()||!form.lastName.trim()){showToast("Name required.");return;}
    update(s=>{const g=s.choir.groups.find(x=>x.id===selGroup);if(g){if(!g.members)g.members=[];g.members.push({id:uid(),...form});}});
    showToast("Member registered!");
    setForm({firstName:"",lastName:"",idNumber:"",phone:"",voice:"Soprano",role:"Member",memberSince:""});
  };

  return (
    <div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          {group&&<TeamLogo teamId={group.id} size={44}/>}
          <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800}}>{group?.name||"Select Group"}</div><div style={{fontSize:11,color:"var(--muted)"}}>{group?.branch}</div></div>
        </div>
        {isOrg&&(
          <div className="form-group"><label className="form-label">Select Group</label>
            <select className="form-input" value={selGroup} onChange={e=>setSelGroup(e.target.value)}>
              {availableGroups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="form-section">Personal Details</div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={form.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="e.g. Nomsa"/></div>
        <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="e.g. Khumalo"/></div>
      </div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">ID Number</label><input className="form-input" value={form.idNumber} onChange={e=>set("idNumber",e.target.value)} placeholder="SA ID"/></div>
        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="082 000 0000" type="tel"/></div>
      </div>

      <div className="form-section">Choir Details</div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">Singing Voice</label>
          <select className="form-input" value={form.voice} onChange={e=>set("voice",e.target.value)}>
            {SINGING_VOICES.map(v=><option key={v}>{v}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Role</label>
          <select className="form-input" value={form.role} onChange={e=>set("role",e.target.value)}>
            {["Member","Choir Leader","Deputy Leader","Soloist","Accompanist"].map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="form-section">Church Membership <span style={{fontSize:9,color:"var(--muted)",letterSpacing:0,textTransform:"none",fontFamily:"'Barlow',sans-serif"}}>(Internal only)</span></div>
      <div className="form-group">
        <label className="form-label"><Icon name="calendar" size={11} stroke="var(--gold)"/> Member Since</label>
        <input className="form-input" type="date" value={form.memberSince} onChange={e=>set("memberSince",e.target.value)} max={new Date().toISOString().split("T")[0]} style={{colorScheme:"dark"}}/>
        {form.memberSince&&<div style={{marginTop:6}}><div className="since-badge"><Icon name="shield" size={11} stroke="var(--gold)"/>Member for {Math.floor((new Date()-new Date(form.memberSince))/(1000*60*60*24*365))} years</div></div>}
      </div>
      <button className="btn btn-primary" style={{marginTop:4}} onClick={submit}><Icon name="plus" size={15}/> Register Member</button>

      {group?.members?.length>0&&(
        <>
          <div className="sec-hd" style={{marginTop:18}}><span className="sec-hd-title">{group.name} · {group.members.length} members</span></div>
          {group.members.map(m=>(
            <div key={m.id} className="player-card">
              <div className="player-avatar">{m.firstName?.charAt(0)||"?"}</div>
              <div style={{flex:1}}><div className="player-name">{m.firstName} {m.lastName}</div><div className="player-meta">{m.voice} · {m.role}</div></div>
              <span className="tag tag-gold">{m.voice?.charAt(0)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function ChoirScore({state,update,currentUser,showToast}) {
  const judge=currentUser;
  const [local,setLocal]=useState({});
  const get=(gid,cat)=>local[`${gid}_${cat}`]||null;
  const set=(gid,cat,v)=>setLocal(s=>({...s,[`${gid}_${cat}`]:v}));
  const submit=gid=>{
    if(!state.choir.categories.every(c=>get(gid,c))){showToast("Score all categories.");return;}
    update(s=>{state.choir.categories.forEach(cat=>{const idx=s.choir.scores.findIndex(x=>x.groupId===gid&&x.judgeId===judge.id&&x.category===cat);const e={id:uid(),groupId:gid,judgeId:judge.id,judgeName:judge.name,category:cat,score:local[`${gid}_${cat}`]};if(idx>=0)s.choir.scores[idx]=e;else s.choir.scores.push(e);});});
    showToast("Scores submitted!");
  };
  return (
    <div>
      <div className="judge-header">
        <Icon name="mic" size={18} stroke="var(--gold)"/>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,letterSpacing:.5}}>{judge?.name}</div>
          <div style={{fontSize:11,color:"var(--muted)"}}>Choir Judge · Score 1–10 per category</div>
        </div>
      </div>
      {state.choir.groups.map(g=>{
        const done=state.choir.categories.every(cat=>state.choir.scores.find(x=>x.groupId===g.id&&x.judgeId===judge?.id&&x.category===cat));
        return (
          <div key={g.id} className="choir-card">
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <TeamLogo teamId={g.id} size={46}/>
              <div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:19,fontWeight:700}}>{g.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{g.branch}</div></div>
              {done&&<span className="tag tag-green"><Icon name="check" size={10}/> Submitted</span>}
            </div>
            {state.choir.categories.map(cat=>(
              <div key={cat} className="dots-row">
                <div className="dots-label">{cat}</div>
                <div className="dots">{[1,2,3,4,5,6,7,8,9,10].map(n=><button key={n} className={`dot ${get(g.id,cat)===n?"on":""}`} onClick={()=>set(g.id,cat,n)}>{n}</button>)}</div>
              </div>
            ))}
            <div style={{marginTop:13}}><button className="btn btn-primary" onClick={()=>submit(g.id)}><Icon name="check" size={14}/> Submit Scores</button></div>
          </div>
        );
      })}
    </div>
  );
}

function ChoirManage({state,update,showToast}) {
  const [newCat,setNewCat]=useState("");
  const togglePublish=()=>{update(s=>{s.choir.published=!s.choir.published;});showToast(state.choir.published?"Hidden.":"Published!");};
  const addCat=()=>{if(!newCat.trim())return;update(s=>{if(!s.choir.categories.includes(newCat))s.choir.categories.push(newCat);});showToast("Category added!");setNewCat("");};
  const removeCat=cat=>update(s=>{s.choir.categories=s.choir.categories.filter(c=>c!==cat);});

  return (
    <div>
      <button className={`btn ${state.choir.published?"btn-danger":"btn-success"}`} style={{marginBottom:18}} onClick={togglePublish}>
        <Icon name={state.choir.published?"eye-off":"publish"} size={14}/>{state.choir.published?"Unpublish":"Publish Leaderboard"}
      </button>

      <div className="sec-hd"><span className="sec-hd-title">Scoring Categories</span></div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <input className="form-input" value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="e.g. Stage Presence" style={{flex:1}}/>
          <button className="btn btn-primary btn-sm" style={{width:"auto"}} onClick={addCat}><Icon name="plus" size={14}/></button>
        </div>
        {state.choir.categories.map(cat=>(
          <div key={cat} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><Icon name="tag" size={14} stroke="var(--gold)"/><span style={{fontSize:14}}>{cat}</span></div>
            <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>removeCat(cat)}><Icon name="x" size={15}/></button>
          </div>
        ))}
      </div>

      <div className="sec-hd"><span className="sec-hd-title">Groups</span></div>
      {state.choir.groups.map(g=>(
        <div key={g.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"var(--navy3)",border:"1px solid var(--border)",borderRadius:10,marginBottom:8}}>
          <TeamLogo teamId={g.id} size={40}/>
          <div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700}}>{g.name}</div><div style={{fontSize:11,color:"var(--muted)"}}>{g.branch} · {g.members?.length||0} members</div></div>
          <span className={`tag ${state.choir.scores.filter(s=>s.groupId===g.id).length>0?"tag-green":"tag-muted"}`}>{state.choir.scores.filter(s=>s.groupId===g.id).length>0?"Scored":"Pending"}</span>
        </div>
      ))}
    </div>
  );
}

function ChoirAllScores({state}) {
  const ranked=rankChoir(state.choir);
  return (
    <div>
      <div className="card">
        {ranked.map((r,i)=>(
          <div key={r.group.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 0",borderBottom:"1px solid var(--border)"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:i<3?"var(--gold)":"var(--muted2)",width:26}}>#{i+1}</div>
            <TeamLogo teamId={r.group.id} size={30}/>
            <div style={{flex:1,marginLeft:6}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700}}>{r.group.name}</div>
              <div style={{fontSize:10,color:"var(--muted)"}}>{r.judgeCount} judges · {state.choir.categories.map((c,ci)=>`${c.charAt(0)}: ${(r.catAvgs[ci]||0).toFixed(1)}`).join(" · ")}</div>
            </div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,color:"var(--gold)"}}>{r.overall>0?r.overall.toFixed(1):"—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VOTING PAGE ──────────────────────────────────────────────────────────────
function VotePage({state,update,role,currentUser,showToast}) {
  const [voterName,setVoterName]=useState("");
  const [voterId,setVoterId]=useState(currentUser?.id||null);
  const [registered,setRegistered]=useState(!!currentUser);
  const [selectedVotes,setSelectedVotes]=useState({});
  const isPlayer=role==="teamadmin";
  const weight=isPlayer?3:1;

  const completedMatches=[];
  ["Soccer","Netball"].forEach(sport=>{
    state.sports[sport].matches.filter(m=>m.winner).forEach(m=>{completedMatches.push({...m,sport});});
  });

  const registerVoter=()=>{
    if(!voterName.trim()){showToast("Enter your name.");return;}
    const id=uid();setVoterId(id);setRegistered(true);
    update(s=>{s.voters[id]={name:voterName,role,weight};});
    showToast("Registered!");
  };

  const castVote=(matchId,gender,playerId)=>{
    if(!registered){showToast("Register first.");return;}
    const key=`${matchId}_${gender}`;
    const existing=state.votes[matchId];
    const already=existing&&Object.values(existing).some(v=>v.voterId===voterId&&v.gender===gender);
    if(already){showToast("Already voted.");return;}
    setSelectedVotes(sv=>({...sv,[key]:playerId}));
    update(s=>{if(!s.votes[matchId])s.votes[matchId]={};s.votes[matchId][`${voterId}_${gender}`]={voterId,playerId,gender,weight};});
    showToast(`Vote cast! (${weight}× weight)`);
  };

  const getTally=(matchId,gender)=>{
    const mv=state.votes[matchId]||{};
    const tally={};
    Object.values(mv).filter(v=>v.gender===gender).forEach(v=>{tally[v.playerId]=(tally[v.playerId]||0)+v.weight;});
    return tally;
  };

  const getPlayers=match=>{
    const sd=state.sports[match.sport];
    const tA=sd.teams.find(t=>t.id===match.teamA);
    const tB=sd.teams.find(t=>t.id===match.teamB);
    return [...(tA?.players||[]).map(p=>({...p,teamName:tA.name,teamId:tA.id})),...(tB?.players||[]).map(p=>({...p,teamName:tB.name,teamId:tB.id}))];
  };

  if(!completedMatches.length)return(
    <div className="page">
      <div className="page-banner fu"><div className="page-label">Public Voting</div><div className="page-title">MOM / <span className="acc">WOM</span></div><div className="page-sub">Voting opens after each completed match</div></div>
      <div className="inner"><div className="empty fu"><div className="empty-icon"><Icon name="vote" size={38} sw={1}/></div><div className="empty-text">No completed matches yet. Voting opens automatically after each result.</div></div></div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-banner fu"><div className="page-label">Public Voting</div><div className="page-title">MOM / <span className="acc">WOM</span></div><div className="page-sub">Man & Woman of the Match · Team admin votes count 3×</div></div>
      <div className="inner">
        {!registered&&(
          <div className="card card-gold fu" style={{marginBottom:16}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,marginBottom:4}}>Register to Vote</div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:14,lineHeight:1.5}}>Enter your name to cast your vote. One vote per award per match.</div>
            <div className="form-group"><label className="form-label">Your Full Name</label><input className="form-input" value={voterName} onChange={e=>setVoterName(e.target.value)} placeholder="e.g. Sipho Dlamini" onKeyDown={e=>e.key==="Enter"&&registerVoter()}/></div>
            <button className="btn btn-primary" onClick={registerVoter}><Icon name="vote" size={15}/> Register & Vote</button>
          </div>
        )}
        {registered&&(
          <div className="card card-sm card-gold fu" style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><Icon name="check" size={14} stroke="var(--gold)"/><span style={{fontSize:13}}>Voting as <strong>{currentUser?.name||voterName}</strong></span>{isPlayer&&<span className="tag tag-gold">3× weight</span>}</div>
          </div>
        )}
        {completedMatches.map(match=>{
          const players=getPlayers(match);
          const sd=state.sports[match.sport];
          const tA=sd.teams.find(t=>t.id===match.teamA);
          const tB=sd.teams.find(t=>t.id===match.teamB);
          return (
            <div key={match.id} className="vote-card fu">
              <div className="vote-match-header">
                <div>
                  <div style={{fontSize:10,color:"var(--gold)",letterSpacing:2,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,marginBottom:3}}>{match.sport} · Round {match.round}</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700}}>{tA?.name} {match.scoreA} — {match.scoreB} {tB?.name}</div>
                </div>
                <span className="tag tag-green"><Icon name="check" size={10}/> Final</span>
              </div>
              <div style={{padding:14}}>
                {[{gender:"m",label:"Man of the Match"},{gender:"f",label:"Woman of the Match"}].map(({gender,label})=>{
                  const tally=getTally(match.id,gender);
                  const maxV=Math.max(1,...Object.values(tally));
                  const myVote=selectedVotes[`${match.id}_${gender}`];
                  return (
                    <div key={gender} style={{marginBottom:gender==="m"?16:0}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2.5,textTransform:"uppercase",color:"var(--muted)",marginBottom:10,fontWeight:700}}>{label}</div>
                      {players.length===0&&<div style={{fontSize:12,color:"var(--muted)",padding:"8px 0"}}>No players registered yet.</div>}
                      {players.map(p=>{
                        const votes=tally[p.id]||0;
                        const pct=Math.round((votes/maxV)*100);
                        const isMyVote=myVote===p.id;
                        return (
                          <div key={p.id} className="vote-player-row" onClick={()=>registered&&castVote(match.id,gender,p.id)}>
                            <div className={`vote-radio ${isMyVote?"checked":""}`}>{isMyVote&&<Icon name="check" size={10} stroke="var(--navy)"/>}</div>
                            <TeamLogo teamId={p.teamId} size={28}/>
                            <div style={{flex:1}}>
                              <div style={{fontSize:14,fontWeight:500}}>{p.firstName} {p.lastName}</div>
                              <div style={{fontSize:11,color:"var(--muted)"}}>{p.teamName} · {p.position}</div>
                            </div>
                            {votes>0&&<div className="vote-bar-wrap"><div className="vote-bar-track"><div className="vote-bar-fill" style={{width:`${pct}%`,background:gender==="f"?"#f06292":"var(--gold)"}}/></div><div className="vote-count">{votes}</div></div>}
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

// ─── NEWS ─────────────────────────────────────────────────────────────────────
function NewsPage({state,update,role,showToast}) {
  const [body,setBody]=useState("");
  const isOrg=role==="organizer";
  const post=()=>{if(!body.trim())return;update(s=>{s.announcements.unshift({id:uid(),body,time:new Date().toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"})});});showToast("Posted!");setBody("");};
  return (
    <div className="page">
      <div className="page-banner fu"><div className="page-label">Updates</div><div className="page-title">News</div><div className="page-sub">Official tournament announcements</div></div>
      <div className="inner">
        {isOrg&&<div className="card fu fu1" style={{marginBottom:16}}><div className="form-group"><label className="form-label">Post Announcement</label><textarea className="form-input" rows={3} value={body} onChange={e=>setBody(e.target.value)} placeholder="Type message..." style={{resize:"vertical",lineHeight:1.5}}/></div><button className="btn btn-primary" onClick={post}><Icon name="announce" size={14}/> Post</button></div>}
        {!state.announcements.length&&<div className="empty fu"><div className="empty-icon"><Icon name="announce" size={38} sw={1}/></div><div className="empty-text">No announcements yet.</div></div>}
        {state.announcements.map((a,i)=>(
          <div key={a.id} className={`ann-card fu fu${Math.min(i+1,4)}`}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div className="ann-time">{a.time}</div>
              {isOrg&&<button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>{update(s=>{s.announcements=s.announcements.filter(x=>x.id!==a.id);});showToast("Removed.");}}><Icon name="trash" size={13}/></button>}
            </div>
            <div className="ann-body">{a.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({state,update,showToast}) {
  const [tab,setTab]=useState("users");
  const tabs=[{id:"users",label:"Users"},{id:"scores",label:"Scores"},{id:"overview",label:"Overview"}];
  return (
    <div className="page">
      <div className="page-banner fu"><div className="page-label">Organizer</div><div className="page-title">Admin <span className="acc">Panel</span></div></div>
      <div className="tabs">{tabs.map(t=><button key={t.id} className={`tab-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>
      <div className="inner">
        {tab==="users"    && <UserManagement state={state} update={update} showToast={showToast}/>}
        {tab==="scores"   && <ScoreManagement state={state} update={update} showToast={showToast}/>}
        {tab==="overview" && <Overview state={state} update={update} showToast={showToast}/>}
      </div>
    </div>
  );
}

function UserManagement({state,update,showToast}) {
  const [activeSection,setActiveSection]=useState("judges");
  // Judge form
  const [jName,setJName]=useState("");const [jPin,setJPin]=useState("");const [jTablet,setJTablet]=useState("");
  // Team admin form
  const [aName,setAName]=useState("");const [aPin,setAPin]=useState("");const [aTeam,setATeam]=useState(TEAMS[0].id);

  const addJudge=()=>{
    if(!jName.trim()||!jPin.trim()){showToast("Name and PIN required.");return;}
    update(s=>{s.judges.push({id:uid(),name:jName,pin:jPin,tablet:jTablet});});
    showToast("Judge added!");setJName("");setJPin("");setJTablet("");
  };
  const removeJudge=id=>update(s=>{s.judges=s.judges.filter(j=>j.id!==id);});

  const addAdmin=()=>{
    if(!aName.trim()||!aPin.trim()){showToast("Name and PIN required.");return;}
    update(s=>{s.teamAdmins.push({id:uid(),name:aName,pin:aPin,teamId:aTeam});});
    showToast("Team admin added!");setAName("");setAPin("");
  };
  const removeAdmin=id=>update(s=>{s.teamAdmins=s.teamAdmins.filter(a=>a.id!==id);});

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        <button className={`btn btn-sm ${activeSection==="judges"?"btn-primary":"btn-outline"}`} onClick={()=>setActiveSection("judges")}><Icon name="mic" size={13}/> Judges ({state.judges.length})</button>
        <button className={`btn btn-sm ${activeSection==="admins"?"btn-primary":"btn-outline"}`} onClick={()=>setActiveSection("admins")}><Icon name="users" size={13}/> Team Admins ({state.teamAdmins.length})</button>
      </div>

      {activeSection==="judges"&&(
        <>
          <div className="card" style={{marginBottom:16}}>
            <div className="form-section" style={{marginTop:0}}>Add Choir Judge</div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={jName} onChange={e=>setJName(e.target.value)} placeholder="Judge name"/></div>
              <div className="form-group"><label className="form-label">Assign PIN</label><input className="form-input" value={jPin} onChange={e=>setJPin(e.target.value)} placeholder="e.g. 5678" type="password"/></div>
            </div>
            <div className="form-group"><label className="form-label">Tablet / Device (optional)</label><input className="form-input" value={jTablet} onChange={e=>setJTablet(e.target.value)} placeholder="e.g. Tablet 1"/></div>
            <button className="btn btn-primary" onClick={addJudge}><Icon name="plus" size={15}/> Add Judge</button>
          </div>
          {!state.judges.length&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"16px 0"}}>No judges added yet.</div>}
          {state.judges.map(j=>(
            <div key={j.id} className="user-row">
              <div className="user-avatar">{j.name.charAt(0)}</div>
              <div style={{flex:1}}>
                <div className="user-name">{j.name}</div>
                <div className="user-meta">{j.tablet||"No device assigned"} · PIN: {"·".repeat(j.pin.length)}</div>
              </div>
              <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>removeJudge(j.id)}><Icon name="trash" size={14}/></button>
            </div>
          ))}
        </>
      )}

      {activeSection==="admins"&&(
        <>
          <div className="card" style={{marginBottom:16}}>
            <div className="form-section" style={{marginTop:0}}>Add Team Admin</div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={aName} onChange={e=>setAName(e.target.value)} placeholder="Admin name"/></div>
              <div className="form-group"><label className="form-label">Assign PIN</label><input className="form-input" value={aPin} onChange={e=>setAPin(e.target.value)} placeholder="e.g. 9012" type="password"/></div>
            </div>
            <div className="form-group"><label className="form-label">Assign Team</label>
              <select className="form-input" value={aTeam} onChange={e=>setATeam(e.target.value)}>
                {TEAMS.map(t=><option key={t.id} value={t.id}>{t.name} — {t.sub}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={addAdmin}><Icon name="plus" size={15}/> Add Team Admin</button>
          </div>
          {!state.teamAdmins.length&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"16px 0"}}>No team admins added yet.</div>}
          {state.teamAdmins.map(a=>{
            const team=TEAMS.find(t=>t.id===a.teamId);
            return (
              <div key={a.id} className="user-row">
                {team&&<TeamLogo teamId={team.id} size={38}/>}
                <div style={{flex:1}}>
                  <div className="user-name">{a.name}</div>
                  <div className="user-meta">{team?.name} · PIN: {"·".repeat(a.pin.length)}</div>
                </div>
                <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>removeAdmin(a.id)}><Icon name="trash" size={14}/></button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function ScoreManagement({state,update,showToast}) {
  const togglePublish=sport=>{update(s=>{s.sports[sport].published=!s.sports[sport].published;});};
  const toggleChoirPublish=()=>{update(s=>{s.choir.published=!s.choir.published;});};
  return (
    <div>
      <div className="sec-hd"><span className="sec-hd-title">Publish Controls</span></div>
      {["Soccer","Netball"].map(sport=>(
        <div key={sport} className="card card-sm" style={{marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700}}>{sport}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{state.sports[sport].matches.filter(m=>m.winner).length} of {state.sports[sport].matches.length} matches complete</div>
            </div>
            <button className={`btn btn-sm ${state.sports[sport].published?"btn-danger":"btn-success"}`} onClick={()=>togglePublish(sport)}>
              <Icon name={state.sports[sport].published?"eye-off":"publish"} size={13}/>{state.sports[sport].published?"Unpublish":"Publish"}
            </button>
          </div>
        </div>
      ))}
      <div className="card card-sm">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700}}>Choir</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{[...new Set(state.choir.scores.map(s=>s.judgeId))].length} judges scored</div>
          </div>
          <button className={`btn btn-sm ${state.choir.published?"btn-danger":"btn-success"}`} onClick={toggleChoirPublish}>
            <Icon name={state.choir.published?"eye-off":"publish"} size={13}/>{state.choir.published?"Unpublish":"Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Overview({state,update,showToast}) {
  const reset=comp=>{
    if(!window.confirm(`Reset all ${comp} data?`))return;
    update(s=>{
      if(comp==="Choir"){s.choir.scores=[];s.choir.published=false;}
      else{s.sports[comp].matches=[];s.sports[comp].published=false;s.sports[comp].votingOpen=false;s.sports[comp].teams=s.sports[comp].teams.map(t=>({...t,players:[]}));}
    });
    showToast(`${comp} reset.`);
  };
  const totalPlayers=Object.values(state.sports).reduce((a,s)=>a+s.teams.reduce((b,t)=>b+(t.players?.length||0),0),0);
  const totalMembers=state.choir.groups.reduce((a,g)=>a+(g.members?.length||0),0);
  return (
    <div>
      <div className="stat-row">
        <div className="stat-box"><div className="stat-n">{totalPlayers}</div><div className="stat-l">Players</div></div>
        <div className="stat-box"><div className="stat-n">{totalMembers}</div><div className="stat-l">Choir</div></div>
        <div className="stat-box"><div className="stat-n">{Object.keys(state.voters).length}</div><div className="stat-l">Voters</div></div>
      </div>
      <div className="sec-hd"><span className="sec-hd-title">Reset Data</span></div>
      <div className="btn-row">
        {["Soccer","Netball"].map(s=><button key={s} className="btn btn-danger btn-sm" onClick={()=>reset(s)}><Icon name="trash" size={12}/> Reset {s}</button>)}
        <button className="btn btn-danger btn-sm" onClick={()=>reset("Choir")}><Icon name="trash" size={12}/> Reset Choir</button>
      </div>
      <div className="card" style={{marginTop:16,borderColor:"var(--gold-border)"}}>
        <div style={{display:"flex",gap:9,alignItems:"flex-start"}}><Icon name="info" size={15} stroke="var(--gold)" sw={1.5}/><div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6}}>Running in demo mode. Connect to Supabase to persist all data across devices in real time.</div></div>
      </div>
    </div>
  );
}
