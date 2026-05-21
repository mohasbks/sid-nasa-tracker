'use strict';
const $ = id => document.getElementById(id);
const state = { dashboard:null, insights:null, alerts:[], asteroids:null, page:'overview' };

/* ── CLOCK ── */
function startClock() {
  const tick = () => { const el=$('current-time'); if(el) el.textContent=new Date().toUTCString().slice(0,25)+' UTC'; };
  tick(); setInterval(tick,1000);
}

/* ── NAV ── */
function initNav() {
  document.getElementById('sidebar').addEventListener('click', e => {
    e.preventDefault();
    const link = e.target.closest('[data-page]');
    if (link) navigateTo(link.dataset.page);
  });
  const rb=$('refresh-btn'); if(rb) rb.addEventListener('click', loadAllData);
  const lb=$('logs-btn'); if(lb) lb.addEventListener('click', openDrawer);
  const olb=$('open-logs-drawer'); if(olb) olb.addEventListener('click', openDrawer);
  const dc=$('drawer-close'); if(dc) dc.addEventListener('click', closeDrawer);
  const ov=$('drawer-overlay'); if(ov) ov.addEventListener('click', closeDrawer);
}

const PAGE_NAMES = { overview:'Overview', monitor:'Monitor', map:'Impact Map', aria:'ARIA AI' };

function navigateTo(pg) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(l=>l.classList.remove('active'));
  const sec=$(`page-${pg}`), nav=$(`nav-${pg}`);
  if(sec) sec.classList.add('active');
  if(nav) nav.classList.add('active');
  state.page = pg;
  if(pg==='map') setTimeout(()=>{ initMap(); updateMap(state.alerts); },150);
}

/* ── DRAWER ── */
function openDrawer() {
  $('logs-drawer')?.classList.add('open');
  $('drawer-overlay')?.classList.add('open');
}
function closeDrawer() {
  $('logs-drawer')?.classList.remove('open');
  $('drawer-overlay')?.classList.remove('open');
}

/* ── TICKER ── */
let _tt;
function updateTicker(text) {
  const el=$('aria-ticker'); if(!el) return;
  clearTimeout(_tt); let i=0; el.textContent='';
  (function t(){ if(i<text.length){ el.textContent+=text[i++]; _tt=setTimeout(t,14); } })();
}

/* ── GAUGE ── */
function setGauge(score) {
  const arc=$('gauge-arc'), lbl=$('gauge-label');
  if(!arc||!lbl) return;
  const pct=Math.min(Math.max(score,0),100)/100;
  const total=251.2;
  arc.style.strokeDashoffset = total*(1-pct);
  lbl.textContent = score;
  const color = score>=70?'#ef4444':score>=40?'#eab308':'#22d3ee';
  arc.style.stroke=color;
  const scoreEl=$('hero-score');
  if(scoreEl){ scoreEl.textContent=score; scoreEl.className=`hero-score${score>=70?' danger':score>=40?' warn':''}`; }
}

/* ── SPARKLINE ── */
function drawSparkline(canvasId, data, color='#22d3ee') {
  const c=$(canvasId); if(!c||!data?.length) return;
  c.width=c.offsetWidth||200; c.height=c.offsetHeight||44;
  const ctx=c.getContext('2d'), W=c.width, H=c.height;
  const max=Math.max(...data,1), min=0;
  ctx.clearRect(0,0,W,H);
  const pts=data.map((v,i)=>({ x:(i/(data.length-1||1))*W, y:H-((v-min)/(max-min||1))*(H-4)-2 }));
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,color+'44'); grad.addColorStop(1,color+'00');
  ctx.beginPath(); pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
  ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.stroke();
  ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
  ctx.fillStyle=grad; ctx.fill();
}

