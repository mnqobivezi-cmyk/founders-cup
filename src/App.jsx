import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qqikvklpnkfxauwavvmj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxaWt2a2xwbmtmeGF1d2F2dm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTgwNzAsImV4cCI6MjA5MzI5NDA3MH0.R1iG33nxvomwTkWeERXncgK7MZ0tOB6bGUG5wD3atj0"
);

const FC_LOGO = "https://static.wixstatic.com/media/4877d6_4bad42a571ec47e982d9b2ec2b4c9a22~mv2.jpeg";
const TEAM_META = {
  "Durban Central United":      { logo:"https://static.wixstatic.com/media/4877d6_e293da9b5c374495864511964d6dd921~mv2.jpg" },
  "Wakanda OT":                  { logo:"https://static.wixstatic.com/media/4877d6_d49e5298427146faa1a5e22be776a2ec~mv2.jpg" },
  "Cape Town Team":              { logo:"https://static.wixstatic.com/media/4877d6_9973532eb7e5406682fb091353a111ad~mv2.jpg" },
  "Swacunda Team":               { logo:"https://static.wixstatic.com/media/4877d6_87f5f6f53d31470eb025f6ea35f8b632~mv2.jpg" },
  "Mighty Durban West":          { logo:"https://static.wixstatic.com/media/4877d6_5d6cb7ce14b54374a5dddb18a4173500~mv2.jpg" },
  "Zululand Warriors":           { logo:"https://static.wixstatic.com/media/4877d6_0d2034b959604f6fa1e66df62e31f49f~mv2.jpg" },
  "Mlungwane FC":                { logo:"https://static.wixstatic.com/media/4877d6_0711c82df47f4dc797de9abf523ffc50~mv2.jpg" },
  "Durban South Rising Stars":   { logo:"https://static.wixstatic.com/media/4877d6_a01acbcd8df24c9ba467e564706e34f9~mv2.jpg" },
  "Othandweni":                  { logo:"https://static.wixstatic.com/media/4877d6_d49e5298427146faa1a5e22be776a2ec~mv2.jpg" },
  "Durban North":                { logo:"https://static.wixstatic.com/media/4877d6_e293da9b5c374495864511964d6dd921~mv2.jpg" },
  "Zululand":                    { logo:"https://static.wixstatic.com/media/4877d6_0d2034b959604f6fa1e66df62e31f49f~mv2.jpg" },
  "Durban South":                { logo:"https://static.wixstatic.com/media/4877d6_a01acbcd8df24c9ba467e564706e34f9~mv2.jpg" },
};
const getLogo = name => TEAM_META[name]?.logo || FC_LOGO;

const DEFAULT_CATS = [
  "Sound Quality","Diction","Technical Correctness","Pitch",
  "Interpretation & Musicianship","Stage Deportment",
];
const CAT_MAX = {
  "Sound Quality":10,"Diction":10,"Technical Correctness":10,
  "Pitch":10,"Interpretation & Musicianship":50,"Stage Deportment":10,
};
const CAT_MAX_DEFAULT = 10;
const GRADE_LABEL = pct =>
  pct>=90?"Superior":pct>=80?"Excellent":pct>=70?"Very Good":pct>=60?"Good":"Needs Improvement";
const GRADE_COLOR = pct =>
  pct>=90?"#f0b429":pct>=80?"#68d391":pct>=70?"#63b3ed":pct>=60?"#fff":"#fc8181";
const POS_SOCCER  = ["Goalkeeper","Defender","Midfielder","Striker","Captain"];
const POS_NETBALL = ["Goal Shooter","Goal Attack","Wing Attack","Centre","Wing Defence","Goal Defence","Goal Keeper","Captain"];
const VOICES      = ["Soprano","Alto","Tenor","Bass"];
const ORG_PIN     = "1234";
const LOCAL_KEY   = "fc_v7_local";
const uid         = () => Math.random().toString(36).slice(2,9);

// ── NETBALL POOL CONFIG ───────────────────────────────────────────────────────
const ROUND_TIMES = {1:"09:30",2:"10:05",3:"10:40",4:"11:15",5:"12:35",6:"13:10"};
const POOL_A_TEAMS = ["Wakanda OT","Durban Central United","Mlungwane FC","Zululand Warriors"];
const POOL_B_TEAMS = ["Cape Town Team","Swacunda Team","Mighty Durban West","Durban South Rising Stars"];

// ── CONFIRMED DRAW ────────────────────────────────────────────────────────────
const CONFIRMED_DRAW = {
  soccer: [
    ["Cape Town Team","Mighty Durban West"],
    ["Zululand Warriors","Durban Central United"],
    ["Wakanda OT","Durban South Rising Stars"],
    ["Swacunda Team","Mlungwane FC"],
  ],
  netball: [
    ["Zululand Warriors","Durban Central United","Pool A"],
    ["Cape Town Team","Swacunda Team","Pool B"],
    ["Wakanda OT","Mlungwane FC","Pool A"],
    ["Mighty Durban West","Durban South Rising Stars","Pool B"],
    ["Durban Central United","Mlungwane FC","Pool A"],
    ["Cape Town Team","Durban South Rising Stars","Pool B"],
    ["Wakanda OT","Zululand Warriors","Pool A"],
    ["Swacunda Team","Durban South Rising Stars","Pool B"],
    ["Mlungwane FC","Zululand Warriors","Pool A"],
    ["Mighty Durban West","Cape Town Team","Pool B"],
    ["Wakanda OT","Durban Central United","Pool A"],
    ["Swacunda Team","Mighty Durban West","Pool B"],
  ],
};

const CHOIR_SONG_ORDERS = {
  0:["Durban North","Zululand","Durban South","Othandweni"],
  1:["Othandweni","Zululand","Durban South","Durban North"],
  2:["Zululand","Durban South","Othandweni","Durban North"],
};
const CHOIR_SONGS = [
  "African Piece: Ruri by Mosoeu Moerane",
  "Western Piece: Blessed Are The Men Who Fear Him by F Mendelssohn",
  "Own Choice"
];

function loadLocal() {
  ["fc_app_state_v5","fc_v6_state","fc_v7_state"].forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});
  try{return JSON.parse(localStorage.getItem(LOCAL_KEY))||{};}catch(e){return{};}
}

async function restoreConfirmedDraw(sport) {
  const{data:evArr}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1);
  const ev=evArr?.[0]; if(!ev) throw new Error("No active event");
  const eid=ev.id;
  const{data:existing}=await supabase.from("fc_matches").select("id").eq("event_id",eid).eq("competition",sport);
  if(existing?.length) for(const m of existing) await supabase.from("fc_matches").delete().eq("id",m.id);
  const draw=CONFIRMED_DRAW[sport];
  const rows=[];
  if(sport==="netball"){
    const roundMatches={};
    draw.forEach(([teamA,teamB,pool],idx)=>{
      const round=Math.floor(idx/2)+1;
      if(!roundMatches[round]) roundMatches[round]=[];
      roundMatches[round].push({teamA,teamB,pool});
    });
    for(const [round,matches] of Object.entries(roundMatches)){
      for(const {teamA,teamB,pool} of matches){
        const{data:tA}=await supabase.from("fc_teams").select("id").eq("event_id",eid).eq("competition","netball").eq("name",teamA).limit(1);
        const{data:tB}=await supabase.from("fc_teams").select("id").eq("event_id",eid).eq("competition","netball").eq("name",teamB).limit(1);
        if(tA?.[0]&&tB?.[0]) rows.push({event_id:eid,competition:"netball",round:parseInt(round),round_label:pool,team_a_id:tA[0].id,team_b_id:tB[0].id,status:"pending",published:false});
      }
    }
  } else {
    for(const [teamA,teamB] of draw){
      const{data:tA}=await supabase.from("fc_teams").select("id").eq("event_id",eid).eq("competition",sport).eq("name",teamA).limit(1);
      const{data:tB}=await supabase.from("fc_teams").select("id").eq("event_id",eid).eq("competition",sport).eq("name",teamB).limit(1);
      if(tA?.[0]&&tB?.[0]) rows.push({event_id:eid,competition:sport,round:1,round_label:"Quarter Final",team_a_id:tA[0].id,team_b_id:tB[0].id,status:"pending",published:false});
    }
  }
  if(rows.length) await supabase.from("fc_matches").insert(rows);
  await supabase.from("fc_publish_flags").update({published:false,updated_at:new Date().toISOString()}).eq("event_id",eid).eq("competition",sport);
}

function saveLocal(data){try{localStorage.setItem(LOCAL_KEY,JSON.stringify(data));}catch(e){}}

function injectPWA(){
  if(document.getElementById("fc-pwa"))return;
  document.title="Founder's Cup — CHG";
  if(!document.querySelector("link[rel='icon']")){
    const fi=Object.assign(document.createElement("link"),{rel:"icon",type:"image/jpeg",href:FC_LOGO});
    document.head.appendChild(fi);
    const fi2=Object.assign(document.createElement("link"),{rel:"shortcut icon",type:"image/jpeg",href:FC_LOGO});
    document.head.appendChild(fi2);
  }
  const m={name:"Founder's Cup — CHG",short_name:"Founders Cup",start_url:"/",display:"standalone",background_color:"#0d1b3e",theme_color:"#0d1b3e",orientation:"portrait-primary",icons:[{src:FC_LOGO,sizes:"512x512",type:"image/jpeg",purpose:"any maskable"}]};
  const l=Object.assign(document.createElement("link"),{id:"fc-pwa",rel:"manifest",href:URL.createObjectURL(new Blob([JSON.stringify(m)],{type:"application/json"}))});
  document.head.appendChild(l);
  [["apple-touch-icon",null,FC_LOGO],[null,"apple-mobile-web-app-capable","yes"],[null,"apple-mobile-web-app-title","Founders Cup"],[null,"theme-color","#0d1b3e"]].forEach(([rel,name,val])=>{const e=rel?document.createElement("link"):document.createElement("meta");rel?Object.assign(e,{rel,href:val}):Object.assign(e,{name,content:val});document.head.appendChild(e);});
}
async function requestPush(){
  if(!("Notification"in window))return{ok:false,reason:"not_supported"};
  if(Notification.permission==="granted")return{ok:true};
  if(Notification.permission==="denied")return{ok:false,reason:"denied"};
  try{const p=await Notification.requestPermission();return{ok:p==="granted",reason:p};}catch(e){return{ok:false,reason:"error"};}
}
function pushNotify(title,body){
  if(!("Notification"in window)||Notification.permission!=="granted")return;
  try{new Notification(title,{body,icon:FC_LOGO,tag:"fc-"+Date.now()});}catch(e){}
}

const Icon=({name,size=22,stroke="currentColor",sw=1.5})=>{
  const p={fill:"none",stroke,strokeWidth:sw,strokeLinecap:"round",strokeLinejoin:"round"};
  const v={width:size,height:size,display:"block",flexShrink:0};
  const d={
    home:<><path {...p} d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path {...p} d="M9 21V12h6v9"/></>,
    soccer:<><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 3l1.5 3.5h-3L12 3zM5 8l2 1-1 3-2.5-1.5L5 8zM19 8l-2 1 1 3 2.5-1.5L19 8z"/></>,
    netball:<><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 3c2.5 4 2.5 14 0 18M3 12c4-2.5 14-2.5 18 0M5.5 6.5c2 2 11 2 13 0M5.5 17.5c2-2 11-2 13 0"/></>,
    choir:<><path {...p} d="M9 18V5l12-2v13"/><circle {...p} cx="6" cy="18" r="3"/><circle {...p} cx="18" cy="16" r="3"/></>,
    news:<><path {...p} d="M18 8a6 6 0 010 8M22 5a10 10 0 010 14M3 10v4a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1z"/></>,
    admin:<><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    trophy:<><path {...p} d="M8 21h8M12 17v4M5 3H3a2 2 0 000 4c0 3 2 5 4 6M19 3h2a2 2 0 010 4c0 3-2 5-4 6"/><path {...p} d="M8 3h8v8a4 4 0 01-8 0V3z"/></>,
    plus:<><path {...p} d="M12 5v14M5 12h14"/></>,
    check:<><path {...p} d="M20 6L9 17l-5-5"/></>,
    lock:<><rect {...p} x="3" y="11" width="18" height="11" rx="2"/><path {...p} d="M7 11V7a5 5 0 0110 0v4"/></>,
    eye:<><path {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle {...p} cx="12" cy="12" r="3"/></>,
    eyeoff:<><path {...p} d="M17.9 17.9A10.9 10.9 0 0112 20C5 20 1 12 1 12a18 18 0 015.1-6.9M9.9 4.2A10.5 10.5 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.1 3.1M1 1l22 22"/><path {...p} d="M14.1 14.1a3 3 0 01-4.2-4.2"/></>,
    trash:<><path {...p} d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path {...p} d="M10 11v6M14 11v6"/></>,
    publish:<><path {...p} d="M12 19V5M5 12l7-7 7 7"/></>,
    bracket:<><path {...p} d="M3 6h4v12H3M17 6h4v12h-4M7 12h10"/></>,
    users:<><circle {...p} cx="9" cy="8" r="3"/><path {...p} d="M2 20c0-3 2.7-5.5 7-5.5"/><circle {...p} cx="17" cy="8" r="3"/><path {...p} d="M22 20c0-3-2.7-5.5-7-5.5s-7 2.5-7 5.5"/></>,
    mic:<><rect {...p} x="9" y="2" width="6" height="12" rx="3"/><path {...p} d="M5 10a7 7 0 0014 0M12 19v3M8 22h8"/></>,
    vote:<><path {...p} d="M9 11l3 3L22 4"/><path {...p} d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    bell:<><path {...p} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></>,
    x:<><path {...p} d="M18 6L6 18M6 6l12 12"/></>,
    tag:<><path {...p} d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line {...p} x1="7" y1="7" x2="7.01" y2="7"/></>,
    shield:<><path {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    cal:<><rect {...p} x="3" y="4" width="18" height="18" rx="2"/><path {...p} d="M16 2v4M8 2v4M3 10h18"/></>,
    signal:<><path {...p} d="M2 20h.01M7 20v-4M12 20V10M17 20V4M22 20v-8"/></>,
    refresh:<><path {...p} d="M23 4v6h-6M1 20v-6h6"/><path {...p} d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>,
    download:<><path {...p} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></>,
  };
  return <svg style={v} viewBox="0 0 24 24">{d[name]||d.signal}</svg>;
};

const TL=({name,size=48,style={}})=>(
  <img src={getLogo(name)} alt={name||""} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(240,180,41,.3)",flexShrink:0,...style}} onError={e=>{e.target.style.opacity=".2";}}/>
);

const Spinner=({size=32})=>(
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:32}}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="rgba(240,180,41,.2)" strokeWidth="2"/>
      <path d="M12 2a10 10 0 0110 10" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{animation:"spin .8s linear infinite"}}/>
    </svg>
    <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
  </div>
);

