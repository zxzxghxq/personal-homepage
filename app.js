const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
menu.addEventListener('click', () => {
 const open = menu.getAttribute('aria-expanded') !== 'true';
 menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
 menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open');
}));
const observer = new IntersectionObserver(entries => {
 entries.forEach(entry => { if(entry.isIntersecting) nav.querySelectorAll('a').forEach(link => {
  if(link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
  else link.removeAttribute('aria-current');
 }); });
}, {rootMargin:'-15% 0px -55% 0px'});
document.querySelectorAll('main section').forEach(section => observer.observe(section));
const projects = {
 journal: {title:'片刻笔记',summary:'一个围绕灵感收集与内容回顾的产品设计练习，让记录成为轻松的日常习惯。',points:['梳理从快速记录到分类回看的完整流程','用清晰的信息层级降低阅读负担','探索标签、卡片与留白的组合']},
 weather: {title:'天气小窗',summary:'一组天气信息界面的前端设计探索，练习将温度、天气状态与日常提示组织成易读的卡片。',points:['用字体与色彩区分信息优先级','探索手机与桌面的响应式布局','为不同天气状态设计一致的视觉语言']},
 reading: {title:'阅读索引',summary:'把读过的书与留下的思考整理成一个视觉档案，探索中文排版与内容组织。',points:['建立书名、摘记与标签的排版规范','用统一网格组织不同长度的内容','兼顾快速浏览与细读的体验']}
};
const dialog = document.querySelector('dialog');
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
 const project = projects[button.dataset.project];
 document.querySelector('#project-title').textContent=project.title;
 document.querySelector('#project-summary').textContent=project.summary;
 document.querySelector('#project-points').replaceChildren(...project.points.map(text => {const li=document.createElement('li');li.textContent=text;return li;}));
 dialog.showModal();
}));
document.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