/* ── 3D SUN ── */
let _sr,_ss,_sc,_ps,_gm,_hex='#22d3ee',_spd=0.0008;
function init3DSun() {
  try {
    if(!window.THREE) return;
    const c=$('space-3d-canvas'); if(!c) return;
    const W=c.clientWidth||600,H=c.clientHeight||300;
    _sr=new THREE.WebGLRenderer({canvas:c,antialias:true,alpha:true});
    _sr.setSize(W,H); _sr.setPixelRatio(Math.min(devicePixelRatio,2));
    _ss=new THREE.Scene(); _sc=new THREE.PerspectiveCamera(45,W/H,0.1,100);
    _sc.position.z=5;
    const N=1400,geo=new THREE.BufferGeometry();
    const pos=new Float32Array(N*3),col=new Float32Array(N*3);
    const ang=new Float32Array(N),rad=new Float32Array(N),spd=new Float32Array(N);
    for(let i=0;i<N;i++){
      const r=0.6+Math.random()*2,a=Math.random()*Math.PI*2;
      rad[i]=r;ang[i]=a;spd[i]=(0.2+Math.random()*0.8)*0.18;
      pos[i*3]=Math.cos(a)*r;pos[i*3+1]=Math.sin(a)*r;pos[i*3+2]=(Math.random()-.5)*.5;
      col[i*3]=0.13;col[i*3+1]=0.83;col[i*3+2]=0.93;
    }
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color',new THREE.BufferAttribute(col,3));
    _ps=new THREE.Points(geo,new THREE.PointsMaterial({size:0.025,vertexColors:true,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending}));
    _ss.add(_ps);
    _gm=new THREE.MeshBasicMaterial({color:0x22d3ee,transparent:true,opacity:0.08,blending:THREE.AdditiveBlending});
    _ss.add(new THREE.Mesh(new THREE.SphereGeometry(0.28,32,32),new THREE.MeshBasicMaterial({color:0x0B0E17,transparent:true,opacity:0.96})));
    _ss.add(new THREE.Mesh(new THREE.SphereGeometry(0.33,32,32),_gm));
    const lc=new THREE.Color(_hex);
    (function anim(){
      requestAnimationFrame(anim);
      _ps.rotation.z+=_spd;
      lc.lerp(new THREE.Color(_hex),0.015);
      _gm.color.copy(lc);
      for(let i=0;i<N;i++){
        ang[i]+=spd[i]*_spd*10;
        pos[i*3]=Math.cos(ang[i])*rad[i];pos[i*3+1]=Math.sin(ang[i])*rad[i];
        col[i*3]=lc.r;col[i*3+1]=lc.g;col[i*3+2]=lc.b;
      }
      geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;
      _sr.render(_ss,_sc);
    })();
    window.addEventListener('resize',()=>{
      if(!c||!_sr||!_sc) return;
      _sr.setSize(c.clientWidth,c.clientHeight);
      _sc.aspect=c.clientWidth/c.clientHeight;_sc.updateProjectionMatrix();
    });
  } catch(e){ console.warn('[3D]',e.message); }
}
function setSunColor(lvl){ _hex=lvl==='HIGH'?'#ef4444':lvl==='ELEVATED'?'#eab308':'#22d3ee'; _spd=lvl==='HIGH'?.005:lvl==='ELEVATED'?.003:.0008; }

