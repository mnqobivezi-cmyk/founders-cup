import { useState, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PINS = { organizer: "1234", coach: "2222", judge: "3333" };
const CHOIR_CATEGORIES = ["Harmony", "Presentation", "Repertoire", "Rhythm", "Diction"];
const SINGING_VOICES = ["Soprano", "Alto", "Tenor", "Bass"];
const POSITIONS_SOCCER  = ["Goalkeeper","Defender","Midfielder","Striker","Captain"];
const POSITIONS_NETBALL = ["Goal Shooter","Goal Attack","Wing Attack","Centre","Wing Defence","Goal Defence","Goal Keeper","Captain"];
const VOTE_WEIGHT = { player: 3, spectator: 1 }; // players count 3x
const uid = () => Math.random().toString(36).slice(2, 9);

const TEAMS = [
  { id:"t1", name:"Durban Central", sub:"United",   branch:"Durban Central", animal:"elephant", color:"#7a8a9a" },
  { id:"t2", name:"Wakanda",        sub:"OT",        branch:"Wakanda",        animal:"panther",  color:"#4a5a9a" },
  { id:"t3", name:"Cape Town",      sub:"Team",      branch:"Cape Town",      animal:"dolphin",  color:"#2a6496" },
  { id:"t4", name:"Swacunda",       sub:"Team",      branch:"Swacunda",       animal:"zebra",    color:"#8b7355" },
  { id:"t5", name:"Mighty",         sub:"West",      branch:"West",           animal:"buffalo",  color:"#6a5a4a" },
  { id:"t6", name:"Zululand",       sub:"Warriors",  branch:"Zululand",       animal:"lion",     color:"#9b6020" },
  { id:"t7", name:"Mlungwane",      sub:"Club",      branch:"Mlungwane",      animal:"rhino",    color:"#4a5568" },
  { id:"t8", name:"Durban South",   sub:"Big Cats",  branch:"Durban South",   animal:"leopard",  color:"#b8860b" },
];

// ─── ANIMAL CRESTS ────────────────────────────────────────────────────────────
const AnimalCrest = ({ animal, size = 56, color = "#c9a84c" }) => {
  const paths = {
    elephant: <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="28" cy="26" rx="13" ry="11"/><path d="M19 32c-2 3-2 7-1 10M37 32c2 3 2 7 1 10"/><path d="M22 20c0-3 2-5 6-5s6 2 6 5"/><path d="M18 26c-4 0-6 2-5 5 1 2 4 3 5 2"/><path d="M18 29c-2 4-1 8 0 10"/><circle cx="23" cy="24" r="1.5" fill={color}/><circle cx="33" cy="24" r="1.5" fill={color}/><path d="M25 30c1 1.5 2 1.5 3 0"/><path d="M22 20c-1-2-3-3-4-2M34 20c1-2 3-3 4-2"/></g>,
    panther:  <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M28 14c-8 0-13 5-13 12 0 5 3 9 7 11l-2 5h16l-2-5c4-2 7-6 7-11 0-7-5-12-13-12z"/><circle cx="23" cy="25" r="2" fill={color}/><circle cx="33" cy="25" r="2" fill={color}/><path d="M24 31c1.5 2 4.5 2 6 0"/><path d="M28 28v2"/><path d="M20 20c-2-3-5-3-6-1M36 20c2-3 5-3 6-1"/><path d="M15 28c-2 1-4 0-4-2M41 28c2 1 4 0 4-2"/></g>,
    dolphin:  <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 32c4-8 10-14 18-15 6-1 11 2 13 7"/><path d="M12 32c6-2 12-1 16 3"/><path d="M43 24c-1 5-4 9-8 11"/><path d="M35 35c-3 4-7 7-12 7"/><path d="M43 24l4-8-6 3"/><circle cx="38" cy="20" r="1.5" fill={color}/></g>,
    zebra:    <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="28" cy="26" rx="12" ry="13"/><path d="M22 14c-1-2-3-3-4-2M34 14c1-2 3-3 4-2"/><path d="M23 14v-4M33 14v-4"/><circle cx="24" cy="24" r="1.5" fill={color}/><circle cx="32" cy="24" r="1.5" fill={color}/><path d="M25 30c1 1.5 2 1.5 3 0"/><path d="M20 18c2 2 4 2 5 0M23 22c2 1 4 1 5-1M26 18v4"/><path d="M31 18c-2 2-4 2-5 0M32 22c-2 1-4 1-5-1"/></g>,
    buffalo:  <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="28" cy="27" rx="13" ry="11"/><path d="M15 22c-3-1-5 0-6 3M41 22c3-1 5 0 6 3"/><path d="M15 22c-1-4 1-7 4-6M41 22c1-4-1-7-4-6"/><circle cx="24" cy="26" r="1.5" fill={color}/><circle cx="32" cy="26" r="1.5" fill={color}/><path d="M25 31c1 2 2 2 3 0"/><path d="M22 20c0-3 3-4 6-4s6 1 6 4"/></g>,
    lion:     <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="28" cy="25" r="11"/><path d="M17 25c-4-2-5-5-3-7M39 25c4-2 5-5 3-7"/><path d="M20 17c-1-4 1-6 4-5M36 17c1-4-1-6-4-5"/><path d="M22 14c0-3 2-4 3-3M34 14c0-3-2-4-3-3"/><circle cx="24" cy="24" r="2" fill={color}/><circle cx="32" cy="24" r="2" fill={color}/><path d="M24 30c2 3 4 3 6 0"/><path d="M22 27c-2 1-3 1-4 0M34 27c2 1 3 1 4 0"/></g>,
    rhino:    <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="28" cy="27" rx="13" ry="11"/><path d="M26 16c0-3-1-5 0-6 1-1 2 1 2 3"/><path d="M24 17c0-2 0-4 1-4"/><circle cx="24" cy="26" r="1.5" fill={color}/><circle cx="32" cy="26" r="1.5" fill={color}/><path d="M25 32c1 1.5 2 1.5 3 0"/><path d="M18 24c-2-1-4 0-4 2M38 24c2-1 4 0 4 2"/></g>,
    leopard:  <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="28" cy="25" rx="12" ry="11"/><path d="M20 16c-1-3 0-5 2-4M36 16c1-3 0-5-2-4"/><path d="M22 14c0-2 1-3 2-2M34 14c0-2-1-3-2-2"/><circle cx="24" cy="24" r="2" fill={color}/><circle cx="32" cy="24" r="2" fill={color}/><path d="M25 30c1.5 2 3.5 2 5 0"/><circle cx="20" cy="20" r="1.5"/><circle cx="36" cy="20" r="1.5"/><circle cx="18" cy="26" r="1"/><circle cx="38" cy="26" r="1"/></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M28 4L6 13v16c0 13 9 23 22 27 13-4 22-14 22-27V13L28 4z" fill="rgba(0,0,0,0.35)" stroke={color} strokeWidth="1.4"/>
      {paths[animal]}
    </svg>
  );
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size=22, stroke="currentColor", sw=1.5 }) => {
  const p = { fill:"none", stroke, strokeWidth:sw, strokeLinecap:"round", strokeLinejoin:"round" };
  const v = { width:size, height:size, display:"block", flexShrink:0 };
  const d = {
    home:     <><path {...p} d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path {...p} d="M9 21V12h6v9"/></>,
    soccer:   <><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 3l1.5 3.5h-3L12 3zM5 8l2 1-1 3-2.5-1.5L5 8zM19 8l-2 1 1 3 2.5-1.5L19 8z"/></>,
    netball:  <><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 3c2.5 4 2.5 14 0 18M3 12c4-2.5 14-2.5 18 0M5.5 6.5c2 2 11 2 13 0M5.5 17.5c2-2 11-2 13 0"/></>,
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
    star:     <><polygon {...p} points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    info:     <><circle {...p} cx="12" cy="12" r="10"/><path {...p} d="M12 16v-4M12 8h.01"/></>,
    signal:   <><path {...p} d="M2 20h.01M7 20v-4M12 20V10M17 20V4M22 20v-8"/></>,
    edit:     <><path {...p} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path {...p} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    calendar: <><rect {...p} x="3" y="4" width="18" height="18" rx="2"/><path {...p} d="M16 2v4M8 2v4M3 10h18"/></>,
    shield:   <><path {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    heart:    <><path {...p} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></>,
    "chevron-r": <><path {...p} d="M9 18l6-6-6-6"/></>,
    x:        <><path {...p} d="M18 6L6 18M6 6l12 12"/></>,
  };
  return <svg style={v} viewBox="0 0 24 24">{d[name]||d.info}</svg>;
};

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const makeState = () => ({
  announcements: [],
  sports: {
    Soccer:  { teams: TEAMS.map(t => ({...t, players:[]})), matches:[], published:false, votingOpen:false },
    Netball: { teams: TEAMS.map(t => ({...t, players:[]})), matches:[], published:false, votingOpen:false },
  },
  choir: {
    groups: TEAMS.map(t => ({...t, members:[]})),
    scores: [], published: false,
  },
  votes: {},        // { matchId: { playerId: { voterId, weight } } }
  voters: {},       // { userId: { name, role, teamId } } — registered voters
  motmResults: {},  // { matchId: { men: playerId, women: playerId } } — published results
});

function buildBracket(teams) {
  const sh = [...teams].sort(() => Math.random()-0.5);
  return sh.reduce((acc, t, i) => {
    if (i % 2 === 0 && sh[i+1]) acc.push({ id:uid(), round:1, teamA:t.id, teamB:sh[i+1].id, scoreA:null, scoreB:null, winner:null, status:"pending" });
    return acc;
  }, []);
}

function rankChoir(choir) {
  return choir.groups.map(g => {
    const gs = choir.scores.filter(s => s.groupId === g.id);
    const catAvgs = CHOIR_CATEGORIES.map(cat => {
      const vals = gs.filter(s => s.category === cat).map(s => s.score);
      return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    });
    return { group:g, catAvgs, overall:catAvgs.reduce((a,b)=>a+b,0)/catAvgs.length, judgeCount:[...new Set(gs.map(s=>s.judge))].length };
  }).sort((a,b) => b.overall - a.overall);
}

function calcVotes(votes, matchId) {
  const mv = votes[matchId] || {};
  const tally = {};
  Object.values(mv).forEach(v => { tally[v.playerId] = (tally[v.playerId]||0) + v.weight; });
  return tally;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{
  --navy:#0d1b3e;--navy2:#152040;--navy3:#1c2a52;--navy4:#233060;
  --gold:#f0b429;--gold2:#ffd166;--gold-dim:rgba(240,180,41,0.12);--gold-border:rgba(240,180,41,0.28);
  --white:#fff;--cream:#e8eeff;--muted:#8899cc;--muted2:#4a5a8a;
  --red:#e53e3e;--green:#38a169;--pink:#e91e8c;
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.13);
  --nav-h:64px;--safe-b:env(safe-area-inset-bottom,0px);
}
body{background:var(--navy);color:var(--white);font-family:'Barlow',sans-serif;min-height:100vh;background-image:radial-gradient(ellipse at 20% 0%,rgba(240,180,41,.06) 0%,transparent 50%),radial-gradient(ellipse at 80% 100%,rgba(26,60,140,.4) 0%,transparent 50%);}
::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}
.app{display:flex;flex-direction:column;min-height:100vh;max-width:480px;margin:0 auto;}
.app-content{flex:1;padding-bottom:calc(var(--nav-h) + var(--safe-b) + 8px);overflow-y:auto;}
/* HEADER */
.header{background:var(--navy2);border-bottom:2px solid var(--gold);padding:13px 18px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
.chg-badge{width:38px;height:38px;border-radius:50%;border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;background:var(--navy3);flex-shrink:0;}
.chg-text{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:800;color:var(--gold);letter-spacing:1px;}
.header-brand{display:flex;align-items:center;gap:10px;}
.h-title{font-family:'Barlow Condensed',sans-serif;font-size:19px;font-weight:800;letter-spacing:2px;color:var(--gold);text-transform:uppercase;line-height:1;}
.h-sub{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:1px;}
.header-right{display:flex;align-items:center;gap:8px;}
.role-pill{padding:4px 10px;border:1px solid var(--gold-border);border-radius:20px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);background:var(--gold-dim);}
.btn-ghost{background:none;border:none;color:var(--muted);cursor:pointer;padding:6px;display:flex;align-items:center;transition:color .2s;border-radius:6px;}
.btn-ghost:hover{color:var(--white);}
/* NAV */
.bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:rgba(13,27,62,.97);border-top:1px solid var(--gold-border);display:flex;padding-bottom:var(--safe-b);z-index:100;height:var(--nav-h);backdrop-filter:blur(16px);}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;padding:6px 2px;color:var(--muted2);transition:color .2s;border:none;background:none;position:relative;}
.nav-item.active{color:var(--gold);}
.nav-item.active::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:28px;height:2px;background:var(--gold);border-radius:0 0 3px 3px;}
.nav-label{font-size:9px;letter-spacing:.8px;text-transform:uppercase;font-weight:700;font-family:'Barlow Condensed',sans-serif;}
/* PAGE */
.page{padding:0 0 16px;}
.page-banner{background:linear-gradient(160deg,var(--navy3) 0%,var(--navy2) 100%);border-bottom:1px solid var(--border);padding:22px 20px 18px;position:relative;overflow:hidden;}
.page-banner::after{content:'';position:absolute;right:-20px;top:-20px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,var(--gold-dim) 0%,transparent 70%);pointer-events:none;}
.page-label{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:3px;font-weight:700;font-family:'Barlow Condensed',sans-serif;}
.page-title{font-family:'Barlow Condensed',sans-serif;font-size:38px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--white);line-height:1;}
.page-title .acc{color:var(--gold);}
.page-sub{font-size:12px;color:var(--muted);margin-top:5px;}
.inner{padding:18px 18px 4px;}
/* CARDS */
.card{background:var(--navy3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;}
.card-gold{border-color:var(--gold-border);background:linear-gradient(135deg,rgba(240,180,41,.07) 0%,var(--navy3) 60%);}
.card-sm{padding:12px 14px;}
/* STATS */
.stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;}
.stat-box{background:var(--navy3);border:1px solid var(--border);border-radius:10px;padding:13px 6px;text-align:center;}
.stat-n{font-family:'Barlow Condensed',sans-serif;font-size:34px;font-weight:700;color:var(--gold);line-height:1;}
.stat-l{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-top:3px;font-family:'Barlow Condensed',sans-serif;}
/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 16px;border-radius:8px;border:none;font-family:'Barlow',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;width:100%;letter-spacing:.5px;text-transform:uppercase;}
.btn:active{transform:scale(.97);}
.btn-primary{background:var(--gold);color:var(--navy);}
.btn-primary:hover{background:var(--gold2);}
.btn-outline{background:transparent;border:1px solid var(--border2);color:var(--white);}
.btn-outline:hover{border-color:var(--gold);color:var(--gold);}
.btn-danger{background:rgba(229,62,62,.12);border:1px solid rgba(229,62,62,.25);color:#fc8181;}
.btn-success{background:rgba(56,161,105,.1);border:1px solid rgba(56,161,105,.25);color:#68d391;}
.btn-vote{background:rgba(233,30,140,.1);border:1px solid rgba(233,30,140,.25);color:#f06292;}
.btn-sm{padding:8px 13px;font-size:11px;border-radius:6px;width:auto;}
.btn-row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}
.btn-icon{width:38px;height:38px;padding:0;border-radius:8px;flex-shrink:0;}
/* FORMS */
.form-group{margin-bottom:13px;}
.form-label{display:block;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;font-family:'Barlow Condensed',sans-serif;font-weight:700;}
.form-input{width:100%;padding:11px 13px;background:var(--navy2);border:1px solid var(--border);border-radius:8px;color:var(--white);font-family:'Barlow',sans-serif;font-size:14px;transition:border-color .2s,box-shadow .2s;-webkit-appearance:none;}
.form-input:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(240,180,41,.1);}
.form-input::placeholder{color:var(--muted2);}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.form-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
.form-section{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin:18px 0 10px;font-weight:700;padding-bottom:6px;border-bottom:1px solid var(--gold-border);}
/* SECTION HEADER */
.sec-hd{display:flex;align-items:center;justify-content:space-between;margin:18px 0 10px;}
.sec-hd-title{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);font-weight:700;}
.gold-line{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
.gold-line::before,.gold-line::after{content:'';flex:1;height:1px;background:var(--border);}
.gold-line-text{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);font-weight:700;white-space:nowrap;}
/* TAGS */
.tag{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;font-family:'Barlow Condensed',sans-serif;}
.tag-gold{background:var(--gold-dim);color:var(--gold);border:1px solid var(--gold-border);}
.tag-green{background:rgba(56,161,105,.1);color:#68d391;border:1px solid rgba(56,161,105,.2);}
.tag-red{background:rgba(229,62,62,.1);color:#fc8181;border:1px solid rgba(229,62,62,.2);}
.tag-muted{background:rgba(255,255,255,.05);color:var(--muted);border:1px solid var(--border);}
.tag-pink{background:rgba(233,30,140,.1);color:#f06292;border:1px solid rgba(233,30,140,.2);}
/* TEAM ROW */
.team-row{display:flex;align-items:center;gap:12px;padding:13px 14px;background:var(--navy3);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;}
.team-name{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;letter-spacing:.5px;}
.team-sub{font-size:11px;color:var(--muted);margin-top:1px;}
/* PLAYER */
.player-card{display:flex;align-items:center;gap:11px;padding:10px 13px;background:var(--navy2);border:1px solid var(--border);border-radius:8px;margin-bottom:7px;}
.player-avatar{width:36px;height:36px;border-radius:50%;background:var(--navy3);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;color:var(--muted);flex-shrink:0;}
.player-name{font-size:14px;font-weight:500;}
.player-meta{font-size:11px;color:var(--muted);margin-top:1px;}
/* BRACKET */
.bracket-scroll{overflow-x:auto;padding:0 18px 16px;}
.bracket-inner{display:flex;gap:14px;min-width:max-content;}
.bracket-col{display:flex;flex-direction:column;gap:12px;width:168px;}
.b-round-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:2px;font-weight:700;}
.match-card{background:var(--navy3);border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.match-team{display:flex;align-items:center;gap:7px;padding:9px 11px;font-size:13px;font-weight:500;border-bottom:1px solid var(--border);}
.match-team:last-of-type{border-bottom:none;}
.match-team.winner{background:rgba(240,180,41,.1);color:var(--gold);}
.match-team.loser{color:var(--muted2);}
.match-team-name{flex:1;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;}
.match-score{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;color:var(--gold);min-width:22px;text-align:right;}
.match-score.dim{color:var(--muted2);}
.match-footer{padding:5px 11px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);background:rgba(0,0,0,.2);text-align:center;font-family:'Barlow Condensed',sans-serif;}
/* SCORE ENTRY */
.score-vs-wrap{display:flex;align-items:center;gap:0;margin-bottom:14px;}
.score-side{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;}
.score-side-name{font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;text-align:center;letter-spacing:.5px;}
.score-vs-sep{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:var(--muted);letter-spacing:2px;padding:0 8px;margin-top:22px;}
.score-input-box{width:60px;height:48px;background:var(--navy2);border:1px solid var(--border);border-radius:8px;color:var(--gold);font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:700;text-align:center;transition:border-color .2s;}
.score-input-box:focus{outline:none;border-color:var(--gold);}
/* CHOIR */
.choir-card{background:var(--navy3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;}
.choir-rank-bg{font-family:'Barlow Condensed',sans-serif;font-size:56px;font-weight:800;color:rgba(255,255,255,.05);line-height:1;position:absolute;right:14px;top:10px;}
.choir-name-text{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;letter-spacing:.5px;}
.score-bar-row{display:flex;align-items:center;gap:9px;margin-bottom:6px;}
.score-bar-label{font-size:11px;color:var(--muted);width:82px;flex-shrink:0;font-family:'Barlow Condensed',sans-serif;font-weight:600;}
.score-bar-track{flex:1;height:3px;background:rgba(255,255,255,.07);border-radius:2px;}
.score-bar-fill{height:100%;background:var(--gold);border-radius:2px;transition:width .6s ease;}
.score-bar-val{font-family:'Barlow Condensed',sans-serif;font-size:12px;color:var(--gold);font-weight:700;width:26px;text-align:right;flex-shrink:0;}
/* DOTS */
.dots-row{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);}
.dots-row:last-child{border-bottom:none;}
.dots-label{font-size:13px;color:var(--white);flex:1;font-weight:500;}
.dots{display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end;}
.dot{width:25px;height:25px;border-radius:50%;border:1px solid var(--muted2);background:transparent;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;color:var(--muted);display:flex;align-items:center;justify-content:center;transition:all .15s;}
.dot:hover{border-color:var(--gold);color:var(--gold);}
.dot.on{background:var(--gold);border-color:var(--gold);color:var(--navy);font-weight:800;}
/* CHAMPION */
.champ-banner{position:relative;overflow:hidden;background:linear-gradient(135deg,#1a2800 0%,#0d1400 50%,#1a2800 100%);border:1px solid var(--gold-border);border-radius:14px;padding:22px;text-align:center;margin-bottom:12px;}
.champ-banner::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(240,180,41,.16) 0%,transparent 60%);}
.champ-sport-lbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);opacity:.8;margin-bottom:4px;position:relative;font-weight:700;}
.champ-name-text{font-family:'Barlow Condensed',sans-serif;font-size:34px;font-weight:800;color:var(--gold);position:relative;letter-spacing:1px;text-transform:uppercase;line-height:1.1;}
.champ-branch-text{font-size:11px;color:var(--muted);margin-top:5px;position:relative;}
/* ANNOUNCEMENTS */
.ann-card{padding:14px;background:var(--navy3);border-left:3px solid var(--gold);border-radius:0 10px 10px 0;margin-bottom:10px;}
.ann-time{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:5px;}
.ann-body{font-size:14px;line-height:1.6;}
/* VOTING */
.vote-card{background:var(--navy3);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:12px;}
.vote-match-header{padding:12px 14px;background:rgba(240,180,41,.06);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.vote-match-teams{font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:.5px;}
.vote-section{padding:14px;}
.vote-section-title{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--muted);margin-bottom:10px;font-weight:700;}
.vote-player-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;}
.vote-player-row:last-child{border-bottom:none;}
.vote-player-row.voted{background:transparent;}
.vote-player-name{flex:1;font-size:14px;font-weight:500;}
.vote-player-team{font-size:11px;color:var(--muted);}
.vote-bar-wrap{display:flex;align-items:center;gap:8px;min-width:80px;}
.vote-bar-track{flex:1;height:4px;background:rgba(255,255,255,.08);border-radius:2px;}
.vote-bar-fill{height:100%;background:var(--pink,#f06292);border-radius:2px;transition:width .4s ease;}
.vote-count{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:var(--gold);min-width:24px;text-align:right;}
.vote-radio{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--muted2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;}
.vote-radio.checked{border-color:var(--gold);background:var(--gold);}
/* MOTM RESULT */
.motm-result{background:linear-gradient(135deg,rgba(240,180,41,.08),rgba(13,27,62,.8));border:1px solid var(--gold-border);border-radius:10px;padding:14px;margin-bottom:10px;}
.motm-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:4px;font-weight:700;}
.motm-name{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;color:var(--white);}
.motm-team{font-size:12px;color:var(--muted);margin-top:2px;}
/* REGISTER VOTER */
.voter-reg{background:var(--navy3);border:1px solid var(--gold-border);border-radius:12px;padding:20px;margin-bottom:16px;}
.voter-reg-title{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:var(--gold);margin-bottom:4px;letter-spacing:.5px;}
.voter-reg-sub{font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.5;}
/* LOGIN */
.login-bg{min-height:100vh;background:var(--navy);background-image:radial-gradient(ellipse at 50% 0%,rgba(240,180,41,.1) 0%,transparent 60%),radial-gradient(ellipse at 0% 100%,rgba(26,60,140,.5) 0%,transparent 50%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;}
.login-chg{width:68px;height:68px;border-radius:50%;border:2px solid var(--gold);background:var(--navy2);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}
.login-chg-txt{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:800;color:var(--gold);letter-spacing:2px;}
.login-wordmark{font-family:'Barlow Condensed',sans-serif;font-size:46px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:var(--white);line-height:1;text-align:center;}
.login-wordmark span{color:var(--gold);}
.login-sub{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-top:6px;text-align:center;}
.login-bar{width:44px;height:2px;background:var(--gold);margin:14px auto 0;}
.login-box{width:100%;max-width:380px;margin-top:36px;}
.role-btn{width:100%;padding:14px 15px;background:var(--navy2);border:1px solid var(--border);border-radius:10px;margin-bottom:9px;cursor:pointer;display:flex;align-items:center;gap:12px;text-align:left;transition:border-color .2s,background .2s;}
.role-btn:hover{border-color:var(--border2);}
.role-btn.sel{border-color:var(--gold);background:var(--gold-dim);}
.role-icon{width:40px;height:40px;border-radius:9px;background:var(--navy3);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--muted);}
.role-btn.sel .role-icon{background:rgba(240,180,41,.15);color:var(--gold);}
.role-name{font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;color:var(--white);letter-spacing:.5px;text-transform:uppercase;}
.role-desc{font-size:11px;color:var(--muted);margin-top:2px;}
.pin-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);text-align:center;margin-bottom:9px;font-weight:700;}
.pin-input{width:100%;padding:15px;background:var(--navy2);border:1px solid var(--border);border-radius:10px;color:var(--gold);font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:700;letter-spacing:12px;text-align:center;margin-bottom:11px;transition:border-color .2s;}
.pin-input:focus{outline:none;border-color:var(--gold);}
.login-err{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;color:#fc8181;text-align:center;margin-bottom:9px;}
.spec-link{margin-top:18px;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:color .2s;}
.spec-link:hover{color:var(--white);}
/* TABS */
.tabs{display:flex;border-bottom:1px solid var(--border);padding:0 18px;overflow-x:auto;}
.tab-btn{padding:11px 13px;background:none;border:none;border-bottom:2px solid transparent;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;color:var(--muted);white-space:nowrap;transition:color .2s,border-color .2s;}
.tab-btn.active{color:var(--gold);border-bottom-color:var(--gold);}
/* EMPTY */
.empty{display:flex;flex-direction:column;align-items:center;padding:48px 24px;text-align:center;gap:12px;}
.empty-icon{color:rgba(255,255,255,.09);}
.empty-text{font-size:13px;color:var(--muted);line-height:1.6;max-width:240px;}
/* TOAST */
.toast{position:fixed;top:76px;left:50%;transform:translateX(-50%);background:var(--navy3);border:1px solid var(--gold-border);border-radius:8px;padding:10px 18px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gold);z-index:999;white-space:nowrap;animation:toastIn .25s ease;}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
/* ANIMS */
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
.fu{animation:fadeUp .32s ease both;}.fu1{animation-delay:.04s;}.fu2{animation-delay:.08s;}.fu3{animation-delay:.12s;}.fu4{animation-delay:.16s;}
hr{border:none;border-top:1px solid var(--border);margin:14px 0;}
/* ADMIN */
.admin-sec{background:var(--navy3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:11px;}
.admin-sec-title{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-bottom:12px;font-weight:700;}
.pin-ref-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border);}
.pin-ref-row:last-child{border-bottom:none;}
.pin-mono{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;color:var(--gold);letter-spacing:6px;}
/* MEMBER SINCE */
.since-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:4px;background:rgba(240,180,41,.06);border:1px solid var(--gold-border);font-size:11px;color:var(--muted);}
/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(5,10,25,.85);z-index:200;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);}
.modal-sheet{background:var(--navy2);border-radius:18px 18px 0 0;border-top:1px solid var(--border2);width:100%;max-width:480px;padding:24px 20px;max-height:90vh;overflow-y:auto;}
.modal-handle{width:36px;height:3px;background:var(--border2);border-radius:3px;margin:0 auto 20px;}
.modal-title{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;}
.modal-sub{font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.5;}
`;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState(null);
  const show = m => { setMsg(m); setTimeout(() => setMsg(null), 2400); };
  return [msg ? <div className="toast">{msg}</div> : null, show];
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function FoundersCup() {
  const [state, setState] = useState(makeState);
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("home");
  const [currentUser, setCurrentUser] = useState(null); // { id, name, role, teamId }
  const [toast, showToast] = useToast();
  const update = fn => setState(s => { const n = JSON.parse(JSON.stringify(s)); fn(n); return n; });

  const navItems = [
    { id:"home",    label:"Home",   icon:"home"     },
    { id:"soccer",  label:"Soccer", icon:"soccer"   },
    { id:"netball", label:"Netball",icon:"netball"  },
    { id:"choir",   label:"Choir",  icon:"choir"    },
    { id:"vote",    label:"Vote",   icon:"vote"     },
    { id:"news",    label:"News",   icon:"announce" },
    ...(role === "organizer" ? [{ id:"admin", label:"Admin", icon:"admin" }] : []),
  ];

  const handleLogin = (r, user) => { setRole(r); setCurrentUser(user); setTab("home"); };

  if (!role) return <><style>{CSS}</style><LoginScreen onLogin={handleLogin} /></>;

  return (
    <>
      <style>{CSS}</style>
      {toast}
      <div className="app">
        <header className="header">
          <div className="header-brand">
            <div className="chg-badge"><div className="chg-text">CHG</div></div>
            <div><div className="h-title">Founder's Cup</div><div className="h-sub">Church of the Holy Ghost</div></div>
          </div>
          <div className="header-right">
            <span className="role-pill">{role}</span>
            <button className="btn-ghost" onClick={() => { setRole(null); setCurrentUser(null); }}><Icon name="lock" size={17} /></button>
          </div>
        </header>
        <div className="app-content">
          {tab === "home"    && <HomePage state={state} />}
          {tab === "soccer"  && <SportPage sport="Soccer"  state={state} update={update} role={role} currentUser={currentUser} showToast={showToast} />}
          {tab === "netball" && <SportPage sport="Netball" state={state} update={update} role={role} currentUser={currentUser} showToast={showToast} />}
          {tab === "choir"   && <ChoirPage state={state} update={update} role={role} showToast={showToast} />}
          {tab === "vote"    && <VotePage  state={state} update={update} role={role} currentUser={currentUser} showToast={showToast} />}
          {tab === "news"    && <NewsPage  state={state} update={update} role={role} showToast={showToast} />}
          {tab === "admin"   && role === "organizer" && <AdminPage state={state} update={update} showToast={showToast} />}
        </div>
        <nav className="bottom-nav">
          {navItems.map(n => (
            <button key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <Icon name={n.icon} size={20} sw={tab === n.id ? 1.8 : 1.3} stroke={tab === n.id ? "var(--gold)" : "currentColor"} />
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [sel, setSel] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const roles = [
    { id:"organizer", name:"Tournament Organizer", desc:"Full control — scores, registrations, publishing", icon:"trophy" },
    { id:"coach",     name:"Coach / Team Manager", desc:"Register players and manage your roster",          icon:"users"  },
    { id:"judge",     name:"Choir Judge",           desc:"Score choir group performances",                   icon:"mic"    },
  ];
  const go = () => {
    if (!sel) { setErr("Please select a role."); return; }
    if (PINS[sel] !== pin) { setErr("Incorrect PIN."); return; }
    onLogin(sel, { id: uid(), name: sel, role: sel });
  };
  return (
    <div className="login-bg">
      <div className="fu">
        <div className="login-chg"><div className="login-chg-txt">CHG</div></div>
        <div className="login-wordmark">Founder's <span>Cup</span></div>
        <div className="login-sub">Annual Championship Tournament</div>
        <div className="login-bar" />
      </div>
      <div className="login-box fu fu1">
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"var(--muted)", textAlign:"center", marginBottom:14, fontWeight:700 }}>Select your role</div>
        {roles.map(r => (
          <button key={r.id} className={`role-btn ${sel === r.id ? "sel" : ""}`} onClick={() => { setSel(r.id); setPin(""); setErr(""); }}>
            <div className="role-icon"><Icon name={r.icon} size={19} /></div>
            <div><div className="role-name">{r.name}</div><div className="role-desc">{r.desc}</div></div>
          </button>
        ))}
        {sel && (
          <div className="fu" style={{ marginTop:16 }}>
            {err && <div className="login-err">{err}</div>}
            <div className="pin-label">Enter PIN</div>
            <input className="pin-input" type="password" placeholder="····" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} />
            <button className="btn btn-primary" onClick={go}><Icon name="check" size={15} /> Enter</button>
          </div>
        )}
        <div className="spec-link" onClick={() => onLogin("spectator", { id: uid(), name:"Spectator", role:"spectator" })}>
          <Icon name="eye" size={13} /> Continue as spectator — no PIN required
        </div>
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({ state }) {
  const getChamp = sport => {
    const { matches, teams, published } = state.sports[sport];
    if (!published || !matches.length) return null;
    const maxR = Math.max(...matches.map(m => m.round));
    const f = matches.find(m => m.round === maxR && m.winner);
    return f ? teams.find(t => t.id === f.winner) : null;
  };
  const sc = getChamp("Soccer"), nc = getChamp("Netball");
  const cc = (() => {
    if (!state.choir.published) return null;
    const r = rankChoir(state.choir); return r[0]?.group || null;
  })();
  const totalM = Object.values(state.sports).reduce((a,s) => a+s.matches.length, 0);
  const doneM  = Object.values(state.sports).reduce((a,s) => a+s.matches.filter(m=>m.winner).length, 0);
  return (
    <div className="page">
      <div className="page-banner fu">
        <div className="page-label">Welcome to</div>
        <div className="page-title">Founder's <span className="acc">Cup</span></div>
        <div className="page-sub">Soccer · Netball · Choir — Follow all competitions live</div>
      </div>
      <div className="inner">
        <div className="stat-row fu fu1">
          <div className="stat-box"><div className="stat-n">8</div><div className="stat-l">Teams</div></div>
          <div className="stat-box"><div className="stat-n">{totalM}</div><div className="stat-l">Matches</div></div>
          <div className="stat-box"><div className="stat-n">{doneM}</div><div className="stat-l">Played</div></div>
        </div>
        <div className="sec-hd fu fu1"><span className="sec-hd-title">The 8 Teams</span></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:20 }} className="fu fu2">
          {TEAMS.map(t => (
            <div key={t.id} style={{ background:"var(--navy3)", border:"1px solid var(--border)", borderRadius:10, padding:"11px 10px", display:"flex", alignItems:"center", gap:9 }}>
              <AnimalCrest animal={t.animal} size={40} color={t.color} />
              <div>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800 }}>{t.name}</div>
                <div style={{ fontSize:10, color:"var(--muted)" }}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
        {(sc||nc||cc) && <><div className="gold-line fu fu3"><span className="gold-line-text">Champions</span></div>{sc&&<ChampBanner sport="Soccer" team={sc}/>}{nc&&<ChampBanner sport="Netball" team={nc}/>}{cc&&<ChampBanner sport="Choir" team={cc}/>}</>}
        {state.announcements.length > 0 && <><div className="sec-hd fu fu3"><span className="sec-hd-title">Latest News</span></div>{state.announcements.slice(0,2).map(a=><div key={a.id} className="ann-card fu fu4"><div className="ann-time">{a.time}</div><div className="ann-body">{a.body}</div></div>)}</>}
        {!sc&&!nc&&!cc&&state.announcements.length===0&&<div className="empty fu fu2"><div className="empty-icon"><Icon name="signal" size={38} sw={1}/></div><div className="empty-text">Live results and announcements will appear here as the competition progresses.</div></div>}
      </div>
    </div>
  );
}
function ChampBanner({ sport, team }) {
  return (
    <div className="champ-banner fu">
      <div style={{ position:"relative", marginBottom:10 }}><AnimalCrest animal={team.animal} size={60} color="var(--gold)" /></div>
      <div className="champ-sport-lbl">{sport} Champion</div>
      <div className="champ-name-text">{team.name}</div>
      <div className="champ-branch-text">{team.sub || team.branch}</div>
    </div>
  );
}

// ─── SPORT PAGE ───────────────────────────────────────────────────────────────
function SportPage({ sport, state, update, role, currentUser, showToast }) {
  const [tab, setTab] = useState("bracket");
  const sd = state.sports[sport];
  const isOrg = role === "organizer", isCoach = role === "coach";
  const getTeam = id => sd.teams.find(t => t.id === id);
  const champ = (() => {
    if (!sd.published || !sd.matches.length) return null;
    const maxR = Math.max(...sd.matches.map(m=>m.round));
    const f = sd.matches.find(m => m.round===maxR && m.winner);
    return f ? getTeam(f.winner) : null;
  })();
  const tabs = [
    { id:"bracket", label:"Bracket" },
    { id:"teams",   label:"Teams & Players" },
    ...(isOrg   ? [{ id:"scores", label:"Scores" }, { id:"register", label:"Register" }] : []),
    ...(isCoach ? [{ id:"register", label:"My Roster" }] : []),
  ];
  return (
    <div className="page">
      <div className="page-banner fu">
        <div className="page-label">{sport === "Soccer" ? "⚽" : "🏐"} Tournament</div>
        <div className="page-title">{sport}</div>
        <div className="page-sub">Single Elimination · 8 Teams</div>
      </div>
      {champ && <div className="inner" style={{paddingBottom:0}}><ChampBanner sport={sport} team={champ}/></div>}
      <div className="tabs">{tabs.map(t=><button key={t.id} className={`tab-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>
      <div className="inner">
        {tab==="bracket"  && <BracketView sd={sd} getTeam={getTeam} isOrg={isOrg}/>}
        {tab==="teams"    && <TeamsView sd={sd}/>}
        {tab==="scores"   && isOrg && <ScoresView sport={sport} sd={sd} update={update} showToast={showToast}/>}
        {tab==="register" && (isOrg||isCoach) && <RegisterView sport={sport} sd={sd} update={update} role={role} showToast={showToast}/>}
      </div>
    </div>
  );
}