const CSS=`
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
@media(min-width:768px){
  .app{max-width:100%;}
  .app-body{display:flex;justify-content:center;}
  .hdr{max-width:100%;padding:12px 32px;}
  .nav{max-width:100%;padding:0 calc(50% - 400px);}
  .pg-banner,.pgb{padding:28px 40px 22px;}
  .inner{padding:20px 40px 8px;max-width:860px;margin:0 auto;width:100%;}
  .hero{padding:36px 40px 28px;}
  .tgrid{grid-template-columns:repeat(8,1fr);gap:14px;}
  .srow{grid-template-columns:repeat(3,200px);}
  .fgrid{grid-template-columns:1fr 1fr 1fr;}
  .tabs{padding:0 40px;}
  .card{max-width:860px;}
  .bscroll{padding:0 40px 16px;}
  .pwab{margin:0 40px 14px;}
}
@media(min-width:1024px){
  .tgrid{grid-template-columns:repeat(8,1fr);}
  .hdr{padding:12px 48px;}
  .inner{max-width:960px;}
}
.app-body{flex:1;overflow-y:auto;padding-bottom:calc(var(--nav-h) + var(--safe-b) + 8px);}
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
.pw{animation:pe .42s cubic-bezier(.25,.46,.45,.94) both;}
@keyframes pe{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes fu{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
.fu{animation:fu .38s ease both;}
.fu1{animation-delay:.05s;}.fu2{animation-delay:.1s;}.fu3{animation-delay:.15s;}.fu4{animation-delay:.2s;}.fu5{animation-delay:.25s;}.fu6{animation-delay:.3s;}
.hdr{background:rgba(13,27,62,.96);border-bottom:2px solid var(--gold);padding:11px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;backdrop-filter:blur(16px);}
.hdr-brand{display:flex;align-items:center;gap:10px;}
.hdr-logo{width:34px;height:34px;border-radius:50%;object-fit:cover;border:1.5px solid var(--gold);}
.h-title{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:800;letter-spacing:2px;color:var(--gold);text-transform:uppercase;line-height:1;}
.h-sub{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:1px;}
.adm-btn{display:flex;align-items:center;gap:6px;padding:7px 12px;border:1px solid var(--gold-border);border-radius:20px;background:var(--gold-dim);color:var(--gold);font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.adm-btn.on{background:var(--gold);color:var(--navy);}
.rp{padding:4px 10px;border:1px solid var(--gold-border);border-radius:20px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);background:var(--gold-dim);font-family:'Barlow Condensed',sans-serif;font-weight:700;}
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:100%;background:rgba(13,27,62,.97);border-top:1px solid var(--gold-border);display:flex;padding-bottom:var(--safe-b);z-index:100;height:var(--nav-h);backdrop-filter:blur(20px);}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;padding:6px 2px;color:rgba(255,255,255,.6);transition:color .2s;border:none;background:none;position:relative;}
.ni.on{color:var(--gold);}
.ni.on::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:28px;height:2px;background:var(--gold);border-radius:0 0 3px 3px;}
.nl{font-size:9px;letter-spacing:.8px;text-transform:uppercase;font-weight:700;font-family:'Barlow Condensed',sans-serif;color:inherit;}
.nbadge{position:absolute;top:5px;right:calc(50% - 17px);min-width:17px;height:17px;background:#e53e3e;border-radius:9px;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid var(--navy);animation:badgepop .35s cubic-bezier(.34,1.56,.64,1);}
@keyframes badgepop{from{transform:scale(0);}to{transform:scale(1);}}
.live-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#38a169;margin-right:6px;animation:pulse 2s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);}}
.pg{padding:0 0 16px;}
.pgb{background:linear-gradient(160deg,var(--navy3) 0%,var(--navy2) 100%);border-bottom:1px solid var(--border);padding:20px 18px 16px;position:relative;overflow:hidden;}
.pgb::after{content:'';position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,var(--gold-dim) 0%,transparent 70%);pointer-events:none;}
.pgl{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:3px;font-weight:700;font-family:'Barlow Condensed',sans-serif;}
.pgt{font-family:'Barlow Condensed',sans-serif;font-size:34px;font-weight:900;letter-spacing:2px;text-transform:uppercase;line-height:1;}
.pgt .acc{color:var(--gold);}
.pgs{font-size:13px;color:var(--muted);margin-top:5px;}
.inner{padding:16px 18px 4px;}
.hero{background:linear-gradient(180deg,var(--navy3) 0%,var(--navy) 100%);padding:26px 20px 20px;text-align:center;border-bottom:1px solid var(--border);position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(240,180,41,.1) 0%,transparent 60%);pointer-events:none;}
.hero-logo{width:86px;height:86px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);box-shadow:0 0 30px rgba(240,180,41,.28);margin-bottom:12px;position:relative;animation:hli .7s cubic-bezier(.34,1.56,.64,1) .1s both;}
@keyframes hli{from{opacity:0;transform:scale(.6);}to{opacity:1;transform:scale(1);}}
.hero-title{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:900;letter-spacing:3px;text-transform:uppercase;line-height:1;}
.hero-title em{color:var(--gold);font-style:normal;}
.hero-sub{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-top:6px;font-family:'Barlow Condensed',sans-serif;}
.card{background:var(--navy3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;}
.card-gold{border-color:var(--gold-border);background:linear-gradient(135deg,rgba(240,180,41,.07) 0%,var(--navy3) 60%);}
.card-sm{padding:12px 14px;}
.srow{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.sbox{background:var(--navy3);border:1px solid var(--border);border-radius:10px;padding:12px 6px;text-align:center;}
.sn{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:700;color:var(--gold);line-height:1;}
.sl{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-top:3px;font-family:'Barlow Condensed',sans-serif;}
.tgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;}
.tgi{display:flex;flex-direction:column;align-items:center;gap:6px;}
.tgi-logo{width:54px;height:54px;border-radius:50%;object-fit:cover;border:2px solid var(--border2);}
.tgi-name{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;text-align:center;line-height:1.2;}
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
.fg{margin-bottom:13px;}
.fl{display:block;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;font-family:'Barlow Condensed',sans-serif;font-weight:700;}
.fi{width:100%;padding:11px 13px;background:rgba(0,0,0,.25);border:1px solid var(--border);border-radius:8px;color:#fff;font-family:'Barlow',sans-serif;font-size:14px;transition:border-color .2s;-webkit-appearance:none;}
.fi:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(240,180,41,.1);}
.fi::placeholder{color:var(--muted2);}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.fsec{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin:16px 0 10px;font-weight:700;padding-bottom:5px;border-bottom:1px solid var(--gold-border);}
.sechd{display:flex;align-items:center;justify-content:space-between;margin:16px 0 10px;}
.secht{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);font-weight:700;}
.gline{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.gline::before,.gline::after{content:'';flex:1;height:1px;background:var(--border);}
.gline-t{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);font-weight:700;white-space:nowrap;}
.tag{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;font-family:'Barlow Condensed',sans-serif;}
.tg{background:var(--gold-dim);color:var(--gold);border:1px solid var(--gold-border);}
.tgn{background:rgba(56,161,105,.1);color:#68d391;border:1px solid rgba(56,161,105,.2);}
.tgr{background:rgba(229,62,62,.1);color:#fc8181;border:1px solid rgba(229,62,62,.2);}
.tgm{background:rgba(255,255,255,.05);color:var(--muted);border:1px solid var(--border);}
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
.ccard{background:var(--navy3);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;position:relative;}
.sbr{display:flex;align-items:center;gap:9px;margin-bottom:6px;}
.sbl{font-size:12px;color:var(--muted);width:88px;flex-shrink:0;font-family:'Barlow Condensed',sans-serif;font-weight:600;}
.sbt{flex:1;height:3px;background:rgba(255,255,255,.07);border-radius:2px;}
.sbf{height:100%;background:var(--gold);border-radius:2px;transition:width .6s ease;}
.sbv{font-family:'Barlow Condensed',sans-serif;font-size:12px;color:var(--gold);font-weight:700;width:26px;text-align:right;flex-shrink:0;}
.drow{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);}
.drow:last-child{border-bottom:none;}
.dlbl{font-size:14px;flex:1;font-weight:500;}
.dots{display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end;}
.dot{width:25px;height:25px;border-radius:50%;border:1px solid var(--muted2);background:transparent;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;color:var(--muted);display:flex;align-items:center;justify-content:center;transition:all .15s;}
.dot:hover{border-color:var(--gold);color:var(--gold);}
.dot.on{background:var(--gold);border-color:var(--gold);color:var(--navy);}
.champ{position:relative;overflow:hidden;background:linear-gradient(135deg,#1a2800 0%,#0d1400 50%,#1a2800 100%);border:1px solid var(--gold-border);border-radius:14px;padding:20px;text-align:center;margin-bottom:12px;}
.champ::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(240,180,41,.15) 0%,transparent 60%);}
.cl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);opacity:.8;margin-bottom:6px;position:relative;font-weight:700;}
.cn{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:900;color:var(--gold);position:relative;letter-spacing:1px;text-transform:uppercase;line-height:1.1;}
.cs{font-size:11px;color:var(--muted);margin-top:5px;position:relative;}
.clogo{width:68px;height:68px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);margin-bottom:10px;box-shadow:0 0 20px rgba(240,180,41,.3);position:relative;}
.ann{padding:14px 14px 14px 16px;background:var(--navy3);border-left:3px solid var(--gold);border-radius:0 10px 10px 0;margin-bottom:10px;display:flex;gap:10px;}
.ann.urg{border-left-color:#fc8181;background:rgba(229,62,62,.04);}
.ann-bw{flex:1;}
.ann-time{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:5px;display:flex;align-items:center;gap:6px;}
.ann-body{font-size:14px;line-height:1.6;}
.pcard{display:flex;align-items:center;gap:11px;padding:10px 13px;background:rgba(0,0,0,.2);border:1px solid var(--border);border-radius:8px;margin-bottom:7px;}
.pav{width:36px;height:36px;border-radius:50%;background:var(--navy3);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;color:var(--muted);flex-shrink:0;}
.urow{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--navy3);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;}
.uav{width:38px;height:38px;border-radius:50%;background:var(--gold-dim);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:var(--gold);flex-shrink:0;}
.tabs{display:flex;border-bottom:1px solid var(--border);padding:0 18px;overflow-x:auto;}
.tab{padding:10px 13px;background:none;border:none;border-bottom:2px solid transparent;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;color:var(--muted);white-space:nowrap;transition:color .2s,border-color .2s;}
.tab.on{color:var(--gold);border-bottom-color:var(--gold);}
.empty{display:flex;flex-direction:column;align-items:center;padding:48px 24px;text-align:center;gap:12px;}
.eti{color:rgba(255,255,255,.09);}
.ett{font-size:13px;color:var(--muted);line-height:1.6;max-width:240px;}
.toast{position:fixed;top:72px;left:50%;transform:translateX(-50%);background:var(--navy3);border:1px solid var(--gold-border);border-radius:8px;padding:10px 18px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gold);z-index:999;white-space:nowrap;pointer-events:none;animation:toastin .25s ease;}
@keyframes toastin{from{opacity:0;transform:translateX(-50%) translateY(-8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
.ov{position:fixed;inset:0;background:rgba(5,10,25,.9);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(8px);animation:fdi .2s ease;}
.ms{background:var(--navy2);border-radius:16px;border:1px solid var(--border2);width:100%;max-width:400px;padding:28px 22px;max-height:88vh;overflow-y:auto;}
.mh{width:36px;height:3px;background:var(--border2);border-radius:3px;margin:0 auto 20px;}
.mt2{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;color:#fff;}
.msub{font-size:13px;color:var(--muted);margin-bottom:20px;}
@keyframes fdi{from{opacity:0;}to{opacity:1;}}
.pino{position:fixed;inset:0;background:rgba(5,10,25,.92);z-index:300;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(10px);animation:fdi .2s ease;}
.pinb{background:var(--navy2);border:1px solid var(--border2);border-radius:16px;padding:28px 24px;width:100%;max-width:320px;text-align:center;}
.pinf{width:100%;padding:14px;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:10px;color:var(--gold);font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:700;letter-spacing:12px;text-align:center;margin-bottom:12px;transition:border-color .2s;}
.pinf:focus{outline:none;border-color:var(--gold);}
.pwab{margin:0 18px 14px;padding:14px 16px;background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:10px;display:flex;align-items:center;gap:12px;}
.pwal{width:40px;height:40px;border-radius:10px;object-fit:cover;flex-shrink:0;}
.svs{display:flex;align-items:center;margin-bottom:14px;}
.ss{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;}
.ssn{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;text-align:center;}
.ssp{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:var(--muted);letter-spacing:2px;padding:0 6px;margin-top:20px;}
.since{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:4px;background:rgba(240,180,41,.06);border:1px solid var(--gold-border);font-size:11px;color:var(--muted);}
.jhdr{background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
hr{border:none;border-top:1px solid var(--border);margin:14px 0;}
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

function useToast(){
  const[msg,setMsg]=useState(null);
  const show=m=>{setMsg(m);setTimeout(()=>setMsg(null),2400);};
  return[msg?<div className="toast">{msg}</div>:null,show];
}

function usePinDialog(){
  const[cfg,setCfg]=useState(null);
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
  return[el,ask];
}

function PinInput({onOk,onCancel}){
  const[pin,setPin]=useState("");
  return(
    <>
      <input className="pinf" type="password" placeholder="····" autoFocus value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onOk(pin)}/>
      <button className="btn bd" style={{marginBottom:8}} onClick={()=>onOk(pin)}><Icon name="check" size={14}/> Confirm</button>
      <button className="btn bo" onClick={onCancel}>Cancel</button>
    </>
  );
}

function Splash({onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3400);return()=>clearTimeout(t);},[]);
  return(
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

function AdminModal({onLogin,onClose}){
  const[step,setStep]=useState("role");
  const[role,setRole]=useState(null);
  const[uid2,setUid2]=useState("");
  const[pin,setPin]=useState("");
  const[err,setErr]=useState("");
  const[users,setUsers]=useState([]);
  const[loading,setLoading]=useState(false);
  const roles=[
    {id:"organizer",label:"Tournament Organizer",desc:"Full control",icon:"trophy"},
    {id:"judge",label:"Choir Judge",desc:"Score on your tablet",icon:"mic"},
    {id:"teamadmin",label:"Team Admin",desc:"Manage your team",icon:"users"},
  ];
  const loadUsers=async(r)=>{
    if(r==="organizer")return;
    setLoading(true);
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1);
      const eid=ev?.[0]?.id;if(!eid)return;
      const{data}=await supabase.from("fc_users").select("*").eq("event_id",eid).eq("role",r);
      setUsers(data||[]);
    }catch(e){console.warn("Load users error",e);}
    setLoading(false);
  };
  const attempt=()=>{
    setErr("");
    if(role==="organizer"){if(pin!==ORG_PIN){setErr("Incorrect PIN.");return;}onLogin({id:"organizer",name:"Organizer",role:"organizer"});}
    else{const u=users.find(x=>x.id===uid2);if(!u||u.pin!==pin){setErr("Incorrect PIN.");return;}onLogin({...u,role});}
  };
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="ms">
        <div className="mh"/>
        <div className="mt2">Admin Login</div>
        <div className="msub">Select your role</div>
        {step==="role"&&roles.map(r=>(
          <button key={r.id} onClick={()=>{setRole(r.id);setUid2("");setPin("");setErr("");setStep("pin");loadUsers(r.id);}}
            style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,.04)",border:"1px solid var(--border)",borderRadius:10,marginBottom:10,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12,color:"#fff",transition:"border-color .2s"}}
            onMouseOver={e=>e.currentTarget.style.borderColor="var(--gold)"}
            onMouseOut={e=>e.currentTarget.style.borderColor="var(--border)"}>
            <div style={{width:40,height:40,borderRadius:9,background:"var(--gold-dim)",border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--gold)"}}><Icon name={r.icon} size={18}/></div>
            <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,textTransform:"uppercase"}}>{r.label}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{r.desc}</div></div>
          </button>
        ))}
        {step==="pin"&&(
          <div>
            <button onClick={()=>{setStep("role");setUsers([]);}} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:11,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",marginBottom:16,fontWeight:700}}>← Back</button>
            {loading&&<div style={{textAlign:"center",padding:16,color:"var(--muted)",fontSize:13}}>Loading profiles...</div>}
            {!loading&&role!=="organizer"&&users.length>0&&(
              <div className="fg"><label className="fl">Your Name</label>
                <select className="fi" value={uid2} onChange={e=>setUid2(e.target.value)}>
                  <option value="">— Select your name —</option>
                  {users.map(u=><option key={u.id} value={u.id}>{u.name}{u.team_id?" — "+u.team_id:""}</option>)}
                </select>
              </div>
            )}
            {!loading&&role!=="organizer"&&users.length===0&&(
              <div style={{fontSize:13,color:"var(--muted)",padding:"12px",background:"rgba(255,255,255,.03)",borderRadius:8,border:"1px solid var(--border)",marginBottom:14,lineHeight:1.6}}>
                No {role==="judge"?"judges":"team admins"} set up yet. Ask the organizer to add profiles in Admin → Users.
              </div>
            )}
            {(role==="organizer"||(uid2&&role!=="organizer"))&&(
              <>
                {err&&<div style={{fontSize:12,color:"#fc8181",textAlign:"center",marginBottom:10}}>{err}</div>}
                <div className="fg"><label className="fl">PIN</label><input className="fi" type="password" placeholder="····" style={{fontSize:24,letterSpacing:10,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif"}} value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()}/></div>
                <button className="btn bp" onClick={attempt}><Icon name="check" size={15}/> Enter</button>
              </>
            )}
            <div style={{marginTop:16,textAlign:"center",fontSize:11,color:"var(--muted)",cursor:"pointer",letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={onClose}><Icon name="eye" size={13}/> Continue as spectator</div>
          </div>
        )}
      </div>
    </div>
  );
}

function PWABanner(){
  const[prompt,setPrompt]=useState(null);
  const[show,setShow]=useState(false);
  const[gone,setGone]=useState(()=>!!localStorage.getItem("fc_pwa_gone"));
  useEffect(()=>{const h=e=>{e.preventDefault();setPrompt(e);setShow(true);};window.addEventListener("beforeinstallprompt",h);return()=>window.removeEventListener("beforeinstallprompt",h);},[]);
  if(!show||gone)return null;
  const install=async()=>{if(!prompt)return;prompt.prompt();const{outcome}=await prompt.userChoice;setShow(false);if(outcome==="accepted")localStorage.setItem("fc_pwa_gone","1");};
  return(
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

export default function FoundersCup(){
  const[splash,setSplash]=useState(()=>{try{return!sessionStorage.getItem("fc_session");}catch(e){return true;}});
  const[adminModal,setAdminModal]=useState(false);
  const[user,setUser]=useState(()=>{try{const s=sessionStorage.getItem("fc_session");return s?JSON.parse(s):null;}catch(e){return null;}});
  const[tab,setTab]=useState("home");
  const[toast,showToast]=useToast();
  const[pinEl,askPin]=usePinDialog();
  const[local,setLocal]=useState(loadLocal);
  const[lastSeen,setLastSeen]=useState(()=>parseInt(localStorage.getItem("fc_last_seen")||"0"));
  const[announcements,setAnnouncements]=useState([]);
  const[unread,setUnread]=useState(0);

  useEffect(()=>{injectPWA();},[]);

  useEffect(()=>{
    const tabHistory=[];
    const handlePopState=(e)=>{
      e.preventDefault();
      if(tabHistory.length>1){tabHistory.pop();const prev=tabHistory[tabHistory.length-1];setTab(prev);}
      else{window.history.pushState({tab:"home"},"","");setTab("home");}
    };
    window.addEventListener("popstate",handlePopState);
    window.history.pushState({tab:"home"},"","");
    return()=>window.removeEventListener("popstate",handlePopState);
  },[]);

  const[sessionStart]=useState(()=>Date.now());
  const[sessionTime,setSessionTime]=useState("");
  useEffect(()=>{
    if(!user)return;
    const iv=setInterval(()=>{
      const elapsed=Date.now()-sessionStart;
      const h=Math.floor(elapsed/3600000);
      const m=Math.floor((elapsed%3600000)/60000);
      setSessionTime(`${h}h ${m}m`);
      if(elapsed>8*60*60*1000){setUser(null);setTab("home");try{sessionStorage.removeItem("fc_session");}catch(e){}showToast("Session expired — please log in again.");}
    },30000);
    return()=>clearInterval(iv);
  },[user,sessionStart]);

  useEffect(()=>{
    const onFocus=()=>{setTimeout(()=>loadAnnouncements(),200);};
    window.addEventListener("focus",onFocus);
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")loadAnnouncements();});
    return()=>{window.removeEventListener("focus",onFocus);};
  },[]);

  useEffect(()=>{saveLocal(local);},[local]);

  useEffect(()=>{
    setTimeout(()=>loadAnnouncements(),300);
    const ch=supabase.channel("ann_realtime")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"fc_announcements"},payload=>{
        setAnnouncements(a=>[payload.new,...a]);
        setUnread(u=>u+1);
        if(Notification.permission==="granted"&&localStorage.getItem("fc_push_enabled")==="1")pushNotify(payload.new.urgent?"🚨 Founders Cup — Urgent":"📢 Founders Cup",payload.new.body);
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"fc_announcements"},payload=>{
        setAnnouncements(a=>a.filter(x=>x.id!==payload.old.id));
      })
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[]);

  async function loadAnnouncements(retries=3){
    for(let i=0;i<retries;i++){
      try{
        const{data,error}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
        if(error)throw error;
        if(!data)throw new Error("No active event");
        const eid=data.id;
        const{data:anns,error:ae}=await supabase.from("fc_announcements").select("*").eq("event_id",eid).order("created_at",{ascending:false});
        if(ae)throw ae;
        setAnnouncements(anns||[]);
        const newCount=(anns||[]).filter(a=>new Date(a.created_at).getTime()>lastSeen).length;
        setUnread(newCount);
        return;
      }catch(e){console.warn("Announcement load attempt "+(i+1)+" failed:",e.message);if(i<retries-1)await new Promise(r=>setTimeout(r,1500*(i+1)));}
    }
  }

  const handleTab=t=>{
    setTab(t);
    window.history.pushState({tab:t},"","");
    if(t==="news"){const now=Date.now();setLastSeen(now);localStorage.setItem("fc_last_seen",now);setUnread(0);}
  };

  const role=user?.role||"spectator";
  const isOrg=role==="organizer";

  const navItems=[
    {id:"home",lbl:"Home",icon:"home"},
    {id:"soccer",lbl:"Soccer",icon:"soccer"},
    {id:"netball",lbl:"Netball",icon:"netball"},
    {id:"choir",lbl:"Choir",icon:"choir"},

    {id:"news",lbl:"News",icon:"news",badge:unread},
    ...(isOrg?[{id:"admin",lbl:"Admin",icon:"admin"}]:[]),
  ];

  if(splash)return<><style>{CSS}</style><Splash onDone={()=>setSplash(false)}/></>;

  return(
    <>
      <style>{CSS}</style>
      {toast}{pinEl}
      {adminModal&&<AdminModal onLogin={u=>{setUser(u);setAdminModal(false);try{sessionStorage.setItem("fc_session",JSON.stringify(u));}catch(e){}showToast(`Welcome, ${u.name}`);if(u.role==="organizer")setTab("admin");else if(u.role==="judge")setTab("choir");else setTab("soccer");}} onClose={()=>setAdminModal(false)}/>}
      <div className="app">
        <header className="hdr">
          <div className="hdr-brand">
            <img src={FC_LOGO} className="hdr-logo" alt=""/>
            <div><div className="h-title">Founder's Cup</div><div className="h-sub">Church of the Holy Ghost</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {user?(<><div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1}}><span className="rp">{user.name}</span>{sessionTime&&<span style={{fontSize:9,color:"var(--muted)",letterSpacing:.5,fontFamily:"'Barlow Condensed',sans-serif"}}>{sessionTime}</span>}</div><button className="adm-btn on" onClick={()=>{setUser(null);setTab("home");showToast("Signed out");try{sessionStorage.removeItem("fc_session");}catch(e){}}}><Icon name="lock" size={13}/> Out</button></>):(<button className="adm-btn" onClick={()=>setAdminModal(true)}><Icon name="admin" size={13}/> Admin</button>)}
          </div>
        </header>
        <div className="app-body">
          {tab==="home"   &&<HomePage announcements={announcements} onChampClick={sport=>{if(sport==="soccer")setTab("soccer");else if(sport==="netball")setTab("netball");else if(sport==="choir")setTab("choir");}}/>}
          {tab==="soccer" &&<SportPage sport="soccer"  role={role} user={user} local={local} askPin={askPin} showToast={showToast}/>}
          {tab==="netball"&&<SportPage sport="netball" role={role} user={user} local={local} askPin={askPin} showToast={showToast}/>}
          {tab==="choir"  &&<ChoirPage role={role} user={user} local={local} setLocal={setLocal} askPin={askPin} showToast={showToast}/>}
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

function HomePage({announcements,onChampClick}){
  const[champions,setChampions]=useState([]);
  const[latestResult,setLatestResult]=useState(null);
  const[loading,setLoading]=useState(true);
  const[revealed,setRevealed]=useState({});

  useEffect(()=>{
    async function load(){
      try{
        const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
        const eid=ev.id;
        const[{data:sc},{data:nc},{data:cc}]=await Promise.all([
          supabase.from("fc_matches_view").select("*").eq("event_id",eid).eq("competition","soccer").eq("published",true),
          supabase.from("fc_matches_view").select("*").eq("event_id",eid).eq("competition","netball").eq("published",true),
          supabase.from("fc_choir_leaderboard").select("*").eq("event_id",eid),
        ]);
        const champs=[];
        const findChamp=(matches,sport)=>{
          if(!matches?.length)return;
          const maxR=Math.max(...matches.map(m=>m.round));
          const f=matches.find(m=>m.round===maxR&&m.winner_id);
          if(f)champs.push({sport,name:f.winner_name,scoreA:f.score_a,scoreB:f.score_b,teamA:f.team_a_name,teamB:f.team_b_name,winnerId:f.winner_id,teamAId:f.team_a_id});
        };
        findChamp(sc,"Soccer");findChamp(nc,"Netball");
        const pf=await supabase.from("fc_publish_flags").select("*").eq("event_id",eid).eq("competition","choir").eq("published",true).maybeSingle();
        if(pf.data&&cc?.length)champs.push({sport:"Choir",name:cc[0].group_name,score:cc[0].overall?.toFixed(1)});
        setChampions(champs);
        // latest result ticker — most recently confirmed published match
        const allMatches=[...(sc||[]),...(nc||[])].filter(m=>m.winner_id&&m.published);
        if(allMatches.length){
          allMatches.sort((a,b)=>new Date(b.updated_at||0)-new Date(a.updated_at||0));
          setLatestResult(allMatches[0]);
        }
      }catch(e){console.warn("Home load error",e);}
      setLoading(false);
    }
    load();
    const ch=supabase.channel("home_rt")
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"fc_matches"},()=>load())
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"fc_publish_flags"},()=>load())
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[]);

  const allTeamNames=["Durban Central United","Wakanda OT","Cape Town Team","Swacunda Team","Mighty Durban West","Zululand Warriors","Mlungwane FC","Durban South Rising Stars"];

  const ChampReveal=({c,i})=>{
    const isChoir=c.sport==="Choir";
    const aWon=c.winnerId===c.teamAId;
    return(
      <div className="champ fu" onClick={()=>onChampClick&&onChampClick(c.sport)} style={{cursor:"pointer",position:"relative",overflow:"hidden"}}>
        {/* confetti particles */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
          {Array.from({length:16},(_,pi)=>(
            <div key={pi} style={{position:"absolute",width:5+Math.random()*4,height:5+Math.random()*4,borderRadius:"50%",background:["#f0b429","#ffd166","#fff","rgba(240,180,41,.5)"][pi%4],left:`${Math.random()*100}%`,animation:`fall ${2+Math.random()*3}s linear ${Math.random()*3}s infinite`,opacity:.6}}/>
          ))}
        </div>
        <img src={getLogo(c.name)} className="clogo" alt={c.name} style={{animation:"hli .7s cubic-bezier(.34,1.56,.64,1) both"}}/>
        <div className="cl">{c.sport==="Soccer"?"⚽":c.sport==="Netball"?"🏐":"🎵"} {c.sport} Champions</div>
        <div className="cn" style={{fontSize:32}}>{c.name}</div>
        {!isChoir&&c.teamA&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginTop:14,position:"relative"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <TL name={c.teamA} size={36}/>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:700,color:aWon?"var(--gold)":"rgba(255,255,255,.4)",maxWidth:72,textAlign:"center",lineHeight:1.2}}>{c.teamA}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:38,fontWeight:900,color:aWon?"var(--gold)":"rgba(255,255,255,.3)",lineHeight:1}}>{c.scoreA}</span>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,color:"rgba(255,255,255,.3)",fontWeight:700}}>—</span>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:38,fontWeight:900,color:!aWon?"var(--gold)":"rgba(255,255,255,.3)",lineHeight:1}}>{c.scoreB}</span>
              </div>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,.3)",marginTop:2}}>Final</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <TL name={c.teamB} size={36}/>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:700,color:!aWon?"var(--gold)":"rgba(255,255,255,.4)",maxWidth:72,textAlign:"center",lineHeight:1.2}}>{c.teamB}</span>
            </div>
          </div>
        )}
        {isChoir&&c.score&&(
          <div style={{marginTop:10,position:"relative"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:42,fontWeight:900,color:"var(--gold)",lineHeight:1}}>{c.score}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"rgba(240,180,41,.5)",marginTop:4}}>Points · Out of 100</div>
          </div>
        )}
        <div style={{fontSize:10,color:"rgba(240,180,41,.5)",letterSpacing:2,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",marginTop:12,position:"relative"}}>Tap to view full results →</div>
      </div>
    );
  };

  return(
    <div className="pw">
      <style>{`@keyframes fall{0%{transform:translateY(-10px) rotate(0deg);opacity:1;}100%{transform:translateY(350px) rotate(360deg);opacity:0;}}`}</style>
      <div className="hero">
        <img src={FC_LOGO} className="hero-logo" alt=""/>
        <div className="hero-title fu fu1">Founder's <em>Cup</em></div>
        <div className="hero-sub fu fu2">Church of the Holy Ghost · Annual Championship</div>
      </div>
      <PWABanner/>
      <div className="inner">
        {/* Live ticker */}
        {latestResult&&(
          <div className="fu fu1" style={{background:"rgba(240,180,41,.07)",border:"1px solid rgba(240,180,41,.2)",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"var(--gold)",flexShrink:0,animation:"pulse 2s ease-in-out infinite"}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"rgba(240,180,41,.7)",fontWeight:700,marginBottom:2}}>{latestResult.competition?.toUpperCase()} · Latest Result</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{latestResult.team_a_name} <span style={{color:"var(--gold)"}}>{latestResult.score_a}</span> — <span style={{color:"var(--gold)"}}>{latestResult.score_b}</span> {latestResult.team_b_name}</div>
            </div>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:1,textTransform:"uppercase",color:"var(--gold)",fontWeight:700,flexShrink:0}}>🏆 {latestResult.winner_name}</span>
          </div>
        )}
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
          <><div className="gline fu fu3"><span className="gline-t">🏆 Champions</span></div>
          {champions.map((c,i)=><ChampReveal key={c.sport} c={c} i={i}/>)}</>
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

// ── NETBALL POOL HELPERS ──────────────────────────────────────────────────────
function calcStandings(matches,poolLabel){
  const poolMatches=matches.filter(m=>m.round_label===poolLabel&&m.round<=6);
  const teams={};
  const initTeam=name=>{if(!teams[name])teams[name]={name,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};};
  poolMatches.forEach(m=>{
    if(m.score_a===null||m.score_b===null)return;
    const a=m.team_a_name,b=m.team_b_name;
    if(!a||!b)return;
    initTeam(a);initTeam(b);
    teams[a].p++;teams[b].p++;
    teams[a].gf+=m.score_a||0;teams[a].ga+=m.score_b||0;
    teams[b].gf+=m.score_b||0;teams[b].ga+=m.score_a||0;
    if(m.winner_id===m.team_a_id){teams[a].w++;teams[a].pts+=3;teams[b].l++;}
    else if(m.winner_id===m.team_b_id){teams[b].w++;teams[b].pts+=3;teams[a].l++;}
    else{teams[a].d++;teams[b].d++;teams[a].pts+=1;teams[b].pts+=1;}
  });
  return Object.values(teams).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
}

// ── SPORT PAGE ────────────────────────────────────────────────────────────────
function SportPage({sport,role,user,local,askPin,showToast}){
  const[tab,setTab]=useState("bracket");
  const[teams,setTeams]=useState([]);
  const[matches,setMatches]=useState([]);
  const[published,setPublished]=useState(false);
  const[loading,setLoading]=useState(true);
  const isOrg=role==="organizer",isTA=role==="teamadmin";
  const isNetball=sport==="netball";
  const sportLabel=sport==="soccer"?"Soccer":"Netball";

  const load=useCallback(async()=>{
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      if(!ev||!ev.id)throw new Error("No active event");
      const eid=ev.id;
      const[teamsRes,matchesRes,pfRes]=await Promise.all([
        supabase.from("fc_teams").select("*,fc_players(*)").eq("event_id",eid).eq("competition",sport),
        supabase.from("fc_matches_view").select("*").eq("event_id",eid).eq("competition",sport).order("round",{ascending:true}),
        supabase.from("fc_publish_flags").select("*").eq("event_id",eid).eq("competition",sport),
      ]);
      setTeams(teamsRes.data||[]);
      setMatches(matchesRes.data||[]);
      setPublished(pfRes.data?.[0]?.published||false);
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
    const poll=setInterval(()=>load(),15000);
    return()=>{supabase.removeChannel(ch);clearInterval(poll);};
  },[sport,load]);

  const tabs=[
    {id:"bracket",lbl:isNetball?"Pools & Results":"Bracket"},
    {id:"teams",lbl:"Teams & Players"},
    ...(isOrg?[{id:"scores",lbl:"Scores"},{id:"register",lbl:"Register"}]:[]),
    ...(isTA?[{id:"register",lbl:"My Roster"}]:[]),
  ];

  return(
    <div className="pw pg">
      <div className="pgb">
        <div className="pgl fu">{sport==="soccer"?"⚽":"🏐"} Tournament</div>
        <div className="pgt fu fu1">{sportLabel}</div>
        <div className="pgs fu fu2">
          <span className="live-dot"/>
          {isNetball?"Pool Stage · Semi Finals · Final · 8 Teams":"Single Elimination · 8 Teams"} · {published?"Live":"Awaiting"}
        </div>
      </div>
      <div className="tabs">{tabs.map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.lbl}</button>)}</div>
      <div className="inner">
        {loading?<Spinner/>:<>
          {tab==="bracket"&&(isNetball
            ?<NetballView matches={matches} isOrg={isOrg} published={published}/>
            :<BracketView matches={matches} isOrg={isOrg} published={published}/>
          )}
          {tab==="teams"   &&<TeamsView teams={teams} isOrg={isOrg} sport={sport} askPin={askPin} showToast={showToast} onRefresh={load}/>}
          {tab==="scores"  &&isOrg&&(isNetball
            ?<NetballScoresView sport={sport} teams={teams} matches={matches} published={published} askPin={askPin} showToast={showToast} onRefresh={load}/>
            :<ScoresView sport={sport} teams={teams} matches={matches} published={published} askPin={askPin} showToast={showToast} onRefresh={load}/>
          )}
          {tab==="register"&&(isOrg||isTA)&&<RegisterView sport={sport} teams={teams} role={role} user={user} local={local} askPin={askPin} showToast={showToast} onRefresh={load}/>}
        </>}
      </div>
    </div>
  );
}

// ── NETBALL VIEW (spectator + judge) ─────────────────────────────────────────
function NetballView({matches,isOrg,published}){
  const visible=isOrg?matches:(published?matches:[]);
  if(!visible.length)return(
    <div className="empty fu">
      <div className="eti"><Icon name="netball" size={38} sw={1}/></div>
      <div className="ett">{isOrg?"Pool fixtures will appear here. Use the Scores tab to enter results.":"Results will be published here once available."}</div>
    </div>
  );
  const poolMatches=visible.filter(m=>m.round>=1&&m.round<=6);
  const semiMatches=visible.filter(m=>m.round===7);
  const finalMatch=visible.find(m=>m.round===8);
  const standingsA=calcStandings(visible,"Pool A");
  const standingsB=calcStandings(visible,"Pool B");
  const allPoolDone=poolMatches.length>=12&&poolMatches.every(m=>m.winner_id||m.status==="completed");

  return(
    <div className="pw">

      {/* POOL MATCHES */}
      <div className="gline"><span className="gline-t">Pool Stage</span></div>
      {[1,2,3,4,5,6].map(r=>{
        const rMatches=poolMatches.filter(m=>m.round===r);
        if(!rMatches.length)return null;
        return(
          <div key={r}>
            {r===5&&(
              <div style={{textAlign:"center",padding:"8px 0",margin:"4px 0 10px",borderTop:"1px dashed var(--border)",borderBottom:"1px dashed var(--border)"}}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--muted)",fontWeight:700}}>Lunch Break · 11:35 – 12:35</span>
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,marginTop:r>1&&r!==5?10:0}}>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",fontWeight:700}}>Round {r}</span>
              <span style={{fontSize:10,color:"var(--muted)",fontFamily:"'Barlow Condensed',sans-serif"}}>{ROUND_TIMES[r]}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4}}>
              {["Pool A","Pool B"].map(pool=>{
                const m=rMatches.find(x=>x.round_label===pool);
                if(!m)return<div key={pool}/>;
                const aWin=m.winner_id===m.team_a_id,bWin=m.winner_id===m.team_b_id,done=!!m.winner_id;
                return(
                  <div key={pool} className="mc fu" style={{minWidth:0}}>
                    <div style={{padding:"4px 8px",borderBottom:"1px solid var(--border)",background:"rgba(0,0,0,.15)"}}>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:"var(--gold)",fontWeight:700,opacity:.8}}>{pool}</span>
                    </div>
                    {[{name:m.team_a_name,sc:m.score_a,id:m.team_a_id,win:aWin},{name:m.team_b_name,sc:m.score_b,id:m.team_b_id,win:bWin}].map((s,i)=>(
                      <div key={i} className={`mt ${s.win?"win":done&&!s.win?"los":""}`} style={{padding:"6px 8px"}}>
                        {s.name&&<TL name={s.name} size={18}/>}
                        <span className="mtn" style={{fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name||"TBD"}</span>
                        <span className={`msc ${s.sc===null?"dim":""}`} style={{fontSize:15}}>{s.sc??"—"}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* STANDINGS */}
      {(standingsA.length>0||standingsB.length>0)&&(
        <>
          <div className="gline" style={{marginTop:16}}><span className="gline-t">Standings</span></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:4}}>
            {[{label:"Pool A",standings:standingsA},{label:"Pool B",standings:standingsB}].map(({label,standings})=>(
              <div key={label}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",fontWeight:700,marginBottom:6,textAlign:"center"}}>{label}</div>
                <div style={{background:"var(--navy3)",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"16px 1fr 18px 18px 18px 22px",gap:2,padding:"5px 8px",borderBottom:"1px solid var(--border)",background:"rgba(0,0,0,.2)"}}>
                    {["#","","P","W","L","Pts"].map((h,i)=>(
                      <div key={i} style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"var(--muted)",fontWeight:700,textAlign:i>1?"center":"left"}}>{h}</div>
                    ))}
                  </div>
                  {standings.length===0
                    ?<div style={{padding:"10px 8px",fontSize:11,color:"var(--muted)",textAlign:"center"}}>No results yet</div>
                    :standings.map((t,i)=>{
                      const qualified=i<2&&allPoolDone;
                      return(
                        <div key={t.name} style={{display:"grid",gridTemplateColumns:"16px 1fr 18px 18px 18px 22px",gap:2,padding:"6px 8px",borderBottom:i<standings.length-1?"1px solid var(--border)":"none",background:qualified?"rgba(240,180,41,.06)":"transparent",alignItems:"center"}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,color:i<2?"var(--gold)":"var(--muted2)"}}>{i+1}</div>
                          <div style={{display:"flex",alignItems:"center",gap:4,minWidth:0}}>
                            <TL name={t.name} size={16}/>
                            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name.split(" ")[0]}</span>
                            {qualified&&<span style={{width:5,height:5,borderRadius:"50%",background:"var(--gold)",flexShrink:0}}/>}
                          </div>
                          {[t.p,t.w,t.l].map((v,vi)=>(
                            <div key={vi} style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,textAlign:"center",color:"var(--muted)"}}>{v}</div>
                          ))}
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,textAlign:"center",color:t.pts>0?"var(--gold)":"var(--muted)"}}>{t.pts}</div>
                        </div>
                      );
                    })
                  }
                </div>
                {allPoolDone&&standings.length>=2&&<div style={{fontSize:9,color:"var(--gold)",textAlign:"center",marginTop:4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>● TOP 2 ADVANCE</div>}
              </div>
            ))}
          </div>
          <div style={{fontSize:10,color:"var(--muted)",textAlign:"center",marginBottom:16,fontFamily:"'Barlow Condensed',sans-serif"}}>P · W · L · Pts</div>
        </>
      )}

      {/* SEMI FINALS */}
      {(semiMatches.length>0||allPoolDone)&&(
        <>
          <div className="gline" style={{marginTop:4}}><span className="gline-t">Semi Finals</span></div>
          {semiMatches.length===0?(
            <div style={{background:"var(--navy3)",border:"1px solid var(--border)",borderRadius:10,padding:14,textAlign:"center",marginBottom:12}}>
              <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6,marginBottom:6}}>Semi-final matchups will be confirmed once pool results are reviewed.</div>
              <div style={{fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,textTransform:"uppercase",color:"rgba(240,180,41,.5)"}}>A1 vs B2 · B1 vs A2</div>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              {semiMatches.map((m,i)=>{
                const aWin=m.winner_id===m.team_a_id,bWin=m.winner_id===m.team_b_id,done=!!m.winner_id;
                return(
                  <div key={m.id} className="mc fu">
                    <div style={{padding:"4px 8px",borderBottom:"1px solid var(--border)",background:"rgba(0,0,0,.15)"}}>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:"var(--gold)",fontWeight:700,opacity:.8}}>SF {i+1}</span>
                    </div>
                    {[{name:m.team_a_name,sc:m.score_a,id:m.team_a_id,win:aWin},{name:m.team_b_name||"TBD",sc:m.score_b,id:m.team_b_id,win:bWin}].map((s,j)=>(
                      <div key={j} className={`mt ${s.win?"win":done&&!s.win?"los":""}`} style={{padding:"6px 8px"}}>
                        {s.name&&s.name!=="TBD"&&<TL name={s.name} size={18}/>}
                        <span className="mtn" style={{fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name||"TBD"}</span>
                        <span className={`msc ${s.sc===null?"dim":""}`} style={{fontSize:15}}>{s.sc??"—"}</span>
                      </div>
                    ))}
                    {done&&<div className="mfoot">{m.winner_name} to Final</div>}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* FINAL */}
      {(finalMatch||(semiMatches.length===2&&semiMatches.every(m=>m.winner_id)))&&(
        <>
          <div className="gline" style={{marginTop:4}}><span className="gline-t">Final</span></div>
          {!finalMatch?(
            <div style={{background:"var(--navy3)",border:"1px solid var(--border)",borderRadius:10,padding:14,textAlign:"center",marginBottom:12}}>
              <div style={{fontSize:12,color:"var(--muted)"}}>Final matchup to be confirmed.</div>
            </div>
          ):(
            <div className="mc fu" style={{marginBottom:12}}>
              <div style={{padding:"6px 10px",borderBottom:"1px solid var(--border)",background:"rgba(0,0,0,.15)"}}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",fontWeight:700}}>🏆 Final</span>
              </div>
              {[{name:finalMatch.team_a_name,sc:finalMatch.score_a,id:finalMatch.team_a_id},{name:finalMatch.team_b_name||"TBD",sc:finalMatch.score_b,id:finalMatch.team_b_id}].map((s,i)=>(
                <div key={i} className={`mt ${finalMatch.winner_id===s.id?"win":finalMatch.winner_id?"los":""}`} style={{padding:"9px 11px"}}>
                  {s.name&&s.name!=="TBD"&&<TL name={s.name} size={22}/>}
                  <span className="mtn" style={{fontSize:13}}>{s.name||"TBD"}</span>
                  <span className={`msc ${s.sc===null?"dim":""}`} style={{fontSize:19}}>{s.sc??"—"}</span>
                </div>
              ))}
              {finalMatch.winner_id&&<div className="mfoot" style={{fontSize:10,padding:"7px 11px"}}>🏆 {finalMatch.winner_name} — Netball Champions</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── NETBALL SCORES VIEW (admin) ───────────────────────────────────────────────
function NetballScoresView({sport,teams,matches,published,askPin,showToast,onRefresh}){
  const[saving,setSaving]=useState(false);
  const[phase,setPhase]=useState("pools");
  const[semiSetup,setSemiSetup]=useState(false);

  const standingsA=calcStandings(matches,"Pool A");
  const standingsB=calcStandings(matches,"Pool B");
  const poolMatches=matches.filter(m=>m.round<=6);
  const semiMatches=matches.filter(m=>m.round===7);
  const finalMatch=matches.find(m=>m.round===8);
  const allPoolDone=poolMatches.length>=12&&poolMatches.every(m=>m.winner_id||m.status==="completed");

  const getTeamId=name=>teams.find(t=>t.name===name)?.id;

  const updateScore=async(mid,field,val)=>{
    await supabase.from("fc_matches").update({[field]:parseInt(val)||0}).eq("id",mid);
    onRefresh();
  };

  const confirmMatch=async(m)=>{
    setSaving(true);
    try{
      const sa=m.score_a??0,sb=m.score_b??0;
      const winner=sa>=sb?m.team_a_id:m.team_b_id;
      const winnerName=sa>=sb?m.team_a_name:m.team_b_name;
      await supabase.from("fc_matches").update({winner_id:winner,status:"completed"}).eq("id",m.id);
      showToast(`${winnerName} wins!`);onRefresh();
    }catch(e){showToast("Error: "+e.message);}
    setSaving(false);
  };

  const editMatch=mid=>askPin("Edit Result","Enter organizer PIN to reopen this match.",async()=>{
    await supabase.from("fc_matches").update({winner_id:null,status:"pending",score_a:null,score_b:null}).eq("id",mid);
    showToast("Match reopened — enter new scores.");onRefresh();
  });

  const removeMatch=mid=>askPin("Remove Match","Enter organizer PIN.",async()=>{
    await supabase.from("fc_matches").delete().eq("id",mid);showToast("Removed.");onRefresh();
  });

  const togglePublish=async()=>{
    const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0]}));
    await supabase.from("fc_publish_flags").update({published:!published}).eq("event_id",ev.id).eq("competition",sport);
    if(!published){
      try{
        await supabase.from("fc_announcements").insert({event_id:ev.id,body:"🏐 Netball results are now live! Check the Netball tab for the latest standings.",urgent:false,posted_by:"System"});
      }catch(e){}
    }
    showToast(published?"Hidden.":"Published to spectators!");onRefresh();
  };

  const createSemis=async()=>{
    if(standingsA.length<2||standingsB.length<2){showToast("Need at least 2 teams in each pool.");return;}
    setSaving(true);
    try{
      const{data:evArr}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1);
      const ev=evArr?.[0];
      await supabase.from("fc_matches").insert([
        {event_id:ev.id,competition:"netball",round:7,round_label:"Semi Final",team_a_id:getTeamId(standingsA[0].name),team_b_id:getTeamId(standingsB[1].name),status:"pending",published:false},
        {event_id:ev.id,competition:"netball",round:7,round_label:"Semi Final",team_a_id:getTeamId(standingsB[0].name),team_b_id:getTeamId(standingsA[1].name),status:"pending",published:false},
      ]);
      showToast("Semi-finals created!");setSemiSetup(false);onRefresh();
    }catch(e){showToast("Error: "+e.message);}
    setSaving(false);
  };

  const createFinal=async()=>{
    const sf1=semiMatches[0],sf2=semiMatches[1];
    if(!sf1?.winner_id||!sf2?.winner_id){showToast("Confirm both semi-finals first.");return;}
    setSaving(true);
    try{
      const{data:evArr}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1);
      const ev=evArr?.[0];
      await supabase.from("fc_matches").insert({event_id:ev.id,competition:"netball",round:8,round_label:"Final",team_a_id:sf1.winner_id,team_b_id:sf2.winner_id,status:"pending",published:false});
      showToast("Final created!");onRefresh();
    }catch(e){showToast("Error: "+e.message);}
    setSaving(false);
  };

  // Single match card — reused across all phases
  const MatchCard=({m,label})=>{
    const done=!!m.winner_id;
    return(
      <div className="card card-sm fu" style={{marginBottom:10,opacity:done?.9:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span className="tag tg" style={{fontSize:9}}>{label||m.round_label}</span>
            {m.round<=6&&<span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,color:"var(--muted)"}}>Rd {m.round} · {ROUND_TIMES[m.round]}</span>}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {done&&<span className="tag tgn" style={{fontSize:9}}><Icon name="check" size={9}/> Done</span>}
            {done&&<button style={{background:"none",border:"none",color:"var(--gold)",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",padding:2}} onClick={()=>editMatch(m.id)}>Edit</button>}
            <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:2}} onClick={()=>removeMatch(m.id)}><Icon name="trash" size={13}/></button>
          </div>
        </div>
        <div className="svs">
          <div className="ss">
            <TL name={m.team_a_name} size={36}/>
            <div className="ssn" style={{fontSize:11}}>{m.team_a_name||"TBD"}</div>
            <input className="fi" type="number" min="0" key={`${m.id}_a_${m.score_a}`} defaultValue={m.score_a??""} onBlur={e=>updateScore(m.id,"score_a",e.target.value)} disabled={done} style={{width:54,height:42,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,color:"var(--gold)",padding:"0 4px",background:"rgba(255,255,255,.08)",border:"1px solid rgba(240,180,41,.4)"}}/>
          </div>
          <div className="ssp">VS</div>
          <div className="ss">
            <TL name={m.team_b_name} size={36}/>
            <div className="ssn" style={{fontSize:11}}>{m.team_b_name||"TBD"}</div>
            <input className="fi" type="number" min="0" key={`${m.id}_b_${m.score_b}`} defaultValue={m.score_b??""} onBlur={e=>updateScore(m.id,"score_b",e.target.value)} disabled={done} style={{width:54,height:42,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,color:"var(--gold)",padding:"0 4px",background:"rgba(255,255,255,.08)",border:"1px solid rgba(240,180,41,.4)"}}/>
          </div>
        </div>
        {!done&&<button className="btn bp" style={{marginTop:4}} onClick={()=>confirmMatch(m)} disabled={saving||m.score_a===null||m.score_b===null}><Icon name="check" size={14}/> Confirm Result</button>}
        {done&&<div style={{textAlign:"center",color:"var(--gold)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,marginTop:4}}>🏆 {m.winner_name} wins</div>}
      </div>
    );
  };

  const phaseTabs=[
    {id:"pools",lbl:`Pools (${poolMatches.filter(m=>m.winner_id).length}/${poolMatches.length})`},
    {id:"semis",lbl:`Semis (${semiMatches.filter(m=>m.winner_id).length}/${Math.max(semiMatches.length,2)})`},
    {id:"final",lbl:`Final (${finalMatch?.winner_id?1:0}/1)`},
  ];

  return(
    <div>
      <div className="brow" style={{marginBottom:14}}>
        <button className={`btn bsm ${published?"bd":"bg"}`} onClick={togglePublish}><Icon name={published?"eyeoff":"publish"} size={13}/>{published?"Unpublish":"Publish to Spectators"}</button>
      </div>

      <div className="tabs" style={{padding:0,marginBottom:14}}>
        {phaseTabs.map(t=><button key={t.id} className={`tab ${phase===t.id?"on":""}`} onClick={()=>setPhase(t.id)} style={{fontSize:10}}>{t.lbl}</button>)}
      </div>

      {/* POOL ROUNDS */}
      {phase==="pools"&&(
        <div>
          {[1,2,3,4,5,6].map(r=>{
            const rMatches=poolMatches.filter(m=>m.round===r);
            if(!rMatches.length)return null;
            return(
              <div key={r}>
                {r===5&&<div style={{textAlign:"center",padding:"6px 0",margin:"6px 0 10px",borderTop:"1px dashed var(--border)",borderBottom:"1px dashed var(--border)"}}><span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--muted)",fontWeight:700}}>Lunch 11:35 – 12:35</span></div>}
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",fontWeight:700,marginBottom:8,marginTop:r>1&&r!==5?10:0}}>Round {r} · {ROUND_TIMES[r]}</div>
                {rMatches.map(m=><MatchCard key={m.id} m={m} label={m.round_label}/>)}
              </div>
            );
          })}
          {allPoolDone&&(
            <div style={{background:"rgba(56,161,105,.06)",border:"1px solid rgba(56,161,105,.2)",borderRadius:10,padding:14,marginTop:8,textAlign:"center"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,color:"#68d391",marginBottom:6}}>✅ Pool stage complete</div>
              <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>Move to the Semis tab to set up the knock-out rounds.</div>
              <button className="btn bp bsm" onClick={()=>setPhase("semis")}><Icon name="signal" size={13}/> Go to Semis →</button>
            </div>
          )}
        </div>
      )}

      {/* SEMIS */}
      {phase==="semis"&&(
        <div>
          {/* Standings summary */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {[{label:"Pool A",standings:standingsA},{label:"Pool B",standings:standingsB}].map(({label,standings})=>(
              <div key={label} style={{background:"var(--navy3)",border:"1px solid var(--border)",borderRadius:8,padding:10}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",fontWeight:700,marginBottom:8}}>{label}</div>
                {standings.slice(0,2).map((t,i)=>(
                  <div key={t.name} style={{display:"flex",alignItems:"center",gap:6,marginBottom:i===0?6:0}}>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:"var(--gold)",width:16}}>{i+1}</span>
                    <TL name={t.name} size={20}/>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name.split(" ")[0]}</span>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,color:"var(--gold)"}}>{t.pts}pts</span>
                  </div>
                ))}
                {standings.length<2&&<div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Not enough results yet</div>}
              </div>
            ))}
          </div>

          {semiMatches.length===0&&allPoolDone&&!semiSetup&&(
            <div style={{background:"var(--gold-dim)",border:"1px solid var(--gold-border)",borderRadius:12,padding:16,marginBottom:12}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,color:"var(--gold)",marginBottom:8}}>Set Up Semi Finals</div>
              <div style={{fontSize:12,color:"var(--muted)",marginBottom:4,lineHeight:1.5}}>Based on current standings:</div>
              <div style={{fontSize:13,marginBottom:3,fontWeight:500}}><span style={{color:"var(--gold)",fontWeight:700}}>SF 1: </span>{standingsA[0]?.name||"A1"} <span style={{color:"var(--muted)"}}>vs</span> {standingsB[1]?.name||"B2"}</div>
              <div style={{fontSize:13,marginBottom:14,fontWeight:500}}><span style={{color:"var(--gold)",fontWeight:700}}>SF 2: </span>{standingsB[0]?.name||"B1"} <span style={{color:"var(--muted)"}}>vs</span> {standingsA[1]?.name||"A2"}</div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn bp bsm" onClick={createSemis} disabled={saving}>Confirm These Matchups</button>
                <button className="btn bo bsm" onClick={()=>setSemiSetup(true)}>Override</button>
              </div>
            </div>
          )}

          {semiSetup&&(
            <ManualSemiSetup teams={teams} standingsA={standingsA} standingsB={standingsB}
              onConfirm={async(sf1a,sf1b,sf2a,sf2b)=>{
                setSaving(true);
                try{
                  const{data:evArr}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1);
                  const ev=evArr?.[0];
                  await supabase.from("fc_matches").insert([
                    {event_id:ev.id,competition:"netball",round:7,round_label:"Semi Final",team_a_id:getTeamId(sf1a),team_b_id:getTeamId(sf1b),status:"pending",published:false},
                    {event_id:ev.id,competition:"netball",round:7,round_label:"Semi Final",team_a_id:getTeamId(sf2a),team_b_id:getTeamId(sf2b),status:"pending",published:false},
                  ]);
                  showToast("Semi-finals created!");setSemiSetup(false);onRefresh();
                }catch(e){showToast("Error: "+e.message);}
                setSaving(false);
              }}
              onCancel={()=>setSemiSetup(false)}
            />
          )}

          {!allPoolDone&&semiMatches.length===0&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"16px 0",lineHeight:1.6}}>Complete all pool rounds first before setting up semi-finals.</div>}

          {semiMatches.map(m=><MatchCard key={m.id} m={m} label="Semi Final"/>)}

          {semiMatches.length===2&&semiMatches.every(m=>m.winner_id)&&!finalMatch&&(
            <div style={{background:"var(--gold-dim)",border:"1px solid var(--gold-border)",borderRadius:12,padding:14,marginTop:4,textAlign:"center"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,color:"var(--gold)",marginBottom:6}}>Both semis done!</div>
              <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>{semiMatches[0].winner_name} vs {semiMatches[1].winner_name}</div>
              <button className="btn bp bsm" onClick={()=>setPhase("final")}><Icon name="trophy" size={13}/> Create Final →</button>
            </div>
          )}
        </div>
      )}

      {/* FINAL */}
      {phase==="final"&&(
        <div>
          {!finalMatch&&semiMatches.length===2&&semiMatches.every(m=>m.winner_id)&&(
            <div style={{background:"var(--gold-dim)",border:"1px solid var(--gold-border)",borderRadius:12,padding:16,marginBottom:12}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,color:"var(--gold)",marginBottom:8}}>🏆 Create Final</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>{semiMatches[0].winner_name}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:3}}>vs</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>{semiMatches[1].winner_name}</div>
              <button className="btn bp" onClick={createFinal} disabled={saving}><Icon name="trophy" size={14}/> Create Final Match</button>
            </div>
          )}
          {!finalMatch&&!(semiMatches.length===2&&semiMatches.every(m=>m.winner_id))&&(
            <div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"16px 0",lineHeight:1.6}}>Complete both semi-finals first.</div>
          )}
          {finalMatch&&<MatchCard m={finalMatch} label="Final"/>}
        </div>
      )}
    </div>
  );
}

function ManualSemiSetup({teams,standingsA,standingsB,onConfirm,onCancel}){
  const allNames=teams.map(t=>t.name);
  const[sf1a,setSf1a]=useState(standingsA[0]?.name||allNames[0]||"");
  const[sf1b,setSf1b]=useState(standingsB[1]?.name||allNames[1]||"");
  const[sf2a,setSf2a]=useState(standingsB[0]?.name||allNames[2]||"");
  const[sf2b,setSf2b]=useState(standingsA[1]?.name||allNames[3]||"");
  const sel=(val,set)=>(
    <select className="fi" style={{marginBottom:6}} value={val} onChange={e=>set(e.target.value)}>
      {allNames.map(n=><option key={n}>{n}</option>)}
    </select>
  );
  return(
    <div style={{background:"var(--navy3)",border:"1px solid var(--border)",borderRadius:12,padding:14,marginBottom:12}}>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,color:"var(--gold)",marginBottom:10}}>Manual Semi-Final Setup</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:"var(--muted)",marginBottom:6,fontWeight:700}}>SF 1</div>
      {sel(sf1a,setSf1a)}{sel(sf1b,setSf1b)}
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:"var(--muted)",marginBottom:6,marginTop:8,fontWeight:700}}>SF 2</div>
      {sel(sf2a,setSf2a)}{sel(sf2b,setSf2b)}
      <div style={{display:"flex",gap:8,marginTop:10}}>
        <button className="btn bp bsm" onClick={()=>onConfirm(sf1a,sf1b,sf2a,sf2b)}>Confirm</button>
        <button className="btn bo bsm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}


// ── BRACKET VIEW (soccer) ─────────────────────────────────────────────────────
function BracketView({matches,isOrg,published}){
  const visible=isOrg?matches:(published?matches:[]);
  if(!visible.length)return<div className="empty fu"><div className="eti"><Icon name="bracket" size={38} sw={1}/></div><div className="ett">{isOrg?"The confirmed draw will appear here. Use the Scores tab to enter results.":"Bracket will appear once published."}</div></div>;
  const rounds=[...new Set(visible.map(m=>m.round))].sort((a,b)=>a-b);
  const rL={1:"Quarter Finals",2:"Semi Finals",3:"Final"};
  return(
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
                <div className="mfoot">
                  {m.winner_id
                    ?(m.round===1?"⚽ "+m.winner_name+" → Semi Final":m.round===2?"⚽ "+m.winner_name+" → Final":"🏆 "+m.winner_name+" — Champions")
                    :"Upcoming"
                  }
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamsView({teams,isOrg,sport,askPin,showToast,onRefresh}){
  const removePlayer=async(pid)=>{
    askPin("Remove Player","Enter organizer PIN to remove this player.",async()=>{
      await supabase.from("fc_players").delete().eq("id",pid);
      showToast("Player removed.");onRefresh();
    });
  };
  return(
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

function ScoresView({sport,teams,matches,published,askPin,showToast,onRefresh}){
  const[saving,setSaving]=useState(false);
  const[advanceMatch,setAdvanceMatch]=useState(null);
  // Local score state — keyed by match id. Type freely, nothing saves until Confirm is tapped.
  const[localScores,setLocalScores]=useState({});
  const getLocal=(mid,field,fallback)=>localScores[mid]?.[field]??fallback;
  const setLocal=(mid,field,val)=>setLocalScores(s=>({...s,[mid]:{...s[mid],[field]:val}}));
  const getTeamName=id=>teams.find(t=>t.id===id)?.name;
  const confirm=async(m)=>{
    const sa=localScores[m.id]?.score_a??m.score_a;
    const sb=localScores[m.id]?.score_b??m.score_b;
    if(sa===null||sa===undefined||sa===""||sb===null||sb===undefined||sb===""){showToast("Enter both scores first.");return;}
    setSaving(true);
    try{
      const saNum=parseInt(sa)||0;
      const sbNum=parseInt(sb)||0;
      const winner=(saNum>=sbNum)?m.team_a_id:m.team_b_id;
      const winnerName=getTeamName(winner)||"Winner";
      const loserName=getTeamName(winner===m.team_a_id?m.team_b_id:m.team_a_id)||"opponent";
      await supabase.from("fc_matches").update({score_a:saNum,score_b:sbNum,winner_id:winner,status:"completed",voting_open:true}).eq("id",m.id);
      showToast(`${winnerName} wins!`);
      try{
        const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0]}));
        const rLabel=m.round_label||`Round ${m.round}`;
        await supabase.from("fc_announcements").insert({event_id:ev.id,body:`⚽ Result — ${rLabel}: ${winnerName} ${saNum}–${sbNum} ${loserName}`,urgent:false,posted_by:"System"});
      }catch(e){}
      setAdvanceMatch({matchId:m.id,winnerId:winner,winnerName,round:m.round});
      onRefresh();
    }catch(e){showToast("Error: "+e.message);}
    setSaving(false);
  };
  const editMatch=mid=>askPin("Edit Result","Enter organizer PIN to reopen this match.",async()=>{
    await supabase.from("fc_matches").update({winner_id:null,status:"pending",score_a:null,score_b:null}).eq("id",mid);
    setLocalScores(s=>({...s,[mid]:{score_a:"",score_b:""}}));
    showToast("Match reopened.");onRefresh();
  });
  const advanceWinner=async()=>{
    if(!advanceMatch)return;
    const{winnerId,winnerName,round}=advanceMatch;
    setSaving(true);
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      const nextR=round+1;
      const{data:existing}=await supabase.from("fc_matches").select("*").eq("event_id",ev.id).eq("competition",sport).eq("round",nextR).is("team_b_id",null).maybeSingle();
      if(existing){await supabase.from("fc_matches").update({team_b_id:winnerId}).eq("id",existing.id);}
      else{await supabase.from("fc_matches").insert({event_id:ev.id,competition:sport,round:nextR,team_a_id:winnerId,status:"pending",published:false});}
      showToast(`${winnerName} advanced to ${nextR===2?"Semi Final":"Final"}!`);
      setAdvanceMatch(null);onRefresh();
    }catch(e){showToast("Error: "+e.message);}
    setSaving(false);
  };
  const togglePublish=async()=>{
    const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
    await supabase.from("fc_publish_flags").update({published:!published}).eq("event_id",ev.id).eq("competition",sport);
    showToast(published?"Hidden.":"Published!");onRefresh();
  };
  const removeMatch=mid=>askPin("Remove Match","Enter organizer PIN.",async()=>{await supabase.from("fc_matches").delete().eq("id",mid);showToast("Removed.");onRefresh();});
  const inputStyle={width:64,height:56,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:700,color:"var(--gold)",padding:"0 6px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(240,180,41,.4)",borderRadius:8};
  return(
    <div>
      {advanceMatch&&(
        <div style={{background:"var(--gold-dim)",border:"1px solid var(--gold-border)",borderRadius:12,padding:16,marginBottom:14}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,color:"var(--gold)",marginBottom:6}}>🏆 Advance Winner?</div>
          <div style={{fontSize:14,marginBottom:14,lineHeight:1.5}}><strong>{advanceMatch.winnerName}</strong> won. Advance to the {advanceMatch.round+1===2?"Semi Final":"Final"}?</div>
          <div style={{display:"flex",gap:8}}><button className="btn bp bsm" onClick={advanceWinner} disabled={saving}>Yes — Advance</button><button className="btn bo bsm" onClick={()=>setAdvanceMatch(null)}>Not yet</button></div>
        </div>
      )}
      <div className="brow" style={{marginBottom:16}}>
        <button className={`btn bsm ${published?"bd":"bg"}`} onClick={togglePublish}><Icon name={published?"eyeoff":"publish"} size={13}/>{published?"Unpublish":"Publish"}</button>
      </div>
      {!matches.length&&<div className="empty"><div className="eti"><Icon name="bracket" size={38} sw={1}/></div><div className="ett">Generate a bracket to begin.</div></div>}
      {matches.map((m,i)=>{
        const done=!!m.winner_id;
        const sa=getLocal(m.id,"score_a",m.score_a??"");
        const sb=getLocal(m.id,"score_b",m.score_b??"");
        const ready=sa!==""&&sb!=="";
        return(
          <div key={m.id} className="card card-sm fu" style={{opacity:done?.85:1,marginBottom:12,animationDelay:`${i*.04}s`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span className="tag tg">{m.round_label||`Round ${m.round}`}</span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {done&&<span className="tag tgn"><Icon name="check" size={10}/> Done</span>}
                {done&&<button style={{background:"none",border:"none",color:"var(--gold)",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",padding:2}} onClick={()=>editMatch(m.id)}>Edit</button>}
                <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:2}} onClick={()=>removeMatch(m.id)}><Icon name="trash" size={14}/></button>
              </div>
            </div>
            <div className="svs">
              <div className="ss">
                <TL name={m.team_a_name} size={40}/>
                <div className="ssn">{m.team_a_name||"TBD"}</div>
                <input
                  className="fi"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max="99"
                  placeholder="0"
                  value={sa}
                  onChange={e=>setLocal(m.id,"score_a",e.target.value)}
                  disabled={done}
                  style={inputStyle}
                />
              </div>
              <div className="ssp">VS</div>
              <div className="ss">
                <TL name={m.team_b_name} size={40}/>
                <div className="ssn">{m.team_b_name||"TBD"}</div>
                <input
                  className="fi"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max="99"
                  placeholder="0"
                  value={sb}
                  onChange={e=>setLocal(m.id,"score_b",e.target.value)}
                  disabled={done}
                  style={inputStyle}
                />
              </div>
            </div>
            {!done&&(
              <button className="btn bp" style={{marginTop:8,opacity:ready?1:.4}} onClick={()=>confirm(m)} disabled={saving||!ready}>
                <Icon name="check" size={14}/> {ready?"Confirm Result":"Enter Both Scores"}
              </button>
            )}
            {done&&<div style={{textAlign:"center",color:"var(--gold)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,marginTop:6}}>
              {m.round===1?"⚽ "+m.winner_name+" advances to Semi Final":m.round===2?"⚽ "+m.winner_name+" advances to Final":"🏆 "+m.winner_name+" — Soccer Champions"}
            </div>}
          </div>
        );
      })}
    </div>
  );
}

function RegisterView({sport,teams,role,user,local,askPin,showToast,onRefresh}){
  const isOrg=role==="organizer";
  const avail=isOrg?teams:teams.filter(t=>t.id===user?.teamId);
  const[sel,setSel]=useState(avail[0]?.id||"");
  const[f,setF]=useState({firstName:"",lastName:"",idNumber:"",jersey:"",position:"",ageGroup:"Open",phone:"",memberSince:""});
  const sf=(k,v)=>setF(x=>({...x,[k]:v}));
  const positions=sport==="soccer"?POS_SOCCER:POS_NETBALL;
  const team=teams.find(t=>t.id===sel);
  const submit=async()=>{
    if(!f.firstName.trim()||!f.lastName.trim()){showToast("Name required.");return;}
    try{
      await supabase.from("fc_players").insert({team_id:sel,name:`${f.firstName} ${f.lastName}`,first_name:f.firstName,last_name:f.lastName,jersey_number:f.jersey,position:f.position,age_group:f.ageGroup,id_number:f.idNumber,phone:f.phone,member_since:f.memberSince||null,player_role:f.playerRole||"Player"});
      showToast("Player registered! ✓");
      setF({firstName:"",lastName:"",idNumber:"",jersey:"",position:"",ageGroup:"Open",phone:"",memberSince:""});
      onRefresh();
    }catch(e){console.error("Registration error:",e);showToast("Registration failed: "+(e.message||"Check connection and try again."));}
  };
  return(
    <div className="pw">
      <div className="card" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>{team&&<TL name={team.name} size={44}/>}<div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800}}>{team?.name||"Select Team"}</div></div></div>
        {isOrg&&<div className="fg"><label className="fl">Select Team</label><select className="fi" value={sel} onChange={e=>setSel(e.target.value)}>{avail.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>}
      </div>
      <div className="fsec">Personal Details</div>
      <div className="fgrid"><div className="fg"><label className="fl">First Name</label><input className="fi" value={f.firstName} onChange={e=>sf("firstName",e.target.value)} placeholder="e.g. Sipho"/></div><div className="fg"><label className="fl">Last Name</label><input className="fi" value={f.lastName} onChange={e=>sf("lastName",e.target.value)} placeholder="e.g. Dlamini"/></div></div>
      <div className="fgrid"><div className="fg"><label className="fl">ID Number</label><input className="fi" value={f.idNumber} onChange={e=>sf("idNumber",e.target.value)} placeholder="SA ID" maxLength={13} pattern="[0-9]*" inputMode="numeric"/></div><div className="fg"><label className="fl">Phone</label><input className="fi" value={f.phone} onChange={e=>sf("phone",e.target.value)} placeholder="082 000 0000" type="tel"/></div></div>
      <div className="fsec">Sport Details</div>
      <div className="fgrid"><div className="fg"><label className="fl">Jersey #</label><input className="fi" value={f.jersey} onChange={e=>sf("jersey",e.target.value)} placeholder="10"/></div><div className="fg"><label className="fl">Age Group</label><select className="fi" value={f.ageGroup} onChange={e=>sf("ageGroup",e.target.value)}>{["Under 13","Under 17","Under 21","Open"].map(a=><option key={a}>{a}</option>)}</select></div></div>
      <div className="fgrid">
        <div className="fg"><label className="fl">Position</label><select className="fi" value={f.position} onChange={e=>sf("position",e.target.value)}><option value="">— Select —</option>{positions.map(p=><option key={p}>{p}</option>)}</select></div>
        <div className="fg"><label className="fl">Role</label><select className="fi" value={f.playerRole||"Player"} onChange={e=>sf("playerRole",e.target.value)}>{["Player","Captain","Vice Captain","Coach","Manager"].map(r=><option key={r}>{r}</option>)}</select></div>
      </div>
      <div className="fsec">Church Membership <span style={{fontSize:9,color:"var(--muted)",letterSpacing:0,textTransform:"none",fontFamily:"'Barlow',sans-serif"}}>(Internal only)</span></div>
      <div className="fg"><label className="fl"><Icon name="cal" size={11} stroke="var(--gold)"/> Member Since</label><input className="fi" type="date" value={f.memberSince} onChange={e=>sf("memberSince",e.target.value)} max={new Date().toISOString().split("T")[0]} style={{colorScheme:"dark"}}/>{f.memberSince&&<div style={{marginTop:6}}><div className="since"><Icon name="shield" size={11} stroke="var(--gold)"/>Member for {Math.floor((new Date()-new Date(f.memberSince))/(1000*60*60*24*365))} years</div></div>}</div>
      <button className="btn bp" onClick={submit}><Icon name="plus" size={15}/> Register Player</button>
      <div className="fsec" style={{marginTop:24}}>Or Upload Spreadsheet</div>
      <SpreadsheetUpload teamId={sel} sport={sport} onRefresh={onRefresh} showToast={showToast}/>
      {team?.fc_players?.length>0&&(<><div className="sechd" style={{marginTop:18}}><span className="secht">{team.name} · {team.fc_players.length} registered</span></div>{team.fc_players.map(p=>(<div key={p.id} className="pcard"><div className="pav">{(p.first_name||p.name||"?").charAt(0)}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:500}}>{p.first_name||p.name} {p.last_name||""}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>#{p.jersey_number} · {p.position}</div></div><button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>askPin("Remove Player","Enter organizer PIN.",async()=>{await supabase.from("fc_players").delete().eq("id",p.id);showToast("Removed.");onRefresh();})}><Icon name="trash" size={14}/></button></div>))}</>)}
    </div>
  );
}

// ── CHOIR PAGE ────────────────────────────────────────────────────────────────
function ChoirPage({role,user,local,setLocal,askPin,showToast}){
  const[tab,setTab]=useState(role==="judge"?"score":"leaderboard");
  const[groups,setGroups]=useState([]);
  const[scores,setScores]=useState([]);
  const[published,setPublished]=useState(false);
  const[cats,setCats]=useState(local.choirCats||DEFAULT_CATS);
  const[songs,setSongs]=useState(["Prescribed Song 1","Prescribed Song 2","Choice Song"]);
  const[songOrders,setSongOrders]=useState(CHOIR_SONG_ORDERS);
  const[currentGroupId,setCurrentGroupId]=useState(null);
  const[spectatorMode,setSpectatorMode]=useState("hold");
  const[publishTeams,setPublishTeams]=useState(false);
  const[publishSpectators,setPublishSpectators]=useState(false);
  const[eventId,setEventId]=useState(null);
  const isJudge=role==="judge",isOrg=role==="organizer",isTA=role==="teamadmin";

  const load=useCallback(async()=>{
    try{
      const{data:evArr2}=await supabase.from("fc_events").select("id,choir_categories,choir_current_group_id,choir_spectator_mode,choir_songs,choir_song_orders,choir_publish_teams,choir_publish_spectators").eq("is_active",true).limit(1);
      const ev=evArr2?.[0];
      if(!ev||!ev.id)throw new Error("No active event");
      const eid=ev.id;
      if(ev.choir_categories)setCats(ev.choir_categories);
      if(ev.choir_songs)setSongs(ev.choir_songs);
      if(ev.choir_song_orders)setSongOrders(ev.choir_song_orders);
      setCurrentGroupId(ev.choir_current_group_id||null);
      setSpectatorMode(ev.choir_spectator_mode||"hold");
      setPublishTeams(ev.choir_publish_teams||false);
      setPublishSpectators(ev.choir_publish_spectators||false);
      setEventId(eid);
      const[groupsRes,scoresRes]=await Promise.all([
        supabase.from("fc_choir_groups").select("*,fc_choir_members(*)").eq("event_id",eid).order("performance_order",{ascending:true,nullsLast:true}),
        supabase.from("fc_choir_scores").select("*").eq("event_id",eid),
      ]);
      setGroups(groupsRes.data||[]);
      setScores(scoresRes.data||[]);
      setPublished(ev.choir_publish_spectators||false);
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
    ...(isOrg?[{id:"manage",lbl:"Manage"},{id:"settings",lbl:"Settings"},{id:"allscores",lbl:"All Scores"}]:[]),
  ];

  return(
    <div className="pw pg">
      <div className="pgb">
        <div className="pgl fu">Competition</div>
        <div className="pgt fu fu1">Choir <span className="acc">2026</span></div>
        <div className="pgs fu fu2">{cats.length} scoring categories · Independent judges</div>
      </div>
      <div className="tabs">{tabs.map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.lbl}</button>)}</div>
      <div className="inner">
        {tab==="leaderboard"&&<ChoirLeaderboard groups={groups} scores={scores} cats={cats} songs={songs} published={published} publishTeams={publishTeams} publishSpectators={publishSpectators} role={role} spectatorMode={spectatorMode} currentGroupId={currentGroupId}/>}
        {tab==="register"&&(isOrg||isTA)&&<ChoirRegister groups={groups} role={role} user={user} askPin={askPin} showToast={showToast} onRefresh={load}/>}
        {tab==="score"&&isJudge&&<ChoirScore groups={groups} scores={scores} cats={cats} songs={songs} songOrders={songOrders} user={user} currentGroupId={currentGroupId} showToast={showToast} onRefresh={load}/>}
        {tab==="manage"&&isOrg&&<ChoirManage groups={groups} scores={scores} cats={cats} songs={songs} songOrders={songOrders} published={published} publishTeams={publishTeams} publishSpectators={publishSpectators} spectatorMode={spectatorMode} currentGroupId={currentGroupId} eventId={eventId} askPin={askPin} showToast={showToast} onRefresh={load}/>}
        {tab==="settings"&&isOrg&&<ChoirSettings cats={cats} songs={songs} songOrders={songOrders} groups={groups} spectatorMode={spectatorMode} eventId={eventId} showToast={showToast} onRefresh={load}/>}
        {tab==="allscores"&&isOrg&&<ChoirAllScores groups={groups} scores={scores} cats={cats} songs={songs}/>}
      </div>
    </div>
  );
}

function getCatMax(cat){return CAT_MAX[cat]||CAT_MAX_DEFAULT;}

function rankGroups(groups,scores,cats){
  return groups.map(g=>{
    const gs=scores.filter(s=>s.group_id===g.id);
    const judgeNames=[...new Set(gs.map(s=>s.judge_name))];
    const judgeCount=judgeNames.length;
    const catAvgs=cats.map(cat=>{
      const catMax=getCatMax(cat);
      const vals=gs.filter(s=>s.category===cat).map(s=>s.score);
      if(!vals.length)return 0;
      return vals.reduce((a,b)=>a+b,0)/vals.length;
    });
    const totalMax=cats.reduce((a,cat)=>a+getCatMax(cat),0);
    const totalScore=catAvgs.reduce((a,b)=>a+b,0);
    const pct=totalMax>0?(totalScore/totalMax)*100:0;
    return{group:g,catAvgs,overall:totalScore,pct,totalMax,judgeCount};
  }).sort((a,b)=>b.overall-a.overall);
}

function ChoirLeaderboard({groups,scores,cats,songs,published,publishTeams,publishSpectators,role,spectatorMode,currentGroupId}){
  const[expanded,setExpanded]=useState(null);
  const isOrg=role==="organizer";
  const isTeamAdmin=role==="teamadmin";
  if(role==="spectator"&&!publishSpectators){
    const currentGroup=currentGroupId?groups.find(g=>g.id===currentGroupId):null;
    return(
      <div className="pw">
        {currentGroup?(
          <div className="ccard card-gold">
            <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,marginBottom:8}}>🎵 Now Performing</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}><TL name={currentGroup.name} size={52}/><div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800}}>{currentGroup.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{currentGroup.branch}</div></div></div>
          </div>
        ):(
          <div className="empty fu"><div className="eti"><Icon name="mic" size={38} sw={1}/></div><div className="ett">Choir competition in progress. Results will be announced by the MC.</div></div>
        )}
      </div>
    );
  }
  const ranked=rankGroups(groups,scores,cats);
  return(
    <div className="pw">
      {currentGroupId&&(isOrg||isTeamAdmin)&&(()=>{const cg=groups.find(g=>g.id===currentGroupId);return cg?(<div className="ccard card-gold" style={{marginBottom:16}}><div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,marginBottom:6}}>🎵 Now Performing</div><div style={{display:"flex",alignItems:"center",gap:10}}><TL name={cg.name} size={36}/><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700}}>{cg.name}</div></div></div>):null;})()}
      {ranked.map((r,i)=>(
        <div key={r.group.id} className={`ccard fu ${i===0?"card-gold":""}`} style={{animationDelay:`${i*.07}s`,cursor:"pointer"}} onClick={()=>setExpanded(expanded===r.group.id?null:r.group.id)}>
          <div style={{position:"absolute",right:14,top:10,fontFamily:"'Barlow Condensed',sans-serif",fontSize:52,fontWeight:800,color:"rgba(255,255,255,.05)",lineHeight:1}}>#{i+1}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <TL name={r.group.name} size={52} style={{border:`2px solid ${i===0?"var(--gold)":"rgba(240,180,41,.2)"}`}}/>
            <div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:700}}>{r.group.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{r.group.branch} · {r.judgeCount} judge{r.judgeCount!==1?"s":""}</div></div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:36,fontWeight:800,color:r.overall>0?GRADE_COLOR(r.pct):"#fff",lineHeight:1}}>{r.overall>0?r.overall.toFixed(1):"—"}</div>
              <div style={{fontSize:9,color:"var(--muted)"}}>/ {r.totalMax||100}</div>
              {r.overall>0&&<div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:700,color:GRADE_COLOR(r.pct),letterSpacing:.5,marginTop:2}}>{GRADE_LABEL(r.pct)}</div>}
            </div>
          </div>
          {cats.map((cat,ci)=>{
            const catMax=getCatMax(cat);
            const pctBar=Math.min(100,((r.catAvgs[ci]||0)/catMax)*100);
            return(
              <div key={cat} className="sbr">
                <div className="sbl" style={{fontSize:12,width:96}}>{cat}</div>
                <div className="sbt"><div className="sbf" style={{width:`${pctBar}%`}}/></div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,color:"var(--gold)",fontWeight:700,width:40,textAlign:"right",flexShrink:0}}>{r.catAvgs[ci]>0?`${r.catAvgs[ci].toFixed(1)}/${catMax}`:"—"}</div>
              </div>
            );
          })}
          {expanded===r.group.id&&songs.length>0&&(
            <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",fontWeight:700,marginBottom:10}}>Song Breakdown</div>
              {songs.map((song,si)=>{
                const songScores=scores.filter(s=>s.group_id===r.group.id&&s.song_index===si);
                const songAvg=songScores.length?songScores.reduce((a,b)=>a+b.score,0)/songScores.length:0;
                return(
                  <div key={si} style={{padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:600}}>{song}</span>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:"var(--gold)"}}>{songAvg>0?songAvg.toFixed(1):"—"}</span>
                    </div>
                    {cats.map(cat=>{
                      const catMax=getCatMax(cat);
                      const cs=songScores.filter(s=>s.category===cat);
                      const ca=cs.length?cs.reduce((a,b)=>a+b.score,0)/cs.length:0;
                      return(
                        <div key={cat} className="sbr" style={{marginBottom:3}}>
                          <div className="sbl" style={{fontSize:12,width:96}}>{cat}</div>
                          <div className="sbt"><div className="sbf" style={{width:`${Math.min(100,(ca/catMax)*100)}%`,background:"rgba(240,180,41,.5)"}}/></div>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,color:"var(--gold)",width:46,textAlign:"right",flexShrink:0}}>{ca>0?`${ca.toFixed(1)}/${catMax}`:"—"}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              <div style={{fontSize:10,color:"var(--muted)",textAlign:"center",marginTop:8}}>Tap to collapse</div>
            </div>
          )}
          {expanded!==r.group.id&&<div style={{fontSize:10,color:"rgba(240,180,41,.4)",textAlign:"center",marginTop:8,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>Tap for song breakdown</div>}
        </div>
      ))}
    </div>
  );
}

function ChoirScore({groups,scores,cats,songs,songOrders,user,currentGroupId,showToast,onRefresh}){
  const[songIdx,setSongIdx]=useState(0);
  const[openGroupId,setOpenGroupId]=useState(null);
  const[local2,setLocal2]=useState({});
  const[submitting,setSubmitting]=useState(false);
  const judgeName=user?.name||"Judge";
  const get=(gid,cat,si)=>local2[`${gid}_${cat}_${si}`]??null;
  const setScore=(gid,cat,si,v)=>setLocal2(s=>({...s,[`${gid}_${cat}_${si}`]:v}));
  const orderedGroups=(()=>{
    const orderNames=songOrders?.[songIdx];
    if(orderNames&&orderNames.length){
      const ordered=orderNames.map(n=>groups.find(g=>g.name===n)).filter(Boolean);
      groups.forEach(g=>{if(!ordered.find(o=>o.id===g.id))ordered.push(g);});
      return ordered;
    }
    return groups;
  })();
  if(!groups.length)return<div className="empty"><div className="eti"><Icon name="mic" size={38} sw={1}/></div><div className="ett">No choir groups set up yet.</div></div>;
  const groupSongStatus=(gid,si)=>{
    const mine=scores.filter(s=>s.group_id===gid&&s.judge_name===judgeName&&s.song_index===si);
    const scoredCats=cats.filter(cat=>mine.find(s=>s.category===cat));
    if(scoredCats.length===0)return{state:"none"};
    const total=mine.reduce((a,b)=>a+b.score,0);
    if(scoredCats.length===cats.length)return{state:"done",total};
    return{state:"partial",total,count:scoredCats.length};
  };
  const openGroup=(gid)=>{
    if(openGroupId===gid){setOpenGroupId(null);return;}
    const mine=scores.filter(s=>s.group_id===gid&&s.judge_name===judgeName&&s.song_index===songIdx);
    const prefill={};
    mine.forEach(s=>{prefill[`${gid}_${s.category}_${songIdx}`]=s.score;});
    setLocal2(l=>({...l,...prefill}));
    setOpenGroupId(gid);
  };
  const submit=async(gid)=>{
    const missing=cats.filter(c=>!get(gid,c,songIdx));
    if(missing.length){showToast(`Score all categories first (${missing.length} remaining).`);return;}
    setSubmitting(true);
    try{
      const{data:evArr}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1);
      const ev=evArr?.[0];if(!ev)throw new Error("No active event");
      const results=await Promise.all(cats.map(cat=>supabase.from("fc_choir_scores").upsert({event_id:ev.id,group_id:gid,judge_name:judgeName,category:cat,score:get(gid,cat,songIdx),song_index:songIdx},{onConflict:"group_id,judge_name,category,song_index"}).then(r=>({cat,error:r.error}))));
      const failed=results.filter(r=>r.error);
      if(failed.length){console.error("Score save failures:",failed);showToast(`⚠ ${failed.length} score(s) REJECTED by database: ${failed[0].error.message}`);setSubmitting(false);return;}
      const{data:saved}=await supabase.from("fc_choir_scores").select("category").eq("group_id",gid).eq("judge_name",judgeName).eq("song_index",songIdx);
      const savedCats=(saved||[]).map(s=>s.category);
      const notSaved=cats.filter(c=>!savedCats.includes(c));
      if(notSaved.length){showToast(`⚠ Verification failed — ${notSaved.length} score(s) did not save: ${notSaved.join(", ")}`);setSubmitting(false);return;}
      const g=groups.find(x=>x.id===gid);
      showToast(`✓ Verified — all ${cats.length} scores saved for ${g?.name||"choir"}`);
      setOpenGroupId(null);onRefresh();
    }catch(e){showToast("Error: "+e.message);}
    setSubmitting(false);
  };
  return(
    <div className="pw">
      <div className="jhdr"><Icon name="mic" size={18} stroke="var(--gold)"/><div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700}}>{judgeName}</div><div style={{fontSize:12,color:"var(--muted)"}}>Tap any choir to score or edit · Total out of 100 per song</div></div></div>
      <div className="tabs" style={{marginBottom:14,padding:0}}>
        {songs.map((s,i)=>{const allDone=orderedGroups.every(g=>groupSongStatus(g.id,i).state==="done");return<button key={i} className={`tab ${songIdx===i?"on":""}`} onClick={()=>{setSongIdx(i);setOpenGroupId(null);}}>{`Song ${i+1}`}{allDone?" ✓":""}</button>;})}
      </div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,color:"var(--gold)",marginBottom:12,lineHeight:1.4}}>{songs[songIdx]||`Song ${songIdx+1}`}</div>
      {orderedGroups.map((g,i)=>{
        const st=groupSongStatus(g.id,songIdx);
        const isNow=g.id===currentGroupId;
        const isOpen=openGroupId===g.id;
        return(
          <div key={g.id} className={`ccard ${isNow?"card-gold":""}`} style={{marginBottom:10,padding:isOpen?16:12}}>
            <div style={{display:"flex",alignItems:"center",gap:11,cursor:"pointer"}} onClick={()=>openGroup(g.id)}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,color:isNow?"var(--gold)":"var(--muted2)",width:22,flexShrink:0}}>{i+1}</div>
              <TL name={g.name} size={38}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>{g.name}{isNow&&<span className="tag tg" style={{fontSize:9}}>● Now Performing</span>}</div>
                <div style={{fontSize:12,color:st.state==="done"?"#68d391":"var(--muted)",marginTop:2}}>
                  {st.state==="done"&&`✓ Scored — ${st.total}/100 · tap to edit`}
                  {st.state==="partial"&&`⚠ Incomplete — ${st.count}/${cats.length} categories`}
                  {st.state==="none"&&"Not scored yet · tap to score"}
                </div>
              </div>
              <div style={{color:"var(--muted)",transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s"}}><Icon name="publish" size={14}/></div>
            </div>
            {isOpen&&(
              <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                {cats.map(cat=>{
                  const catMax=getCatMax(cat);
                  const current=get(g.id,cat,songIdx);
                  const useInput=catMax>10;
                  return(
                    <div key={cat} className="drow" style={{flexDirection:"column",alignItems:"flex-start",gap:6,paddingBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
                        <div className="dlbl" style={{fontWeight:600}}>{cat}</div>
                        <div style={{fontSize:11,color:"var(--muted)"}}>Max: {catMax}</div>
                      </div>
                      {useInput?(
                        <div style={{display:"flex",alignItems:"center",gap:10,width:"100%"}}>
                          <input type="number" min={1} max={catMax} className="fi" style={{width:90,textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,color:"var(--gold)",padding:"6px 8px"}} value={current||""} onChange={e=>{const v=Math.min(catMax,Math.max(1,parseInt(e.target.value)||0));setScore(g.id,cat,songIdx,v||null);}} placeholder={`1–${catMax}`}/>
                          <div style={{flex:1,height:4,background:"rgba(255,255,255,.07)",borderRadius:2}}><div style={{height:"100%",background:"var(--gold)",borderRadius:2,transition:"width .3s",width:current?`${(current/catMax)*100}%`:"0%"}}/></div>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:"var(--gold)",minWidth:32}}>{current||"—"}</div>
                        </div>
                      ):(
                        <div className="dots" style={{justifyContent:"flex-start"}}>
                          {Array.from({length:catMax},(_,n)=>n+1).map(n=>(
                            <button key={n} className={`dot ${current===n?"on":""}`} onClick={()=>setScore(g.id,cat,songIdx,n)}>{n}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {(()=>{
                  const remaining=cats.filter(c=>!get(g.id,c,songIdx)).length;
                  const ready=remaining===0;
                  return(
                    <div style={{marginTop:12}}>
                      {!ready&&<div style={{fontSize:12,color:"#fc8181",textAlign:"center",marginBottom:8,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.5,fontWeight:700}}>{remaining} categor{remaining===1?"y":"ies"} still unscored — submit unlocks when all are done</div>}
                      <div style={{display:"flex",gap:8}}>
                        <button className="btn bp" style={{flex:1,opacity:ready?1:.35,cursor:ready?"pointer":"not-allowed"}} disabled={!ready||submitting} onClick={()=>submit(g.id)}><Icon name="check" size={14}/> {submitting?"Verifying...":groupSongStatus(g.id,songIdx).state==="done"?"Update Scores":"Submit Scores"}</button>
                        <button className="btn bo bsm" style={{width:"auto"}} onClick={()=>setOpenGroupId(null)}>Close</button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChoirRegister({groups,role,user,askPin,showToast,onRefresh}){
  const isOrg=role==="organizer";
  const avail=isOrg?groups:groups.filter(g=>g.id===user?.teamId);
  const[sel,setSel]=useState(avail[0]?.id||"");
  const[f,setF]=useState({firstName:"",lastName:"",idNumber:"",phone:"",voice:"Soprano",role:"Member",memberSince:""});
  const sf=(k,v)=>setF(x=>({...x,[k]:v}));
  const group=groups.find(g=>g.id===sel);
  const submit=async()=>{
    if(!f.firstName.trim()||!f.lastName.trim()){showToast("Name required.");return;}
    try{await supabase.from("fc_choir_members").insert({group_id:sel,first_name:f.firstName,last_name:f.lastName,id_number:f.idNumber,phone:f.phone,singing_voice:f.voice,choir_role:f.role,member_since:f.memberSince||null});showToast("Member registered! ✓");setF({firstName:"",lastName:"",idNumber:"",phone:"",voice:"Soprano",role:"Member",memberSince:""});onRefresh();}
    catch(e){console.error("Choir reg error:",e);showToast("Registration failed: "+(e.message||"Check connection."));}
  };
  return(
    <div className="pw">
      <div className="card" style={{marginBottom:14}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>{group&&<TL name={group.name} size={44}/>}<div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800}}>{group?.name||"Select Group"}</div></div></div>{isOrg&&<div className="fg"><label className="fl">Select Group</label><select className="fi" value={sel} onChange={e=>setSel(e.target.value)}>{avail.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>}</div>
      <div className="fsec">Personal Details</div>
      <div className="fgrid"><div className="fg"><label className="fl">First Name</label><input className="fi" value={f.firstName} onChange={e=>sf("firstName",e.target.value)} placeholder="e.g. Nomsa"/></div><div className="fg"><label className="fl">Last Name</label><input className="fi" value={f.lastName} onChange={e=>sf("lastName",e.target.value)} placeholder="e.g. Khumalo"/></div></div>
      <div className="fgrid"><div className="fg"><label className="fl">ID Number</label><input className="fi" value={f.idNumber} onChange={e=>sf("idNumber",e.target.value)} placeholder="SA ID" maxLength={13} pattern="[0-9]*" inputMode="numeric"/></div><div className="fg"><label className="fl">Phone</label><input className="fi" value={f.phone} onChange={e=>sf("phone",e.target.value)} placeholder="082 000 0000" type="tel"/></div></div>
      <div className="fsec">Choir Details</div>
      <div className="fgrid"><div className="fg"><label className="fl">Singing Voice</label><select className="fi" value={f.voice} onChange={e=>sf("voice",e.target.value)}>{VOICES.map(v=><option key={v}>{v}</option>)}</select></div><div className="fg"><label className="fl">Role</label><select className="fi" value={f.role} onChange={e=>sf("role",e.target.value)}>{["Member","Choir Leader","Deputy Leader","Soloist","Accompanist"].map(r=><option key={r}>{r}</option>)}</select></div></div>
      <div className="fsec">Church Membership <span style={{fontSize:9,color:"var(--muted)",letterSpacing:0,textTransform:"none",fontFamily:"'Barlow',sans-serif"}}>(Internal only)</span></div>
      <div className="fg"><label className="fl">Member Since</label><input className="fi" type="date" value={f.memberSince} onChange={e=>sf("memberSince",e.target.value)} max={new Date().toISOString().split("T")[0]} style={{colorScheme:"dark"}}/>{f.memberSince&&<div style={{marginTop:6}}><div className="since"><Icon name="shield" size={11} stroke="var(--gold)"/>Member for {Math.floor((new Date()-new Date(f.memberSince))/(1000*60*60*24*365))} years</div></div>}</div>
      <button className="btn bp" onClick={submit}><Icon name="plus" size={15}/> Register Member</button>
      {group?.fc_choir_members?.length>0&&(<><div className="sechd" style={{marginTop:18}}><span className="secht">{group.name} · {group.fc_choir_members.length} members</span></div>{group.fc_choir_members.map(m=>(<div key={m.id} className="pcard"><div className="pav">{m.first_name?.charAt(0)||"?"}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:500}}>{m.first_name} {m.last_name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{m.singing_voice} · {m.choir_role}</div></div>{isOrg&&<button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>askPin("Remove Member","Enter organizer PIN.",async()=>{await supabase.from("fc_choir_members").delete().eq("id",m.id);showToast("Removed.");onRefresh();})}><Icon name="trash" size={14}/></button>}<span className="tag tg" style={{marginLeft:4}}>{m.singing_voice?.charAt(0)}</span></div>))}</>)}
    </div>
  );
}

function ChoirManage({groups,scores,cats,songs,songOrders,published,publishTeams,publishSpectators,spectatorMode,currentGroupId,eventId,askPin,showToast,onRefresh}){
  const[newCat,setNewCat]=useState("");
  const currentIdx=groups.findIndex(g=>g.id===currentGroupId);
  const currentGroup=groups.find(g=>g.id===currentGroupId);
  const nextGroup=currentIdx>=0&&currentIdx<groups.length-1?groups[currentIdx+1]:null;
  const updateEvent=async(fields)=>{if(!eventId)return;await supabase.from("fc_events").update(fields).eq("id",eventId);onRefresh();};
  const startChoir=async()=>{if(!groups.length){showToast("No groups set up.");return;}await updateEvent({choir_current_group_id:groups[0].id});showToast(`Started — ${groups[0].name} is now performing`);};
  const advanceGroup=async()=>{if(!nextGroup){showToast("All groups have performed!");return;}await updateEvent({choir_current_group_id:nextGroup.id});showToast(`Advanced to ${nextGroup.name}`);};
  const togglePublishTeams=async()=>{await updateEvent({choir_publish_teams:!publishTeams});showToast(!publishTeams?"Results published to choir teams!":"Hidden from teams.");};
  const togglePublishSpectators=async()=>{
    await updateEvent({choir_publish_spectators:!publishSpectators});
    if(!eventId)return;
    await supabase.from("fc_publish_flags").update({published:!publishSpectators,updated_at:new Date().toISOString()}).eq("event_id",eventId).eq("competition","choir");
    showToast(!publishSpectators?"Leaderboard published to spectators!":"Hidden from spectators.");
  };
  const toggleSpectatorMode=async()=>{const next=spectatorMode==="hold"?"live":"hold";await updateEvent({choir_spectator_mode:next});showToast(next==="live"?"Spectators now see live scores":"Scores hidden until you publish");};
  const addCat=async()=>{
    if(!newCat.trim())return;
    const{data:evArr}=await supabase.from("fc_events").select("id,choir_categories").eq("is_active",true).limit(1);
    const ev=evArr?.[0];if(!ev)return;
    const updated=[...(ev.choir_categories||cats),newCat];
    await supabase.from("fc_events").update({choir_categories:updated}).eq("id",ev.id);
    showToast("Category added!");setNewCat("");onRefresh();
  };
  const removeCat=cat=>askPin("Remove Category","Enter organizer PIN.",async()=>{
    const{data:evArr}=await supabase.from("fc_events").select("id,choir_categories").eq("is_active",true).limit(1);
    const ev=evArr?.[0];if(!ev)return;
    await supabase.from("fc_events").update({choir_categories:(ev.choir_categories||cats).filter(c=>c!==cat)}).eq("id",ev.id);
    showToast("Removed.");onRefresh();
  });
  return(
    <div className="pw">
      <div className="fsec" style={{marginTop:0}}>Performance Control</div>
      <div className="card card-gold" style={{marginBottom:14}}>
        {!currentGroupId?(
          <div><div style={{fontSize:13,color:"var(--muted)",marginBottom:12,lineHeight:1.5}}>Start the choir competition. Judges will only see the first performing group.</div><button className="btn bp" onClick={startChoir}><Icon name="signal" size={14}/> Start Choir Competition</button></div>
        ):(
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",marginBottom:8,fontWeight:700}}>Now Performing</div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><TL name={currentGroup?.name} size={46}/><div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800}}>{currentGroup?.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Group {currentIdx+1} of {groups.length}</div></div></div>
            {nextGroup?(<button className="btn bp" onClick={advanceGroup}><Icon name="signal" size={14}/> Advance to {nextGroup.name} →</button>):(<div style={{fontSize:13,color:"#68d391",textAlign:"center",padding:"10px 0",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>✅ All groups have performed</div>)}
          </div>
        )}
      </div>
      <div className="fsec">Publish Controls</div>
      <div className="card" style={{marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><div><div style={{fontSize:14,fontWeight:600}}>Publish to Choir Teams</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Each team sees their detailed scores per song</div></div><button className={`btn bsm ${publishTeams?"bd":"bg"}`} onClick={togglePublishTeams}><Icon name={publishTeams?"eyeoff":"publish"} size={13}/>{publishTeams?"Unpublish":"Publish"}</button></div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:14,fontWeight:600}}>Publish to Spectators</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Full leaderboard visible to everyone</div></div><button className={`btn bsm ${publishSpectators?"bd":"bg"}`} onClick={togglePublishSpectators}><Icon name={publishSpectators?"eyeoff":"publish"} size={13}/>{publishSpectators?"Unpublish":"Publish"}</button></div>
      </div>
      <div className="card card-sm" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:14,fontWeight:600}}>Spectator Visibility</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{spectatorMode==="live"?"Scores update live":"Held until MC announces"}</div></div><div style={{width:44,height:24,borderRadius:12,background:spectatorMode==="live"?"var(--gold)":"var(--border2)",position:"relative",cursor:"pointer",transition:"background .2s"}} onClick={toggleSpectatorMode}><div style={{position:"absolute",top:2,left:spectatorMode==="live"?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/></div></div>
      </div>
      <div className="fsec">Performance Order Per Song</div>
      {songs.map((song,si)=>(
        <div key={si} className="card" style={{marginBottom:10}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",fontWeight:700,marginBottom:10}}>Song {si+1}: {song}</div>
          {((songOrders||CHOIR_SONG_ORDERS)[si]||[]).map((name,i)=>{
            const g=groups.find(x=>x.name===name);
            const songScored=g?scores.filter(s=>s.group_id===g.id&&s.song_index===si).length>0:false;
            return(<div key={name} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid var(--border)"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,color:g?.id===currentGroupId?"var(--gold)":"var(--muted2)",width:26}}>{i+1}</div>{g&&<TL name={g.name} size={32}/>}<div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{name}</div><div style={{fontSize:11,color:"var(--muted)"}}>{songScored?"✅ Scored":"Pending"}</div></div>{g?.id===currentGroupId&&<span className="tag tg">Now</span>}</div>);
          })}
        </div>
      ))}
      <div className="fsec">Scoring Categories</div>
      <div className="card">
        <div style={{display:"flex",gap:8,marginBottom:12}}><input className="fi" value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="Add category..." style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&addCat()}/><button className="btn bp bsm" style={{width:"auto"}} onClick={addCat}><Icon name="plus" size={14}/></button></div>
        {cats.map(cat=>(<div key={cat} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--border)"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Icon name="tag" size={14} stroke="var(--gold)"/><span style={{fontSize:14}}>{cat}</span></div><button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>removeCat(cat)}><Icon name="x" size={15}/></button></div>))}
      </div>
    </div>
  );
}

function ChoirSettings({cats,songs,songOrders,groups,spectatorMode,eventId,showToast,onRefresh}){
  const[localSongs,setLocalSongs]=useState(songs);
  const[localOrders,setLocalOrders]=useState(songOrders||CHOIR_SONG_ORDERS);
  useEffect(()=>{setLocalSongs(songs);},[songs]);
  useEffect(()=>{if(songOrders)setLocalOrders(songOrders);},[songOrders]);
  const saveSongs=async()=>{if(!eventId)return;await supabase.from("fc_events").update({choir_songs:localSongs}).eq("id",eventId);showToast("Song titles saved!");onRefresh();};
  const move=(si,idx,dir)=>{setLocalOrders(prev=>{const orders={...prev};const list=[...(orders[si]||[])];const ni=idx+dir;if(ni<0||ni>=list.length)return prev;[list[idx],list[ni]]=[list[ni],list[idx]];orders[si]=list;return orders;});};
  const saveOrders=async()=>{if(!eventId)return;try{await supabase.from("fc_events").update({choir_song_orders:localOrders}).eq("id",eventId);showToast("Performance orders saved ✓");onRefresh();}catch(e){showToast("Error: "+e.message);}};
  return(
    <div className="pw">
      <div className="fsec" style={{marginTop:0}}>Song Titles</div>
      <div className="card" style={{marginBottom:14}}>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:14,lineHeight:1.5}}>Define the titles of the 3 songs each choir will perform.</div>
        {localSongs.map((s,i)=>(<div key={i} className="fg"><label className="fl">Song {i+1}</label><input className="fi" value={s} onChange={e=>{const ns=[...localSongs];ns[i]=e.target.value;setLocalSongs(ns);}} placeholder={`e.g. Song ${i+1} title`}/></div>))}
        <button className="btn bp" onClick={saveSongs}><Icon name="check" size={14}/> Save Song Titles</button>
      </div>
      <div className="fsec">Performance Order Per Song</div>
      <div style={{fontSize:12,color:"var(--muted)",marginBottom:12,lineHeight:1.5}}>Use the arrows to reorder which choir performs in each position. Save when done.</div>
      {localSongs.map((song,si)=>(
        <div key={si} className="card" style={{marginBottom:10}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",fontWeight:700,marginBottom:10}}>Song {si+1}: {song}</div>
          {(localOrders[si]||[]).map((name,i)=>(
            <div key={name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,color:"var(--muted2)",width:24}}>{i+1}</div>
              <TL name={name} size={30}/>
              <div style={{flex:1,fontSize:14,fontWeight:600}}>{name}</div>
              <button className="btn bo bsm" style={{width:36,padding:"6px 0",opacity:i===0?.3:1}} disabled={i===0} onClick={()=>move(si,i,-1)}>↑</button>
              <button className="btn bo bsm" style={{width:36,padding:"6px 0",opacity:i===(localOrders[si]||[]).length-1?.3:1}} disabled={i===(localOrders[si]||[]).length-1} onClick={()=>move(si,i,1)}>↓</button>
            </div>
          ))}
        </div>
      ))}
      <button className="btn bp" onClick={saveOrders}><Icon name="check" size={14}/> Save Performance Orders</button>
    </div>
  );
}

function ChoirAllScores({groups,scores,cats}){
  const ranked=rankGroups(groups,scores,cats);
  return(
    <div className="pw">
      <div style={{fontSize:11,color:"var(--muted)",marginBottom:12,lineHeight:1.6}}>Scores calculated per official CHG scoring model. Interpretation & Musicianship = 50pts, all other categories = 10pts each. Total out of 100.</div>
      <div className="card">
        {ranked.map((r,i)=>(
          <div key={r.group.id} style={{padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:i<3?"var(--gold)":"var(--muted2)",width:26}}>#{i+1}</div>
              <TL name={r.group.name} size={32}/>
              <div style={{flex:1,marginLeft:4}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700}}>{r.group.name}</div><div style={{fontSize:10,color:"var(--muted)",marginTop:1}}>{r.judgeCount} judge{r.judgeCount!==1?"s":""}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:700,color:r.overall>0?GRADE_COLOR(r.pct):"var(--muted)"}}>{r.overall>0?r.overall.toFixed(1):"—"}</div><div style={{fontSize:9,color:"var(--muted)"}}>/ {r.totalMax||100}</div>{r.overall>0&&<div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:700,color:GRADE_COLOR(r.pct)}}>{GRADE_LABEL(r.pct)}</div>}</div>
            </div>
            <div style={{fontSize:10,color:"var(--muted)",paddingLeft:68}}>{cats.map((c,ci)=>`${c}: ${(r.catAvgs[ci]||0).toFixed(1)}/${getCatMax(c)}`).join("  ·  ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpreadsheetUpload({teamId,sport,onRefresh,showToast}){
  const[uploading,setUploading]=useState(false);
  const[preview,setPreview]=useState(null);
  const[errors,setErrors]=useState([]);
  const fileRef=React.useRef();
  const parseCSV=(text)=>{
    const lines=text.trim().split("\n").map(l=>l.replace(/\r/g,""));
    if(!lines.length)return{rows:[],errors:["Empty file"]};
    const headers=lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/\s+/g,"_").replace(/[^a-z_]/g,""));
    const errs=[],rows=[];
    lines.slice(1).forEach((line,i)=>{
      if(!line.trim())return;
      const vals=line.split(",").map(v=>v.trim().replace(/^"|"$/g,""));
      const row={};
      headers.forEach((h,j)=>{row[h]=vals[j]||"";});
      if(!row.first_name||!row.last_name)errs.push(`Row ${i+2}: first_name and last_name are required`);
      else rows.push(row);
    });
    return{rows,errors:errs};
  };
  const handleFile=(e)=>{
    const file=e.target.files[0];if(!file)return;
    const ext=file.name.split(".").pop().toLowerCase();
    if(!["csv","txt"].includes(ext)){showToast("Please upload a CSV file");return;}
    const reader=new FileReader();
    reader.onload=ev=>{const{rows,errors:errs}=parseCSV(ev.target.result);setPreview(rows);setErrors(errs);};
    reader.readAsText(file);
  };
  const uploadPlayers=async()=>{
    if(!preview?.length){showToast("No valid players to upload");return;}
    setUploading(true);
    try{
      let success=0,failed=0;
      for(const row of preview){
        try{await supabase.from("fc_players").insert({team_id:teamId,name:`${row.first_name} ${row.last_name}`,first_name:row.first_name,last_name:row.last_name,id_number:row.id_number||null,phone:row.phone||null,jersey_number:row.jersey_number||null,position:row.position||null,age_group:row.age_group||"Open",player_role:row.player_role||"Player",member_since:row.member_since||null});success++;}
        catch(e){failed++;}
      }
      showToast(`Uploaded ${success} players${failed>0?", "+failed+" failed":""}`);
      setPreview(null);setErrors([]);if(fileRef.current)fileRef.current.value="";onRefresh();
    }catch(e){showToast("Upload failed: "+e.message);}
    setUploading(false);
  };
  return(
    <div>
      <div style={{background:"rgba(240,180,41,.06)",border:"1px solid var(--gold-border)",borderRadius:10,padding:14,marginBottom:12}}>
        <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:10}}>Upload a CSV file with one player per row. First row must be column headers.</div>
        <div style={{fontFamily:"Courier New, monospace",fontSize:11,color:"#68d391",background:"rgba(0,0,0,.3)",padding:"8px 10px",borderRadius:6,overflowX:"auto",whiteSpace:"nowrap",marginBottom:8}}>first_name,last_name,id_number,phone,jersey_number,position,age_group,player_role,member_since</div>
      </div>
      <div style={{border:"2px dashed var(--gold-border)",borderRadius:10,padding:20,textAlign:"center",cursor:"pointer",marginBottom:12}} onClick={()=>fileRef.current?.click()}>
        <Icon name="download" size={24} stroke="var(--gold)"/>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:"var(--gold)",marginTop:8}}>Tap to select CSV file</div>
        <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Accepts .csv files only</div>
        <input ref={fileRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleFile}/>
      </div>
      {errors.length>0&&(<div style={{background:"rgba(229,62,62,.1)",border:"1px solid rgba(229,62,62,.3)",borderRadius:8,padding:12,marginBottom:12}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,color:"#fc8181",marginBottom:6}}>⚠️ {errors.length} issue{errors.length>1?"s":""} found</div>{errors.map((e,i)=><div key={i} style={{fontSize:12,color:"#fc8181",marginBottom:2}}>{e}</div>)}</div>)}
      {preview&&preview.length>0&&(
        <div style={{marginBottom:12}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",fontWeight:700,marginBottom:8}}>{preview.length} players ready to upload</div>
          {preview.slice(0,5).map((p,i)=>(<div key={i} className="pcard" style={{marginBottom:6}}><div className="pav">{p.first_name?.charAt(0)||"?"}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:500}}>{p.first_name} {p.last_name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>#{p.jersey_number} · {p.position}</div></div></div>))}
          {preview.length>5&&<div style={{fontSize:12,color:"var(--muted)",textAlign:"center",padding:"6px 0"}}>+{preview.length-5} more players</div>}
          <button className="btn bp" onClick={uploadPlayers} disabled={uploading} style={{marginTop:8}}><Icon name="plus" size={14}/>{uploading?"Uploading...":"Upload All "+preview.length+" Players"}</button>
        </div>
      )}
    </div>
  );
}

function NewsPage({role,announcements,onRefresh,askPin,showToast}){
  const[body,setBody]=useState("");
  const[urgent,setUrgent]=useState(false);
  const[pushOn,setPushOn]=useState(()=>"Notification"in window&&Notification.permission==="granted");
  const isOrg=role==="organizer";
  const enablePush=async()=>{
    const result=await requestPush();
    setPushOn(result.ok);
    if(result.ok){showToast("Push notifications enabled!");}
    else if(result.reason==="denied"){showToast("Blocked — enable in browser settings");alert("To enable notifications:\n\n1. Tap the padlock/info icon in your browser address bar\n2. Find 'Notifications'\n3. Change to 'Allow'\n4. Refresh the page");}
    else if(result.reason==="not_supported"){showToast("Not supported on this browser");}
    else{showToast("Could not enable — try from home screen app");}
  };
  const post=async()=>{
    if(!body.trim())return;
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      await supabase.from("fc_announcements").insert({event_id:ev.id,body,urgent,posted_by:"Organizer"});
      showToast("Posted!");setBody("");setUrgent(false);onRefresh();
    }catch(e){showToast("Error: "+e.message);}
  };
  const remove=id=>askPin("Remove Announcement","Enter organizer PIN.",async()=>{await supabase.from("fc_announcements").delete().eq("id",id);showToast("Removed.");onRefresh();});
  return(
    <div className="pw pg">
      <div className="pgb"><div className="pgl fu">Updates</div><div className="pgt fu fu1">News</div><div className="pgs fu fu2">Official tournament announcements</div></div>
      <div className="inner">
        {!isOrg&&!pushOn&&<div className="card card-gold fu fu1" style={{marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:12}}><Icon name="bell" size={22} stroke="var(--gold)"/><div style={{flex:1}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:"var(--gold)"}}>Enable Notifications</div><div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>Get notified when the organizer posts</div></div><button className="btn bp bsm" onClick={enablePush}>Enable</button></div></div>}
        {isOrg&&(
          <div className="card fu fu1" style={{marginBottom:16}}>
            <div className="fg"><label className="fl">Post Announcement</label><textarea className="fi" rows={3} value={body} onChange={e=>setBody(e.target.value)} placeholder="Type your message..." style={{resize:"vertical",lineHeight:1.5}}/></div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><div style={{width:40,height:22,borderRadius:11,background:urgent?"#e53e3e":"var(--border2)",position:"relative",transition:"background .2s"}} onClick={()=>setUrgent(u=>!u)}><div style={{position:"absolute",top:2,left:urgent?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/></div><span style={{fontSize:12,color:urgent?"#fc8181":"var(--muted)"}}>Mark as urgent</span></label>
              {!pushOn&&<button className="btn bo bsm" onClick={enablePush}><Icon name="bell" size={13}/> Enable Push</button>}
            </div>
            <button className="btn bp" onClick={post}><Icon name="news" size={14}/> {pushOn?"Post & Notify":"Post"}</button>
          </div>
        )}
        {!announcements.length&&<div className="empty fu"><div className="eti"><Icon name="news" size={38} sw={1}/></div><div className="ett">No announcements yet.</div></div>}
        {announcements.map((a,i)=>(
          <div key={a.id} className={`ann fu ${a.urgent?"urg":""}`} style={{animationDelay:`${i*.05}s`}}>
            <div className="ann-bw"><div className="ann-time">{new Date(a.created_at).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"})}{a.urgent&&<span className="tag tgr" style={{fontSize:9,padding:"1px 6px"}}>🚨 Urgent</span>}</div><div className="ann-body">{a.body}</div></div>
            {isOrg&&<button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4,alignSelf:"flex-start"}} onClick={()=>remove(a.id)}><Icon name="trash" size={14}/></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPage({local,setLocal,askPin,showToast}){
  const[tab,setTab]=useState("users");
  return(
    <div className="pw pg">
      <div className="pgb"><div className="pgl fu">Organizer</div><div className="pgt fu fu1">Admin <span className="acc">Panel</span></div></div>
      <div className="tabs">{[{id:"users",lbl:"Users"},{id:"publish",lbl:"Publish"},{id:"overview",lbl:"Overview"}].map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.lbl}</button>)}</div>
      <div className="inner">
        {tab==="users"   &&<UserMgmt   askPin={askPin} showToast={showToast}/>}
        {tab==="publish" &&<PublishMgmt showToast={showToast}/>}
        {tab==="overview"&&<Overview   local={local} askPin={askPin} showToast={showToast}/>}
      </div>
    </div>
  );
}

function UserMgmt({askPin,showToast}){
  const[sec,setSec]=useState("judges");
  const[judges,setJudges]=useState([]);
  const[admins,setAdmins]=useState([]);
  const[loading,setLoading]=useState(true);
  const[eventId,setEventId]=useState(null);
  const[jn,setJn]=useState("");const[jp,setJp]=useState("");const[jt,setJt]=useState("");
  const[an,setAn]=useState("");const[ap,setAp]=useState("");const[at,setAt]=useState("Durban Central United");
  const allTeamNames=["Durban Central United","Wakanda OT","Cape Town Team","Swacunda Team","Mighty Durban West","Zululand Warriors","Mlungwane FC","Durban South Rising Stars"];
  const loadUsers=async()=>{
    setLoading(true);
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1);
      const eid=ev?.[0]?.id;if(!eid)return;
      setEventId(eid);
      const{data}=await supabase.from("fc_users").select("*").eq("event_id",eid).order("created_at",{ascending:true});
      setJudges((data||[]).filter(u=>u.role==="judge"));
      setAdmins((data||[]).filter(u=>u.role==="teamadmin"));
    }catch(e){console.warn("Load users error",e);}
    setLoading(false);
  };
  useEffect(()=>{
    loadUsers();
    const ch=supabase.channel("fc_users_rt").on("postgres_changes",{event:"*",schema:"public",table:"fc_users"},()=>loadUsers()).subscribe();
    return()=>supabase.removeChannel(ch);
  },[]);
  const addJudge=async()=>{
    if(!jn.trim()||!jp.trim()){showToast("Name & PIN required.");return;}
    if(!eventId){showToast("No active event found.");return;}
    try{await supabase.from("fc_users").insert({event_id:eventId,role:"judge",name:jn.trim(),pin:jp,tablet:jt});showToast("Judge added! ✓");setJn("");setJp("");setJt("");}
    catch(e){showToast("Error: "+e.message);}
  };
  const rmJudge=id=>askPin("Remove Judge","Enter organizer PIN.",async()=>{await supabase.from("fc_users").delete().eq("id",id);showToast("Judge removed.");});
  const addAdmin=async()=>{
    if(!an.trim()||!ap.trim()){showToast("Name & PIN required.");return;}
    if(!eventId){showToast("No active event found.");return;}
    try{await supabase.from("fc_users").insert({event_id:eventId,role:"teamadmin",name:an.trim(),pin:ap,team_id:at});showToast("Team admin added! ✓");setAn("");setAp("");}
    catch(e){showToast("Error: "+e.message);}
  };
  const rmAdmin=id=>askPin("Remove Team Admin","Enter organizer PIN.",async()=>{await supabase.from("fc_users").delete().eq("id",id);showToast("Team admin removed.");});
  return(
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
        {loading&&<Spinner size={24}/>}
        {!loading&&!judges.length&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"16px 0"}}>No judges added yet.</div>}
        {!loading&&judges.map((j,i)=>(<div key={j.id} className="urow fu" style={{animationDelay:`${i*.04}s`}}><div className="uav">{j.name.charAt(0)}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{j.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{j.tablet||"No device assigned"} · PIN set ✓</div></div><button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>rmJudge(j.id)}><Icon name="trash" size={14}/></button></div>))}</>
      )}
      {sec==="admins"&&(
        <><div className="card" style={{marginBottom:14}}>
          <div className="fsec" style={{marginTop:0}}>Add Team Admin</div>
          <div className="fgrid"><div className="fg"><label className="fl">Full Name</label><input className="fi" value={an} onChange={e=>setAn(e.target.value)} placeholder="Admin name"/></div><div className="fg"><label className="fl">PIN</label><input className="fi" value={ap} onChange={e=>setAp(e.target.value)} placeholder="e.g. 9012" type="password"/></div></div>
          <div className="fg"><label className="fl">Assign Team</label><select className="fi" value={at} onChange={e=>setAt(e.target.value)}>{allTeamNames.map(t=><option key={t}>{t}</option>)}</select></div>
          <button className="btn bp" onClick={addAdmin}><Icon name="plus" size={15}/> Add Team Admin</button>
        </div>
        {loading&&<Spinner size={24}/>}
        {!loading&&!admins.length&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",padding:"16px 0"}}>No team admins yet.</div>}
        {!loading&&admins.map((a,i)=>(<div key={a.id} className="urow fu" style={{animationDelay:`${i*.04}s`}}><TL name={a.team_id} size={38}/><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{a.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{a.team_id} · PIN set ✓</div></div><button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",padding:4}} onClick={()=>rmAdmin(a.id)}><Icon name="trash" size={14}/></button></div>))}</>
      )}
    </div>
  );
}

function PublishMgmt({showToast}){
  const[flags,setFlags]=useState({soccer:false,netball:false,choir:false});
  const[eid,setEid]=useState(null);
  const loadFlags=async()=>{
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      if(!ev||!ev.id)throw new Error("No active event");
      setEid(ev.id);
      const{data:pf}=await supabase.from("fc_publish_flags").select("*").eq("event_id",ev.id);
      const f={};(pf||[]).forEach(p=>{f[p.competition]=p.published;});
      setFlags(f);
      return ev.id;
    }catch(e){console.warn("PublishMgmt load error",e);}
  };
  useEffect(()=>{
    loadFlags();
    const ch=supabase.channel("publish_flags_rt").on("postgres_changes",{event:"UPDATE",schema:"public",table:"fc_publish_flags"},payload=>{setFlags(f=>({...f,[payload.new.competition]:payload.new.published}));}).subscribe();
    return()=>supabase.removeChannel(ch);
  },[]);
  const toggle=async comp=>{
    try{
      const evId=eid||(await loadFlags());
      if(!evId)throw new Error("No active event ID");
      const isPublishing=!flags[comp];
      await supabase.from("fc_publish_flags").update({published:isPublishing,updated_at:new Date().toISOString()}).eq("event_id",evId).eq("competition",comp);
      // Choir uses a separate field on fc_events — keep them in sync
      if(comp==="choir"){
        await supabase.from("fc_events").update({choir_publish_spectators:isPublishing}).eq("id",evId);
      }
      const compLabel=comp.charAt(0).toUpperCase()+comp.slice(1);
      showToast(isPublishing?`${compLabel} published to all devices!`:`${compLabel} hidden.`);
      if(isPublishing){
        try{
          const{data:ev2}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1);
          if(ev2?.[0]){await supabase.from("fc_announcements").insert({event_id:ev2[0].id,body:`📢 ${compLabel} results are now live! Check the ${compLabel} tab for the latest standings.`,urgent:false,posted_by:"System"});}
        }catch(e){}
      }
    }catch(e){showToast("Error: "+e.message);}
  };
  const[reviewComp,setReviewComp]=useState(null);
  const[reviewData,setReviewData]=useState(null);
  const[reviewLoading,setReviewLoading]=useState(false);
  const openReview=async(comp)=>{
    if(reviewComp===comp){setReviewComp(null);setReviewData(null);return;}
    setReviewComp(comp);setReviewLoading(true);setReviewData(null);
    try{
      const evId=eid||(await loadFlags());
      if(comp==="choir"){
        const[{data:g},{data:s},{data:evd}]=await Promise.all([supabase.from("fc_choir_groups").select("*").eq("event_id",evId).order("performance_order"),supabase.from("fc_choir_scores").select("*").eq("event_id",evId),supabase.from("fc_events").select("choir_categories").eq("id",evId).limit(1)]);
        const evCats=evd?.[0]?.choir_categories||DEFAULT_CATS;
        const ranked=rankGroups(g||[],s||[],evCats);
        setReviewData({type:"choir",ranked,cats:evCats});
      } else {
        const{data:m}=await supabase.from("fc_matches_view").select("*").eq("event_id",evId).eq("competition",comp).order("round");
        setReviewData({type:"sport",matches:m||[]});
      }
    }catch(e){console.warn("Review load error",e);}
    setReviewLoading(false);
  };
  return(
    <div className="pw">
      <div className="sechd fu"><span className="secht">Publish Controls</span></div>
      <div style={{fontSize:12,color:"var(--muted)",marginBottom:12,lineHeight:1.5}}>Tap <strong style={{color:"var(--gold)"}}>Review</strong> to preview exactly what spectators will see before publishing.</div>
      {["soccer","netball","choir"].map((comp,i)=>(
        <div key={comp} className="card card-sm fu" style={{marginBottom:10,animationDelay:`${i*.05}s`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,textTransform:"capitalize"}}>{comp}</div><div style={{marginTop:4}}><span className={`tag ${flags[comp]?"tgn":"tgm"}`}>{flags[comp]?"Published":"Hidden"}</span></div></div>
            <div style={{display:"flex",gap:6}}>
              <button className="btn bo bsm" onClick={()=>openReview(comp)}><Icon name="eye" size={13}/>{reviewComp===comp?"Close":"Review"}</button>
              <button className={`btn bsm ${flags[comp]?"bd":"bg"}`} onClick={()=>toggle(comp)}><Icon name={flags[comp]?"eyeoff":"publish"} size={13}/>{flags[comp]?"Unpublish":"Publish"}</button>
            </div>
          </div>
          {reviewComp===comp&&(
            <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",fontWeight:700,marginBottom:10}}>Spectator Preview — What will go live</div>
              {reviewLoading&&<Spinner size={22}/>}
              {!reviewLoading&&reviewData?.type==="sport"&&(
                reviewData.matches.length?reviewData.matches.map(m=>(
                  <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
                    <span className="tag tgm" style={{fontSize:9}}>R{m.round}{m.round_label&&m.round_label!=="Quarter Final"?" · "+m.round_label:""}</span>
                    <span style={{flex:1}}>{m.team_a_name} <strong style={{color:"var(--gold)"}}>{m.score_a??"—"}</strong> vs <strong style={{color:"var(--gold)"}}>{m.score_b??"—"}</strong> {m.team_b_name||"TBD"}</span>
                    {m.winner_id?<span className="tag tgn" style={{fontSize:9}}>✓ {m.winner_name}</span>:<span className="tag tgm" style={{fontSize:9}}>Pending</span>}
                  </div>
                )):<div style={{fontSize:12,color:"var(--muted)",padding:"8px 0"}}>No matches loaded.</div>
              )}
              {!reviewLoading&&reviewData?.type==="choir"&&(
                reviewData.ranked.length?reviewData.ranked.map((r,ri)=>(
                  <div key={r.group.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,color:ri<3?"var(--gold)":"var(--muted2)",width:24}}>#{ri+1}</span>
                    <TL name={r.group.name} size={24}/>
                    <span style={{flex:1}}>{r.group.name}</span>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,color:r.overall>0?GRADE_COLOR(r.pct):"var(--muted)"}}>{r.overall>0?r.overall.toFixed(1)+"/100":"No scores"}</span>
                  </div>
                )):<div style={{fontSize:12,color:"var(--muted)",padding:"8px 0"}}>No groups loaded.</div>
              )}
              <div style={{fontSize:11,color:"var(--muted)",marginTop:10,lineHeight:1.5}}>To fix an error: go to the {comp==="choir"?"Choir tab (judges edit their scores)":comp+" tab → Scores"} and correct it, then come back and publish.</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Overview({local,askPin,showToast}){
  const clearChoirScores=()=>askPin("Clear Choir Scores","This clears ALL judge scores and resets the performing group to the start.",async()=>{
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0]}));
      if(!ev?.id)throw new Error("No active event");
      const{data:scores}=await supabase.from("fc_choir_scores").select("id").eq("event_id",ev.id);
      if(scores?.length)for(const s of scores)await supabase.from("fc_choir_scores").delete().eq("id",s.id);
      await supabase.from("fc_events").update({choir_current_group_id:null,choir_publish_teams:false,choir_publish_spectators:false}).eq("id",ev.id);
      await supabase.from("fc_publish_flags").update({published:false,updated_at:new Date().toISOString()}).eq("event_id",ev.id).eq("competition","choir");
      showToast("Choir scores cleared ✓");
    }catch(e){showToast("Error: "+e.message);}
  });
  const resetComp=comp=>askPin(`Reset ${comp}`,"This permanently deletes ALL data for this competition.",async()=>{
    try{
      const{data:ev}=await supabase.from("fc_events").select("id").eq("is_active",true).limit(1).then(r=>({data:r.data?.[0],error:r.error}));
      if(!ev||!ev.id)throw new Error("No active event found");
      const eid=ev.id;
      if(comp==="choir"){
        const{data:scores}=await supabase.from("fc_choir_scores").select("id").eq("event_id",eid);
        if(scores?.length)for(const s of scores)await supabase.from("fc_choir_scores").delete().eq("id",s.id);
        await supabase.from("fc_events").update({choir_current_group_id:null,choir_publish_teams:false,choir_publish_spectators:false}).eq("id",eid);
        await supabase.from("fc_publish_flags").update({published:false,updated_at:new Date().toISOString()}).eq("event_id",eid).eq("competition","choir");
        showToast("Choir reset ✓");
      } else {
        const{data:existingMatches}=await supabase.from("fc_matches").select("id").eq("event_id",eid).eq("competition",comp);
        if(existingMatches?.length)for(const m of existingMatches)await supabase.from("fc_matches").delete().eq("id",m.id);
        const{data:teams}=await supabase.from("fc_teams").select("id").eq("event_id",eid).eq("competition",comp);
        if(teams?.length)for(const t of teams){const{data:players}=await supabase.from("fc_players").select("id").eq("team_id",t.id);if(players?.length)for(const p of players)await supabase.from("fc_players").delete().eq("id",p.id);}
        await restoreConfirmedDraw(comp);
        showToast(`${comp} reset ✓ — Confirmed draw restored`);
      }
    }catch(e){console.error("Reset error:",e);showToast("Reset failed: "+e.message);}
  });
  return(
    <div className="pw">
      <div className="card fu fu1">
        <div className="fsec" style={{marginTop:0}}>Organizer PIN Reference</div>
        {[["Organizer",ORG_PIN],["Judges","Set per judge"],["Team Admins","Set per admin"]].map(([r,p])=>(
          <div key={r} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}><span style={{fontSize:13}}>{r}</span><span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:r==="Organizer"?20:13,fontWeight:700,color:"var(--gold)",letterSpacing:r==="Organizer"?6:0}}>{p}</span></div>
        ))}
      </div>
      <div className="sechd fu fu2"><span className="secht" style={{color:"#fc8181"}}>Danger Zone — PIN Required</span></div>
      <div className="card fu fu2" style={{borderColor:"rgba(229,62,62,.2)"}}>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:12,lineHeight:1.6}}><strong style={{color:"#fc8181"}}>Clear Choir Scores</strong> — wipes all judge scores and resets performing group to start. All other data is preserved.</div>
        <button className="btn bd bsm" style={{marginBottom:14,width:"100%"}} onClick={clearChoirScores}><Icon name="refresh" size={12}/> Clear Choir Scores Only</button>
        <div style={{height:1,background:"rgba(229,62,62,.15)",marginBottom:14}}/>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:12,lineHeight:1.6}}><strong style={{color:"#fc8181"}}>Full Reset</strong> — clears all matches, scores and players and restores the confirmed pre-drawn fixtures.</div>
        <div className="brow">{["soccer","netball","choir"].map(c=><button key={c} className="btn bd bsm" onClick={()=>resetComp(c)}><Icon name="trash" size={12}/> Reset {c}</button>)}</div>
      </div>
      <div className="card fu fu3" style={{borderColor:"var(--gold-border)",marginTop:4}}>
        <div style={{display:"flex",gap:9,alignItems:"flex-start"}}><span className="live-dot"/><div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6}}>Connected to Supabase. All data syncs in real time across every device.</div></div>
      </div>
    </div>
  );
}