/* ── RADAR ── */
let _raf;
function initRadar(neos) {
  const c=$('radar-canvas'); if(!c) return;
  const ctx=c.getContext('2d');
  c.width=c.offsetWidth||340; c.height=c.offsetHeight||220;
  const objs=(neos||[]).map((n,i)=>({
    haz:n.isHazardous,
    dist:(Math.min(parseFloat(n.missDistance?.lunar||20),40)/40)*Math.min(c.width,c.height)*.42,
    angle:(i/Math.max(neos.length,1))*Math.PI*2, opacity:0
  }));
  if(_raf) cancelAnimationFrame(_raf);
  let sw=0;
  (function draw(){
    _raf=requestAnimationFrame(draw);
    const W=c.width,H=c.height,cx=W/2,cy=H/2,R=Math.min(W,H)*.42;
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='rgba(34,211,238,0.07)';ctx.lineWidth=1;
    [.25,.5,.75,1].forEach(r=>{ctx.beginPath();ctx.arc(cx,cy,R*r,0,Math.PI*2);ctx.stroke();});
    ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy+R);ctx.stroke();
    sw=(sw+0.012)%(Math.PI*2);
    const ex=cx+Math.cos(sw)*R,ey=cy+Math.sin(sw)*R;
    const g=ctx.createLinearGradient(cx,cy,ex,ey);
    g.addColorStop(0,'rgba(34,211,238,0.55)');g.addColorStop(1,'rgba(34,211,238,0)');
    ctx.strokeStyle=g;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.stroke();
    objs.forEach(o=>{
      const tx=cx+Math.cos(o.angle)*o.dist,ty=cy+Math.sin(o.angle)*o.dist;
      if(Math.abs((sw-o.angle+Math.PI*4)%(Math.PI*2))<0.09) o.opacity=1;
      if(o.opacity>.01){
        o.opacity-=.005;
        const col=o.haz?`rgba(249,115,22,${o.opacity})`:`rgba(34,211,238,${o.opacity})`;
        ctx.shadowColor=o.haz?'#f97316':'#22d3ee';ctx.shadowBlur=8*o.opacity;
        ctx.fillStyle=col;ctx.beginPath();ctx.arc(tx,ty,o.haz?4:2.5,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
      }
    });
  })();
}

/* ── TERMINAL LOG ── */
function termLog(msg,lvl='') {
  const body=$('terminal-log-body'); if(!body) return;
  const t=new Date().toLocaleTimeString('en',{hour12:false});
  const row=document.createElement('div');
  row.className=`term-row ${lvl.toLowerCase()}`;
  const dot=lvl&&lvl!=='dim'?'<span class="term-dot"></span>':'';
  row.innerHTML=`<span class="ts">[${t}]</span>${dot}${msg}`;
  body.appendChild(row);
  while(body.children.length>50) body.removeChild(body.firstChild);
  body.scrollTop=body.scrollHeight;
}

/* ── STATUS ── */
function setStatus(ok) {
  const d=$('sb-dot'),l=$('sb-status-lbl'),ld=$('live-dot');
  if(d) d.className=`sb-dot${ok?'':' offline'}`;
  if(l) l.textContent=ok?'LIVE':'OFFLINE';
  if(ld) ld.style.background=ok?'#22c55e':'#ef4444';
}

