(() => {
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const avatarPool=['/avatar-1.svg','/avatar-2.svg','/avatar-3.svg','/avatar-4.svg'];
  let openingDefault=false;

  function initials(name=''){
    const parts=String(name).trim().split(/\s+/).filter(Boolean);
    return (parts.at(-1)?.[0]||parts[0]?.[0]||'P').toUpperCase();
  }

  function decorateTree(){
    const tree=$('#familyTree');
    if(!tree)return;
    $$('.generation-column',tree).forEach(column=>{
      const generation=Number(column.dataset.generation||1);
      const cards=$$('.person-card',column);
      column.dataset.count=String(cards.length);
      const title=$('.generation-title',column);
      if(title)title.textContent=`ĐỜI THỨ ${generation}`;
      cards.forEach((card,index)=>{
        const copy=$('.person-copy',card);
        const name=$('strong',copy)?.textContent?.trim()||'';
        const avatar=$('.person-avatar',card);
        const isAncestor=card.classList.contains('ancestor')||generation===1;
        if(avatar && !avatar.querySelector('img')){
          avatar.textContent='';
          const img=document.createElement('img');
          img.alt='';
          img.src=isAncestor?'/avatar-ancestor.svg':avatarPool[(generation+index-2+avatarPool.length)%avatarPool.length];
          avatar.appendChild(img);
        }
        let badge=$('.person-badge',card);
        if(!badge){
          badge=document.createElement('span');
          badge.className='person-badge';
          card.appendChild(badge);
        }
        badge.textContent=isAncestor?'祖':initials(name);
      });
    });
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
    const secondary=['documents-view','settings-view'].some(id=>{
      const el=document.getElementById(id);
      return el && !el.hidden;
    });
    more.classList.toggle('active',secondary);
  }

  function bindMore(){
    const more=$('#bottomNav [data-nav="more"]');
    const menu=$('#menuButton');
    if(!more||!menu)return;
    more.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      menu.click();
    },true);
  }

  function bindFilterButton(){
    const button=$('#treeFilterButton');
    const chips=$('#generationChips');
    if(!button||!chips)return;
    button.addEventListener('click',()=>{
      chips.classList.toggle('expanded');
      button.classList.toggle('active',chips.classList.contains('expanded'));
    });
  }

  function openTreeAsDefault(){
    if(openingDefault)return;
    openingDefault=true;
    requestAnimationFrame(()=>{
      const treeButton=$('#bottomNav [data-nav="tree"]');
      if(treeButton)treeButton.click();
      decorateTree();
      normalizeGenerationChips();
      openingDefault=false;
    });
  }

  function observeDynamicUI(){
    const tree=$('#familyTree');
    const chips=$('#generationChips');
    const views=$$('.view');
    if(tree)new MutationObserver(decorateTree).observe(tree,{childList:true,subtree:true});
    if(chips)new MutationObserver(normalizeGenerationChips).observe(chips,{childList:true,subtree:true,characterData:true});
    if(views.length){
      const observer=new MutationObserver(syncMoreState);
      views.forEach(view=>observer.observe(view,{attributes:true,attributeFilter:['hidden','class']}));
    }
  }

  function syncViewport(){
    const viewport=window.visualViewport;
    const height=viewport?.height||window.innerHeight;
    document.documentElement.style.setProperty('--app-vh',`${Math.round(height)}px`);
  }

  function init(){
    document.body.classList.add('ui-rebuilt');
    bindMore();
    bindFilterButton();
    observeDynamicUI();
    syncViewport();
    window.visualViewport?.addEventListener('resize',syncViewport,{passive:true});
    window.addEventListener('resize',syncViewport,{passive:true});
    openTreeAsDefault();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
