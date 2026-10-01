let demoArmorThickness = 100;
function renderHitDemo(root, shell, penetration, shotDistance, shotAngle) {
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
 const svgEl=(tag,attrs)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,val] of Object.entries(attrs))n.setAttribute(key,String(val));return n;};
 const panel=el('section',null,'hit-demo');panel.setAttribute('aria-label','钢板命中演示');
 const heading=el('div',null,'demo-heading');heading.append(el('h3','命中演示'),el('span',`${shell.name} · ${shotDistance} m · ${shotAngle}°`));panel.append(heading);
 const controls=el('div',null,'demo-controls');const label=el('label','钢板厚度（mm）');const input=el('input');input.type='number';input.min='1';input.max='2000';input.step='1';input.value=demoArmorThickness;input.id='armor-thickness';label.append(input);
 const fire=el('button','发射','demo-fire');fire.type='button';const stat=el('div',null,'demo-stat');stat.append(el('span','当前条件下的穿深'),el('strong',penetration==null?'无数据':`${penetration} mm`));controls.append(label,fire,stat);panel.append(controls);
 const scene=svgEl('svg',{viewBox:'0 0 800 260',role:'img','aria-label':'弹药沿水平方向命中倾斜钢板的示意图',class:'demo-scene'});
 scene.append(svgEl('rect',{x:0,y:0,width:800,height:260,fill:'#f1f5f9'}),svgEl('line',{x1:45,y1:140,x2:755,y2:140,stroke:'#a5b7c8','stroke-dasharray':'7 7'}));
 const leftText=svgEl('text',{x:35,y:35,fill:'#536379','font-size':16});leftText.textContent='弹药飞行方向';scene.append(leftText);
 const plate=svgEl('g',{transform:`rotate(${shotAngle} 500 140)`});const armor=svgEl('rect',{x:484,y:50,width:32,height:180,rx:3,fill:'#647991',stroke:'#344a63','stroke-width':2});plate.append(armor);scene.append(plate);
 const plateLabel=svgEl('text',{x:500,y:247,'text-anchor':'middle',fill:'#344a63','font-size':16});scene.append(plateLabel);
 const trace=svgEl('line',{x1:60,y1:140,x2:60,y2:140,stroke:'#0b7667','stroke-width':3,opacity:.3});scene.append(trace);
 const bullet=svgEl('g',{transform:'translate(65 140)'});bullet.append(svgEl('path',{d:'M -22 -5 L 7 -5 L 18 0 L 7 5 L -22 5 Z',fill:'#096c61'}));scene.append(bullet);
 const impact=svgEl('g',{opacity:0});impact.append(svgEl('circle',{cx:0,cy:0,r:16,fill:'#ffc96a',opacity:.65}),svgEl('path',{d:'M-27 0H27M0-27V27M-19-19L19 19M-19 19L19-19',stroke:'#b36f10','stroke-width':3}));scene.append(impact);
 const mark=svgEl('circle',{cx:500,cy:140,r:6,fill:'#172d42',opacity:0});scene.append(mark);
 panel.append(scene);const result=el('p','设置厚度后点击发射。','demo-result');result.setAttribute('role','status');panel.append(result);
 panel.append(el('p','仅按 Wiki 穿深与均质钢板厚度对比。钢板和飞行速度不按比例；不模拟跳弹、破片、复合装甲、反应装甲或车内伤害。','notes'));
 let running=false,revision=0;
 function updateArmor(){
  const thickness=Number(input.value);const valid=Number.isFinite(thickness)&&thickness>=1&&thickness<=2000;
  if(valid)demoArmorThickness=thickness;
  plateLabel.textContent=valid?`${thickness} mm / ${shotAngle}°`:'请输入 1–2000 mm';
  const width=Math.min(64,Math.max(14,Math.sqrt(valid?thickness:100)*2));armor.setAttribute('x',500-width/2);armor.setAttribute('width',width);
  fire.disabled=!valid||penetration==null||running;
  return valid;
 }
 input.addEventListener('input',()=>{revision++;running=false;fire.textContent='发射';updateArmor();bullet.setAttribute('transform','translate(65 140)');trace.setAttribute('x2','60');impact.setAttribute('opacity','0');mark.setAttribute('opacity','0');result.textContent=penetration==null?'该条件没有穿深数据，无法演示。':'设置厚度后点击发射。';result.className='demo-result';});
 fire.addEventListener('click',()=>{
  if(!updateArmor()||penetration==null||running)return;
  const thickness=Number(input.value),passes=penetration>=thickness;
  const width=Number(armor.getAttribute('width'));
  const hitX=500-width/(2*Math.cos(Number(shotAngle)*Math.PI/180));
  const endX=passes?745:hitX-18;
  const current=++revision;running=true;fire.disabled=true;fire.textContent='发射中…';impact.setAttribute('opacity','0');mark.setAttribute('opacity','0');result.textContent='弹药飞行中…';result.className='demo-result';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration=reduce?0:1300;let start;
  function finish(){running=false;fire.textContent='再次发射';updateArmor();mark.setAttribute('opacity','1');mark.setAttribute('cx',passes?500:hitX);result.className='demo-result '+(passes?'pass':'stop');result.textContent=passes?`穿深数值足够：${penetration} mm ≥ ${thickness} mm。演示为穿透钢板。`:`穿深数值不足：${penetration} mm < ${thickness} mm。演示为被钢板阻挡。`;}
  function frame(time){
   if(current!==revision||!panel.isConnected)return;
   start??=time;const progress=duration?Math.min(1,(time-start)/duration):1;
   const x=65+(endX-65)*progress;bullet.setAttribute('transform',`translate(${x} 140)`);trace.setAttribute('x2',x);
   if(x+18>=hitX){impact.setAttribute('transform',`translate(${hitX} 140)`);impact.setAttribute('opacity',progress<.95?'1':'0');}
   if(progress<1)requestAnimationFrame(frame);else{impact.setAttribute('opacity','0');finish();}
  }
  requestAnimationFrame(frame);
 });
 updateArmor();if(penetration==null)result.textContent='该条件没有穿深数据，无法演示。';root.append(panel);
}

