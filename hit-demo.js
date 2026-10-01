let demoArmorThickness=100,demoTarget='armor',demoVtMode='impact',demoSamTarget='air';
function ammunitionEffect(shell){
 const t=shell.type.toUpperCase(),g=shell.properties.Guidance||'';
 const filling=Object.entries(shell.properties||{}).some(([key,val])=>['Explosive Mass','TNT Equivalent'].includes(key)&&parseFloat(String(val).replace(/,/g,''))>0);
 const semi=t.split('/').find(x=>x.startsWith('SAP'));
 if(semi){const bursting=/SAPHEI|SAPCBC/.test(semi)||filling;return {kind:bursting?'aphe':'ap',label:bursting?'半穿甲高爆弹':semi.includes('-I')?'半穿甲燃烧弹':'半穿甲弹',incendiary:!bursting&&semi.includes('-I')};}
 if(t.includes('AHEAD'))return {kind:'ahead',label:'AHEAD 可编程空爆弹'};
 if(t.includes('VT'))return {kind:'vt',label:'VT 近炸弹药',guided:t.includes('ATGM'),guidance:g};
 if(t==='SAM'||t==='AAM')return {kind:'sam',label:'防空导弹',guided:true,guidance:g,shaped:(shell.penetrationKinds||[]).includes('Cumulative jet')&&!!shell.constantAngles};
 if(t.includes('ATGM')&&/TOW[ -]?2B|BILL|RBS?\s*56/i.test(shell.name))return {kind:'topattack',label:'越顶攻顶导弹',guided:true,guidance:g,efp:/TOW[ -]?2B/i.test(shell.name)};
 if(t.includes('ATGM'))return {kind:t.includes('-HE')?'missile-he':'missile',label:'反坦克导弹',guided:true,guidance:g};
 if(t.includes('APFSDS'))return {kind:'dart',label:'尾翼稳定脱壳穿甲弹'};
 if(t.includes('APDS')||t.includes('APCR')||t.includes('HVAP'))return {kind:'core',label:'次口径穿甲弹'};
 if(t.includes('HEAT')||t.includes('HEDP'))return {kind:'heat',label:'破甲弹'};
 if(t.includes('HESH'))return {kind:'hesh',label:'碎甲弹'};
 if(t.includes('SHRAPNEL'))return {kind:'shrapnel',label:'榴霰弹'};
 if(t.includes('SMOKE'))return {kind:'smoke',label:'烟雾弹'};
 if(t.startsWith('HE')||t.startsWith('FI')||t.includes('AHEAD'))return {kind:'he',label:'高爆/破片弹'};
 const bursting=t.includes('APHE')||t.includes('SAPCBC')||t.includes('APCBC')&&filling;
 return {kind:bursting?'aphe':'ap',label:bursting?(t.includes('SAPCBC')?'半穿甲榴弹':'穿甲榴弹'):'穿甲弹'};
}
function renderHitDemo(root,shell,penetration,shotDistance,shotAngle,selection){
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
 const sv=(tag,attrs,parent)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,val]of Object.entries(attrs))n.setAttribute(key,String(val));if(parent)parent.append(n);return n;};
 const fx=ammunitionEffect(shell);if(fx.shaped){fx.kind=demoSamTarget==='armor'?'missile':'sam';fx.label=demoSamTarget==='armor'?'防空导弹 · 破甲战斗部':'防空导弹 · 航空目标';}
 const sam=fx.kind==='sam',missile=fx.guided,wire=missile&&/TOW|BILL|RBS?\s*56/i.test(shell.name),top=fx.kind==='topattack';
 const dual=['ahead','vt'].includes(fx.kind),air=sam||dual&&demoTarget==='air',airburst=fx.kind==='ahead'||fx.kind==='vt'&&(air||demoVtMode==='proximity');
 const panel=el('section',null,'hit-demo');panel.setAttribute('aria-label','弹药命中演示');panel.dataset.effect=fx.kind;
 const heading=el('div',null,'demo-heading');heading.append(el('h3','命中演示'),el('span',`${fx.label} · ${shotDistance} m · ${shotAngle}°`));panel.append(heading);
 const choice=el('label','这辆载具的弹药');choice.className='demo-ammo-label';const select=el('select');select.id='demo-ammo';
 selection.shells.forEach((s,i)=>{const o=el('option',`${s.name} · ${s.type} · ${s.weapon}`);o.value=i;o.selected=i===selection.index;select.append(o);});select.addEventListener('change',()=>{selection.onSelect(Number(select.value));document.getElementById('demo-ammo')?.focus();});choice.append(select);panel.append(choice);
 if(dual||fx.shaped){const targetLabel=el('label','目标类型', 'demo-ammo-label'),target=el('select');target.id='demo-target';for(const [v,t]of [['armor','装甲目标'],['air','航空目标']]){const o=el('option',t);o.value=v;o.selected=(fx.shaped?demoSamTarget:demoTarget)===v;target.append(o);}target.addEventListener('change',()=>{if(fx.shaped)demoSamTarget=target.value;else demoTarget=target.value;selection.onSelect(selection.index);document.getElementById('demo-target')?.focus();});targetLabel.append(target);panel.append(targetLabel);if(fx.kind==='vt'&&!air){const l=el('label','起爆方式','demo-ammo-label'),mode=el('select');mode.id='demo-vt-mode';for(const [v,t]of [['impact','接触装甲起爆（触发模式示意）'],['proximity','装甲前近炸（机理示意）']]){const o=el('option',t);o.value=v;o.selected=demoVtMode===v;mode.append(o);}mode.addEventListener('change',()=>{demoVtMode=mode.value;selection.onSelect(selection.index);});l.append(mode);panel.append(l);}}
 const controls=el('div',null,'demo-controls');const label=el('label',top?'顶部装甲厚度（mm）':air?'参考钢板厚度（mm）':'钢板厚度（mm）');const input=el('input');Object.assign(input,{type:'number',min:'1',max:'2000',step:'1',value:demoArmorThickness,id:'armor-thickness'});label.append(input);
 const fire=el('button','发射','demo-fire');fire.type='button';const stat=el('div',null,'demo-stat');stat.append(el('span',fx.kind==='hesh'?'可影响钢板厚度参考':'当前穿深参考'),el('strong',penetration==null?'该角度无数据':`${penetration} mm`));label.hidden=air;input.disabled=air;controls.append(label,fire,stat);panel.append(controls);
 const scene=sv('svg',{viewBox:'0 0 800 300',role:'img','aria-label':`${fx.label}外形、飞行与命中机理示意`,class:'demo-scene'});
 sv('rect',{width:800,height:300,fill:'#f1f5f9'},scene);
 const text=(x,y,str,size=16,color='#536379')=>{const n=sv('text',{x,y,fill:color,'font-size':size},scene);n.textContent=str;return n;};
 text(25,30,top?'越顶攻顶 / 顶部装甲剖面示意':air?'航空目标 / 空爆破片示意':'均质钢板 / 弹药剖面示意');text(25,280,wire?'导线传输指令 / SACLOS':fx.guidance||fx.label,14);
 const plate=sv('g',{transform:top?`rotate(${shotAngle} 575 180)`:`rotate(${shotAngle} 510 155)`,opacity:air?0:1},scene);const armor=sv('rect',{x:494,y:65,width:32,height:180,rx:2,fill:'#7c90a6',stroke:'#344a63','stroke-width':2},plate);
 if(top){armor.setAttribute('x',465);armor.setAttribute('y',170);armor.setAttribute('width',220);armor.setAttribute('height',20);const hull=sv('g',{},scene);sv('path',{d:'M435 210H720L742 250H415Z',fill:'#d8e1e8',stroke:'#647a8d'},hull);sv('rect',{x:466,y:195,width:218,height:15,fill:'#e7edf2'},hull);text(550,245,'车内',14);}
 const plateLabel=text(475,273,'',14);
 const plane=sv('g',{transform:'translate(650 100)',opacity:air?1:0},scene);sv('path',{d:'M-65 0L-20-7L0-40L12-40L5-7L55-3L70 0L55 5L5 7L12 40L0 40L-20 7L-65 0Z',fill:'#71879e',stroke:'#344a63','stroke-width':2},plane);
 const line=sv('line',{x1:60,y1:top?75:155,x2:top?740:air?650:510,y2:top?75:air?100:155,stroke:missile?'#ab7c28':'#a5b7c8','stroke-dasharray':'7 6',opacity:.75},scene);
 const guideLabel=text(70,70,missile?(/SACLOS|MCLOS|command/i.test(fx.guidance)?'指令瞄准线':'制导参考线'):'',14,'#81520a');
 const trail=sv('path',{d:'',fill:'none',stroke:missile?'#8b9bae':'#427d89','stroke-width':wire?1:missile?5:2,opacity:.35},scene);
 const bullet=sv('g',{transform:'translate(65 155)'},scene);
 const part=(tag,attrs)=>sv(tag,attrs,bullet);
 if(fx.kind==='ahead'){part('path',{d:'M-30-10H10L31 0L10 10H-30Z',fill:'#b49b64',stroke:'#344a63'});for(let i=0;i<9;i++)part('rect',{x:-20+(i%3)*9,y:-6+Math.floor(i/3)*5,width:5,height:3,fill:'#e3dcc7'});
 }else if(fx.kind==='vt'&&!missile){part('path',{d:'M-28-10H6L30 0L6 10H-28Z',fill:'#98794e',stroke:'#344a63'});part('circle',{cx:18,cy:0,r:4,fill:'#63a6bd'});part('rect',{x:-17,y:-6,width:19,height:12,fill:'#e1b46d'});
 }else if(fx.kind==='dart'){
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
 const cone=sv('path',{d:'',fill:'#d4a24a',opacity:0},scene);
 const sensor=sv('circle',{cx:air?650:510,cy:air?100:155,r:85,fill:'none',stroke:'#4e9cac','stroke-dasharray':'6 5',opacity:fx.kind==='vt'&&airburst?.55:0},scene);
 const impactMarks=Array.from({length:9},()=>sv('path',{d:'',stroke:'#d47d31','stroke-width':2,opacity:0},scene));
 const smoke=Array.from({length:7},()=>sv('circle',{cx:0,cy:0,r:0,fill:'#a7b2bc',opacity:0},scene));
 panel.append(scene);const result=el('p','选择弹药，设置钢板厚度后发射。','demo-result');result.setAttribute('role','status');panel.append(result);
 const descriptions={topattack:'导弹从车顶上方掠过，在目标上方触发向下作用。TOW-2B 用短粗侵彻体表示爆炸成形侵彻体，BILL 用细长射流表示聚能作用。只比较所选条件下的 Wiki 穿深与顶部均质钢板，不计算复合装甲、传感器阈值或真实车内损伤。',ahead:'可编程起爆后，预制子弹丸沿前向锥形区域散射。面对钢板显示表面撞击，面对飞机显示子弹丸扫过机体；不把整弹穿深当作子弹丸穿深。',vt:'VT 使用近炸引信，航空场景显示目标附近起爆和破片扩散；装甲场景可切换接触起爆与板前近炸。感应圈只是提示，不代表该弹真实触发距离；接触模式不代表所有载具都可切换引信。',heat:'锥形装药弹体停在装甲外，随后显示金属射流。',dart:'细长穿甲杆带尾翼；先显示弹托分离，再由杆体撞击装甲。',hesh:'装药在钢板表面摊开并爆炸；背面剥落不等于弹体穿孔。',shrapnel:'弹体在钢板前打开，弹丸向前散射。图中起爆点是演示位置，不是引信设置值。',sam:'导弹接近航空目标后显示爆炸和破片，不以坦克穿深数值判定飞机损伤。',missile:'导弹沿制导参考线飞行，命中后显示破甲射流。瞄准线不代表所有导弹都由导线制导。','missile-he':'导弹命中后显示爆炸与破片。',he:'弹体在命中点爆炸，破片向周围扩散。',aphe:'弹体先穿过钢板，再在板后爆炸并向四周散射破片；未击穿时不显示板后爆炸。APCBC 的板后爆炸仅用于 Wiki 标有炸药装填的弹药。',core:'次口径弹芯撞击钢板，效果为弹芯示意。',ap:'全口径弹体撞击钢板，穿深足够时继续向板后运动。',smoke:'展示烟雾形成，不判定穿甲。'};
 panel.append(el('p',(fx.incendiary?'半穿甲燃烧弹穿透后显示局部燃烧；没有高爆装填时不显示板后爆炸。':descriptions[fx.kind])+(fx.shaped?' 本弹 Wiki 提供独立破甲射流数据；地面模式按射流穿深比较钢板，航空模式显示近炸破片，不判定飞机损伤。':'')+(wire?' 本条 TOW 以细线表示指令传输导线。':'')+(shell.belt?' 弹带外形按其中的代表弹种示意，不逐发模拟组合。':'')+' 外形和作用过程为二维示意，不按比例，也不计算真实弹道、跳弹、ERA、复合装甲或车内伤害。','notes'));
 if(dual||top||fx.shaped){const source=el('a','作用机理来源','source');source.href=fx.kind==='ahead'?'https://www.rheinmetall.com/en/products/weapons-and-ammunition/medium-calibre-ammunition':'https://wiki.warthunder.com/weapon/2544-tank-ammunition';source.target='_blank';source.rel='noopener';panel.append(source);}
 let running=false,revision=0;
 function resetVisual(){bullet.setAttribute('transform',top?'translate(65 75)':'translate(65 155)');bullet.setAttribute('opacity',1);trail.setAttribute('d','');[flash,jet,splash,sabot,cone,...impactMarks,...particles,...smoke].forEach(n=>n.setAttribute('opacity',0));}
 function updateArmor(){const thickness=Number(input.value),valid=Number.isFinite(thickness)&&thickness>=1&&thickness<=2000;if(valid)demoArmorThickness=thickness;const w=Math.min(64,Math.max(14,Math.sqrt(valid?thickness:100)*2));if(top){armor.setAttribute('y',180-w/2);armor.setAttribute('height',w);}else{armor.setAttribute('x',510-w/2);armor.setAttribute('width',w);}plateLabel.textContent=air?'航空目标':valid?`${top?'顶部 ':''}${thickness} mm / ${shotAngle}°`:'厚度范围 1–2000 mm';fire.disabled=!valid||running;return valid;}
 input.addEventListener('input',()=>{revision++;running=false;fire.textContent='发射';updateArmor();resetVisual();result.textContent='选择弹药，设置钢板厚度后发射。';result.className='demo-result';});
 fire.addEventListener('click',()=>{
  if(!updateArmor()||running)return;const thickness=Number(input.value);
  const special=air||['ahead','vt','sam','shrapnel','smoke'].includes(fx.kind);const judged=penetration!=null&&!special;const passes=judged&&penetration>=thickness;
  const hitX=air?(fx.kind==='ahead'?490:585):airburst?380:fx.kind==='shrapnel'?375:510-Number(armor.getAttribute('width'))/(2*Math.cos(Number(shotAngle)*Math.PI/180));const hitY=air?100:155;
  const current=++revision;running=true;fire.disabled=true;fire.textContent='演示中…';resetVisual();result.textContent='弹药飞行中…';result.className='demo-result';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,duration=reduce?0:2600;let start;
  function finish(){running=false;fire.textContent='再次发射';updateArmor();result.className='demo-result '+(judged?(passes?'pass':'stop'):'');result.textContent=top?(!judged?'已显示越顶触发与向下作用；该角度无对应穿深，不判定击穿。':`顶部钢板 ${thickness} mm / 穿深参考 ${penetration} mm：${passes?'显示穿过顶部装甲后的破片。':'向下作用止于顶部装甲。'}`):dual?(fx.kind==='ahead'?(air?'已显示前向子弹丸锥扫过航空目标；命中闪光不代表判定击毁。':'已显示子弹丸撞击装甲表面；未判定单颗子弹丸穿甲。'):(air?'已显示航空目标附近起爆和破片命中示意；未判定击毁。':airburst?'已显示装甲前近炸，破片被钢板拦截；未判定穿甲。':'已显示接触装甲爆炸与表面破片；未计算装甲破坏或超压伤害。')):sam?'已显示近炸破片示意；未判定航空目标损伤。':fx.kind==='shrapnel'?'已显示弹丸散射示意；当前穿深是弹体参考，不是每颗散射弹丸的穿深。':fx.kind==='smoke'?'已显示烟雾形成示意。':!judged?'已显示弹种作用机理；该角度缺少对应数据，不判定击穿。':fx.kind==='hesh'?`可影响厚度参考 ${penetration} mm / 钢板 ${thickness} mm。${passes?'显示背面剥落，不显示弹体穿孔。':'不显示背面剥落。'}`:`穿深 ${penetration} mm / 钢板 ${thickness} mm：${passes?'数值足够，显示板后作用。':'数值不足，作用停在装甲前。'}`;}
  function frame(time){if(current!==revision||!panel.isConnected)return;start??=time;const p=duration?Math.min(1,(time-start)/duration):1,flight=Math.min(1,p/.52),effect=Math.max(0,(p-.52)/.48);
   if(top){const bx=65+510*flight;bullet.setAttribute('transform',`translate(${bx} 75)`);trail.setAttribute('d',`M65 75L${bx} 75`);if(effect>0){bullet.setAttribute('opacity',0);flash.setAttribute('cx',575);flash.setAttribute('cy',75);flash.setAttribute('r',10+effect*30);flash.setAttribute('opacity',Math.max(.1,.8-effect*.6));const endY=passes?265:180-Number(armor.getAttribute('height'))/2;const dy=75+(endY-75)*Math.min(1,effect*1.8);jet.setAttribute('d',fx.efp?`M560 ${dy-13}L560 ${dy}M590 ${dy-13}L590 ${dy}`:`M575 75L575 ${dy}`);jet.setAttribute('stroke-width',fx.efp?8:4);jet.setAttribute('stroke-linecap','round');jet.setAttribute('opacity',1);if(passes&&effect>.55)particles.forEach((n,i)=>{const q=(effect-.55)/.45;n.setAttribute('cx',575+(i-7)*q*7);n.setAttribute('cy',195+q*(40+i%4*12));n.setAttribute('opacity',.7);});}if(p<1)requestAnimationFrame(frame);else finish();return;}
   let x=65+(hitX-65)*flight,y=155+(hitY-155)*flight;
   if(missile)y+=Math.sin(flight*Math.PI*3)*12*(1-flight);
   if(effect>0&&passes&&['dart','core','ap','aphe'].includes(fx.kind)){x=hitX+(fx.kind==='aphe'?115:210)*Math.min(1,effect*1.8);}
   bullet.setAttribute('transform',`translate(${x} ${y})`);trail.setAttribute('d',`M65 155L${x} ${y}`);
   if(fx.kind==='dart'&&p>.12){sabot.setAttribute('opacity',Math.max(0,1-p/.48));petals.forEach((petal,i)=>petal.setAttribute('transform',`translate(${190+(p-.12)*120} ${155+(i?-1:1)*(p-.12)*130}) rotate(${(i?-1:1)*p*90})`));}
   if(effect>0){
    const explosive=['heat','missile','missile-he','hesh','he','shrapnel','sam','aphe','vt','ahead'].includes(fx.kind);
    if(!['dart','core','ap','aphe'].includes(fx.kind)||!passes)bullet.setAttribute('opacity',0);
    const originX=fx.kind==='aphe'&&passes?hitX+115:hitX;
    const burst=fx.kind==='aphe'?Math.max(0,(effect-.55)/.45):effect;
    if(fx.kind==='aphe'&&passes&&effect>=.55)bullet.setAttribute('opacity',0);
    if(explosive&&(fx.kind!=='aphe'||passes&&burst>0)){flash.setAttribute('cx',originX);flash.setAttribute('cy',hitY);flash.setAttribute('r',8+burst*42);flash.setAttribute('opacity',Math.max(0,.9-burst*.8));}
    if(['heat','missile'].includes(fx.kind)){const length=(passes?235:Math.max(10,Number(armor.getAttribute('width'))*.4))*Math.min(1,effect*1.6);jet.setAttribute('d',`M${hitX} ${hitY}L${hitX+length} ${hitY}`);jet.setAttribute('opacity',Math.max(.2,1-effect*.7));}
    if(fx.kind==='hesh'){splash.setAttribute('cx',hitX);splash.setAttribute('ry',Math.min(30,8+effect*35));splash.setAttribute('opacity',1);}
    const showParticles=['he','missile-he','sam','shrapnel','ahead','vt'].includes(fx.kind)||fx.kind==='hesh'&&(passes||!judged)||passes&&(['heat','missile','dart','core','ap'].includes(fx.kind)||fx.kind==='aphe'&&burst>0);
    if(showParticles)particles.forEach((particle,i)=>{const radial=['he','missile-he','sam','aphe','vt'].includes(fx.kind),spread=radial?Math.PI*2*i/15:(i-7)*.12;const origin=fx.kind==='hesh'?530:originX;const travel=burst*(70+(i%5)*25);const px=origin+Math.cos(spread)*travel;particle.setAttribute('cx',dual&&!air?Math.min(490,px):px);particle.setAttribute('cy',hitY+Math.sin(spread)*travel);particle.setAttribute('opacity',Math.max(.2,1-effect*.65));});
    if(fx.incendiary&&passes&&effect>.55){flash.setAttribute('cx',hitX+125);flash.setAttribute('cy',hitY);flash.setAttribute('r',10+Math.sin(effect*30)*3);flash.setAttribute('opacity',.65);smoke.slice(0,3).forEach((n,i)=>{n.setAttribute('cx',hitX+125+i*5);n.setAttribute('cy',hitY-(effect-.55)*(40+i*25));n.setAttribute('r',6+i*3);n.setAttribute('opacity',.25);});}
    if(fx.kind==='smoke')smoke.forEach((n,i)=>{n.setAttribute('cx',hitX+(i-3)*14);n.setAttribute('cy',hitY-effect*(20+i*12));n.setAttribute('r',12+effect*(20+i*3));n.setAttribute('opacity',.25);});
   }
   if(dual&&effect>0){if(fx.kind==='ahead'){cone.setAttribute('d',`M${hitX} ${hitY}L${Math.min(air?800:490,hitX+effect*220)} ${hitY-effect*90}L${Math.min(air?800:490,hitX+effect*220)} ${hitY+effect*90}Z`);cone.setAttribute('opacity',.12);}if(effect>.55)impactMarks.forEach((mark,i)=>{const mx=air?605+(i%3)*22:490,my=hitY+(i-4)*8;mark.setAttribute('d',`M${mx-4} ${my-4}L${mx+4} ${my+4}M${mx-4} ${my+4}L${mx+4} ${my-4}`);mark.setAttribute('opacity',.7);});}
   if(p<1)requestAnimationFrame(frame);else finish();
  }
  requestAnimationFrame(frame);
 });
 updateArmor();root.append(panel);
}
