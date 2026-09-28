(() => {
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const avatarPool=['/avatar-1.svg','/avatar-2.svg','/avatar-3.svg','/avatar-4.svg'];
  let openingDefault=false;
  let drawFrame=0;

  function initials(name=''){
    const parts=String(name).trim().split(/\s+/).filter(Boolean);
    return (parts.at(-1)?.[0]||parts[0]?.[0]||'P').toUpperCase();
  }

  function configureColumn(column,count){
    const mobile=window.innerWidth<=560;
    let cols=1;
    if(count===2)cols=2;
    else if(count===3)cols=3;
    else if(count===4)cols=4;
    else if(count>4)cols=mobile?3:Math.min(4,count);
    column.style.gridTemplateColumns=count===1?'minmax(220px,310px)':`repeat(${cols},minmax(0,1fr))`;
    column.style.paddingInline=count===1?'10%':count===2?'8%':count===3?'2%':'0';
    column.dataset.cols=String(cols);
  }

  function decorateTree(){
    const tree=$('#familyTree');
    if(!tree)return;
    $$('.generation-column',tree).forEach(column=>{
      const generation=Number(column.dataset.generation||1);
      const cards=$$('.person-card',column);
      column.dataset.count=String(cards.length);
      configureColumn(column,cards.length);
      const title=$('.generation-title',column);
      if(title)title.textContent=`ĐỜI THỨ ${generation}`;
      cards.forEach((card,index)=>{
        const copy=$('.person-copy',card);
        const name=$('strong',copy)?.textContent?.trim()||'';
        const avatar=$('.person-avatar',card);
        const isAncestor=card.classList.contains('ancestor')||generation===1;
        if(avatar){
          avatar.textContent='';
          const img=document.createElement('img');
          img.alt='';
          img.src=isAncestor?'/avatar-ancestor.svg':avatarPool[(generation+index-2+avatarPool.length)%avatarPool.length];
          avatar.appendChild(img);
        }
        let badge=$('.person-badge',card);
        if(!badge){badge=document.createElement('span');badge.className='person-badge';card.appendChild(badge);}
        badge.textContent=isAncestor?'祖':initials(name);
      });
    });
    scheduleConnectors();
  }

  function makeSvgNode(name,attrs={}){
    const node=document.createElementNS('http://www.w3.org/2000/svg',name);
    for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));
    return node;
  }

  function drawConnectors(){
    const tree=$('#familyTree');
    if(!tree)return;
    let svg=$(':scope > .tree-connectors',tree);
    if(!svg){
      svg=makeSvgNode('svg',{class:'tree-connectors','aria-hidden':'true'});
      tree.prepend(svg);
    }
    while(svg.firstChild)svg.removeChild(svg.firstChild);

    const treeRect=tree.getBoundingClientRect();
    const width=Math.max(1,treeRect.width),height=Math.max(1,treeRect.height);
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio','none');

    const columns=$$('.generation-column',tree);
    for(let i=1;i<columns.length;i++){
      const prevCards=$$('.person-card',columns[i-1]);
      const nextCards=$$('.person-card',columns[i]);
      if(!prevCards.length||!nextCards.length)continue;

      const prevRects=prevCards.map(card=>card.getBoundingClientRect());
      const nextRects=nextCards.map(card=>card.getBoundingClientRect());
      const sourceX=prevRects.reduce((sum,r)=>sum+(r.left+r.width/2-treeRect.left),0)/prevRects.length;
      const sourceY=Math.max(...prevRects.map(r=>r.bottom-treeRect.top));
      const firstRowTop=Math.min(...nextRects.map(r=>r.top-treeRect.top));
      const firstRow=nextRects.filter(r=>Math.abs((r.top-treeRect.top)-firstRowTop)<6);
      const targets=firstRow.map(r=>({x:r.left+r.width/2-treeRect.left,y:r.top-treeRect.top}));
      if(!targets.length)continue;

      const gap=Math.max(24,firstRowTop-sourceY);
      const branchY=sourceY+Math.min(gap-12,Math.max(18,gap*.50));
      const minX=Math.min(...targets.map(t=>t.x)),maxX=Math.max(...targets.map(t=>t.x));

      const path=makeSvgNode('path',{d:`M ${sourceX} ${sourceY} V ${branchY} M ${minX} ${branchY} H ${maxX}`});
      svg.appendChild(path);
      svg.appendChild(makeSvgNode('circle',{cx:sourceX,cy:sourceY,r:3.4}));
      targets.forEach(target=>{
        svg.appendChild(makeSvgNode('line',{x1:target.x,y1:branchY,x2:target.x,y2:target.y}));
        svg.appendChild(makeSvgNode('circle',{cx:target.x,cy:branchY,r:3.2}));
      });
    }
  }

  function scheduleConnectors(){
    cancelAnimationFrame(drawFrame);
    drawFrame=requestAnimationFrame(()=>requestAnimationFrame(drawConnectors));
  }

  function normalizeGenerationChips(){
    const chips=$('#generationChips');
    if(!chips)return;
    $$('button',chips).forEach(button=>{
      const value=button.dataset.generation;
      if(value==='all')button.textContent='Tất cả';
      else if(value)button.textContent=`Đời thứ ${value}`;
    });
  }

  function syncMoreState(){
    const more=$('#bottomNav [data-nav="more"]');
    if(!more)return;
    const secondary=['documents-view','settings-view'].some(id=>{const el=document.getElementById(id);return el&&!el.hidden;});
    more.classList.toggle('active',secondary);
  }

  function bindMore(){
    const more=$('#bottomNav [data-nav="more"]');
    const menu=$('#menuButton');
    if(!more||!menu)return;
    more.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();menu.click();},true);
  }

  function bindFilterButton(){
    const button=$('#treeFilterButton');
    const chips=$('#generationChips');
    if(!button||!chips)return;
    button.addEventListener('click',()=>{
      button.classList.toggle('active');
      if(window.innerWidth<=390)chips.classList.toggle('compact');
      chips.scrollIntoView({block:'nearest',behavior:'smooth'});
    });
  }

  function openTreeAsDefault(){
    if(openingDefault)return;
    openingDefault=true;
    requestAnimationFrame(()=>{
      const treeButton=$('#bottomNav [data-nav="tree"]');
      if(treeButton)treeButton.click();
      normalizeGenerationChips();
      decorateTree();
      openingDefault=false;
    });
  }

  function observeDynamicUI(){
    const tree=$('#familyTree');
    const chips=$('#generationChips');
    const views=$$('.view');
    if(tree)new MutationObserver(()=>{decorateTree();}).observe(tree,{childList:true});
    if(chips)new MutationObserver(normalizeGenerationChips).observe(chips,{childList:true,subtree:true,characterData:true});
    if(views.length){
      const observer=new MutationObserver(()=>{syncMoreState();scheduleConnectors();});
      views.forEach(view=>observer.observe(view,{attributes:true,attributeFilter:['hidden','class']}));
    }
  }

  function syncViewport(){
    const viewport=window.visualViewport;
    const height=viewport?.height||window.innerHeight;
    document.documentElement.style.setProperty('--app-vh',`${Math.round(height)}px`);
    $$('.generation-column').forEach(column=>configureColumn(column,$$('.person-card',column).length));
    scheduleConnectors();
  }

  function init(){
    document.body.classList.add('reference-ui-ready');
    bindMore();
    bindFilterButton();
    observeDynamicUI();
    syncViewport();
    window.visualViewport?.addEventListener('resize',syncViewport,{passive:true});
    window.addEventListener('resize',syncViewport,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(syncViewport,120),{passive:true});
    openTreeAsDefault();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
