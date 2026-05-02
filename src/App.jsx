import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CLIENT (inlined — no separate import needed) ────────────────────
const supabase = createClient(
  "https://qqikvklpnkfxauwavvmj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxaWt2a2xwbmtmeGF1d2F2dm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTgwNzAsImV4cCI6MjA5MzI5NDA3MH0.R1iG33nxvomwTkWeERXncgK7MZ0tOB6bGUG5wD3atj0"
);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FC_LOGO = "https://static.wixstatic.com/media/4877d6_4bad42a571ec47e982d9b2ec2b4c9a22~mv2.jpeg";
const TEAM_META = {
  "Durban Central": { logo:"https://static.wixstatic.com/media/4877d6_e293da9b5c374495864511964d6dd921~mv2.jpg" },
  "Wakanda":        { logo:"https://static.wixstatic.com/media/4877d6_d49e5298427146faa1a5e22be776a2ec~mv2.jpg" },
  "Cape Town":      { logo:"https://static.wixstatic.com/media/4877d6_9973532eb7e5406682fb091353a111ad~mv2.jpg" },
  "Swacunda":       { logo:"https://static.wixstatic.com/media/4877d6_87f5f6f53d31470eb025f6ea35f8b632~mv2.jpg" },
  "Mighty":         { logo:"https://static.wixstatic.com/media/4877d6_5d6cb7ce14b54374a5dddb18a4173500~mv2.jpg" },
  "Zululand":       { logo:"https://static.wixstatic.com/media/4877d6_0d2034b959604f6fa1e66df62e31f49f~mv2.jpg" },
  "Mlungwane":      { logo:"https://static.wixstatic.com/media/4877d6_0711c82df47f4dc797de9abf523ffc50~mv2.jpg" },
  "Durban South":   { logo:"https://static.wixstatic.com/media/4877d6_a01acbcd8df24c9ba467e564706e34f9~mv2.jpg" },
};
const getLogo = name => TEAM_META[name]?.logo || FC_LOGO;

const DEFAULT_CATS   = ["Harmony","Presentation","Repertoire","Rhythm","Diction"];
const POS_SOCCER     = ["Goalkeeper","Defender","Midfielder","Striker","Captain"];
const POS_NETBALL    = ["Goal Shooter","Goal Attack","Wing Attack","Centre","Wing Defence","Goal Defence","Goal Keeper","Captain"];
const VOICES         = ["Soprano","Alto","Tenor","Bass"];
const ORG_PIN        = "1234";
const LOCAL_KEY      = "fc_v7_local"; // for votes, viewers, judges, teamAdmins
const uid            = () => Math.random().toString(36).slice(2,9);

// ─── LOCAL-ONLY STATE (judges, team admins, votes — device-specific) ──────────
function loadLocal() {
  // Clear old localStorage keys from v5/v6 that might cause conflicts
  ["fc_app_state_v5","fc_v6_state","fc_v7_state"].forEach(k=>{
    try { localStorage.removeItem(k); } catch(e){}
  });
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}; } catch(e) { return {}; }
}
function saveLocal(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch(e) {}
}

// ─── PWA ──────────────────────────────────────────────────────────────────────
function injectPWA() {
  if (document.getElementById("fc-pwa")) return;
  const m = {name:"Founder's Cup — CHG",short_name:"Founders Cup",start_url:"/",display:"standalone",background_color:"#0d1b3e",theme_color:"#0d1b3e",orientation:"portrait-primary",icons:[{src:FC_LOGO,sizes:"512x512",type:"image/jpeg",purpose:"any maskable"}]};
  const l = Object.assign(document.createElement("link"),{id:"fc-pwa",rel:"manifest",href:URL.createObjectURL(new Blob([JSON.stringify(m)],{type:"application/json"}))});
  document.head.appendChild(l);
  [["apple-touch-icon",null,FC_LOGO],[null,"apple-mobile-web-app-capable","yes"],[null,"apple-mobile-web-app-title","Founders Cup"],[null,"theme-color","#0d1b3e"]].forEach(([rel,name,val])=>{const e=rel?document.createElement("link"):document.createElement("meta");rel?Object.assign(e,{rel,href:val}):Object.assign(e,{name,content:val});document.head.appendChild(e);});
}
async function requestPush(){if(!("Notification"in window))return false;return(await Notification.requestPermission())==="granted";}
function pushNotify(title,body){if(!("Notification"in window)||Notification.permission!=="granted")return;try{new Notification(title,{body,icon:FC_LOGO,tag:"fc"});}catch(e){}}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({name,size=22,stroke="currentColor",sw=1.5})=>{
  const p={fill:"none",stroke,strokeWidth:sw,strokeLinecap:"round",strokeLinejoin:"round"};
  const v={width:size,height:size,display:"block",flexShrink:0};
  const d={
    home:   <><path {...p} d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path {...p} d="M9 21V12h6v9"/></>,
    soccer: <><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 3l1.5 3.5h-3L12 3zM5 8l2 1-1 3-2.5-1.5L5 8zM19 8l-2 1 1 3 2.5-1.5L19 8z"/></>,
    netball:<><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 3c2.5 4 2.5 14 0 18M3 12c4-2.5 14-2.5 18 0M5.5 6.5c2 2 11 2 13 0M5.5 17.5c2-2 11-2 13 0"/></>,
    choir:  <><path {...p} d="M9 18V5l12-2v13"/><circle {...p} cx="6" cy="18" r="3"/><circle {...p} cx="18" cy="16" r="3"/></>,
    news:   <><path {...p} d="M18 8a6 6 0 010 8M22 5a10 10 0 010 14M3 10v4a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1z"/></>,
    admin:  <><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    trophy: <><path {...p} d="M8 21h8M12 17v4M5 3H3a2 2 0 000 4c0 3 2 5 4 6M19 3h2a2 2 0 010 4c0 3-2 5-4 6"/><path {...p} d="M8 3h8v8a4 4 0 01-8 0V3z"/></>,
    plus:   <><path {...p} d="M12 5v14M5 12h14"/></>,
    check:  <><path {...p} d="M20 6L9 17l-5-5"/></>,
    lock:   <><rect {...p} x="3" y="11" width="18" height="11" rx="2"/><path {...p} d="M7 11V7a5 5 0 0110 0v4"/></>,
    eye:    <><path {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle {...p} cx="12" cy="12" r="3"/></>,
    eyeoff: <><path {...p} d="M17.9 17.9A10.9 10.9 0 0112 20C5 20 1 12 1 12a18 18 0 015.1-6.9M9.9 4.2A10.5 10.5 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.1 3.1M1 1l22 22"/><path {...p} d="M14.1 14.1a3 3 0 01-4.2-4.2"/></>,
    trash:  <><path {...p} d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path {...p} d="M10 11v6M14 11v6"/></>,
    publish:<><path {...p} d="M12 19V5M5 12l7-7 7 7"/></>,
    bracket:<><path {...p} d="M3 6h4v12H3M17 6h4v12h-4M7 12h10"/></>,
    users:  <><circle {...p} cx="9" cy="8" r="3"/><path {...p} d="M2 20c0-3 2.7-5.5 7-5.5"/><circle {...p} cx="17" cy="8" r="3"/><path {...p} d="M22 20c0-3-2.7-5.5-7-5.5s-7 2.5-7 5.5"/></>,
    mic:    <><rect {...p} x="9" y="2" width="6" height="12" rx="3"/><path {...p} d="M5 10a7 7 0 0014 0M12 19v3M8 22h8"/></>,
    vote:   <><path {...p} d="M9 11l3 3L22 4"/><path {...p} d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    bell:   <><path {...p} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></>,
    x:      <><path {...p} d="M18 6L6 18M6 6l12 12"/></>,
    tag:    <><path {...p} d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line {...p} x1="7" y1="7" x2="7.01" y2="7"/></>,
    shield: <><path {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    cal:    <><rect {...p} x="3" y="4" width="18" height="18" rx="2"/><path {...p} d="M16 2v4M8 2v4M3 10h18"/></>,
    signal: <><path {...p} d="M2 20h.01M7 20v-4M12 20V10M17 20V4M22 20v-8"/></>,
    refresh:<><path {...p} d="M23 4v6h-6M1 20v-6h6"/><path {...p} d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>,
    download:<><path {...p} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></>,
  };
  return <svg style={v} viewBox="0 0 24 24">{d[name]||d.signal}</svg>;
};

// ─── TEAM LOGO COMPONENT ─────────────────────────────────────────────────────
const TL = ({name,size=48,style={}})=>(
  <img src={getLogo(name)} alt={name||""} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(240,180,41,.3)",flexShrink:0,...style}} onError={e=>{e.target.style.opacity=".2";}}/>
);

// ─── LOADING SPINNER ─────────────────────────────────────────────────────────
const Spinner = ({size=32})=>(
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:32}}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="rgba(240,180,41,.2)" strokeWidth="2"/>
      <path d="M12 2a10 10 0 0110 10" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{animation:"spin .8s linear infinite"}}/>
    </svg>
    <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
  </div>
);

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{
  --navy:#0d1b3e;--navy2:#122044;--navy3:#1a2a54;
  --gold:#f0b429;--gold2:#ffd166;--gold-dim:rgba(240,180,41,.12);--gold-border:rgba(240,180,41,.28);
  --muted:#8899cc;--muted2:#4a5a8a;
  --border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.14);
  --nav-h:64px;--safe-b:env(safe-area-inset-bottom,0px);
}
body{background:var(--navy);color:#fff;font-family:'Barlow',sans-serif;min-height:100vh;overscroll-behavior:none;background-image:radial-gradient(ellipse at 20% 0%,rgba(240,180,41,.04) 0%,transparent 50%);}
::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}
.app{display:flex;flex-direction:column;min-height:100vh;max-width:480px;margin:0 auto;}
.app-body{flex:1;overflow-y:auto;padding-bottom:calc(var(--nav-h) + var(--safe-b) + 8px);}

