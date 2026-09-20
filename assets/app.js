document.querySelectorAll('button.copy').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);const t=b.textContent;b.textContent='Copied';setTimeout(()=>b.textContent=t,1400);}catch(e){}}));
  (async()=>{
    const dot=document.getElementById('dot'),s=document.getElementById('status');
    const q=async u=>{try{const r=await fetch(u,{cache:'no-store'});return await r.json();}catch(e){return null;}};
    const j=await q('https://api.mcstatus.io/v2/status/java/play.cubelune.com');
    const b=await q('https://api.mcstatus.io/v2/status/bedrock/play.cubelune.com:32374');
    const on=(j&&j.online)||(b&&b.online);
    if(on){const n=(j&&j.players&&j.players.online)||0;dot.className='dot on';s.textContent=`Online · ${n} player${n===1?'':'s'} on right now`;}
    else{dot.className='dot off';s.textContent='Server unreachable right now';}
  })();