/* ── HUD UPDATE ── */
function updateHUD(ins) {
  if(!ins) return;
  const { solarScore=0, flareCount=0, stormCount=0, cmeCount=0, hazardousCount=0, solarRisk, asteroidRisk, solarTrend, aiInsight, maxFlareClass } = ins;

  const lvl = solarScore>=70||hazardousCount>=4?'HIGH':solarScore>=40||hazardousCount>=1?'ELEVATED':'STABLE';
  setSunColor(lvl);

  // Hero score + gauge
  setGauge(solarScore);

  // Hero text
  const eyebrow=$('hero-eyebrow'); if(eyebrow) eyebrow.textContent='PLANETARY THREAT INDEX';
  const desc=$('hero-desc');
  const neos=state.asteroids?.data||[];
  const minLD=neos.length?Math.min(...neos.map(n=>parseFloat(n.missDistance?.lunar||999))).toFixed(1):'—';
  if(desc) desc.textContent=`${flareCount} solar flares · ${hazardousCount} hazardous NEOs · Closest approach: ${minLD} LD`;

  // Tags
  const tags=$('hero-tags');
  if(tags) {
    const tagData=[
      { text:lvl==='HIGH'?'⚠ HIGH RISK':lvl==='ELEVATED'?'ELEVATED':'STABLE', cls:lvl==='HIGH'?'danger':lvl==='ELEVATED'?'warn':'safe' },
      { text:`${flareCount} FLARES`, cls:'info' },
      { text:`${neos.length} NEOs TRACKED`, cls:'info' },
      hazardousCount>0?{ text:`${hazardousCount} HAZARDOUS`, cls:'danger' }:null,
    ].filter(Boolean);
    tags.innerHTML=tagData.map(t=>`<span class="hero-tag ${t.cls}">${t.text}</span>`).join('');
  }

  // Metric cards
  const sRisk=solarRisk?.level||'LOW';
  const aRisk=asteroidRisk?.level||'LOW';

  // Solar card
  setBadge('solar-badge', sRisk);
  setEl('solar-count', flareCount);
  setEl('solar-class', `Max class: ${maxFlareClass||'—'}`);
  setEl('solar-trend', solarTrend||'STABLE');
  setEl('m-flare-count', flareCount);
  setEl('m-max-class', maxFlareClass||'—');
  setEl('m-trend', solarTrend||'STABLE');
  // Sparkline from raw data
  const flares=state.dashboard?.solarFlares||[];
  if(flares.length) {
    const byDay={};
    flares.forEach(f=>{ const d=(f.beginTime||'').slice(0,10); byDay[d]=(byDay[d]||0)+1; });
    drawSparkline('spark-solar', Object.values(byDay).slice(-14), '#fb923c');
  }

  // NEO card
  setBadge('neo-badge', aRisk);
  setEl('neo-count', neos.length);
  setEl('neo-closest', `Closest: ${minLD} LD`);
  const hazPct=neos.length?Math.round((hazardousCount/neos.length)*100):0;
  const pbar=$('neo-progress'); if(pbar) pbar.style.width=`${hazPct}%`;
  setEl('neo-haz-label', `${hazardousCount} hazardous (${hazPct}%)`);
  setEl('neo-dist', aRisk==='HIGH'?'⚠ DANGEROUS':aRisk==='MEDIUM'?'CAUTION':'SAFE');

  // Storm card
  const stormRisk=stormCount>2?'HIGH':stormCount>0?'ELEVATED':'STABLE';
  setBadge('storm-badge', stormRisk);
  const sw=$('storm-word');
  if(sw){ sw.textContent=stormRisk; sw.style.color=stormRisk==='HIGH'?'#ef4444':stormRisk==='ELEVATED'?'#eab308':'#22c55e'; }
  setEl('storm-count', `${stormCount} events (7d)`);
  setEl('storm-cme', `CMEs: ${cmeCount}`);

  // Ticker
  updateTicker(aiInsight?.summary||`SOLAR SCORE ${solarScore}/100 · ${hazardousCount} HAZARDOUS NEOs · SYSTEM ${lvl}`);
}

function setEl(id,val){ const e=$(id); if(e) e.textContent=val; }
function setBadge(id,lvl){
  const e=$(id); if(!e) return;
  e.textContent=lvl; e.className=`mc-badge ${lvl}`;
}

/* ── RENDER EVENTS ── */
function renderEventsLog(data) {
  const { solarFlares=[], geoStorms=[], cmes=[] } = data||{};
  termLog('[NASA] Telemetry link established','dim');
  solarFlares.slice(-6).forEach(f=>{
    const cls=f.classType||'C';
    termLog(`FLARE ${cls} · ${(f.beginTime||'').slice(0,10)} · peak ${(f.peakTime||'').slice(11,16)||'—'}`,cls[0]==='X'?'high':cls[0]==='M'?'medium':'low');
  });
  geoStorms.slice(-3).forEach(s=>{
    const kp=parseFloat(s.allKpIndex?.[0]?.kpIndex||0);
    termLog(`GEO STORM Kp=${kp.toFixed(1)} · ${(s.startTime||'').slice(0,10)}`,kp>=7?'high':'medium');
  });
  cmes.slice(-3).forEach(c=>termLog(`CME EJECTION · ${(c.startTime||'').slice(0,10)}`,'medium'));
}

/* ── RENDER ASTEROIDS ── */
function renderAsteroids(astRes) {
  const neos=astRes?.data||[];
  setEl('radar-total-count',`${neos.length} tracked`);
  initRadar(neos);
  neos.filter(n=>n.isHazardous).slice(0,5).forEach(n=>
    termLog(`⚠ NEO ${n.name} · ${parseFloat(n.missDistance?.lunar||0).toFixed(2)} LD`,'high')
  );
}