/* SPLASH */
.splash{position:fixed;inset:0;z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;background:var(--navy);background-image:radial-gradient(ellipse at 50% 35%,rgba(240,180,41,.13) 0%,transparent 65%);}
.sp-rings{position:relative;display:flex;align-items:center;justify-content:center;margin-bottom:28px;}
.sp-ring{position:absolute;border-radius:50%;border:1px solid rgba(240,180,41,.15);}
.sp-r1{width:220px;height:220px;animation:rp 2.4s ease-in-out infinite;}
.sp-r2{width:270px;height:270px;animation:rp 2.4s ease-in-out infinite .4s;}
.sp-r3{width:320px;height:320px;animation:rp 2.4s ease-in-out infinite .8s;}
.sp-logo{width:160px;height:160px;border-radius:50%;object-fit:cover;border:3px solid var(--gold);box-shadow:0 0 60px rgba(240,180,41,.45);position:relative;z-index:1;animation:li 1.1s cubic-bezier(.34,1.56,.64,1) both;}
.sp-title{font-family:'Barlow Condensed',sans-serif;font-size:46px;font-weight:900;letter-spacing:5px;text-transform:uppercase;line-height:1;animation:su .8s ease .6s both;}
.sp-title em{color:var(--gold);font-style:normal;}
.sp-sub{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--muted);margin-top:7px;animation:su .8s ease .8s both;}
.sp-bar{height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:20px auto 0;animation:bg 1s ease 1s both;}
.sp-hint{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.25);margin-top:22px;animation:su .6s ease 1.4s both;}
.sp-dots{display:flex;gap:8px;margin-top:14px;animation:su .5s ease 1.6s both;}
.sp-dot{width:6px;height:6px;border-radius:50%;background:rgba(240,180,41,.35);animation:db 1.6s ease-in-out infinite;}
.sp-dot:nth-child(2){animation-delay:.2s;}.sp-dot:nth-child(3){animation-delay:.4s;}
@keyframes li{from{opacity:0;transform:scale(.2) rotate(-20deg);}60%{transform:scale(1.1) rotate(4deg);}to{opacity:1;transform:scale(1) rotate(0);}}
@keyframes su{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
@keyframes bg{from{width:0;opacity:0;}to{width:80px;opacity:1;}}
@keyframes rp{0%,100%{transform:scale(1);opacity:.5;}50%{transform:scale(1.06);opacity:.15;}}
@keyframes db{0%,100%{transform:translateY(0);opacity:.4;}50%{transform:translateY(-5px);opacity:1;}}

/* PAGE ENTER */
.pw{animation:pe .42s cubic-bezier(.25,.46,.45,.94) both;}
@keyframes pe{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes fu{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
.fu{animation:fu .38s ease both;}
.fu1{animation-delay:.05s;}.fu2{animation-delay:.1s;}.fu3{animation-delay:.15s;}.fu4{animation-delay:.2s;}.fu5{animation-delay:.25s;}.fu6{animation-delay:.3s;}

/* HEADER */
.hdr{background:rgba(13,27,62,.96);border-bottom:2px solid var(--gold);padding:11px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;backdrop-filter:blur(16px);}
.hdr-brand{display:flex;align-items:center;gap:10px;}
.hdr-logo{width:34px;height:34px;border-radius:50%;object-fit:cover;border:1.5px solid var(--gold);}
.h-title{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:800;letter-spacing:2px;color:var(--gold);text-transform:uppercase;line-height:1;}
.h-sub{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:1px;}
.adm-btn{display:flex;align-items:center;gap:6px;padding:7px 12px;border:1px solid var(--gold-border);border-radius:20px;background:var(--gold-dim);color:var(--gold);font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.adm-btn.on{background:var(--gold);color:var(--navy);}
.rp{padding:4px 10px;border:1px solid var(--gold-border);border-radius:20px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);background:var(--gold-dim);font-family:'Barlow Condensed',sans-serif;font-weight:700;}

/* NAV */
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:rgba(13,27,62,.97);border-top:1px solid var(--gold-border);display:flex;padding-bottom:var(--safe-b);z-index:100;height:var(--nav-h);backdrop-filter:blur(20px);}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;padding:6px 2px;color:var(--muted2);transition:color .2s;border:none;background:none;position:relative;}
.ni.on{color:var(--gold);}
.ni.on::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:28px;height:2px;background:var(--gold);border-radius:0 0 3px 3px;}
.nl{font-size:9px;letter-spacing:.8px;text-transform:uppercase;font-weight:700;font-family:'Barlow Condensed',sans-serif;}
.nbadge{position:absolute;top:5px;right:calc(50% - 17px);min-width:17px;height:17px;background:#e53e3e;border-radius:9px;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid var(--navy);animation:badgepop .35s cubic-bezier(.34,1.56,.64,1);}
@keyframes badgepop{from{transform:scale(0);}to{transform:scale(1);}}

/* LIVE DOT */
.live-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#38a169;margin-right:6px;animation:pulse 2s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);}}

/* PAGE */
.pg{padding:0 0 16px;}
.pgb{background:linear-gradient(160deg,var(--navy3) 0%,var(--navy2) 100%);border-bottom:1px solid var(--border);padding:20px 18px 16px;position:relative;overflow:hidden;}
.pgb::after{content:'';position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,var(--gold-dim) 0%,transparent 70%);pointer-events:none;}
.pgl{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:3px;font-weight:700;font-family:'Barlow Condensed',sans-serif;}
.pgt{font-family:'Barlow Condensed',sans-serif;font-size:34px;font-weight:900;letter-spacing:2px;text-transform:uppercase;line-height:1;}
.pgt .acc{color:var(--gold);}
.pgs{font-size:12px;color:var(--muted);margin-top:5px;}
.inner{padding:16px 18px 4px;}

/* HERO */
.hero{background:linear-gradient(180deg,var(--navy3) 0%,var(--navy) 100%);padding:26px 20px 20px;text-align:center;border-bottom:1px solid var(--border);position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(240,180,41,.1) 0%,transparent 60%);pointer-events:none;}
.hero-logo{width:86px;height:86px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);box-shadow:0 0 30px rgba(240,180,41,.28);margin-bottom:12px;position:relative;animation:hli .7s cubic-bezier(.34,1.56,.64,1) .1s both;}
@keyframes hli{from{opacity:0;transform:scale(.6);}to{opacity:1;transform:scale(1);}}
.hero-title{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:900;letter-spacing:3px;text-transform:uppercase;line-height:1;}
.hero-title em{color:var(--gold);font-style:normal;}
.hero-sub{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-top:6px;font-family:'Barlow Condensed',sans-serif;}

/* CARDS */
.card{background:var(--navy3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;}
.card-gold{border-color:var(--gold-border);background:linear-gradient(135deg,rgba(240,180,41,.07) 0%,var(--navy3) 60%);}
.card-sm{padding:12px 14px;}

/* STATS */
.srow{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.sbox{background:var(--navy3);border:1px solid var(--border);border-radius:10px;padding:12px 6px;text-align:center;}
.sn{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:700;color:var(--gold);line-height:1;}
.sl{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-top:3px;font-family:'Barlow Condensed',sans-serif;}

/* TEAM GRID */
.tgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;}
.tgi{display:flex;flex-direction:column;align-items:center;gap:6px;}
.tgi-logo{width:54px;height:54px;border-radius:50%;object-fit:cover;border:2px solid var(--border2);}
.tgi-name{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;text-align:center;line-height:1.2;}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 16px;border-radius:8px;border:none;font-family:'Barlow',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;width:100%;letter-spacing:.5px;text-transform:uppercase;}
.btn:active{transform:scale(.97);}
.bp{background:var(--gold);color:var(--navy);}
.bp:hover{background:var(--gold2);}
.bo{background:transparent;border:1px solid var(--border2);color:#fff;}
.bo:hover{border-color:var(--gold);color:var(--gold);}
.bd{background:rgba(229,62,62,.12);border:1px solid rgba(229,62,62,.25);color:#fc8181;}
.bg{background:rgba(56,161,105,.1);border:1px solid rgba(56,161,105,.25);color:#68d391;}
.bsm{padding:8px 13px;font-size:11px;border-radius:6px;width:auto;}
.brow{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}

/* FORMS */
.fg{margin-bottom:13px;}
.fl{display:block;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;font-family:'Barlow Condensed',sans-serif;font-weight:700;}
.fi{width:100%;padding:11px 13px;background:rgba(0,0,0,.25);border:1px solid var(--border);border-radius:8px;color:#fff;font-family:'Barlow',sans-serif;font-size:14px;transition:border-color .2s;-webkit-appearance:none;}
.fi:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(240,180,41,.1);}
.fi::placeholder{color:var(--muted2);}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.fsec{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin:16px 0 10px;font-weight:700;padding-bottom:5px;border-bottom:1px solid var(--gold-border);}

/* SECTION */
.sechd{display:flex;align-items:center;justify-content:space-between;margin:16px 0 10px;}
.secht{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);font-weight:700;}
.gline{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.gline::before,.gline::after{content:'';flex:1;height:1px;background:var(--border);}
.gline-t{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);font-weight:700;white-space:nowrap;}

/* TAGS */
.tag{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;font-family:'Barlow Condensed',sans-serif;}
.tg{background:var(--gold-dim);color:var(--gold);border:1px solid var(--gold-border);}
.tgn{background:rgba(56,161,105,.1);color:#68d391;border:1px solid rgba(56,161,105,.2);}
.tgr{background:rgba(229,62,62,.1);color:#fc8181;border:1px solid rgba(229,62,62,.2);}
.tgm{background:rgba(255,255,255,.05);color:var(--muted);border:1px solid var(--border);}

/* BRACKET */
.bscroll{overflow-x:auto;padding:0 0 16px;}
.binner{display:flex;gap:14px;min-width:max-content;}
.bcol{display:flex;flex-direction:column;gap:12px;width:170px;}
.brlbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:2px;font-weight:700;}
.mc{background:var(--navy3);border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.mt{display:flex;align-items:center;gap:7px;padding:9px 11px;border-bottom:1px solid var(--border);}
.mt:last-of-type{border-bottom:none;}
.mt.win{background:rgba(240,180,41,.1);color:var(--gold);}
.mt.los{color:var(--muted2);}
.mtn{flex:1;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;}
.msc{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;color:var(--gold);min-width:22px;text-align:right;}
.msc.dim{color:var(--muted2);}
.mfoot{padding:5px 11px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);background:rgba(0,0,0,.2);text-align:center;font-family:'Barlow Condensed',sans-serif;}

/* CHOIR */
.ccard{background:var(--navy3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;position:relative;}
.sbr{display:flex;align-items:center;gap:9px;margin-bottom:6px;}
.sbl{font-size:11px;color:var(--muted);width:84px;flex-shrink:0;font-family:'Barlow Condensed',sans-serif;font-weight:600;}
.sbt{flex:1;height:3px;background:rgba(255,255,255,.07);border-radius:2px;}
.sbf{height:100%;background:var(--gold);border-radius:2px;transition:width .6s ease;}
.sbv{font-family:'Barlow Condensed',sans-serif;font-size:12px;color:var(--gold);font-weight:700;width:26px;text-align:right;flex-shrink:0;}
.drow{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);}
.drow:last-child{border-bottom:none;}
.dlbl{font-size:13px;flex:1;font-weight:500;}
.dots{display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end;}
.dot{width:25px;height:25px;border-radius:50%;border:1px solid var(--muted2);background:transparent;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;color:var(--muted);display:flex;align-items:center;justify-content:center;transition:all .15s;}
.dot:hover{border-color:var(--gold);color:var(--gold);}
.dot.on{background:var(--gold);border-color:var(--gold);color:var(--navy);}

/* CHAMP */
.champ{position:relative;overflow:hidden;background:linear-gradient(135deg,#1a2800 0%,#0d1400 50%,#1a2800 100%);border:1px solid var(--gold-border);border-radius:14px;padding:20px;text-align:center;margin-bottom:12px;}
.champ::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(240,180,41,.15) 0%,transparent 60%);}
.cl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);opacity:.8;margin-bottom:6px;position:relative;font-weight:700;}
.cn{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:900;color:var(--gold);position:relative;letter-spacing:1px;text-transform:uppercase;line-height:1.1;}
.cs{font-size:11px;color:var(--muted);margin-top:5px;position:relative;}
.clogo{width:68px;height:68px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);margin-bottom:10px;box-shadow:0 0 20px rgba(240,180,41,.3);position:relative;}

/* ANN */
.ann{padding:14px 14px 14px 16px;background:var(--navy3);border-left:3px solid var(--gold);border-radius:0 10px 10px 0;margin-bottom:10px;display:flex;gap:10px;}
.ann.urg{border-left-color:#fc8181;background:rgba(229,62,62,.04);}
.ann-bw{flex:1;}
.ann-time{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:5px;display:flex;align-items:center;gap:6px;}
.ann-body{font-size:14px;line-height:1.6;}

/* PLAYER */
.pcard{display:flex;align-items:center;gap:11px;padding:10px 13px;background:rgba(0,0,0,.2);border:1px solid var(--border);border-radius:8px;margin-bottom:7px;}
.pav{width:36px;height:36px;border-radius:50%;background:var(--navy3);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;color:var(--muted);flex-shrink:0;}

/* USER ROW */
.urow{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--navy3);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;}
.uav{width:38px;height:38px;border-radius:50%;background:var(--gold-dim);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:var(--gold);flex-shrink:0;}

