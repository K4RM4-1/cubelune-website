document.querySelectorAll('button.copy').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);const t=b.textContent;b.textContent='copied';setTimeout(()=>b.textContent=t,1400);}catch(e){}}));
(async()=>{
  const dot=document.getElementById('dot'),s=document.getElementById('status');
  const q=async u=>{try{const r=await fetch(u,{cache:'no-store'});return await r.json();}catch(e){return null;}};
  const j=await q('https://api.mcstatus.io/v2/status/java/play.cubelune.com');
  const b=await q('https://api.mcstatus.io/v2/status/bedrock/play.cubelune.com:32374');
  const on=(j&&j.online)||(b&&b.online);
  if(on){const n=(j&&j.players&&j.players.online)||0;dot.className='dot on';s.textContent=`Online · ${n} player${n===1?'':'s'} on right now`;}
  else{dot.className='dot off';s.textContent='Server unreachable right now';}
})();

// ---- Player stats lookup (read-only /api on the game server, proxied by this site) ----
(()=>{
  const $=id=>document.getElementById(id);
  const KEY='cubelune_last_name';
  const lookup=$('lookup'),me=$('me'),form=$('lookupForm'),err=$('lookupErr');
  if(!form) return;
  const fmt=n=>Math.round(n).toLocaleString('en-US');
  const esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const ago=ms=>{if(!ms)return 'never';const d=(Date.now()-ms)/1000;if(d<90)return 'just now';if(d<5400)return Math.round(d/60)+' min ago';if(d<172800)return Math.round(d/3600)+' h ago';return Math.round(d/86400)+' days ago';};
  const showErr=m=>{err.textContent=m;err.hidden=false;};
  const remember=v=>{try{v?localStorage.setItem(KEY,v):localStorage.removeItem(KEY);}catch(e){}};
  const last=()=>{try{return localStorage.getItem(KEY);}catch(e){return null;}};

  function render(d){
    $('meName').textContent=d.name;
    $('meSub').textContent=(d.online?'online now':'last seen '+ago(d.lastSeen))+(d.islandOwner&&d.islandOwner!==d.name?" · on "+d.islandOwner+"'s island":'');
    const cards=[
      ['Rank',d.rank+(d.prestige?' · P'+d.prestige:'')],
      ['Money',fmt(d.balance)],
      ['Networth',fmt(d.networth)],
      ['Island level',fmt(d.islandLevel)],
      ['Moonstones',fmt(d.moonstones)],
      ['Fuel',d.fuel+(d.fuel!=='empty'?' / '+d.fuelMaxDays+'d':'')],
      ['Phase',d.phase||'-'],
      ['Sell boost','+'+d.sellBoost+'%'],
      ['Team',d.hasIsland?d.teamSize+(d.teamSize===1?' player':' players'):'no island'],
      ['Miner',d.minerUnlocked?'unlocked':'locked'],
      ['Hours played',d.playHours!=null?d.playHours:'-'],
    ];
    $('meStats').innerHTML=cards.map(([k,v])=>`<div class="stat"><b>${esc(v)}</b><span>${k}</span></div>`).join('');
    const pct=Math.min(100,Math.round(100*d.lifetimeBlocks/Math.max(1,d.passLength)));
    $('mePass').innerHTML=`<p class="msg" style="margin-top:12px">Pass: ${d.passDone?'done, /prestige is ready':fmt(d.lifetimeBlocks)+' / '+fmt(d.passLength)+' blocks'}${d.nextRank?' · next rank '+esc(d.nextRank)+' at prestige '+d.nextRankAt:''}</p><div class="bar"><i style="width:${pct}%"></i></div>`;
    lookup.hidden=true;me.hidden=false;
  }
  async function show(name){
    err.hidden=true;
    try{
      const r=await fetch('/api/player?name='+encodeURIComponent(name),{cache:'no-store'});
      const d=await r.json().catch(()=>({}));
      if(!r.ok){showErr(d.error||'Something went wrong.');return false;}
      render(d); remember(d.name); return true;
    }catch(e){showErr('Could not reach the server right now. Try again in a minute.');return false;}
  }
  form.addEventListener('submit',ev=>{ev.preventDefault();const n=$('lookupName').value.trim();if(n)show(n);});
  $('lookupAgain').addEventListener('click',()=>{remember(null);me.hidden=true;lookup.hidden=false;$('lookupName').value='';$('lookupName').focus();});
  (async()=>{
    try{
      const r=await fetch('/api/top',{cache:'no-store'}); if(!r.ok) return;
      const t=await r.json(); if(!t.length) return;
      $('topTable').querySelector('tbody').innerHTML=t.map((p,i)=>`<tr><td>${i+1}</td><td>${esc(p.name)}</td><td>${fmt(p.networth)}</td><td>${fmt(p.islandLevel)}</td><td>${esc(p.rank)}</td></tr>`).join('');
      $('top').hidden=false;
    }catch(e){}
  })();
  const l=last(); if(l){$('lookupName').value=l;show(l);}
})();