/* ── RENDER AI REPORT ── */
function renderAIReport(ins) {
  const content=$('ai-report-content'); if(!content) return;
  const ai=ins?.aiInsight||{};
  const threat=ai.threatLevel||ins?.solarRisk?.level||'NORMAL';
  const color={'HIGH':'#ef4444','MEDIUM':'#eab308','ELEVATED':'#eab308','LOW':'#22c55e','NORMAL':'#22d3ee'}[threat]||'#94a3b8';
  const rl=$('report-lvl');
  if(rl){ rl.textContent=threat; rl.style.cssText=`background:${color}18;border-color:${color}44;color:${color}`; }
  const blocks=[['SUMMARY',ai.summary],['SOLAR FLUX',ai.solarInsight],['ORBITAL VECTORS',ai.asteroidInsight],['EARTH IMPACT',ai.earthImpact]].filter(([,v])=>v);
  content.innerHTML=`
    <div class="ai-threat-banner" style="border-color:${color}22">
      <span class="atb-lbl">Overall Threat Level</span>
      <span class="atb-val" style="color:${color}">${threat}</span>
    </div>
    <div class="ai-blocks">${blocks.map(([t,v])=>`<div class="ai-blk"><div class="ai-blk-tag">${t}</div><div class="ai-blk-text">${v}</div></div>`).join('')}</div>`;
}

/* ── CHAT ── */
function initChat() {
  const input=$('chat-input'),btn=$('chat-send');
  if(btn) btn.addEventListener('click',sendChat);
  if(input) input.addEventListener('keydown',e=>{ if(e.key==='Enter') sendChat(); });
}
async function sendChat() {
  const input=$('chat-input'); const msg=input?.value?.trim(); if(!msg) return;
  input.value=''; appendMsg(msg,'user');
  const typing=appendMsg('Analyzing...','bot typing');
  try{ const res=await API.chat(msg); typing.remove(); appendMsg(res?.reply||'Signal lost.','bot'); }
  catch(_){ typing.remove(); appendMsg('Connection error.','bot'); }
}
function appendMsg(text,cls) {
  const box=$('chat-messages'); if(!box) return document.createElement('div');
  const isBot=cls.includes('bot');
  const div=document.createElement('div'); div.className=`msg ${cls}`;
  const icon=isBot?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  div.innerHTML=`<div class="msg-av ${isBot?'bot-av':'user-av'}">${icon}</div><div class="msg-body"><div class="msg-name">${isBot?'ARIA':'YOU'}</div><div class="msg-txt">${text}</div></div>`;
  box.appendChild(div); box.scrollTop=box.scrollHeight; return div;
}
window.askARIA = q => { const i=$('chat-input'); if(i){ i.value=q; sendChat(); } };

/* ── LOADER ── */
function hideLoader() {
  const l=$('loader'); if(!l) return;
  l.style.opacity='0'; l.style.transition='opacity .4s';
  setTimeout(()=>l.style.display='none',450);
}

/* ── MAIN LOAD ── */
async function loadAllData() {
  const safety=setTimeout(hideLoader,12000);
  try {
    setStatus(true);
    const [dash,astRes,alertRes,insRes]=await Promise.allSettled([
      API.dashboard(),API.asteroids(),API.alerts(),API.insights()
    ]);
    if(dash.value?.data){ state.dashboard=dash.value.data; renderEventsLog(dash.value.data); if(typeof renderSolarChart==='function') renderSolarChart(dash.value.data.solarFlares); }
    if(astRes.value?.data){ state.asteroids=astRes.value; renderAsteroids(astRes.value); }
    if(alertRes.value?.alerts){ state.alerts=alertRes.value.alerts; if(state.page==='map') updateMap(state.alerts); }
    if(insRes.value?.data){ state.insights=insRes.value.data; updateHUD(insRes.value.data); renderAIReport(insRes.value.data); }
  } catch(err){ console.error('[SID]',err); setStatus(false); termLog(`ERROR: ${err.message}`,'high'); }
  finally{ clearTimeout(safety); hideLoader(); }
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded',()=>{
  startClock(); initNav(); initChat(); init3DSun(); loadAllData();
  setInterval(loadAllData,5*60*1000);
});
