let demoArmorThickness=100;
function ammunitionEffect(shell){
 const t=shell.type.toUpperCase(),g=shell.properties.Guidance||'';
 if(t==='SAM'||t==='AAM')return {kind:'sam',label:'防空导弹',guided:true,guidance:g};
 if(t.includes('ATGM'))return {kind:t.includes('-HE')?'missile-he':'missile',label:'反坦克导弹',guided:true,guidance:g};
 if(t.includes('APFSDS'))return {kind:'dart',label:'尾翼稳定脱壳穿甲弹'};
 if(t.includes('APDS')||t.includes('APCR')||t.includes('HVAP'))return {kind:'core',label:'次口径穿甲弹'};
 if(t.includes('HEAT')||t.includes('HEDP'))return {kind:'heat',label:'破甲弹'};
 if(t.includes('HESH'))return {kind:'hesh',label:'碎甲弹'};
 if(t.includes('SHRAPNEL'))return {kind:'shrapnel',label:'榴霰弹'};
 if(t.includes('SMOKE'))return {kind:'smoke',label:'烟雾弹'};
 if(t.startsWith('HE')||t.startsWith('FI')||t.includes('AHEAD'))return {kind:'he',label:'高爆/破片弹'};
 const filling=Object.entries(shell.properties||{}).some(([key,val])=>['Explosive Mass','TNT Equivalent'].includes(key)&&parseFloat(String(val).replace(/,/g,''))>0);
 const bursting=t.includes('APHE')||t.includes('SAPCBC')||t.includes('APCBC')&&filling;
 return {kind:bursting?'aphe':'ap',label:bursting?(t.includes('SAPCBC')?'半穿甲榴弹':'穿甲榴弹'):'穿甲弹'};
}
function renderHitDemo(root,shell,penetration,shotDistance,shotAngle,selection){
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
 const sv=(tag,attrs,parent)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,val]of Object.entries(attrs))n.setAttribute(key,String(val));if(parent)parent.append(n);return n;};
 const fx=ammunitionEffect(shell),sam=fx.kind==='sam',missile=fx.guided,wire=missile&&/TOW/i.test(shell.name);
 const panel=el('section',null,'hit-demo');panel.setAttribute('aria-label','弹药命中演示');panel.dataset.effect=fx.kind;
 const heading=el('div',null,'demo-heading');heading.append(el('h3','命中演示'),el('span',`${fx.label} · ${shotDistance} m · ${shotAngle}°`));panel.append(heading);
 const choice=el('label','这辆载具的弹药');choice.className='demo-ammo-label';const select=el('select');select.id='demo-ammo';
 selection.shells.forEach((s,i)=>{const o=el('option',`${s.name} · ${s.type} · ${s.weapon}`);o.value=i;o.selected=i===selection.index;select.append(o);});select.addEventListener('change',()=>{selection.onSelect(Number(select.value));document.getElementById('demo-ammo')?.focus();});choice.append(select);panel.append(choice);
 const controls=el('div',null,'demo-controls');const label=el('label',sam?'参考钢板厚度（mm）':'钢板厚度（mm）');const input=el('input');Object.assign(input,{type:'number',min:'1',max:'2000',step:'1',value:demoArmorThickness,id:'armor-thickness'});label.append(input);
 const fire=el('button','发射','demo-fire');fire.type='button';const stat=el('div',null,'demo-stat');stat.append(el('span',fx.kind==='hesh'?'可影响钢板厚度参考':'当前穿深参考'),el('strong',penetration==null?'该角度无数据':`${penetration} mm`));controls.append(label,fire,stat);panel.append(controls);
 const scene=sv('svg',{viewBox:'0 0 800 300',role:'img','aria-label':`${fx.label}外形、飞行与命中机理示意`,class:'demo-scene'});
 sv('rect',{width:800,height:300,fill:'#f1f5f9'},scene);
 const text=(x,y,str,size=16,color='#536379')=>{const n=sv('text',{x,y,fill:color,'font-size':size},scene);n.textContent=str;return n;};
 text(25,30,sam?'航空目标 / 近炸破片示意':'均质钢板 / 弹药剖面示意');text(25,280,wire?'导线传输指令 / SACLOS':fx.guidance||fx.label,14);
 const plate=sv('g',{transform:`rotate(${shotAngle} 510 155)`,opacity:sam?0:1},scene);const armor=sv('rect',{x:494,y:65,width:32,height:180,rx:2,fill:'#7c90a6',stroke:'#344a63','stroke-width':2},plate);
 const plateLabel=text(475,273,'',14);
 const plane=sv('g',{transform:'translate(650 100)',opacity:sam?1:0},scene);sv('path',{d:'M-65 0L-20-7L0-40L12-40L5-7L55-3L70 0L55 5L5 7L12 40L0 40L-20 7L-65 0Z',fill:'#71879e',stroke:'#344a63','stroke-width':2},plane);
 const line=sv('line',{x1:60,y1:155,x2:sam?650:510,y2:sam?100:155,stroke:missile?'#ab7c28':'#a5b7c8','stroke-dasharray':'7 6',opacity:.75},scene);
 const guideLabel=text(70,70,missile?(/SACLOS|MCLOS|command/i.test(fx.guidance)?'指令瞄准线':'制导参考线'):'',14,'#81520a');
 const trail=sv('path',{d:'',fill:'none',stroke:missile?'#8b9bae':'#427d89','stroke-width':wire?1:missile?5:2,opacity:.35},scene);
 const bullet=sv('g',{transform:'translate(65 155)'},scene);
 const part=(tag,attrs)=>sv(tag,attrs,bullet);
 if(fx.kind==='dart'){
  part('path',{d:'M-57-3H33L49 0L33 3H-57Z',fill:'#8c9eac',stroke:'#344a63'});part('path',{d:'M-45-3L-58-13H-64L-58 0L-64 13H-58L-45 3Z',fill:'#536379'});
 }else if(missile){
  part('path',{d:'M-44-7H20L40 0L20 7H-44Z',fill:'#b8c7d2',stroke:'#344a63','stroke-width':1.5});part('path',{d:'M-30-7L-42-21H-50L-44 0L-50 21H-42L-30 7M5-7L-4-17H-12L-6 0L-12 17H-4L5 7',fill:'#496478'});part('path',{d:'M-44-5L-70 0L-44 5Z',fill:'#ed9e31'});
  part('path',{d:'M10-5L23 0L10 5',fill:'none',stroke:'#c47223','stroke-width':2});
 }else if(fx.kind==='heat'){
  part('path',{d:'M-31-11H5L29-4L38 0L29 4L5 11H-31Z',fill:'#b99c58',stroke:'#665326','stroke-width':1.5});part('path',{d:'M5-9L-9 0L5 9',fill:'#efe2bd',stroke:'#c16e35','stroke-width':3});part('line',{x1:9,y1:0,x2:30,y2:0,stroke:'#9b642c','stroke-width':2});
 }else if(fx.kind==='hesh'){
  part('path',{d:'M-28-13H5Q28-13 30 0Q28 13 5 13H-28Z',fill:'#c19059',stroke:'#744b2a','stroke-width':1.5});part('path',{d:'M-18-8H5Q21-8 22 0Q21 8 5 8H-18Z',fill:'#edd3a0'});
 }else if(fx.kind==='core'){
  part('path',{d:'M-24-5H14L30 0L14 5H-24Z',fill:'#697d8c',stroke:'#344a63'});
 }else{
  part('path',{d:'M-28-9H4Q17-8 30 0Q17 8 4 9H-28Z',fill:fx.kind==='he'||fx.kind==='shrapnel'?'#9c7649':'#4c7a78',stroke:'#344a63','stroke-width':1.5});
  if(fx.kind==='shrapnel')for(let i=0;i<6;i++)part('circle',{cx:-15+i*6,cy:i%2?4:-3,r:2,fill:'#e8d8a9'});
  if(fx.kind==='aphe')part('rect',{x:-13,y:-5,width:16,height:10,fill:'#e2ae59'});
 }
 const sabot=sv('g',{opacity:0},scene);const petals=[-1,1].map(sign=>sv('path',{d:'M-15-4H16L23 0L16 4H-15Z',fill:'#a19e88',stroke:'#737060'},sabot));
 const flash=sv('circle',{cx:0,cy:0,r:1,fill:'#f2b249',opacity:0},scene);
 const jet=sv('path',{d:'',fill:'none',stroke:'#d58427','stroke-width':5,opacity:0},scene);
 const splash=sv('ellipse',{cx:490,cy:155,rx:5,ry:1,fill:'#d9aa66',opacity:0},scene);
 const particles=Array.from({length:15},(_,i)=>sv('circle',{cx:0,cy:0,r:i%3===0?3:2,fill:fx.kind==='hesh'?'#526d84':'#b78339',opacity:0},scene));
 const smoke=Array.from({length:7},()=>sv('circle',{cx:0,cy:0,r:0,fill:'#a7b2bc',opacity:0},scene));
 panel.append(scene);const result=el('p','选择弹药，设置钢板厚度后发射。','demo-result');result.setAttribute('role','status');panel.append(result);
 const descriptions={heat:'锥形装药弹体停在装甲外，随后显示金属射流。',dart:'细长穿甲杆带尾翼；先显示弹托分离，再由杆体撞击装甲。',hesh:'装药在钢板表面摊开并爆炸；背面剥落不等于弹体穿孔。',shrapnel:'弹体在钢板前打开，弹丸向前散射。图中起爆点是演示位置，不是引信设置值。',sam:'导弹接近航空目标后显示爆炸和破片，不以坦克穿深数值判定飞机损伤。',missile:'导弹沿制导参考线飞行，命中后显示破甲射流。瞄准线不代表所有导弹都由导线制导。','missile-he':'导弹命中后显示爆炸与破片。',he:'弹体在命中点爆炸，破片向周围扩散。',aphe:'弹体先穿过钢板，再在板后爆炸并向四周散射破片；未击穿时不显示板后爆炸。APCBC 的板后爆炸仅用于 Wiki 标有炸药装填的弹药。',core:'次口径弹芯撞击钢板，效果为弹芯示意。',ap:'全口径弹体撞击钢板，穿深足够时继续向板后运动。',smoke:'展示烟雾形成，不判定穿甲。'};
 panel.append(el('p',descriptions[fx.kind]+(wire?' 本条 TOW 以细线表示指令传输导线。':'')+(shell.name.includes('TOW-2B')?' 此图仅示意导弹与射流，不复现越顶攻击轨迹。':'')+(shell.belt?' 弹带外形按其中的代表弹种示意，不逐发模拟组合。':'')+' 外形和作用过程为二维示意，不按比例，也不计算真实弹道、跳弹、ERA、复合装甲或车内伤害。','notes'));
 let running=false,revision=0;
 function resetVisual(){bullet.setAttribute('transform','translate(65 155)');bullet.setAttribute('opacity',1);trail.setAttribute('d','');[flash,jet,splash,sabot,...particles,...smoke].forEach(n=>n.setAttribute('opacity',0));}
 function updateArmor(){const thickness=Number(input.value),valid=Number.isFinite(thickness)&&thickness>=1&&thickness<=2000;if(valid)demoArmorThickness=thickness;const w=Math.min(64,Math.max(14,Math.sqrt(valid?thickness:100)*2));armor.setAttribute('x',510-w/2);armor.setAttribute('width',w);plateLabel.textContent=sam?'航空目标':valid?`${thickness} mm / ${shotAngle}°`:'厚度范围 1–2000 mm';fire.disabled=!valid||running;return valid;}
 input.addEventListener('input',()=>{revision++;running=false;fire.textContent='发射';updateArmor();resetVisual();result.textContent='选择弹药，设置钢板厚度后发射。';result.className='demo-result';});
 fire.addEventListener('click',()=>{
  if(!updateArmor()||running)return;const thickness=Number(input.value);
  const special=['sam','shrapnel','smoke'].includes(fx.kind);const judged=penetration!=null&&!special;const passes=judged&&penetration>=thickness;
  const hitX=sam?600:fx.kind==='shrapnel'?375:510-Number(armor.getAttribute('width'))/(2*Math.cos(Number(shotAngle)*Math.PI/180));const hitY=sam?105:155;
  const current=++revision;running=true;fire.disabled=true;fire.textContent='演示中…';resetVisual();result.textContent='弹药飞行中…';result.className='demo-result';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,duration=reduce?0:2600;let start;
  function finish(){running=false;fire.textContent='再次发射';updateArmor();result.className='demo-result '+(judged?(passes?'pass':'stop'):'');result.textContent=sam?'已显示近炸破片示意；未判定航空目标损伤。':fx.kind==='shrapnel'?'已显示弹丸散射示意；当前穿深是弹体参考，不是每颗散射弹丸的穿深。':fx.kind==='smoke'?'已显示烟雾形成示意。':!judged?'已显示弹种作用机理；该角度缺少对应数据，不判定击穿。':fx.kind==='hesh'?`可影响厚度参考 ${penetration} mm / 钢板 ${thickness} mm。${passes?'显示背面剥落，不显示弹体穿孔。':'不显示背面剥落。'}`:`穿深 ${penetration} mm / 钢板 ${thickness} mm：${passes?'数值足够，显示板后作用。':'数值不足，作用停在装甲前。'}`;}
  function frame(time){if(current!==revision||!panel.isConnected)return;start??=time;const p=duration?Math.min(1,(time-start)/duration):1,flight=Math.min(1,p/.52),effect=Math.max(0,(p-.52)/.48);
   let x=65+(hitX-65)*flight,y=155+(hitY-155)*flight;
   if(missile)y+=Math.sin(flight*Math.PI*3)*12*(1-flight);
   if(effect>0&&passes&&['dart','core','ap','aphe'].includes(fx.kind)){x=hitX+(fx.kind==='aphe'?115:210)*Math.min(1,effect*1.8);}
   bullet.setAttribute('transform',`translate(${x} ${y})`);trail.setAttribute('d',`M65 155L${x} ${y}`);
   if(fx.kind==='dart'&&p>.12){sabot.setAttribute('opacity',Math.max(0,1-p/.48));petals.forEach((petal,i)=>petal.setAttribute('transform',`translate(${190+(p-.12)*120} ${155+(i?-1:1)*(p-.12)*130}) rotate(${(i?-1:1)*p*90})`));}
   if(effect>0){
    const explosive=['heat','missile','missile-he','hesh','he','shrapnel','sam','aphe'].includes(fx.kind);
    if(!['dart','core','ap','aphe'].includes(fx.kind)||!passes)bullet.setAttribute('opacity',0);
    const originX=fx.kind==='aphe'&&passes?hitX+115:hitX;
    const burst=fx.kind==='aphe'?Math.max(0,(effect-.55)/.45):effect;
    if(fx.kind==='aphe'&&passes&&effect>=.55)bullet.setAttribute('opacity',0);
    if(explosive&&(fx.kind!=='aphe'||passes&&burst>0)){flash.setAttribute('cx',originX);flash.setAttribute('cy',hitY);flash.setAttribute('r',8+burst*42);flash.setAttribute('opacity',Math.max(0,.9-burst*.8));}
    if(['heat','missile'].includes(fx.kind)){const length=(passes?235:Math.max(10,Number(armor.getAttribute('width'))*.4))*Math.min(1,effect*1.6);jet.setAttribute('d',`M${hitX} ${hitY}L${hitX+length} ${hitY}`);jet.setAttribute('opacity',Math.max(.2,1-effect*.7));}
    if(fx.kind==='hesh'){splash.setAttribute('cx',hitX);splash.setAttribute('ry',Math.min(30,8+effect*35));splash.setAttribute('opacity',1);}
    const showParticles=['he','missile-he','sam','shrapnel'].includes(fx.kind)||fx.kind==='hesh'&&(passes||!judged)||passes&&(['heat','missile','dart','core','ap'].includes(fx.kind)||fx.kind==='aphe'&&burst>0);
    if(showParticles)particles.forEach((particle,i)=>{const radial=['he','missile-he','sam','aphe'].includes(fx.kind),spread=radial?Math.PI*2*i/15:(i-7)*.12;const origin=fx.kind==='hesh'?530:originX;const travel=burst*(70+(i%5)*25);particle.setAttribute('cx',origin+Math.cos(spread)*travel);particle.setAttribute('cy',hitY+Math.sin(spread)*travel);particle.setAttribute('opacity',Math.max(.2,1-effect*.65));});
    if(fx.kind==='smoke')smoke.forEach((n,i)=>{n.setAttribute('cx',hitX+(i-3)*14);n.setAttribute('cy',hitY-effect*(20+i*12));n.setAttribute('r',12+effect*(20+i*3));n.setAttribute('opacity',.25);});
   }
   if(p<1)requestAnimationFrame(frame);else finish();
  }
  requestAnimationFrame(frame);
 });
 updateArmor();root.append(panel);
}