function BracketView({ sd, getTeam, isOrg }) {
  const visible = isOrg ? sd.matches : (sd.published ? sd.matches : []);
  if (!visible.length) return <div className="empty"><div className="empty-icon"><Icon name="bracket" size={38} sw={1}/></div><div className="empty-text">{isOrg?"Generate a bracket to begin.":"Bracket will appear once published."}</div></div>;
  const rounds = [...new Set(visible.map(m=>m.round))].sort((a,b)=>a-b);
  const rL = {1:"Quarter Finals",2:"Semi Finals",3:"Final"};
  return (
    <div className="bracket-scroll" style={{padding:"0 0 16px",margin:"0 -18px",paddingLeft:18,paddingRight:18}}>
      <div className="bracket-inner">
        {rounds.map(r=>(
          <div key={r} className="bracket-col">
            <div className="b-round-label">{rL[r]||`Round ${r}`}</div>
            {visible.filter(m=>m.round===r).map(m=>{
              const tA=getTeam(m.teamA), tB=getTeam(m.teamB==="tbd"?null:m.teamB);
              return (
                <div key={m.id} className="match-card">
                  {[{t:tA,sc:m.scoreA,id:m.teamA},{t:tB,sc:m.scoreB,id:m.teamB}].map((s,i)=>(
                    <div key={i} className={`match-team ${m.winner===s.id?"winner":m.winner?"loser":""}`}>
                      <div style={{width:22,height:22,flexShrink:0}}>{s.t&&<AnimalCrest animal={s.t.animal} size={22} color={m.winner===s.id?"var(--gold)":s.t.color}/>}</div>
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

function TeamsView({ sd }) {
  return (
    <div>
      {sd.teams.map(t=>(
        <div key={t.id} className="card">
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <AnimalCrest animal={t.animal} size={50} color={t.color}/>
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
              <div className="since-badge"><Icon name="calendar" size={11} stroke="var(--muted)"/>{p.memberSince ? new Date(p.memberSince).getFullYear() : "—"}</div>
            </div>
          ))}
          {!t.players?.length&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"12px 0"}}>No players registered yet.</div>}
        </div>
      ))}
    </div>
  );
}

function ScoresView({ sport, sd, update, showToast }) {
  const getTeam = id => sd.teams.find(t=>t.id===id);
  const generate = () => { update(s=>{s.sports[sport].matches=buildBracket(s.sports[sport].teams);}); showToast("Bracket generated!"); };
  const setScore = (mid,field,val) => update(s=>{const m=s.sports[sport].matches.find(x=>x.id===mid);if(m)m[field]=parseInt(val)||0;});
  const confirm = mid => {
    update(s=>{
      const matches=s.sports[sport].matches;
      const m=matches.find(x=>x.id===mid);if(!m)return;
      const winner=(m.scoreA??0)>=(m.scoreB??0)?m.teamA:m.teamB;
      m.winner=winner;m.status="completed";
      // open voting for this match
      s.sports[sport].votingOpen=true;
      const nextR=m.round+1;
      const rM=matches.filter(x=>x.round===m.round);
      const idx=rM.findIndex(x=>x.id===mid);
      if(idx%2===0){const nx=matches.find(x=>x.round===nextR&&x.teamB==="tbd");if(nx)nx.teamA=winner;else matches.push({id:uid(),round:nextR,teamA:winner,teamB:"tbd",scoreA:null,scoreB:null,winner:null,status:"pending"});}
      else{const nm=matches.find(x=>x.round===nextR&&(x.teamB==="tbd"||!x.teamB));if(nm)nm.teamB=winner;}
    });
    showToast("Result confirmed — voting opened!");
  };
  const togglePublish = () => { update(s=>{s.sports[sport].published=!s.sports[sport].published;}); showToast(sd.published?"Results hidden.":"Results published!"); };
  return (
    <div>
      <div className="btn-row" style={{marginBottom:18}}>
        <button className="btn btn-outline btn-sm" onClick={generate}><Icon name="bracket" size={13}/> Generate Bracket</button>
        <button className={`btn btn-sm ${sd.published?"btn-danger":"btn-success"}`} onClick={togglePublish}><Icon name={sd.published?"eye-off":"publish"} size={13}/>{sd.published?"Unpublish":"Publish"}</button>
      </div>
      {!sd.matches.length&&<div className="empty"><div className="empty-icon"><Icon name="bracket" size={38} sw={1}/></div><div className="empty-text">Generate a bracket to begin.</div></div>}
      {sd.matches.map(m=>{
        const tA=getTeam(m.teamA),tB=getTeam(m.teamB==="tbd"?null:m.teamB);
        return (
          <div key={m.id} className="card card-sm" style={{opacity:m.winner?.6:1,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <span className="tag tag-gold">Round {m.round}</span>
              {m.winner&&<span className="tag tag-green"><Icon name="check" size={10}/> Done</span>}
            </div>
            <div className="score-vs-wrap">
              <div className="score-side">
                <AnimalCrest animal={tA?.animal||"lion"} size={40} color={tA?.color||"var(--muted)"}/>
                <div className="score-side-name">{tA?.name||"TBD"}</div>
                <input className="score-input-box form-input" type="number" min="0" value={m.scoreA??""} onChange={e=>setScore(m.id,"scoreA",e.target.value)} disabled={!!m.winner} style={{width:60,height:48,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:700,color:"var(--gold)",padding:"0 6px"}}/>
              </div>
              <div className="score-vs-sep">VS</div>
              <div className="score-side">
                <AnimalCrest animal={tB?.animal||"elephant"} size={40} color={tB?.color||"var(--muted)"}/>
                <div className="score-side-name">{tB?.name||"TBD"}</div>
                <input className="score-input-box form-input" type="number" min="0" value={m.scoreB??""} onChange={e=>setScore(m.id,"scoreB",e.target.value)} disabled={!!m.winner} style={{width:60,height:48,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:700,color:"var(--gold)",padding:"0 6px"}}/>
              </div>
            </div>
            {!m.winner&&<button className="btn btn-primary" onClick={()=>confirm(m.id)}><Icon name="check" size={14}/> Confirm & Open Voting</button>}
            {m.winner&&<div style={{textAlign:"center",color:"var(--gold)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,marginTop:6,letterSpacing:1}}>🏆 {getTeam(m.winner)?.name} advances</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── REGISTRATION FORM ────────────────────────────────────────────────────────
function RegisterView({ sport, sd, update, role, showToast }) {
  const isOrg = role === "organizer";
  const [selTeam, setSelTeam] = useState(sd.teams[0]?.id || "");
  const [form, setForm] = useState({ firstName:"", lastName:"", idNumber:"", jersey:"", position:"", ageGroup:"Open", phone:"", memberSince:"", isPlayer:true });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const positions = sport === "Soccer" ? POSITIONS_SOCCER : POSITIONS_NETBALL;
  const team = sd.teams.find(t=>t.id===selTeam);

  const submit = () => {
    if (!form.firstName.trim()||!form.lastName.trim()) { showToast("First and last name required."); return; }
    update(s=>{
      const t=s.sports[sport].teams.find(x=>x.id===selTeam);
      if(t) t.players.push({ id:uid(), ...form });
    });
    showToast("Player registered!");
    setForm({ firstName:"", lastName:"", idNumber:"", jersey:"", position:"", ageGroup:"Open", phone:"", memberSince:"", isPlayer:true });
  };

  return (
    <div>
      {/* Team selector */}
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          {team&&<AnimalCrest animal={team.animal} size={46} color={team.color}/>}
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800}}>{team?.name||"Select Team"}</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>{team?.sub} · {team?.branch}</div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Select Team</label>
          <select className="form-input" value={selTeam} onChange={e=>setSelTeam(e.target.value)}>
            {sd.teams.map(t=><option key={t.id} value={t.id}>{t.name} — {t.sub}</option>)}
          </select>
        </div>
      </div>

      {/* Personal details */}
      <div className="form-section">Personal Details</div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={form.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="e.g. Sipho"/></div>
        <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="e.g. Dlamini"/></div>
      </div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">ID Number</label><input className="form-input" value={form.idNumber} onChange={e=>set("idNumber",e.target.value)} placeholder="SA ID number" type="text"/></div>
        <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="e.g. 082 000 0000" type="tel"/></div>
      </div>

      {/* Sport details */}
      <div className="form-section">Sport Details</div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">Jersey #</label><input className="form-input" value={form.jersey} onChange={e=>set("jersey",e.target.value)} placeholder="e.g. 10"/></div>
        <div className="form-group"><label className="form-label">Age Group</label>
          <select className="form-input" value={form.ageGroup} onChange={e=>set("ageGroup",e.target.value)}>
            {["Under 13","Under 17","Under 21","Open"].map(a=><option key={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Position / Designation</label>
        <select className="form-input" value={form.position} onChange={e=>set("position",e.target.value)}>
          <option value="">— Select position —</option>
          {positions.map(p=><option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Church membership — internal only */}
      <div className="form-section">Church Membership <span style={{fontSize:9,color:"var(--muted)",letterSpacing:0,textTransform:"none",fontFamily:"'Barlow',sans-serif"}}>(Internal use only — not shown publicly)</span></div>
      <div className="form-group">
        <label className="form-label"><Icon name="calendar" size={11} stroke="var(--gold)"/> Member Since</label>
        <input className="form-input" type="date" value={form.memberSince} onChange={e=>set("memberSince",e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          style={{colorScheme:"dark"}}/>
        {form.memberSince && (
          <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
            <div className="since-badge"><Icon name="shield" size={11} stroke="var(--gold)"/>
              Member for {Math.floor((new Date()-new Date(form.memberSince))/(1000*60*60*24*365))} year{Math.floor((new Date()-new Date(form.memberSince))/(1000*60*60*24*365))!==1?"s":""}
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-primary" style={{marginTop:6}} onClick={submit}><Icon name="plus" size={15}/> Register Player</button>

      {/* Existing roster quick view */}
      {team?.players?.length > 0 && (
        <>
          <div className="sec-hd" style={{marginTop:20}}><span className="sec-hd-title">Registered — {team.name} ({team.players.length})</span></div>
          {team.players.map(p=>(
            <div key={p.id} className="player-card">
              <div className="player-avatar">{p.firstName?.charAt(0)||"?"}</div>
              <div style={{flex:1}}>
                <div className="player-name">{p.firstName} {p.lastName}</div>
                <div className="player-meta">#{p.jersey} · {p.position}</div>
              </div>
              {isOrg&&<button className="btn-ghost" onClick={()=>{update(s=>{const t=s.sports[sport].teams.find(x=>x.id===selTeam);if(t)t.players=t.players.filter(x=>x.id!==p.id);});showToast("Removed.");}}><Icon name="trash" size={14}/></button>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── CHOIR ────────────────────────────────────────────────────────────────────
function ChoirPage({ state, update, role, showToast }) {
  const [tab, setTab] = useState(role==="judge"?"score":"leaderboard");
  const isJudge=role==="judge", isOrg=role==="organizer";
  const tabs=[
    ...(isOrg||role==="spectator"||role==="coach"?[{id:"leaderboard",label:"Leaderboard"}]:[]),
    ...(isOrg||role==="coach"?[{id:"register",label:"Registration"}]:[]),
    ...(isJudge?[{id:"score",label:"Score"}]:[]),
    ...(isOrg?[{id:"manage",label:"Manage"},{id:"allscores",label:"All Scores"}]:[]),
  ];
  return (
    <div className="page">
      <div className="page-banner fu"><div className="page-label">Competition</div><div className="page-title">Choir <span className="acc">2025</span></div><div className="page-sub">8 groups · 5 categories · Independent judges</div></div>
      <div className="tabs">{tabs.map(t=><button key={t.id} className={`tab-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>
      <div className="inner">
        {tab==="leaderboard"&&<ChoirLeaderboard state={state}/>}
        {tab==="register"&&(isOrg||role==="coach")&&<ChoirRegister state={state} update={update} showToast={showToast}/>}
        {tab==="score"&&isJudge&&<ChoirScore state={state} update={update} showToast={showToast}/>}
        {tab==="manage"&&isOrg&&<ChoirManage state={state} update={update} showToast={showToast}/>}
        {tab==="allscores"&&isOrg&&<ChoirAllScores state={state}/>}
      </div>
    </div>
  );
}

function ChoirLeaderboard({ state }) {
  if (!state.choir.published) return <div className="empty"><div className="empty-icon"><Icon name="mic" size={38} sw={1}/></div><div className="empty-text">The choir leaderboard will be published by the organizer once scoring is complete.</div></div>;
  const ranked=rankChoir(state.choir);
  return (
    <div>
      {ranked.map((r,i)=>(
        <div key={r.group.id} className={`choir-card fu ${i===0?"card-gold":""}`} style={{position:"relative",animationDelay:`${i*.06}s`}}>
          <div className="choir-rank-bg">#{i+1}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <AnimalCrest animal={r.group.animal} size={52} color={i===0?"var(--gold)":r.group.color}/>
            <div style={{flex:1}}>
              <div className="choir-name-text">{r.group.name}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{r.group.branch} · {r.judgeCount} judge{r.judgeCount!==1?"s":""}</div>
              <div style={{marginTop:4}}><span className="tag tag-muted">{r.group.members?.length||0} members</span></div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:42,fontWeight:800,color:i===0?"var(--gold)":"var(--white)",lineHeight:1}}>{r.overall>0?r.overall.toFixed(1):"—"}</div>
              <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1}}>avg</div>
            </div>
          </div>
          {CHOIR_CATEGORIES.map((cat,ci)=>(
            <div key={cat} className="score-bar-row">
              <div className="score-bar-label">{cat}</div>
              <div className="score-bar-track"><div className="score-bar-fill" style={{width:`${(r.catAvgs[ci]/10)*100}%`}}/></div>
              <div className="score-bar-val">{r.catAvgs[ci]>0?r.catAvgs[ci].toFixed(1):"—"}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ChoirRegister({ state, update, showToast }) {
  const [selGroup, setSelGroup] = useState(state.choir.groups[0]?.id||"");
  const [form, setForm] = useState({ firstName:"", lastName:"", idNumber:"", phone:"", voice:"Soprano", memberSince:"", role:"Member" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const group = state.choir.groups.find(g=>g.id===selGroup);

  const submit = () => {
    if (!form.firstName.trim()||!form.lastName.trim()) { showToast("First and last name required."); return; }
    update(s=>{
      const g=s.choir.groups.find(x=>x.id===selGroup);
      if(g){if(!g.members)g.members=[];g.members.push({id:uid(),...form});}
    });
    showToast("Member registered!");
    setForm({ firstName:"", lastName:"", idNumber:"", phone:"", voice:"Soprano", memberSince:"", role:"Member" });
  };

  return (
    <div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          {group&&<AnimalCrest animal={group.animal} size={44} color={group.color}/>}
          <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800}}>{group?.name||"Select Group"}</div><div style={{fontSize:11,color:"var(--muted)"}}>{group?.branch}</div></div>
        </div>
        <div className="form-group"><label className="form-label">Select Choir Group</label>
          <select className="form-input" value={selGroup} onChange={e=>setSelGroup(e.target.value)}>
            {state.choir.groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </div>

      <div className="form-section">Personal Details</div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={form.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="e.g. Nomsa"/></div>
        <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="e.g. Khumalo"/></div>
      </div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">ID Number</label><input className="form-input" value={form.idNumber} onChange={e=>set("idNumber",e.target.value)} placeholder="SA ID"/></div>
        <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="082 000 0000" type="tel"/></div>
      </div>

      <div className="form-section">Choir Details</div>
      <div className="form-grid">
        <div className="form-group"><label className="form-label">Singing Voice</label>
          <select className="form-input" value={form.voice} onChange={e=>set("voice",e.target.value)}>
            {SINGING_VOICES.map(v=><option key={v}>{v}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Role in Choir</label>
          <select className="form-input" value={form.role} onChange={e=>set("role",e.target.value)}>
            {["Member","Choir Leader","Deputy Leader","Soloist","Accompanist"].map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="form-section">Church Membership <span style={{fontSize:9,color:"var(--muted)",letterSpacing:0,textTransform:"none",fontFamily:"'Barlow',sans-serif"}}>(Internal use only)</span></div>
      <div className="form-group">
        <label className="form-label"><Icon name="calendar" size={11} stroke="var(--gold)"/> Member Since</label>
        <input className="form-input" type="date" value={form.memberSince} onChange={e=>set("memberSince",e.target.value)} max={new Date().toISOString().split("T")[0]} style={{colorScheme:"dark"}}/>
        {form.memberSince&&(
          <div style={{marginTop:8}}>
            <div className="since-badge"><Icon name="shield" size={11} stroke="var(--gold)"/>
              Member for {Math.floor((new Date()-new Date(form.memberSince))/(1000*60*60*24*365))} years
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-primary" style={{marginTop:6}} onClick={submit}><Icon name="plus" size={15}/> Register Member</button>

      {group?.members?.length>0&&(
        <>
          <div className="sec-hd" style={{marginTop:20}}><span className="sec-hd-title">{group.name} — {group.members.length} members</span></div>
          {group.members.map(m=>(
            <div key={m.id} className="player-card">
              <div className="player-avatar">{m.firstName?.charAt(0)||"?"}</div>
              <div style={{flex:1}}>
                <div className="player-name">{m.firstName} {m.lastName}</div>
                <div className="player-meta">{m.voice} · {m.role}</div>
              </div>
              <span className="tag tag-gold">{m.voice?.charAt(0)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function ChoirScore({ state, update, showToast }) {
  const [judgeName] = useState("Judge " + String.fromCharCode(65+Math.floor(Math.random()*26)));
  const [local, setLocal] = useState({});
  const get = (gid,cat) => local[`${gid}_${cat}`]||null;
  const set = (gid,cat,v) => setLocal(s=>({...s,[`${gid}_${cat}`]:v}));
  const submit = gid => {
    if(!CHOIR_CATEGORIES.every(c=>get(gid,c))){ showToast("Score all 5 categories."); return; }
    update(s=>{CHOIR_CATEGORIES.forEach(cat=>{const idx=s.choir.scores.findIndex(x=>x.groupId===gid&&x.judge===judgeName&&x.category===cat);const e={id:uid(),groupId:gid,judge:judgeName,category:cat,score:local[`${gid}_${cat}`]};if(idx>=0)s.choir.scores[idx]=e;else s.choir.scores.push(e);});});
    showToast("Scores submitted!");
  };
  return (
    <div>
      <div className="card card-sm" style={{marginBottom:16}}><div style={{display:"flex",gap:8,alignItems:"center"}}><Icon name="user" size={14} stroke="var(--gold)"/><span style={{fontSize:13,color:"var(--muted)"}}>Scoring as <strong style={{color:"var(--white)"}}>{judgeName}</strong> · Score 1–10</span></div></div>
      {state.choir.groups.map(g=>{
        const done=CHOIR_CATEGORIES.every(cat=>state.choir.scores.find(x=>x.groupId===g.id&&x.judge===judgeName&&x.category===cat));
        return (
          <div key={g.id} className="choir-card">
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <AnimalCrest animal={g.animal} size={46} color={g.color}/>
              <div style={{flex:1}}><div className="choir-name-text">{g.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{g.branch}</div></div>
              {done&&<span className="tag tag-green"><Icon name="check" size={10}/> Submitted</span>}
            </div>
            {CHOIR_CATEGORIES.map(cat=>(
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

function ChoirManage({ state, update, showToast }) {
  const togglePublish = () => { update(s=>{s.choir.published=!s.choir.published;}); showToast(state.choir.published?"Leaderboard hidden.":"Leaderboard published!"); };
  return (
    <div>
      <button className={`btn ${state.choir.published?"btn-danger":"btn-success"}`} style={{marginBottom:18}} onClick={togglePublish}><Icon name={state.choir.published?"eye-off":"publish"} size={14}/>{state.choir.published?"Unpublish Leaderboard":"Publish Leaderboard"}</button>
      <div className="sec-hd"><span className="sec-hd-title">Choir Groups</span></div>
      {state.choir.groups.map(g=>(
        <div key={g.id} className="team-row">
          <AnimalCrest animal={g.animal} size={40} color={g.color}/>
          <div style={{flex:1}}><div className="team-name">{g.name}</div><div className="team-sub">{g.branch} · {g.members?.length||0} members</div></div>
          <span className={`tag ${state.choir.scores.filter(s=>s.groupId===g.id).length>0?"tag-green":"tag-muted"}`}>{state.choir.scores.filter(s=>s.groupId===g.id).length>0?"Scored":"Pending"}</span>
        </div>
      ))}
    </div>
  );
}

function ChoirAllScores({ state }) {
  const ranked=rankChoir(state.choir);
  return (
    <div>
      <div className="card">
        {ranked.map((r,i)=>(
          <div key={r.group.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 0",borderBottom:"1px solid var(--border)"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:i<3?"var(--gold)":"var(--muted2)",width:26}}>#{i+1}</div>
            <AnimalCrest animal={r.group.animal} size={30} color={i===0?"var(--gold)":r.group.color}/>
            <div style={{flex:1,marginLeft:8}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700}}>{r.group.name}</div>
              <div style={{fontSize:10,color:"var(--muted)"}}>{r.judgeCount} judges · {CHOIR_CATEGORIES.map((c,ci)=>`${c.charAt(0)}: ${r.catAvgs[ci].toFixed(1)}`).join(" · ")}</div>
            </div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,color:"var(--gold)"}}>{r.overall>0?r.overall.toFixed(1):"—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VOTING PAGE ──────────────────────────────────────────────────────────────
function VotePage({ state, update, role, currentUser, showToast }) {
  const [voterName, setVoterName] = useState("");
  const [voterId, setVoterId] = useState(null);
  const [voterRegistered, setVoterRegistered] = useState(false);
  const [selectedVotes, setSelectedVotes] = useState({}); // { `${matchId}_m`: playerId, `${matchId}_f`: playerId }

  // Collect all completed matches across both sports
  const completedMatches = [];
  ["Soccer","Netball"].forEach(sport => {
    state.sports[sport].matches.filter(m=>m.winner).forEach(m=>{
      completedMatches.push({ ...m, sport });
    });
  });

  // Check if voter is already registered (players by role)
  const isPlayer = role === "coach"; // coaches vote as players (weight 3)
  const effectiveWeight = isPlayer ? VOTE_WEIGHT.player : VOTE_WEIGHT.spectator;

  const registerVoter = () => {
    if (!voterName.trim()) { showToast("Enter your name to vote."); return; }
    const id = uid();
    setVoterId(id);
    setVoterRegistered(true);
    update(s => { s.voters[id] = { name: voterName, role: role, weight: effectiveWeight }; });
    showToast("Registered! You can now vote.");
  };

  const castVote = (matchId, gender, playerId) => {
    if (!voterRegistered) { showToast("Register to vote first."); return; }
    const key = `${matchId}_${gender}`;
    // check if already voted this match+gender
    const existing = state.votes[matchId];
    const alreadyVoted = existing && Object.values(existing).some(v => v.voterId === voterId && v.gender === gender);
    if (alreadyVoted) { showToast("You already voted for this award."); return; }
    setSelectedVotes(sv => ({...sv, [key]: playerId}));
    update(s => {
      if (!s.votes[matchId]) s.votes[matchId] = {};
      s.votes[matchId][`${voterId}_${gender}`] = { voterId, playerId, gender, weight: effectiveWeight };
    });
    showToast(`Vote cast! (Weight: ${effectiveWeight}x)`);
  };

  const getVoteTally = (matchId, gender) => {
    const mv = state.votes[matchId] || {};
    const tally = {};
    Object.values(mv).filter(v=>v.gender===gender).forEach(v => { tally[v.playerId] = (tally[v.playerId]||0) + v.weight; });
    return tally;
  };

  const getPlayersForMatch = (match) => {
    const sport = match.sport;
    const sd = state.sports[sport];
    const tA = sd.teams.find(t=>t.id===match.teamA);
    const tB = sd.teams.find(t=>t.id===match.teamB);
    const players = [...(tA?.players||[]).map(p=>({...p,teamName:tA.name})), ...(tB?.players||[]).map(p=>({...p,teamName:tB.name}))];
    return players;
  };

  if (!completedMatches.length) return (
    <div className="page">
      <div className="page-banner fu"><div className="page-label">Man / Woman</div><div className="page-title">of the <span className="acc">Match</span></div><div className="page-sub">Voting opens after each completed match</div></div>
      <div className="inner">
        <div className="empty fu"><div className="empty-icon"><Icon name="vote" size={38} sw={1}/></div><div className="empty-text">No completed matches yet. Voting opens automatically after each match result is confirmed.</div></div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-banner fu">
        <div className="page-label">Public Voting</div>
        <div className="page-title">MOM / <span className="acc">WOM</span></div>
        <div className="page-sub">Man & Woman of the Match · Players vote counts 3× more</div>
      </div>
      <div className="inner">
        {/* Voter registration */}
        {!voterRegistered && (
          <div className="voter-reg fu">
            <div className="voter-reg-title">Register to Vote</div>
            <div className="voter-reg-sub">Enter your name to cast your vote. Each person gets one vote per award per match.{isPlayer ? " As a player, your vote carries 3× weight." : " Player votes carry more weight than public votes."}</div>
            <div className="form-group"><label className="form-label">Your Full Name</label><input className="form-input" value={voterName} onChange={e=>setVoterName(e.target.value)} placeholder="e.g. Sipho Dlamini" onKeyDown={e=>e.key==="Enter"&&registerVoter()}/></div>
            <button className="btn btn-primary" onClick={registerVoter}><Icon name="vote" size={15}/> Register &amp; Vote</button>
          </div>
        )}

        {voterRegistered && (
          <div className="card card-sm card-gold" style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Icon name="check" size={15} stroke="var(--gold)"/>
              <span style={{fontSize:13}}>Voting as <strong>{voterName}</strong></span>
              {isPlayer && <span className="tag tag-gold">3× weight</span>}
            </div>
          </div>
        )}

        {completedMatches.map(match => {
          const players = getPlayersForMatch(match);
          const sd = state.sports[match.sport];
          const tA = sd.teams.find(t=>t.id===match.teamA);
          const tB = sd.teams.find(t=>t.id===match.teamB);

          return (
            <div key={match.id} className="vote-card fu">
              <div className="vote-match-header">
                <div>
                  <div style={{fontSize:10,color:"var(--gold)",letterSpacing:2,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,marginBottom:3}}>{match.sport} · Round {match.round}</div>
                  <div className="vote-match-teams">{tA?.name} {match.scoreA} — {match.scoreB} {tB?.name}</div>
                </div>
                <span className="tag tag-green"><Icon name="check" size={10}/> Final</span>
              </div>
              <div className="vote-section">
                {[{gender:"m",label:"Man of the Match"},{gender:"f",label:"Woman of the Match"}].map(({gender,label})=>{
                  const tally = getVoteTally(match.id, gender);
                  const maxVotes = Math.max(1, ...Object.values(tally));
                  const myVote = selectedVotes[`${match.id}_${gender}`];
                  const votedPlayers = players.filter(p => tally[p.id]);
                  const displayPlayers = voterRegistered ? players : votedPlayers;

                  return (
                    <div key={gender} style={{marginBottom:gender==="m"?16:0}}>
                      <div className="vote-section-title">{label}</div>
                      {displayPlayers.length === 0 && <div style={{fontSize:12,color:"var(--muted)",padding:"8px 0"}}>No players registered for this match yet.</div>}
                      {displayPlayers.map(p=>{
                        const votes = tally[p.id]||0;
                        const pct = Math.round((votes/maxVotes)*100);
                        const isMyVote = myVote === p.id;
                        return (
                          <div key={p.id} className="vote-player-row" onClick={()=>voterRegistered&&castVote(match.id,gender,p.id)}>
                            <div className={`vote-radio ${isMyVote?"checked":""}`}>{isMyVote&&<Icon name="check" size={10} stroke="var(--navy)"/>}</div>
                            <div style={{flex:1}}>
                              <div className="vote-player-name">{p.firstName} {p.lastName}</div>
                              <div className="vote-player-team">{p.teamName} · {p.position}</div>
                            </div>
                            {votes > 0 && (
                              <div className="vote-bar-wrap">
                                <div className="vote-bar-track"><div className="vote-bar-fill" style={{width:`${pct}%`,background:gender==="f"?"#f06292":"var(--gold)"}}/></div>
                                <div className="vote-count">{votes}</div>
                              </div>
                            )}
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

        <div style={{fontSize:11,color:"var(--muted)",textAlign:"center",padding:"12px 0",lineHeight:1.6}}>
          Voting weight: Players &amp; coaches = 3 points · Public spectators = 1 point
        </div>
      </div>
    </div>
  );
}

// ─── NEWS ─────────────────────────────────────────────────────────────────────
function NewsPage({ state, update, role, showToast }) {
  const [body, setBody] = useState("");
  const isOrg = role==="organizer";
  const post = () => { if(!body.trim())return; update(s=>{s.announcements.unshift({id:uid(),body,time:new Date().toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"})});}); showToast("Posted!"); setBody(""); };
  return (
    <div className="page">
      <div className="page-banner fu"><div className="page-label">Updates</div><div className="page-title">News</div><div className="page-sub">Official tournament announcements</div></div>
      <div className="inner">
        {isOrg&&<div className="card fu fu1" style={{marginBottom:18}}><div className="form-group"><label className="form-label">Post Announcement</label><textarea className="form-input" rows={3} value={body} onChange={e=>setBody(e.target.value)} placeholder="Type your message..." style={{resize:"vertical",lineHeight:1.5}}/></div><button className="btn btn-primary" onClick={post}><Icon name="announce" size={14}/> Post</button></div>}
        {!state.announcements.length&&<div className="empty fu"><div className="empty-icon"><Icon name="announce" size={38} sw={1}/></div><div className="empty-text">No announcements yet.</div></div>}
        {state.announcements.map((a,i)=>(
          <div key={a.id} className={`ann-card fu fu${Math.min(i+1,4)}`}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div className="ann-time">{a.time}</div>
              {isOrg&&<button className="btn-ghost" onClick={()=>{update(s=>{s.announcements=s.announcements.filter(x=>x.id!==a.id);});showToast("Removed.");}}><Icon name="trash" size={13}/></button>}
            </div>
            <div className="ann-body">{a.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function AdminPage({ state, update, showToast }) {
  const reset = comp => {
    if(!window.confirm(`Reset all ${comp} data?`))return;
    update(s=>{if(comp==="Choir"){s.choir.scores=[];s.choir.published=false;s.choir.groups=s.choir.groups.map(g=>({...g,members:[]}));}else{s.sports[comp].matches=[];s.sports[comp].published=false;s.sports[comp].votingOpen=false;s.sports[comp].teams=s.sports[comp].teams.map(t=>({...t,players:[]}));}});
    showToast(`${comp} reset.`);
  };
  const totalVotes = Object.values(state.votes).reduce((a,mv)=>a+Object.keys(mv).length,0);
  return (
    <div className="page">
      <div className="page-banner fu"><div className="page-label">Organizer</div><div className="page-title">Admin <span className="acc">Panel</span></div></div>
      <div className="inner">
        {["Soccer","Netball"].map(sp=>{
          const d=state.sports[sp];
          return (
            <div key={sp} className="admin-sec fu">
              <div className="admin-sec-title">{sp}</div>
              <div className="stat-row" style={{marginBottom:10}}>
                <div className="stat-box"><div className="stat-n">{d.teams.reduce((a,t)=>a+(t.players?.length||0),0)}</div><div className="stat-l">Players</div></div>
                <div className="stat-box"><div className="stat-n">{d.matches.length}</div><div className="stat-l">Matches</div></div>
                <div className="stat-box"><div className="stat-n">{d.matches.filter(m=>m.winner).length}</div><div className="stat-l">Played</div></div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
                <span className={`tag ${d.published?"tag-green":"tag-muted"}`}>{d.published?"Published":"Hidden"}</span>
                <span className={`tag ${d.votingOpen?"tag-pink":"tag-muted"}`}>{d.votingOpen?"Voting Open":"Voting Closed"}</span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={()=>reset(sp)}><Icon name="trash" size={12}/> Reset {sp}</button>
            </div>
          );
        })}
        <div className="admin-sec fu fu2">
          <div className="admin-sec-title">Choir</div>
          <div className="stat-row" style={{marginBottom:10}}>
            <div className="stat-box"><div className="stat-n">{state.choir.groups.reduce((a,g)=>a+(g.members?.length||0),0)}</div><div className="stat-l">Members</div></div>
            <div className="stat-box"><div className="stat-n">{[...new Set(state.choir.scores.map(s=>s.judge))].length}</div><div className="stat-l">Judges</div></div>
            <div className="stat-box"><div className="stat-n">{state.choir.scores.length}</div><div className="stat-l">Scores</div></div>
          </div>
          <div style={{marginBottom:10}}><span className={`tag ${state.choir.published?"tag-green":"tag-muted"}`}>{state.choir.published?"Published":"Hidden"}</span></div>
          <button className="btn btn-danger btn-sm" onClick={()=>reset("Choir")}><Icon name="trash" size={12}/> Reset Choir</button>
        </div>
        <div className="admin-sec fu fu3">
          <div className="admin-sec-title">Voting</div>
          <div className="stat-row" style={{marginBottom:0}}>
            <div className="stat-box"><div className="stat-n">{Object.keys(state.voters).length}</div><div className="stat-l">Voters</div></div>
            <div className="stat-box"><div className="stat-n">{totalVotes}</div><div className="stat-l">Votes Cast</div></div>
            <div className="stat-box"><div className="stat-n">{Object.keys(state.votes).length}</div><div className="stat-l">Matches</div></div>
          </div>
        </div>
        <div className="admin-sec fu fu3">
          <div className="admin-sec-title">PIN Reference</div>
          {[["Tournament Organizer","1234"],["Coach / Team Manager","2222"],["Choir Judge","3333"]].map(([r,p])=>(
            <div key={r} className="pin-ref-row"><span style={{fontSize:13,color:"var(--white)"}}>{r}</span><span className="pin-mono">{p}</span></div>
          ))}
        </div>
        <div className="card fu fu4" style={{borderColor:"var(--gold-border)"}}>
          <div style={{display:"flex",gap:9,alignItems:"flex-start"}}><Icon name="info" size={15} stroke="var(--gold)" sw={1.5}/><div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6}}>Running in demo mode. Connect to Supabase to persist all registrations, scores and votes across devices in real time.</div></div>
        </div>
      </div>
    </div>
  );
}
