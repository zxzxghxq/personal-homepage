'use strict';
const $ = id => document.getElementById(id);
const countryNames = {USA:'美国',Germany:'德国',USSR:'苏联',Britain:'英国','Great Britain':'英国',Japan:'日本',China:'中国',Italy:'意大利',France:'法国',Sweden:'瑞典',Israel:'以色列'};
const roleNames = {'Light tank':'轻型坦克','Medium tank':'中型坦克','Heavy tank':'重型坦克','Tank destroyer':'坦克歼击车','SPAA':'自行防空炮','Self-propelled anti-aircraft gun':'自行防空炮'};
const translations = {'Caliber':'口径','Projectile Mass':'弹体质量','Muzzle Velocity':'初速','Explosive Mass':'装药质量','Explosive Type':'炸药类型','Fuze Delay':'引信延迟','Fuze Sensitivity':'引信灵敏度','TNT Equivalent':'TNT 当量','Range':'射程'};
const aliases = {'豹':'leopard','虎':'tiger','谢尔曼':'sherman','艾布拉姆斯':'abrams','挑战者':'challenger','百夫长':'centurion','鼠':'maus','勒克莱尔':'leclerc','梅卡瓦':'merkava','布雷德利':'bradley','丘吉尔':'churchill','潘兴':'pershing','猎虎':'jagdtiger'};
let dataset,vehicles=[],filtered=[],selectedId='',shellIndex=0,page=0,distance=10,angle='0';
const pageSize=60;
const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!=null)el.textContent=text;if(cls)el.className=cls;return el;};
const normalize=text=>String(text).toLowerCase().normalize('NFKC').replace(/[\s\-_.()'’]/g,'');
const country=v=>countryNames[v.country]||v.country||'未知国家';
const role=v=>roleNames[v.role]||v.role||'未分类';
function value(shell,d=distance,a=angle){
 if(shell.type==='HESH'&&shell.affectedThickness!=null)return a==='0'?shell.affectedThickness:null;
 if(shell.constantAngles && Object.hasOwn(shell.constantAngles,a))return shell.constantAngles[a];
 if(shell.angles[a]){const i=(shell.angleDistances||shell.distances).indexOf(Number(d));return i>=0?shell.angles[a][i]??null:null;}
 if(a==='0'){const i=shell.distances.indexOf(Number(d));return i>=0?shell.table0[i]??null:null;}
 return null;
}
function populate(id,values,label){const select=$(id);values.forEach(v=>{const o=node('option',label(v));o.value=v;select.append(o);});}
async function load(){
 $('load-error').hidden=true;
 try{
  const response=await fetch('data/vehicles.json');if(!response.ok)throw Error(response.status);
  dataset=await response.json();vehicles=dataset.vehicles;
  vehicles.forEach(v=>v._search=normalize([v.name,v.id,country(v),role(v),...v.shells.flatMap(s=>[s.name,s.type,s.weapon])].join(' ')));
  for(const id of ['country','role','type']){const o=node('option',id==='country'?'全部国家':id==='role'?'全部类别':'全部类型');o.value='';$(id).replaceChildren(o);}
  populate('country',[...new Set(vehicles.map(v=>v.country).filter(Boolean))].sort(),v=>countryNames[v]||v);
  populate('role',[...new Set(vehicles.map(v=>v.role).filter(Boolean))].sort(),v=>roleNames[v]||v);
  populate('type',[...new Set(vehicles.flatMap(v=>v.shells.flatMap(s=>s.type.split('/'))))].sort(),v=>v);
  const total=vehicles.reduce((n,v)=>n+v.shells.length,0);
  $('counts').replaceChildren(node('b',vehicles.length.toLocaleString()),document.createTextNode(' 辆载具　/　'),node('b',total.toLocaleString()),document.createTextNode(' 条弹药记录'));
  const empty=vehicles.filter(v=>!v.shells.length).length;
  $('coverage').textContent=`数据日期：${dataset.collectedAt} · ${dataset.successCount} 辆载具 · ${empty} 辆暂无炮弹表。游戏更新后数据可能有变化。`;
  const params=new URLSearchParams(location.search);selectedId=vehicles.some(v=>v.id===params.get('v'))?params.get('v'):(vehicles.some(v=>v.id==='us_t29')?'us_t29':vehicles[0]?.id);
  if(params.has('q'))$('search').value=params.get('q');filter();
 }catch(error){$('load-error').hidden=false;$('details').replaceChildren(node('div','数据暂时无法加载，请点击重试。','empty'));$('result-count').textContent='加载失败';}
}
function filter(){
 let query=$('search').value.trim();Object.entries(aliases).sort((a,b)=>b[0].length-a[0].length).forEach(([cn,en])=>query=query.replaceAll(cn,en));
 const words=query.split(/\s+/).map(normalize).filter(Boolean);
 filtered=vehicles.filter(v=>(!$('country').value||v.country===$('country').value)&&(!$('role').value||v.role===$('role').value)&&(!$('type').value||v.shells.some(s=>s.type.split('/').includes($('type').value)))&&words.every(w=>v._search.includes(w)));
 page=0;if(!filtered.some(v=>v.id===selectedId)){selectedId=filtered[0]?.id||'';shellIndex=0;}
 page=Math.max(0,Math.floor(filtered.findIndex(v=>v.id===selectedId)/pageSize));renderList();renderDetails();updateUrl();
}
function updateUrl(){const p=new URLSearchParams();if(selectedId)p.set('v',selectedId);if($('search').value.trim())p.set('q',$('search').value.trim());history.replaceState(null,'',location.pathname+(p.size?'?'+p:''));}
function renderList(){
 $('vehicle-list').replaceChildren();$('result-count').textContent=`${filtered.length} 辆`;
 const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.min(page,totalPages-1);
 for(const v of filtered.slice(page*pageSize,(page+1)*pageSize)){
  const button=node('button',null,'vehicle'+(v.id===selectedId?' selected':''));button.setAttribute('aria-pressed',String(v.id===selectedId));
  button.append(node('span',v.name,'name'));const meta=node('span',null,'meta');meta.append(node('span',country(v)),node('span',role(v)),node('span',`RB ${v.br?.RB||'—'}`));button.append(meta);
  button.addEventListener('click',()=>{selectedId=v.id;shellIndex=0;renderList();renderDetails();updateUrl();});$('vehicle-list').append(button);
 }
 if(!filtered.length)$('vehicle-list').append(node('div','没有匹配载具。试试其他关键词或重置筛选。','empty'));
 $('previous').disabled=page===0;$('next').disabled=page>=totalPages-1;$('page-label').textContent=`${page+1} / ${totalPages}`;
}
function renderDetails(){
 const v=vehicles.find(v=>v.id===selectedId);const root=$('details');root.replaceChildren();
 if(!v){root.append(node('div','没有匹配结果。请调整筛选条件。','empty'));return;}
 const head=node('div',null,'detail-heading');const title=node('div');title.append(node('h2',v.name));const link=node('a','Wiki 页面','source');link.href=v.source;link.target='_blank';link.rel='noopener';head.append(title,link);root.append(head);
 const meta=node('div',null,'vehicle-meta');[country(v),role(v),`等级 ${v.rank||'—'}`,`RB ${v.br?.RB||'—'}`,`${v.shells.length} 种弹药 / 弹带`].forEach(t=>meta.append(node('span',t,'badge')));root.append(meta);
 const conditions=node('div',null,'conditions');
 for(const [id,label,values,current] of [['distance','射击距离',[10,100,500,1000,1500,2000],distance],['angle','入射角度',['0','30','60'],angle]]){
  const l=node('label',label);const select=node('select');select.id=id;values.forEach(val=>{const option=node('option',`${val}${id==='distance'?' m':'°'}`);option.value=val;option.selected=String(val)===String(current);select.append(option);});
  select.addEventListener('change',()=>{if(id==='distance')distance=Number(select.value);else angle=select.value;renderDetails();$(id).focus();});l.append(select);conditions.append(l);
 }
 conditions.append(node('p','单位：毫米 · 点击弹药名展开详情','condition-note'));root.append(conditions);
 const shells=v.shells.map((s,i)=>({s,i}));
 if(!shells.length){const empty=node('div',null,'empty');empty.append(node('b',v.error?'此载具数据暂缺':'暂无炮弹数据'),node('span','请查看上方 Wiki 页面。机枪与榴弹发射器不在本库范围内。'));root.append(empty);return;}
 if(!shells.some(x=>x.i===shellIndex))shellIndex=shells[0].i;
 const wrap=node('div',null,'table-wrap');const table=node('table');const thead=node('thead');const tr=node('tr');['弹药 / 火炮','弹种','初速','穿深 / 作用厚度 (mm)'].forEach((t,i)=>tr.append(node('th',t,i===3?'number':null)));thead.append(tr);table.append(thead);const tbody=node('tbody');
 const max=Math.max(1,...shells.map(({s})=>value(s)||0));
 for(const {s,i} of shells){const row=node('tr',null,'ammo-row'+(i===shellIndex?' active':''));const namecell=node('td');const b=node('button',s.name,'ammo-name'+(i===shellIndex?' selected':''));b.setAttribute('aria-expanded',String(i===shellIndex));b.addEventListener('click',()=>{shellIndex=i;renderDetails();});namecell.append(b,node('span',s.weapon+(s.belt?' · 弹带':''),'weapon'));row.append(namecell);const typ=node('td');typ.append(node('span',s.type,'ammo-type'));row.append(typ,node('td',s.properties['Muzzle Velocity']||'—'));const pen=value(s);const cell=node('td',pen==null?'—':String(pen),'number');if(pen!=null){const bar=node('div',null,'bar');const fill=node('i');fill.style.width=`${pen/max*100}%`;bar.append(fill);cell.append(bar);}row.append(cell);tbody.append(row);}
 table.append(tbody);wrap.append(table);root.append(wrap);renderHitDemo(root,v.shells[shellIndex],value(v.shells[shellIndex]),distance,angle,{shells:v.shells,index:shellIndex,onSelect:i=>{shellIndex=i;renderDetails();}});renderShell(root,v.shells[shellIndex]);
}
function renderShell(root,s){
 const block=node('div',null,'ammo-detail');block.append(node('h3',s.name),node('p',`${s.type} · ${s.weapon}`,'detail-meta'));
 const props=node('div',null,'properties');Object.entries(s.properties).filter(([key])=>['Caliber','Projectile Mass','Muzzle Velocity','Explosive Mass','TNT Equivalent','Fuze Delay','Fuze Sensitivity'].includes(key)).forEach(([key,val])=>{const div=node('div',translations[key]||key);div.append(node('strong',val));props.append(div);});block.append(props);
 const wrap=node('div',null,'table-wrap');const table=node('table',null,'matrix');const cap=node('caption',s.type==='HESH'&&s.affectedThickness!=null?'Wiki 碎甲弹可影响钢板厚度 · mm':s.constantAngles?'Wiki 破甲射流穿深 · mm':Object.keys(s.angles).length?'Wiki 穿深详情表 · mm':'Wiki 距离穿深表 · mm');cap.style.textAlign='left';cap.style.color='var(--muted)';cap.style.fontSize='12px';cap.style.marginBottom='10px';table.append(cap);const head=node('thead');const hr=node('tr');['距离','0°','30°','60°'].forEach(t=>hr.append(node('th',t)));head.append(hr);table.append(head);const body=node('tbody');
 for(const d of dataset.distances){const row=node('tr');row.append(node('td',`${d} m`));for(const a of ['0','30','60']){const n=value(s,d,a);row.append(node('td',n==null?'—':String(n),Number(d)===distance&&a===angle?'current':null));}body.append(row);}table.append(body);wrap.append(table);block.append(wrap);
 const note=node('p',null,'notes');note.textContent='“—”表示 Wiki 未提供对应条件的数据；不进行插值或角度推算。';
 if(s.type==='HESH'&&s.affectedThickness!=null)note.append(document.createTextNode(' 碎甲弹显示可影响钢板厚度，不是弹体动能穿深。Wiki 未提供该作用厚度的角度表；背面剥落仅为机理示意。'));
 if(s.constantAngles)note.append(document.createTextNode(' 本表显示破甲射流穿深：Wiki 距离简表恒定，角度数值来自破甲射流详情。'));
 if(s.constantPenetration!=null)note.append(document.createTextNode(` Wiki 另标注恒定穿深：${s.constantPenetration} mm。未提供角度时不视为各角度相同。`));
 if(s.secondaryPenetration!=null)note.append(document.createTextNode(` 高爆破片穿深另标注为 ${s.secondaryPenetration} mm，与主表穿深类别不同。`));
 if(s.type!=='HESH'&&s.angles['0']&&s.table0.some((n,i)=>n!==s.angles['0'][i]))note.append(document.createTextNode(' 原页面简表与详情表存在差异，此处优先显示详情表。'));
 if(s.belt)note.append(document.createTextNode(' 此条是弹带组合，穿深按 Wiki 的整条弹带数据展示；未将单发弹药的角度值套用到弹带。'));
 block.append(note);root.append(block);
}
for(const id of ['country','role','type'])$(id).addEventListener('change',filter);
let searchTimer;$('search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(filter,140);});
$('reset').addEventListener('click',()=>{$('search').value='';for(const id of ['country','role','type'])$(id).value='';filter();});
$('previous').addEventListener('click',()=>{page--;renderList();$('vehicle-list').scrollTop=0;});$('next').addEventListener('click',()=>{page++;renderList();$('vehicle-list').scrollTop=0;});$('retry').addEventListener('click',load);load();