/* TABS */
.tabs{display:flex;border-bottom:1px solid var(--border);padding:0 18px;overflow-x:auto;}
.tab{padding:10px 13px;background:none;border:none;border-bottom:2px solid transparent;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;color:var(--muted);white-space:nowrap;transition:color .2s,border-color .2s;}
.tab.on{color:var(--gold);border-bottom-color:var(--gold);}

/* EMPTY */
.empty{display:flex;flex-direction:column;align-items:center;padding:48px 24px;text-align:center;gap:12px;}
.eti{color:rgba(255,255,255,.09);}
.ett{font-size:13px;color:var(--muted);line-height:1.6;max-width:240px;}

/* TOAST */
.toast{position:fixed;top:72px;left:50%;transform:translateX(-50%);background:var(--navy3);border:1px solid var(--gold-border);border-radius:8px;padding:10px 18px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gold);z-index:999;white-space:nowrap;pointer-events:none;animation:toastin .25s ease;}
@keyframes toastin{from{opacity:0;transform:translateX(-50%) translateY(-8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

/* OVERLAY / MODAL */
.ov{position:fixed;inset:0;background:rgba(5,10,25,.9);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(8px);animation:fdi .2s ease;}
.ms{background:var(--navy2);border-radius:16px;border:1px solid var(--border2);width:100%;max-width:400px;padding:28px 22px;max-height:88vh;overflow-y:auto;}
.mh{width:36px;height:3px;background:var(--border2);border-radius:3px;margin:0 auto 20px;}
.mt2{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;color:#fff;}
.msub{font-size:13px;color:var(--muted);margin-bottom:20px;}
@keyframes fdi{from{opacity:0;}to{opacity:1;}}

/* PIN */
.pino{position:fixed;inset:0;background:rgba(5,10,25,.92);z-index:300;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(10px);animation:fdi .2s ease;}
.pinb{background:var(--navy2);border:1px solid var(--border2);border-radius:16px;padding:28px 24px;width:100%;max-width:320px;text-align:center;}
.pinf{width:100%;padding:14px;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:10px;color:var(--gold);font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:700;letter-spacing:12px;text-align:center;margin-bottom:12px;transition:border-color .2s;}
.pinf:focus{outline:none;border-color:var(--gold);}

/* PWA BANNER */
.pwab{margin:0 18px 14px;padding:14px 16px;background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:10px;display:flex;align-items:center;gap:12px;}
.pwal{width:40px;height:40px;border-radius:10px;object-fit:cover;flex-shrink:0;}

/* SCORE ENTRY */
.svs{display:flex;align-items:center;margin-bottom:14px;}
.ss{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;}
.ssn{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;text-align:center;}
.ssp{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:var(--muted);letter-spacing:2px;padding:0 6px;margin-top:20px;}

/* MISC */
.since{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:4px;background:rgba(240,180,41,.06);border:1px solid var(--gold-border);font-size:11px;color:var(--muted);}
.jhdr{background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
hr{border:none;border-top:1px solid var(--border);margin:14px 0;}

/* VOTE */
.vc{background:var(--navy3);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:12px;}
.vmh{padding:12px 14px;background:rgba(240,180,41,.06);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.vpr{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;}
.vpr:last-child{border-bottom:none;}
.vrad{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--muted2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;}
.vrad.on{border-color:var(--gold);background:var(--gold);}
.vbw{display:flex;align-items:center;gap:6px;min-width:70px;}
.vbt{flex:1;height:3px;background:rgba(255,255,255,.08);border-radius:2px;}
.vbf{height:100%;background:var(--gold);border-radius:2px;transition:width .4s ease;}
.vbc{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:var(--gold);min-width:22px;text-align:right;}
`;

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useToast() {
  const [msg,setMsg]=useState(null);
  const show=m=>{setMsg(m);setTimeout(()=>setMsg(null),2400);};
  return [msg?<div className="toast">{msg}</div>:null,show];
}

function usePinDialog() {
  const [cfg,setCfg]=useState(null);
  const ask=(title,desc,onOk)=>setCfg({title,desc,onOk});
  const el=cfg?(
    <div className="pino">
      <div className="pinb">
        <div style={{marginBottom:12,color:"var(--gold)"}}><Icon name="lock" size={28}/></div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{cfg.title||"Confirm"}</div>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:20,lineHeight:1.5}}>{cfg.desc||"Enter organizer PIN."}</div>
        <PinInput onOk={v=>{if(v===ORG_PIN){cfg.onOk();setCfg(null);}else alert("Incorrect PIN.");}} onCancel={()=>setCfg(null)}/>
      </div>
    </div>
  ):null;
  return [el,ask];
}

function PinInput({onOk,onCancel}) {
  const [pin,setPin]=useState("");
  return (
    <>
      <input className="pinf" type="password" placeholder="····" autoFocus value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onOk(pin)}/>
      <button className="btn bd" style={{marginBottom:8}} onClick={()=>onOk(pin)}><Icon name="check" size={14}/> Confirm</button>
      <button className="btn bo" onClick={onCancel}>Cancel</button>
    </>
  );
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function Splash({onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,3400);return()=>clearTimeout(t);},[]);
  return (
    <div className="splash" onClick={onDone}>
      <div className="sp-rings">
        <div className="sp-ring sp-r1"/><div className="sp-ring sp-r2"/><div className="sp-ring sp-r3"/>
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
function AdminModal({local,onLogin,onClose}) {
  const [step,setStep]=useState("role");
  const [role,setRole]=useState(null);
  const [uid2,setUid2]=useState("");
  const [pin,setPin]=useState("");
  const [err,setErr]=useState("");
  const roles=[
    {id:"organizer",label:"Tournament Organizer",desc:"Full control",icon:"trophy"},
    {id:"judge",    label:"Choir Judge",          desc:"Score on your tablet",icon:"mic"},
    {id:"teamadmin",label:"Team Admin",           desc:"Manage your team",icon:"users"},
  ];
  const users=role==="judge"?(local.judges||[]):(local.teamAdmins||[]);
  const attempt=()=>{
    if(role==="organizer"){if(pin!==ORG_PIN){setErr("Incorrect PIN.");return;}onLogin({id:"organizer",name:"Organizer",role:"organizer"});}
    else{const u=users.find(x=>x.id===uid2&&x.pin===pin);if(!u){setErr("Incorrect PIN.");return;}onLogin({...u,role});}
  };
  return (
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="ms">
        <div className="mh"/>
        <div className="mt2">Admin Login</div>
        <div className="msub">Select your role</div>
        {step==="role"&&roles.map(r=>(
          <button key={r.id} onClick={()=>{setRole(r.id);setUid2("");setPin("");setErr("");setStep("pin");}}
            style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,.04)",border:"1px solid var(--border)",borderRadius:10,marginBottom:10,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12,color:"#fff",transition:"border-color .2s"}}
            onMouseOver={e=>e.currentTarget.style.borderColor="var(--gold)"}
            onMouseOut={e=>e.currentTarget.style.borderColor="var(--border)"}>
            <div style={{width:40,height:40,borderRadius:9,background:"var(--gold-dim)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--gold)"}}><Icon name={r.icon} size={18}/></div>
            <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,textTransform:"uppercase"}}>{r.label}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{r.desc}</div></div>
          </button>
        ))}
        {step==="pin"&&(
          <div>
            <button onClick={()=>setStep("role")} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:11,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",marginBottom:16,fontWeight:700}}>← Back</button>
            {users.length>0&&<div className="fg"><label className="fl">Your Profile</label><select className="fi" value={uid2} onChange={e=>setUid2(e.target.value)}><option value="">— Select —</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}{u.teamId?" — "+u.teamId:""}</option>)}</select></div>}
            {users.length===0&&role!=="organizer"&&<div style={{fontSize:13,color:"var(--muted)",padding:"12px",background:"rgba(255,255,255,.03)",borderRadius:8,border:"1px solid var(--border)",marginBottom:14,lineHeight:1.5}}>No {role==="judge"?"judges":"team admins"} set up yet.</div>}
            {(role==="organizer"||(uid2&&role!=="organizer"))&&(
              <>{err&&<div style={{fontSize:12,color:"#fc8181",textAlign:"center",marginBottom:10}}>{err}</div>}
              {err&&<div style={{fontSize:12,color:"#fc8181",textAlign:"center",marginBottom:10}}>{err}</div>}
              <div className="fg"><label className="fl">PIN</label><input className="fi" type="password" placeholder="····" style={{fontSize:24,letterSpacing:10,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif"}} value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()}/></div>
              <button className="btn bp" onClick={attempt}><Icon name="check" size={15}/> Enter</button></>
            )}
            <div style={{marginTop:16,textAlign:"center",fontSize:11,color:"var(--muted)",cursor:"pointer",letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={onClose}><Icon name="eye" size={13}/> Continue as spectator</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PWA BANNER ───────────────────────────────────────────────────────────────
function PWABanner() {
  const [prompt,setPrompt]=useState(null);
  const [show,setShow]=useState(false);
  const [gone,setGone]=useState(()=>!!localStorage.getItem("fc_pwa_gone"));
  useEffect(()=>{const h=e=>{e.preventDefault();setPrompt(e);setShow(true);};window.addEventListener("beforeinstallprompt",h);return()=>window.removeEventListener("beforeinstallprompt",h);},[]);
  if(!show||gone)return null;
  const install=async()=>{if(!prompt)return;prompt.prompt();const{outcome}=await prompt.userChoice;setShow(false);if(outcome==="accepted")localStorage.setItem("fc_pwa_gone","1");};
  return (
    <div className="pwab fu">
      <img src={FC_LOGO} className="pwal" alt=""/>
      <div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:"var(--gold)"}}>Add to Home Screen</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Install with the Founders Cup logo as your icon</div></div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        <button className="btn bp bsm" onClick={install}><Icon name="download" size={12}/> Install</button>
        <button className="btn bo bsm" onClick={()=>{setShow(false);setGone(true);localStorage.setItem("fc_pwa_gone","1");}}>Later</button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function FoundersCup() {
  const [splash,setSplash]=useState(true);
  const [adminModal,setAdminModal]=useState(false);
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("home");
  const [toast,showToast]=useToast();
  const [pinEl,askPin]=usePinDialog();
  const [local,setLocal]=useState(loadLocal);
  const [lastSeen,setLastSeen]=useState(()=>parseInt(localStorage.getItem("fc_last_seen")||"0"));

  // Realtime: announcements badge counter
  const [announcements,setAnnouncements]=useState([]);
  const [unread,setUnread]=useState(0);

  useEffect(()=>{injectPWA();},[]);

  // Refresh data when user switches back to the tab (fixes desktop delay)
  useEffect(()=>{
    const onFocus = () => {
      setTimeout(()=>loadAnnouncements(), 200);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", ()=>{
      if(document.visibilityState === "visible") loadAnnouncements();
    });
    return()=>{
      window.removeEventListener("focus", onFocus);
    };
  },[]);
  useEffect(()=>{saveLocal(local);},[local]);

  // Load announcements + subscribe to new ones
  useEffect(()=>{
    // Small delay for mobile browsers to fully initialize
    setTimeout(()=>loadAnnouncements(), 300);
    const ch=supabase.channel("ann_realtime")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"fc_announcements"},payload=>{
        setAnnouncements(a=>[payload.new,...a]);
        setUnread(u=>u+1);
        if(Notification.permission==="granted") pushNotify(payload.new.urgent?"🚨 Founders Cup — Urgent":"📢 Founders Cup",payload.new.body);
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"fc_announcements"},payload=>{
        setAnnouncements(a=>a.filter(x=>x.id!==payload.old.id));
      })
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[]);

  async function loadAnnouncements(retries=3) {
    for(let i=0;i<retries;i++){
      try {
        const {data, error}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
        if(error) throw error;
        if(!data) throw new Error("No active event");
        const eid=data.id;
        const {data:anns, error:ae}=await supabase.from("fc_announcements").select("*").eq("event_id",eid).order("created_at",{ascending:false});
        if(ae) throw ae;
        setAnnouncements(anns||[]);
        const newCount=(anns||[]).filter(a=>new Date(a.created_at).getTime()>lastSeen).length;
        setUnread(newCount);
        return; // success
      } catch(e){
        console.warn("Announcement load attempt "+(i+1)+" failed:",e.message);
        if(i<retries-1) await new Promise(r=>setTimeout(r,1500*(i+1)));
      }
    }
  }

  const handleTab=t=>{
    setTab(t);
    if(t==="news"){const now=Date.now();setLastSeen(now);localStorage.setItem("fc_last_seen",now);setUnread(0);}
  };

  const role=user?.role||"spectator";
  const isOrg=role==="organizer";

  const navItems=[
    {id:"home",   lbl:"Home",   icon:"home"},
    {id:"soccer", lbl:"Soccer", icon:"soccer"},
    {id:"netball",lbl:"Netball",icon:"netball"},
    {id:"choir",  lbl:"Choir",  icon:"choir"},
    {id:"vote",   lbl:"Vote",   icon:"vote"},
    {id:"news",   lbl:"News",   icon:"news",badge:unread},
    ...(isOrg?[{id:"admin",lbl:"Admin",icon:"admin"}]:[]),
  ];

  if(splash)return <><style>{CSS}</style><Splash onDone={()=>setSplash(false)}/></>;

  return (
    <>
      <style>{CSS}</style>
      {toast}{pinEl}
      {adminModal&&<AdminModal local={local} onLogin={u=>{setUser(u);setAdminModal(false);showToast(`Welcome, ${u.name}`);if(u.role==="organizer")setTab("admin");else if(u.role==="judge")setTab("choir");else setTab("soccer");}} onClose={()=>setAdminModal(false)}/>}
      <div className="app">
        <header className="hdr">
          <div className="hdr-brand">
            <img src={FC_LOGO} className="hdr-logo" alt=""/>
            <div><div className="h-title">Founder's Cup</div><div className="h-sub">Church of the Holy Ghost</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {user?(<><span className="rp">{user.name}</span><button className="adm-btn on" onClick={()=>{setUser(null);setTab("home");showToast("Signed out");}}><Icon name="lock" size={13}/> Out</button></>):(<button className="adm-btn" onClick={()=>setAdminModal(true)}><Icon name="admin" size={13}/> Admin</button>)}
          </div>
        </header>
        <div className="app-body">
          {tab==="home"   &&<HomePage announcements={announcements}/>}
          {tab==="soccer" &&<SportPage sport="soccer"  role={role} user={user} local={local} askPin={askPin} showToast={showToast}/>}
          {tab==="netball"&&<SportPage sport="netball" role={role} user={user} local={local} askPin={askPin} showToast={showToast}/>}
          {tab==="choir"  &&<ChoirPage role={role} user={user} local={local} setLocal={setLocal} askPin={askPin} showToast={showToast}/>}
          {tab==="vote"   &&<VotePage  role={role} user={user} local={local} setLocal={setLocal} showToast={showToast}/>}
          {tab==="news"   &&<NewsPage  role={role} announcements={announcements} onRefresh={loadAnnouncements} askPin={askPin} showToast={showToast}/>}
          {tab==="admin"  &&isOrg&&<AdminPage local={local} setLocal={setLocal} askPin={askPin} showToast={showToast}/>}
        </div>
        <nav className="nav">
          {navItems.map(n=>(
            <button key={n.id} className={`ni ${tab===n.id?"on":""}`} onClick={()=>handleTab(n.id)}>
              {n.badge>0&&<span className="nbadge">{n.badge>9?"9+":n.badge}</span>}
              <Icon name={n.icon} size={20} sw={tab===n.id?1.8:1.3} stroke={tab===n.id?"var(--gold)":"currentColor"}/>
              <span className="nl">{n.lbl}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({announcements}) {
  const [champions,setChampions]=useState([]);
  const [teams,setTeams]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    async function load(){
      try{
        const {data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
        const eid=ev.id;
        const[{data:sc},{data:nc},{data:cc},{data:st},{data:nt}]=await Promise.all([
          supabase.from("fc_matches").select("*,winner:winner_id(name)").eq("event_id",eid).eq("competition","soccer").eq("published",true),
          supabase.from("fc_matches").select("*,winner:winner_id(name)").eq("event_id",eid).eq("competition","netball").eq("published",true),
          supabase.from("fc_choir_leaderboard").select("*").eq("event_id",eid),
          supabase.from("fc_teams").select("name").eq("event_id",eid).eq("competition","soccer"),
          supabase.from("fc_teams").select("name").eq("event_id",eid).eq("competition","netball"),
        ]);
        const champs=[];
        const findChamp=(matches,sport)=>{if(!matches?.length)return;const maxR=Math.max(...matches.map(m=>m.round));const f=matches.find(m=>m.round===maxR&&m.winner_id);if(f)champs.push({sport,name:f.winner?.name});};
        findChamp(sc,"Soccer");findChamp(nc,"Netball");
        const pf=await supabase.from("fc_publish_flags").select("*").eq("event_id",eid).eq("competition","choir").eq("published",true).maybeSingle();
        if(pf.data&&cc?.length)champs.push({sport:"Choir",name:cc[0].group_name});
        setChampions(champs);
        setTeams(st?.map(t=>t.name)||[]);
      }catch(e){console.warn("Home load error",e);}
      setLoading(false);
    }
    load();
  },[]);

  const allTeamNames=["Durban Central","Wakanda","Cape Town","Swacunda","Mighty","Zululand","Mlungwane","Durban South"];

  return (
    <div className="pw">
      <div className="hero">
        <img src={FC_LOGO} className="hero-logo" alt=""/>
        <div className="hero-title fu fu1">Founder's <em>Cup</em></div>
        <div className="hero-sub fu fu2">Church of the Holy Ghost · Annual Championship</div>
      </div>
      <PWABanner/>
      <div className="inner">
        <div className="sechd fu fu1"><span className="secht">The 8 Teams</span></div>
        <div className="tgrid fu fu2">
          {allTeamNames.map((name,i)=>(
            <div key={name} className="tgi fu" style={{animationDelay:`${.1+i*.04}s`}}>
              <img src={getLogo(name)} className="tgi-logo" alt={name} onError={e=>e.target.style.opacity=".2"}/>
              <div className="tgi-name">{name}</div>
            </div>
          ))}
        </div>
        {champions.length>0&&(
          <><div className="gline fu fu3"><span className="gline-t">Champions</span></div>
          {champions.map(c=>(
            <div key={c.sport} className="champ fu">
              <img src={getLogo(c.name)} className="clogo" alt={c.name}/>
              <div className="cl">{c.sport} Champion</div>
              <div className="cn">{c.name}</div>
            </div>
          ))}</>
        )}
        {announcements.slice(0,2).length>0&&(
          <><div className="sechd fu fu4"><span className="secht">Latest News</span></div>
          {announcements.slice(0,2).map((a,i)=>(
            <div key={a.id} className={`ann fu ${a.urgent?"urg":""}`} style={{animationDelay:`${.2+i*.06}s`}}>
              <div className="ann-bw"><div className="ann-time">{new Date(a.created_at).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"})}{a.urgent&&<span className="tag tgr" style={{fontSize:9,padding:"1px 6px"}}>Urgent</span>}</div><div className="ann-body">{a.body}</div></div>
            </div>
          ))}</>
        )}
        {!loading&&champions.length===0&&announcements.length===0&&(
          <div className="empty fu fu3"><div className="eti"><Icon name="signal" size={38} sw={1}/></div><div className="ett">Live results will appear here as the competition progresses.</div></div>
        )}
        {loading&&<Spinner/>}
      </div>
    </div>
  );
}

// ─── SPORT PAGE ───────────────────────────────────────────────────────────────
function SportPage({sport,role,user,local,askPin,showToast}) {
  const [tab,setTab]=useState("bracket");
  const [teams,setTeams]=useState([]);
  const [matches,setMatches]=useState([]);
  const [published,setPublished]=useState(false);
  const [loading,setLoading]=useState(true);
  const isOrg=role==="organizer", isTA=role==="teamadmin";
  const sportLabel=sport==="soccer"?"Soccer":"Netball";

  const load=useCallback(async()=>{
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      if(!ev||!ev.id) throw new Error("No active event");
      const eid=ev.id;
      const[teamsRes, matchesRes, pfRes]=await Promise.all([
        supabase.from("fc_teams").select("*,fc_players(*)").eq("event_id",eid).eq("competition",sport),
        supabase.from("fc_matches_view").select("*").eq("event_id",eid).eq("competition",sport).order("round",{ascending:true}),
        supabase.from("fc_publish_flags").select("*").eq("event_id",eid).eq("competition",sport),
      ]);
      console.log("SPORT DEBUG",sport,"pfRes:",JSON.stringify(pfRes));
      console.log("SPORT DEBUG matches count:",matchesRes.data?.length);
      console.log("SPORT DEBUG teams count:",teamsRes.data?.length);
      const pfRow = pfRes.data?.[0];
      setTeams(teamsRes.data||[]);
      setMatches(matchesRes.data||[]);
      setPublished(pfRow?.published||false);
    }catch(e){console.warn("Sport load error",e);}
    setLoading(false);
  },[sport]);

  useEffect(()=>{
    load();
    const ch=supabase.channel(`sport_${sport}_v2`)
      .on("postgres_changes",{event:"*",schema:"public",table:"fc_matches"},()=>load())
      .on("postgres_changes",{event:"*",schema:"public",table:"fc_players"},()=>load())
      .on("postgres_changes",{event:"*",schema:"public",table:"fc_publish_flags"},()=>load())
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[sport,load]);

  let champ = null;
  if (published && matches.length) {
    const maxR = Math.max(...matches.map(m=>m.round));
    const f = matches.find(m=>m.round===maxR && m.winner_id);
    champ = f ? f.winner_name : null;
  }

  const tabs=[
    {id:"bracket",lbl:"Bracket"},
    {id:"teams",  lbl:"Teams & Players"},
    ...(isOrg?[{id:"scores",lbl:"Scores"},{id:"register",lbl:"Register"}]:[]),
    ...(isTA?[{id:"register",lbl:"My Roster"}]:[]),
  ];

  return (
    <div className="pw pg">
      <div className="pgb">
        <div className="pgl fu">{sport==="soccer"?"⚽":"🏐"} Tournament</div>
        <div className="pgt fu fu1">{sportLabel}</div>
        <div className="pgs fu fu2"><span className="live-dot"/>Single Elimination · 8 Teams · {published?"Live":"Awaiting"}</div>
      </div>
      {champ&&<div className="inner" style={{paddingBottom:0}}><div className="champ fu"><img src={getLogo(champ)} className="clogo" alt={champ}/><div className="cl">{sportLabel} Champion</div><div className="cn">{champ}</div></div></div>}
      <div className="tabs">{tabs.map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.lbl}</button>)}</div>
      <div className="inner">
        {loading?<Spinner/>:<>
          {tab==="bracket" &&<BracketView matches={matches} isOrg={isOrg} published={published}/>}
          {tab==="teams"   &&<TeamsView teams={teams} isOrg={isOrg} sport={sport} askPin={askPin} showToast={showToast} onRefresh={load}/>}
          {tab==="scores"  &&isOrg&&<ScoresView sport={sport} teams={teams} matches={matches} published={published} askPin={askPin} showToast={showToast} onRefresh={load}/>}
          {tab==="register"&&(isOrg||isTA)&&<RegisterView sport={sport} teams={teams} role={role} user={user} local={local} askPin={askPin} showToast={showToast} onRefresh={load}/>}
        </>}
      </div>
    </div>
  );
}

function BracketView({matches,isOrg,published}) {
  const visible=isOrg?matches:(published?matches:[]);
  if(!visible.length)return<div className="empty fu"><div className="eti"><Icon name="bracket" size={38} sw={1}/></div><div className="ett">{isOrg?"Generate a bracket to begin.":"Bracket will appear once published."}</div></div>;
  const rounds=[...new Set(visible.map(m=>m.round))].sort((a,b)=>a-b);
  const rL={1:"Quarter Finals",2:"Semi Finals",3:"Final"};
  return (
    <div className="bscroll">
      <div className="binner">
        {rounds.map(r=>(
          <div key={r} className="bcol fu" style={{animationDelay:`${r*.07}s`}}>
            <div className="brlbl">{rL[r]||`Round ${r}`}</div>
            {visible.filter(m=>m.round===r).map(m=>(
              <div key={m.id} className="mc">
                {[{name:m.team_a_name,sc:m.score_a,id:m.team_a_id},{name:m.team_b_name||"TBD",sc:m.score_b,id:m.team_b_id}].map((s,i)=>(
                  <div key={i} className={`mt ${m.winner_id===s.id?"win":m.winner_id?"los":""}`}>
                    {s.name&&s.name!=="TBD"&&<TL name={s.name} size={22}/>}
                    <span className="mtn">{s.name||"TBD"}</span>
                    <span className={`msc ${s.sc===null?"dim":""}`}>{s.sc??"—"}</span>
                  </div>
                ))}
                <div className="mfoot">{m.winner_id?`${m.winner_name} advances`:"Upcoming"}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamsView({teams,isOrg,sport,askPin,showToast,onRefresh}) {
  const removePlayer=async(pid)=>{
    askPin("Remove Player","Enter organizer PIN to remove this player.",async()=>{
      await supabase.from("fc_players").delete().eq("id",pid);
      showToast("Player removed.");onRefresh();
    });
  };
  return (
    <div>
      {teams.map((t,ti)=>(
        <div key={t.id} className="card fu" style={{animationDelay:`${ti*.05}s`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <TL name={t.name} size={50}/>
            <div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800}}>{t.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{t.branch}</div></div>
            <span className="tag tgm">{t.fc_players?.length||0} players</span>
          </div>
          {(t.fc_players||[]).map(p=>(
            <div key={p.id} className="pcard">
              <div className="pav">{(p.first_name||p.name||"?").charAt(0)}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500}}>{p.first_name||p.name} {p.last_name||""}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>#{p.jersey_number} · {p.position} · {p.age_group}</div></div>
              {isOrg&&<button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>removePlayer(p.id)}><Icon name="trash" size={14}/></button>}
            </div>
          ))}
          {!t.fc_players?.length&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"12px 0"}}>No players yet.</div>}
        </div>
      ))}
    </div>
  );
}

function ScoresView({sport,teams,matches,published,askPin,showToast,onRefresh}) {
  const [saving,setSaving]=useState(false);
  const getTeamName=id=>teams.find(t=>t.id===id)?.name;

  const generate=async()=>{
    setSaving(true);
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      if(!ev||!ev.id) throw new Error("No active event");
      const eid=ev.id;
      // Delete old matches first
      await supabase.from("fc_matches").delete().eq("event_id",eid).eq("competition",sport);
      const sh=[...teams].sort(()=>Math.random()-.5);
      const rows=[];
      for(let i=0;i<sh.length;i+=2){if(sh[i+1])rows.push({event_id:eid,competition:sport,round:1,team_a_id:sh[i].id,team_b_id:sh[i+1].id,status:"pending",published:false});}
      await supabase.from("fc_matches").insert(rows);
      showToast("Bracket generated!");onRefresh();
    }catch(e){showToast("Error: "+e.message);}
    setSaving(false);
  };

  const updateScore=async(mid,field,val)=>{
    await supabase.from("fc_matches").update({[field]:parseInt(val)||0}).eq("id",mid);
    onRefresh();
  };

  const confirm=async(m)=>{
    setSaving(true);
    try{
      const winner=((m.score_a??0)>=(m.score_b??0))?m.team_a_id:m.team_b_id;
      await supabase.from("fc_matches").update({winner_id:winner,status:"completed",voting_open:true}).eq("id",m.id);
      // Advance winner to next round
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      const nextR=m.round+1;
      const{data:existing}=await supabase.from("fc_matches").select("*").eq("event_id",ev.id).eq("competition",sport).eq("round",nextR).is("team_b_id",null).maybeSingle();
      if(existing){await supabase.from("fc_matches").update({team_b_id:winner}).eq("id",existing.id);}
      else{await supabase.from("fc_matches").insert({event_id:ev.id,competition:sport,round:nextR,team_a_id:winner,status:"pending",published:false});}
      showToast("Confirmed — voting opened!");onRefresh();
    }catch(e){showToast("Error: "+e.message);}
    setSaving(false);
  };

  const togglePublish=async()=>{
    const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
    await supabase.from("fc_publish_flags").update({published:!published}).eq("event_id",ev.id).eq("competition",sport);
    showToast(published?"Hidden.":"Published!");onRefresh();
  };

  const removeMatch=mid=>askPin("Remove Match","Enter organizer PIN.",async()=>{
    await supabase.from("fc_matches").delete().eq("id",mid);showToast("Removed.");onRefresh();
  });

  return (
    <div>
      <div className="brow" style={{marginBottom:16}}>
        <button className="btn bo bsm" onClick={generate} disabled={saving}><Icon name="bracket" size={13}/> Generate</button>
        <button className={`btn bsm ${published?"bd":"bg"}`} onClick={togglePublish}><Icon name={published?"eyeoff":"publish"} size={13}/>{published?"Unpublish":"Publish"}</button>
      </div>
      {!matches.length&&<div className="empty"><div className="eti"><Icon name="bracket" size={38} sw={1}/></div><div className="ett">Generate a bracket to begin.</div></div>}
      {matches.map((m,i)=>(
        <div key={m.id} className="card card-sm fu" style={{opacity:m.winner_id?.6:1,marginBottom:12,animationDelay:`${i*.04}s`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span className="tag tg">Round {m.round}</span>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {m.winner_id&&<span className="tag tgn"><Icon name="check" size={10}/> Done</span>}
              <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:2}} onClick={()=>removeMatch(m.id)}><Icon name="trash" size={14}/></button>
            </div>
          </div>
          <div className="svs">
            <div className="ss"><TL name={m.team_a_name} size={40}/><div className="ssn">{m.team_a_name||"TBD"}</div>
              <input className="fi" type="number" min="0" defaultValue={m.score_a??""} onBlur={e=>updateScore(m.id,"score_a",e.target.value)} disabled={!!m.winner_id} style={{width:60,height:48,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:700,color:"var(--gold)",padding:"0 6px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(240,180,41,.4)"}}/>
            </div>
            <div className="ssp">VS</div>
            <div className="ss"><TL name={m.team_b_name} size={40}/><div className="ssn">{m.team_b_name||"TBD"}</div>
              <input className="fi" type="number" min="0" defaultValue={m.score_b??""} onBlur={e=>updateScore(m.id,"score_b",e.target.value)} disabled={!!m.winner_id} style={{width:60,height:48,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:700,color:"var(--gold)",padding:"0 6px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(240,180,41,.4)"}}/>
            </div>
          </div>
          {!m.winner_id&&<button className="btn bp" onClick={()=>confirm(m)} disabled={saving}><Icon name="check" size={14}/> Confirm & Open Voting</button>}
          {m.winner_id&&<div style={{textAlign:"center",color:"var(--gold)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,marginTop:6}}>🏆 {m.winner_name} advances</div>}
        </div>
      ))}
    </div>
  );
}

function RegisterView({sport,teams,role,user,local,askPin,showToast,onRefresh}) {
  const isOrg=role==="organizer";
  const avail=isOrg?teams:teams.filter(t=>t.id===user?.teamId);
  const [sel,setSel]=useState(avail[0]?.id||"");
  const [f,setF]=useState({firstName:"",lastName:"",idNumber:"",jersey:"",position:"",ageGroup:"Open",phone:"",memberSince:""});
  const sf=(k,v)=>setF(x=>({...x,[k]:v}));
  const positions=sport==="soccer"?POS_SOCCER:POS_NETBALL;
  const team=teams.find(t=>t.id===sel);

  const submit=async()=>{
    if(!f.firstName.trim()||!f.lastName.trim()){showToast("Name required.");return;}
    try{
      await supabase.from("fc_players").insert({
        team_id:sel,name:`${f.firstName} ${f.lastName}`,
        first_name:f.firstName,last_name:f.lastName,
        jersey_number:f.jersey,position:f.position,age_group:f.ageGroup,
        id_number:f.idNumber,phone:f.phone,
        member_since:f.memberSince||null,
      });
      showToast("Player registered!");
      setF({firstName:"",lastName:"",idNumber:"",jersey:"",position:"",ageGroup:"Open",phone:"",memberSince:""});
      onRefresh();
    }catch(e){showToast("Error: "+e.message);}
  };

  return (
    <div className="pw">
      <div className="card" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          {team&&<TL name={team.name} size={44}/>}
          <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800}}>{team?.name||"Select Team"}</div></div>
        </div>
        {isOrg&&<div className="fg"><label className="fl">Select Team</label><select className="fi" value={sel} onChange={e=>setSel(e.target.value)}>{avail.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>}
      </div>
      <div className="fsec">Personal Details</div>
      <div className="fgrid"><div className="fg"><label className="fl">First Name</label><input className="fi" value={f.firstName} onChange={e=>sf("firstName",e.target.value)} placeholder="e.g. Sipho"/></div><div className="fg"><label className="fl">Last Name</label><input className="fi" value={f.lastName} onChange={e=>sf("lastName",e.target.value)} placeholder="e.g. Dlamini"/></div></div>
      <div className="fgrid"><div className="fg"><label className="fl">ID Number</label><input className="fi" value={f.idNumber} onChange={e=>sf("idNumber",e.target.value)} placeholder="SA ID"/></div><div className="fg"><label className="fl">Phone</label><input className="fi" value={f.phone} onChange={e=>sf("phone",e.target.value)} placeholder="082 000 0000" type="tel"/></div></div>
      <div className="fsec">Sport Details</div>
      <div className="fgrid"><div className="fg"><label className="fl">Jersey #</label><input className="fi" value={f.jersey} onChange={e=>sf("jersey",e.target.value)} placeholder="10"/></div><div className="fg"><label className="fl">Age Group</label><select className="fi" value={f.ageGroup} onChange={e=>sf("ageGroup",e.target.value)}>{["Under 13","Under 17","Under 21","Open"].map(a=><option key={a}>{a}</option>)}</select></div></div>
      <div className="fg"><label className="fl">Position</label><select className="fi" value={f.position} onChange={e=>sf("position",e.target.value)}><option value="">— Select —</option>{positions.map(p=><option key={p}>{p}</option>)}</select></div>
      <div className="fsec">Church Membership <span style={{fontSize:9,color:"var(--muted)",letterSpacing:0,textTransform:"none",fontFamily:"'Barlow',sans-serif"}}>(Internal only)</span></div>
      <div className="fg"><label className="fl"><Icon name="cal" size={11} stroke="var(--gold)"/> Member Since</label><input className="fi" type="date" value={f.memberSince} onChange={e=>sf("memberSince",e.target.value)} max={new Date().toISOString().split("T")[0]} style={{colorScheme:"dark"}}/>{f.memberSince&&<div style={{marginTop:6}}><div className="since"><Icon name="shield" size={11} stroke="var(--gold)"/>Member for {Math.floor((new Date()-new Date(f.memberSince))/(1000*60*60*24*365))} years</div></div>}</div>
      <button className="btn bp" onClick={submit}><Icon name="plus" size={15}/> Register Player</button>
      {team?.fc_players?.length>0&&(<><div className="sechd" style={{marginTop:18}}><span className="secht">{team.name} · {team.fc_players.length} registered</span></div>{team.fc_players.map(p=>(<div key={p.id} className="pcard"><div className="pav">{(p.first_name||p.name||"?").charAt(0)}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:500}}>{p.first_name||p.name} {p.last_name||""}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>#{p.jersey_number} · {p.position}</div></div><button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>askPin("Remove Player","Enter organizer PIN.",async()=>{await supabase.from("fc_players").delete().eq("id",p.id);showToast("Removed.");onRefresh();})}><Icon name="trash" size={14}/></button></div>))}</>)}
    </div>
  );
}

// ─── CHOIR PAGE ───────────────────────────────────────────────────────────────
function ChoirPage({role,user,local,setLocal,askPin,showToast}) {
  const [tab,setTab]=useState(role==="judge"?"score":"leaderboard");
  const [groups,setGroups]=useState([]);
  const [scores,setScores]=useState([]);
  const [published,setPublished]=useState(false);
  const [cats,setCats]=useState(local.choirCats||DEFAULT_CATS);
  const isJudge=role==="judge",isOrg=role==="organizer",isTA=role==="teamadmin";

  const load=useCallback(async()=>{
    try{
      const{data:ev}=await supabase.from("fc_events").select("id,choir_categories").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      const eid=ev.id;
      if(ev.choir_categories)setCats(ev.choir_categories);
      const[groupsRes, scoresRes, pfRes]=await Promise.all([
        supabase.from("fc_choir_groups").select("*,fc_choir_members(*)").eq("event_id",eid).order("performance_order",{ascending:true,nullsLast:true}),
        supabase.from("fc_choir_scores").select("*").eq("event_id",eid),
        supabase.from("fc_publish_flags").select("published").eq("event_id",eid).eq("competition","choir"),
      ]);
      const pfRow = pfRes.data?.[0];
      setGroups(groupsRes.data||[]);
      setScores(scoresRes.data||[]);
      setPublished(pfRow?.published||false);
    }catch(e){console.warn("Choir load error",e);}
  },[]);

  useEffect(()=>{
    load();
    const ch=supabase.channel("choir_rt_v2")
      .on("postgres_changes",{event:"*",schema:"public",table:"fc_choir_scores"},()=>load())
      .on("postgres_changes",{event:"*",schema:"public",table:"fc_choir_members"},()=>load())
      .on("postgres_changes",{event:"*",schema:"public",table:"fc_publish_flags"},()=>load())
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[load]);

  const tabs=[
    ...(isOrg||role==="spectator"||isTA?[{id:"leaderboard",lbl:"Leaderboard"}]:[]),
    ...(isOrg||isTA?[{id:"register",lbl:"Registration"}]:[]),
    ...(isJudge?[{id:"score",lbl:"Score"}]:[]),
    ...(isOrg?[{id:"manage",lbl:"Manage"},{id:"allscores",lbl:"All Scores"}]:[]),
  ];

  return (
    <div className="pw pg">
      <div className="pgb">
        <div className="pgl fu">Competition</div>
        <div className="pgt fu fu1">Choir <span className="acc">2026</span></div>
        <div className="pgs fu fu2">{cats.length} scoring categories · Independent judges</div>
      </div>
      <div className="tabs">{tabs.map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.lbl}</button>)}</div>
      <div className="inner">
        {tab==="leaderboard"&&<ChoirLeaderboard groups={groups} scores={scores} cats={cats} published={published}/>}
        {tab==="register"&&(isOrg||isTA)&&<ChoirRegister groups={groups} role={role} user={user} askPin={askPin} showToast={showToast} onRefresh={load}/>}
        {tab==="score"&&isJudge&&<ChoirScore groups={groups} scores={scores} cats={cats} user={user} showToast={showToast} onRefresh={load}/>}
        {tab==="manage"&&isOrg&&<ChoirManage groups={groups} scores={scores} cats={cats} published={published} askPin={askPin} showToast={showToast} onRefresh={load}/>}
        {tab==="allscores"&&isOrg&&<ChoirAllScores groups={groups} scores={scores} cats={cats}/>}
      </div>
    </div>
  );
}

function rankGroups(groups,scores,cats) {
  return groups.map(g=>{
    const gs=scores.filter(s=>s.group_id===g.id);
    const catAvgs=cats.map(cat=>{const vals=gs.filter(s=>s.category===cat).map(s=>s.score);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;});
    const overall=catAvgs.length?catAvgs.reduce((a,b)=>a+b,0)/catAvgs.length:0;
    return{group:g,catAvgs,overall,judgeCount:[...new Set(gs.map(s=>s.judge_name))].length};
  }).sort((a,b)=>b.overall-a.overall);
}

function ChoirLeaderboard({groups,scores,cats,published}) {
  if(!published)return<div className="empty fu"><div className="eti"><Icon name="mic" size={38} sw={1}/></div><div className="ett">The choir leaderboard will be published once scoring is complete.</div></div>;
  const ranked=rankGroups(groups,scores,cats);
  return (
    <div>
      {ranked.map((r,i)=>(
        <div key={r.group.id} className={`ccard fu ${i===0?"card-gold":""}`} style={{animationDelay:`${i*.07}s`}}>
          <div style={{position:"absolute",right:14,top:10,fontFamily:"'Barlow Condensed',sans-serif",fontSize:52,fontWeight:800,color:"rgba(255,255,255,.05)",lineHeight:1}}>#{i+1}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <TL name={r.group.name} size={52} style={{border:`2px solid ${i===0?"var(--gold)":"rgba(240,180,41,.2)"}`}}/>
            <div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:700}}>{r.group.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{r.group.branch} · {r.judgeCount} judge{r.judgeCount!==1?"s":""}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:40,fontWeight:800,color:i===0?"var(--gold)":"#fff",lineHeight:1}}>{r.overall>0?r.overall.toFixed(1):"—"}</div><div style={{fontSize:10,color:"var(--muted)"}}>avg</div></div>
          </div>
          {cats.map((cat,ci)=>(
            <div key={cat} className="sbr"><div className="sbl">{cat}</div><div className="sbt"><div className="sbf" style={{width:`${((r.catAvgs[ci]||0)/10)*100}%`}}/></div><div className="sbv">{r.catAvgs[ci]>0?r.catAvgs[ci].toFixed(1):"—"}</div></div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ChoirScore({groups,scores,cats,user,showToast,onRefresh}) {
  const [local2,setLocal2]=useState({});
  const get=(gid,cat)=>local2[`${gid}_${cat}`]||null;
  const set=(gid,cat,v)=>setLocal2(s=>({...s,[`${gid}_${cat}`]:v}));
  const submit=async gid=>{
    if(!cats.every(c=>get(gid,c))){showToast("Score all categories.");return;}
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      await Promise.all(cats.map(cat=>supabase.from("fc_choir_scores").upsert({event_id:ev.id,group_id:gid,judge_name:user?.name||"Judge",category:cat,score:local2[`${gid}_${cat}`]},{onConflict:"group_id,judge_name,category"})));
      showToast("Scores submitted!");onRefresh();
    }catch(e){showToast("Error: "+e.message);}
  };
  return (
    <div className="pw">
      <div className="jhdr"><Icon name="mic" size={18} stroke="var(--gold)"/><div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700}}>{user?.name||"Judge"}</div><div style={{fontSize:11,color:"var(--muted)"}}>Choir Judge · Score 1–10 per category</div></div></div>
      {groups.map((g,gi)=>{
        const done=cats.every(cat=>scores.find(s=>s.group_id===g.id&&s.judge_name===(user?.name||"Judge")&&s.category===cat));
        return (
          <div key={g.id} className="ccard fu" style={{animationDelay:`${gi*.06}s`}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><TL name={g.name} size={46}/><div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:19,fontWeight:700}}>{g.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{g.branch}</div></div>{done&&<span className="tag tgn"><Icon name="check" size={10}/> Submitted</span>}</div>
            {cats.map(cat=>(
              <div key={cat} className="drow"><div className="dlbl">{cat}</div><div className="dots">{[1,2,3,4,5,6,7,8,9,10].map(n=><button key={n} className={`dot ${get(g.id,cat)===n?"on":""}`} onClick={()=>set(g.id,cat,n)}>{n}</button>)}</div></div>
            ))}
            <div style={{marginTop:13}}><button className="btn bp" onClick={()=>submit(g.id)}><Icon name="check" size={14}/> Submit Scores</button></div>
          </div>
        );
      })}
    </div>
  );
}

function ChoirRegister({groups,role,user,askPin,showToast,onRefresh}) {
  const isOrg=role==="organizer";
  const avail=isOrg?groups:groups.filter(g=>g.id===user?.teamId);
  const [sel,setSel]=useState(avail[0]?.id||"");
  const [f,setF]=useState({firstName:"",lastName:"",idNumber:"",phone:"",voice:"Soprano",role:"Member",memberSince:""});
  const sf=(k,v)=>setF(x=>({...x,[k]:v}));
  const group=groups.find(g=>g.id===sel);
  const submit=async()=>{
    if(!f.firstName.trim()||!f.lastName.trim()){showToast("Name required.");return;}
    try{await supabase.from("fc_choir_members").insert({group_id:sel,first_name:f.firstName,last_name:f.lastName,id_number:f.idNumber,phone:f.phone,singing_voice:f.voice,choir_role:f.role,member_since:f.memberSince||null});showToast("Member registered!");setF({firstName:"",lastName:"",idNumber:"",phone:"",voice:"Soprano",role:"Member",memberSince:""});onRefresh();}catch(e){showToast("Error: "+e.message);}
  };
  return (
    <div className="pw">
      <div className="card" style={{marginBottom:14}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>{group&&<TL name={group.name} size={44}/>}<div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800}}>{group?.name||"Select Group"}</div></div></div>{isOrg&&<div className="fg"><label className="fl">Select Group</label><select className="fi" value={sel} onChange={e=>setSel(e.target.value)}>{avail.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>}</div>
      <div className="fsec">Personal Details</div>
      <div className="fgrid"><div className="fg"><label className="fl">First Name</label><input className="fi" value={f.firstName} onChange={e=>sf("firstName",e.target.value)} placeholder="e.g. Nomsa"/></div><div className="fg"><label className="fl">Last Name</label><input className="fi" value={f.lastName} onChange={e=>sf("lastName",e.target.value)} placeholder="e.g. Khumalo"/></div></div>
      <div className="fgrid"><div className="fg"><label className="fl">ID Number</label><input className="fi" value={f.idNumber} onChange={e=>sf("idNumber",e.target.value)} placeholder="SA ID"/></div><div className="fg"><label className="fl">Phone</label><input className="fi" value={f.phone} onChange={e=>sf("phone",e.target.value)} placeholder="082 000 0000" type="tel"/></div></div>
      <div className="fsec">Choir Details</div>
      <div className="fgrid"><div className="fg"><label className="fl">Singing Voice</label><select className="fi" value={f.voice} onChange={e=>sf("voice",e.target.value)}>{VOICES.map(v=><option key={v}>{v}</option>)}</select></div><div className="fg"><label className="fl">Role</label><select className="fi" value={f.role} onChange={e=>sf("role",e.target.value)}>{["Member","Choir Leader","Deputy Leader","Soloist","Accompanist"].map(r=><option key={r}>{r}</option>)}</select></div></div>
      <div className="fsec">Church Membership <span style={{fontSize:9,color:"var(--muted)",letterSpacing:0,textTransform:"none",fontFamily:"'Barlow',sans-serif"}}>(Internal only)</span></div>
      <div className="fg"><label className="fl">Member Since</label><input className="fi" type="date" value={f.memberSince} onChange={e=>sf("memberSince",e.target.value)} max={new Date().toISOString().split("T")[0]} style={{colorScheme:"dark"}}/>{f.memberSince&&<div style={{marginTop:6}}><div className="since"><Icon name="shield" size={11} stroke="var(--gold)"/>Member for {Math.floor((new Date()-new Date(f.memberSince))/(1000*60*60*24*365))} years</div></div>}</div>
      <button className="btn bp" onClick={submit}><Icon name="plus" size={15}/> Register Member</button>
      {group?.fc_choir_members?.length>0&&(<><div className="sechd" style={{marginTop:18}}><span className="secht">{group.name} · {group.fc_choir_members.length} members</span></div>{group.fc_choir_members.map(m=>(<div key={m.id} className="pcard"><div className="pav">{m.first_name?.charAt(0)||"?"}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:500}}>{m.first_name} {m.last_name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{m.singing_voice} · {m.choir_role}</div></div>{isOrg&&<button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>askPin("Remove Member","Enter organizer PIN.",async()=>{await supabase.from("fc_choir_members").delete().eq("id",m.id);showToast("Removed.");onRefresh();})}><Icon name="trash" size={14}/></button>}<span className="tag tg" style={{marginLeft:4}}>{m.singing_voice?.charAt(0)}</span></div>))}</>)}
    </div>
  );
}

function ChoirManage({groups,scores,cats,published,askPin,showToast,onRefresh}) {
  const [newCat,setNewCat]=useState("");
  const togglePublish=async()=>{const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));await supabase.from("fc_publish_flags").update({published:!published}).eq("event_id",ev.id).eq("competition","choir");showToast(published?"Hidden.":"Published!");onRefresh();};
  const addCat=async()=>{if(!newCat.trim())return;const{data:ev}=await supabase.from("fc_events").select("id,choir_categories").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));const updated=[...(ev.choir_categories||cats),newCat];await supabase.from("fc_events").update({choir_categories:updated}).eq("id",ev.id);showToast("Category added!");setNewCat("");onRefresh();};
  const removeCat=cat=>askPin("Remove Category","Enter organizer PIN.",async()=>{const{data:ev}=await supabase.from("fc_events").select("id,choir_categories").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));await supabase.from("fc_events").update({choir_categories:(ev.choir_categories||cats).filter(c=>c!==cat)}).eq("id",ev.id);showToast("Removed.");onRefresh();});
  return (
    <div className="pw">
      <button className={`btn ${published?"bd":"bg"}`} style={{marginBottom:18}} onClick={togglePublish}><Icon name={published?"eyeoff":"publish"} size={14}/>{published?"Unpublish":"Publish Leaderboard"}</button>
      <div className="sechd"><span className="secht">Scoring Categories</span></div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",gap:8,marginBottom:12}}><input className="fi" value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="Add new category..." style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&addCat()}/><button className="btn bp bsm" style={{width:"auto"}} onClick={addCat}><Icon name="plus" size={14}/></button></div>
        {cats.map(cat=>(<div key={cat} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--border)"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Icon name="tag" size={14} stroke="var(--gold)"/><span style={{fontSize:14}}>{cat}</span></div><button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>removeCat(cat)}><Icon name="x" size={15}/></button></div>))}
      </div>
      <div className="sechd"><span className="secht">Groups</span></div>
      {groups.map(g=>(<div key={g.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"var(--navy3)",border:"1px solid var(--border)",borderRadius:10,marginBottom:8}}><TL name={g.name} size={40}/><div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700}}>{g.name}</div><div style={{fontSize:11,color:"var(--muted)"}}>{g.branch} · {g.fc_choir_members?.length||0} members</div></div><span className={`tag ${scores.filter(s=>s.group_id===g.id).length>0?"tgn":"tgm"}`}>{scores.filter(s=>s.group_id===g.id).length>0?"Scored":"Pending"}</span></div>))}
    </div>
  );
}

function ChoirAllScores({groups,scores,cats}) {
  const ranked=rankGroups(groups,scores,cats);
  return <div className="pw"><div className="card">{ranked.map((r,i)=>(<div key={r.group.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 0",borderBottom:"1px solid var(--border)"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:i<3?"var(--gold)":"var(--muted2)",width:26}}>#{i+1}</div><TL name={r.group.name} size={30}/><div style={{flex:1,marginLeft:6}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700}}>{r.group.name}</div><div style={{fontSize:10,color:"var(--muted)"}}>{r.judgeCount} judges · {cats.map((c,ci)=>`${c.charAt(0)}: ${(r.catAvgs[ci]||0).toFixed(1)}`).join(" · ")}</div></div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,color:"var(--gold)"}}>{r.overall>0?r.overall.toFixed(1):"—"}</div></div>))}</div></div>;
}

// ─── VOTE PAGE ────────────────────────────────────────────────────────────────
function VotePage({role,user,local,setLocal,showToast}) {
  const [matches,setMatches]=useState([]);
  const [vname,setVname]=useState("");
  const [vid,setVid]=useState(user?.id||null);
  const [registered,setRegistered]=useState(!!user);
  const [picked,setPicked]=useState({});
  const isPlayer=role==="teamadmin";
  const weight=isPlayer?3:1;
  const votes=local.votes||{};

  useEffect(()=>{
    async function load(){
      try{
        const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
        const{data:m}=await supabase.from("fc_matches_view").select("*").eq("event_id",ev.id).not("winner_id","is",null).order("round",{ascending:true});
        setMatches(m||[]);
      }catch(e){}
    }
    load();
  },[]);

  const register=()=>{if(!vname.trim()){showToast("Enter your name.");return;}const id=uid();setVid(id);setRegistered(true);setLocal(l=>({...l,voters:{...l.voters,[id]:{name:vname,role,weight}}}));showToast("Registered!");};
  const castVote=(mid,gender,pid)=>{
    if(!registered){showToast("Register first.");return;}
    const key=`${mid}_${gender}`;
    if(votes[mid]&&Object.values(votes[mid]).some(v=>v.voterId===vid&&v.gender===gender)){showToast("Already voted.");return;}
    setPicked(p=>({...p,[key]:pid}));
    setLocal(l=>{const nv={...l.votes};if(!nv[mid])nv[mid]={};nv[mid][`${vid}_${gender}`]={voterId:vid,playerId:pid,gender,weight};return{...l,votes:nv};});
    showToast(`Vote cast! (${weight}× weight)`);
  };
  const tally=(mid,gender)=>{const mv=votes[mid]||{};const t={};Object.values(mv).filter(v=>v.gender===gender).forEach(v=>{t[v.playerId]=(t[v.playerId]||0)+v.weight;});return t;};

  return (
    <div className="pw pg">
      <div className="pgb"><div className="pgl fu">Public Voting</div><div className="pgt fu fu1">MOM / <span className="acc">WOM</span></div><div className="pgs fu fu2">Man & Woman of the Match · Team admin votes count 3×</div></div>
      <div className="inner">
        {!matches.length&&<div className="empty fu"><div className="eti"><Icon name="vote" size={38} sw={1}/></div><div className="ett">Voting opens automatically after each confirmed result.</div></div>}
        {!registered&&matches.length>0&&<div className="card card-gold fu" style={{marginBottom:16}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,marginBottom:4}}>Register to Vote</div><div style={{fontSize:12,color:"var(--muted)",marginBottom:14,lineHeight:1.5}}>One vote per award per match.{isPlayer?" Your vote counts 3×.":""}</div><div className="fg"><label className="fl">Your Full Name</label><input className="fi" value={vname} onChange={e=>setVname(e.target.value)} placeholder="e.g. Sipho Dlamini" onKeyDown={e=>e.key==="Enter"&&register()}/></div><button className="btn bp" onClick={register}><Icon name="vote" size={15}/> Register & Vote</button></div>}
        {registered&&<div className="card card-sm card-gold fu" style={{marginBottom:14}}><div style={{display:"flex",alignItems:"center",gap:8}}><Icon name="check" size={14} stroke="var(--gold)"/><span style={{fontSize:13}}>Voting as <strong>{user?.name||vname}</strong></span>{isPlayer&&<span className="tag tg">3× weight</span>}</div></div>}
        {matches.map((m,mi)=>{
          // Get players from Supabase teams - simplified: show team names as placeholder
          const t=tally(m.id,"m"), maxV=Math.max(1,...Object.values(t));
          return (
            <div key={m.id} className="vc fu" style={{animationDelay:`${mi*.06}s`}}>
              <div className="vmh">
                <div><div style={{fontSize:10,color:"var(--gold)",letterSpacing:2,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,marginBottom:3}}>{m.competition?.toUpperCase()} · Round {m.round}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700}}>{m.team_a_name} {m.score_a} — {m.score_b} {m.team_b_name}</div></div>
                <span className="tag tgn"><Icon name="check" size={10}/> Final</span>
              </div>
              <div style={{padding:14}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--muted)",fontWeight:700,marginBottom:10}}>Vote for Man / Woman of the Match</div>
              {[m.team_a_name,m.team_b_name].map((tname,ti)=>{
                const fakePid=`${m.id}_team_${ti}`;
                const votes_count=t[fakePid]||0;
                const pct=Math.round((votes_count/maxV)*100);
                const isMyVote=picked[`${m.id}_m`]===fakePid;
                return (
                  <div key={tname} className="vpr" onClick={()=>registered&&castVote(m.id,"m",fakePid)}>
                    <div className={`vrad ${isMyVote?"on":""}`}>{isMyVote&&<Icon name="check" size={10} stroke="var(--navy)"/>}</div>
                    <TL name={tname} size={28}/>
                    <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500}}>{tname}</div><div style={{fontSize:11,color:"var(--muted)"}}>Team vote</div></div>
                    {votes_count>0&&<div className="vbw"><div className="vbt"><div className="vbf" style={{width:`${pct}%`}}/></div><div className="vbc">{votes_count}</div></div>}
                  </div>
                );
              })}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── NEWS PAGE ────────────────────────────────────────────────────────────────
function NewsPage({role,announcements,onRefresh,askPin,showToast}) {
  const [body,setBody]=useState("");
  const [urgent,setUrgent]=useState(false);
  const [pushOn,setPushOn]=useState(()=>"Notification"in window&&Notification.permission==="granted");
  const isOrg=role==="organizer";
  const enablePush=async()=>{const ok=await requestPush();setPushOn(ok);showToast(ok?"Push enabled!":"Permission denied.");};
  const post=async()=>{
    if(!body.trim())return;
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      await supabase.from("fc_announcements").insert({event_id:ev.id,body,urgent,posted_by:"Organizer"});
      showToast("Posted!");setBody("");setUrgent(false);onRefresh();
    }catch(e){showToast("Error: "+e.message);}
  };
  const remove=id=>askPin("Remove Announcement","Enter organizer PIN.",async()=>{await supabase.from("fc_announcements").delete().eq("id",id);showToast("Removed.");onRefresh();});

  return (
    <div className="pw pg">
      <div className="pgb"><div className="pgl fu">Updates</div><div className="pgt fu fu1">News</div><div className="pgs fu fu2">Official tournament announcements</div></div>
      <div className="inner">
        {!isOrg&&!pushOn&&<div className="card card-gold fu fu1" style={{marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:12}}><Icon name="bell" size={22} stroke="var(--gold)"/><div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:"var(--gold)"}}>Enable Notifications</div><div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>Get notified when the organizer posts</div></div><button className="btn bp bsm" onClick={enablePush}>Enable</button></div></div>}
        {isOrg&&(
          <div className="card fu fu1" style={{marginBottom:16}}>
            <div className="fg"><label className="fl">Post Announcement</label><textarea className="fi" rows={3} value={body} onChange={e=>setBody(e.target.value)} placeholder="Type your message..." style={{resize:"vertical",lineHeight:1.5}}/></div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <div style={{width:40,height:22,borderRadius:11,background:urgent?"#e53e3e":"var(--border2)",position:"relative",transition:"background .2s"}} onClick={()=>setUrgent(u=>!u)}><div style={{position:"absolute",top:2,left:urgent?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/></div>
                <span style={{fontSize:12,color:urgent?"#fc8181":"var(--muted)"}}>Mark as urgent</span>
              </label>
              {!pushOn&&<button className="btn bo bsm" onClick={enablePush}><Icon name="bell" size={13}/> Enable Push</button>}
            </div>
            <button className="btn bp" onClick={post}><Icon name="news" size={14}/> {pushOn?"Post & Notify":"Post"}</button>
          </div>
        )}
        {!announcements.length&&<div className="empty fu"><div className="eti"><Icon name="news" size={38} sw={1}/></div><div className="ett">No announcements yet.</div></div>}
        {announcements.map((a,i)=>(
          <div key={a.id} className={`ann fu ${a.urgent?"urg":""}`} style={{animationDelay:`${i*.05}s`}}>
            <div className="ann-bw">
              <div className="ann-time">{new Date(a.created_at).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"})}{a.urgent&&<span className="tag tgr" style={{fontSize:9,padding:"1px 6px"}}>🚨 Urgent</span>}</div>
              <div className="ann-body">{a.body}</div>
            </div>
            {isOrg&&<button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4,alignSelf:"flex-start"}} onClick={()=>remove(a.id)}><Icon name="trash" size={14}/></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({local,setLocal,askPin,showToast}) {
  const [tab,setTab]=useState("users");
  return (
    <div className="pw pg">
      <div className="pgb"><div className="pgl fu">Organizer</div><div className="pgt fu fu1">Admin <span className="acc">Panel</span></div></div>
      <div className="tabs">{[{id:"users",lbl:"Users"},{id:"publish",lbl:"Publish"},{id:"overview",lbl:"Overview"}].map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.lbl}</button>)}</div>
      <div className="inner">
        {tab==="users"   &&<UserMgmt   local={local} setLocal={setLocal} askPin={askPin} showToast={showToast}/>}
        {tab==="publish" &&<PublishMgmt showToast={showToast}/>}
        {tab==="overview"&&<Overview   local={local} askPin={askPin} showToast={showToast}/>}
      </div>
    </div>
  );
}

function UserMgmt({local,setLocal,askPin,showToast}) {
  const [sec,setSec]=useState("judges");
  const judges=local.judges||[], admins=local.teamAdmins||[];
  const [jn,setJn]=useState("");const [jp,setJp]=useState("");const [jt,setJt]=useState("");
  const [an,setAn]=useState("");const [ap,setAp]=useState("");const [at,setAt]=useState("Durban Central");
  const allTeamNames=["Durban Central","Wakanda","Cape Town","Swacunda","Mighty","Zululand","Mlungwane","Durban South"];
  const addJudge=()=>{if(!jn.trim()||!jp.trim()){showToast("Name & PIN required.");return;}setLocal(l=>({...l,judges:[...(l.judges||[]),{id:uid(),name:jn,pin:jp,tablet:jt}]}));showToast("Judge added!");setJn("");setJp("");setJt("");};
  const rmJudge=id=>askPin("Remove Judge","Enter organizer PIN.",()=>{setLocal(l=>({...l,judges:(l.judges||[]).filter(j=>j.id!==id)}));showToast("Removed.");});
  const addAdmin=()=>{if(!an.trim()||!ap.trim()){showToast("Name & PIN required.");return;}setLocal(l=>({...l,teamAdmins:[...(l.teamAdmins||[]),{id:uid(),name:an,pin:ap,teamId:at}]}));showToast("Team admin added!");setAn("");setAp("");};
  const rmAdmin=id=>askPin("Remove Team Admin","Enter organizer PIN.",()=>{setLocal(l=>({...l,teamAdmins:(l.teamAdmins||[]).filter(a=>a.id!==id)}));showToast("Removed.");});

  return (
    <div className="pw">
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        <button className={`btn bsm ${sec==="judges"?"bp":"bo"}`} onClick={()=>setSec("judges")}><Icon name="mic" size={13}/> Judges ({judges.length})</button>
        <button className={`btn bsm ${sec==="admins"?"bp":"bo"}`} onClick={()=>setSec("admins")}><Icon name="users" size={13}/> Team Admins ({admins.length})</button>
      </div>
      {sec==="judges"&&(
        <><div className="card" style={{marginBottom:14}}>
          <div className="fsec" style={{marginTop:0}}>Add Choir Judge</div>
          <div className="fgrid"><div className="fg"><label className="fl">Full Name</label><input className="fi" value={jn} onChange={e=>setJn(e.target.value)} placeholder="Judge name"/></div><div className="fg"><label className="fl">PIN</label><input className="fi" value={jp} onChange={e=>setJp(e.target.value)} placeholder="e.g. 5678" type="password"/></div></div>
          <div className="fg"><label className="fl">Tablet / Device</label><input className="fi" value={jt} onChange={e=>setJt(e.target.value)} placeholder="e.g. Tablet 1"/></div>
          <button className="btn bp" onClick={addJudge}><Icon name="plus" size={15}/> Add Judge</button>
        </div>
        {!judges.length&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"16px 0"}}>No judges added yet.</div>}
        {judges.map((j,i)=>(<div key={j.id} className="urow fu" style={{animationDelay:`${i*.04}s`}}><div className="uav">{j.name.charAt(0)}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{j.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{j.tablet||"No device"} · PIN: {"·".repeat(j.pin.length)}</div></div><button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>rmJudge(j.id)}><Icon name="trash" size={14}/></button></div>))}</>
      )}
      {sec==="admins"&&(
        <><div className="card" style={{marginBottom:14}}>
          <div className="fsec" style={{marginTop:0}}>Add Team Admin</div>
          <div className="fgrid"><div className="fg"><label className="fl">Full Name</label><input className="fi" value={an} onChange={e=>setAn(e.target.value)} placeholder="Admin name"/></div><div className="fg"><label className="fl">PIN</label><input className="fi" value={ap} onChange={e=>setAp(e.target.value)} placeholder="e.g. 9012" type="password"/></div></div>
          <div className="fg"><label className="fl">Assign Team</label><select className="fi" value={at} onChange={e=>setAt(e.target.value)}>{allTeamNames.map(t=><option key={t}>{t}</option>)}</select></div>
          <button className="btn bp" onClick={addAdmin}><Icon name="plus" size={15}/> Add Team Admin</button>
        </div>
        {!admins.length&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"16px 0"}}>No team admins yet.</div>}
        {admins.map((a,i)=>(<div key={a.id} className="urow fu" style={{animationDelay:`${i*.04}s`}}><TL name={a.teamId} size={38}/><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{a.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{a.teamId} · PIN: {"·".repeat(a.pin.length)}</div></div><button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>rmAdmin(a.id)}><Icon name="trash" size={14}/></button></div>))}</>
      )}
    </div>
  );
}

function PublishMgmt({showToast}) {
  const [flags,setFlags]=useState({soccer:false,netball:false,choir:false});
  const [eid,setEid]=useState(null);

  const loadFlags = async () => {
    try {
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      if(!ev||!ev.id) throw new Error("No active event");
      setEid(ev.id);
      const{data:pf}=await supabase.from("fc_publish_flags").select("*").eq("event_id",ev.id);
      const f={};(pf||[]).forEach(p=>{f[p.competition]=p.published;});
      setFlags(f);
      return ev.id;
    } catch(e){ console.warn("PublishMgmt load error",e); }
  };

  useEffect(()=>{
    loadFlags();
    // Realtime subscription — update all devices when any publish flag changes
    const ch = supabase.channel("publish_flags_rt")
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"fc_publish_flags"},
        payload => {
          setFlags(f=>({...f,[payload.new.competition]:payload.new.published}));
        }
      ).subscribe();
    return()=>supabase.removeChannel(ch);
  },[]);

  const toggle=async comp=>{
    try {
      const evId = eid || (await loadFlags());
      if(!evId) throw new Error("No active event ID");
      await supabase.from("fc_publish_flags").update({published:!flags[comp],updated_at:new Date().toISOString()}).eq("event_id",evId).eq("competition",comp);
      // Don't setFlags locally — let the realtime subscription update all devices
      showToast(!flags[comp]?"Published — all devices updated!":"Hidden on all devices.");
    } catch(e){ showToast("Error: "+e.message); }
  };
  return (
    <div className="pw">
      <div className="sechd fu"><span className="secht">Publish Controls</span></div>
      {["soccer","netball","choir"].map((comp,i)=>(
        <div key={comp} className="card card-sm fu" style={{marginBottom:10,animationDelay:`${i*.05}s`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,textTransform:"capitalize"}}>{comp}</div><div style={{marginTop:4}}><span className={`tag ${flags[comp]?"tgn":"tgm"}`}>{flags[comp]?"Published":"Hidden"}</span></div></div>
            <button className={`btn bsm ${flags[comp]?"bd":"bg"}`} onClick={()=>toggle(comp)}><Icon name={flags[comp]?"eyeoff":"publish"} size={13}/>{flags[comp]?"Unpublish":"Publish"}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Overview({local,askPin,showToast}) {
  const resetComp=comp=>askPin(`Reset ${comp}`,"This permanently deletes all match data. Enter organizer PIN.",async()=>{
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      if(comp==="choir"){await supabase.from("fc_choir_scores").delete().eq("event_id",ev.id);}
      else{await supabase.from("fc_matches").delete().eq("event_id",ev.id).eq("competition",comp);}
      await supabase.from("fc_publish_flags").update({published:false}).eq("event_id",ev.id).eq("competition",comp==="choir"?"choir":comp);
      showToast(`${comp} reset.`);
    }catch(e){showToast("Error: "+e.message);}
  });
  return (
    <div className="pw">
      <div className="card fu fu1">
        <div className="fsec" style={{marginTop:0}}>Organizer PIN Reference</div>
        {[["Organizer",ORG_PIN],["Judges","Set per judge"],["Team Admins","Set per admin"]].map(([r,p])=>(
          <div key={r} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}><span style={{fontSize:13}}>{r}</span><span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:r==="Organizer"?20:13,fontWeight:700,color:"var(--gold)",letterSpacing:r==="Organizer"?6:0}}>{p}</span></div>
        ))}
      </div>
      <div className="sechd fu fu2"><span className="secht" style={{color:"#fc8181"}}>Danger Zone — PIN Required</span></div>
      <div className="card fu fu2" style={{borderColor:"rgba(229,62,62,.2)"}}>
        <div className="brow">
          {["soccer","netball","choir"].map(c=><button key={c} className="btn bd bsm" onClick={()=>resetComp(c)}><Icon name="trash" size={12}/> Reset {c}</button>)}
        </div>
      </div>
      <div className="card fu fu3" style={{borderColor:"var(--gold-border)",marginTop:4}}>
        <div style={{display:"flex",gap:9,alignItems:"flex-start"}}><span className="live-dot"/><div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6}}>Connected to Supabase. All data syncs in real time across every device.</div></div>
      </div>
    </div>
  );
}
