(() => {
  'use strict';

  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  let defaultOpened=false;

  function syncMoreState(){
    const more=$('#bottomNav [data-nav="more"]');
    if(!more)return;
    const secondaryActive=['documents-view','settings-view'].some(id=>{
      const view=document.getElementById(id);
      return view && !view.hidden;
    });
    more.classList.toggle('active',secondaryActive);
  }

  function bindMore(){
    const more=$('#bottomNav [data-nav="more"]');
    const menu=$('#menuButton');
    if(!more||!menu||more.dataset.boundMore==='1')return;
    more.dataset.boundMore='1';
    more.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      menu.click();
    },true);
  }

  function decorateGenerationFilters(){
    const chips=$$('#generationChips .generation-chip');
    chips.forEach((chip,index)=>{
      const value=chip.dataset.generation;
      chip.textContent=value==='all'?'Tất cả':`Đời thứ ${value}`;
      if(index===0)chip.setAttribute('aria-label','Tất cả các đời');
    });
  }

  function decorateTree(){
    const columns=$$('#familyTree .generation-column');
    columns.forEach(column=>{
      [...column.classList].filter(name=>name.startsWith('count-')).forEach(name=>column.classList.remove(name));
      const cards=$$('.person-card',column);
      column.classList.add(`count-${Math.min(cards.length,8)}`);
      const generation=column.dataset.generation||'';
      const title=$('.generation-title',column);
      if(title)title.textContent=`ĐỜI THỨ ${generation}`;
      cards.forEach((card,index)=>{
        const avatar=$('.person-avatar',card);
        const raw=(avatar?.textContent||'').trim();
        const ancestor=card.classList.contains('ancestor');
        card.dataset.initial=ancestor?'祖':(raw||'P').slice(0,1).toUpperCase();
        card.dataset.avatar=String((index+Number(generation||1)-1)%4+1);
        if(avatar)avatar.setAttribute('aria-hidden','true');
      });
    });
  }

  function decorateAll(){
    decorateGenerationFilters();
    decorateTree();
    syncMoreState();
  }

  function observeDynamicUI(){
    const tree=document.getElementById('familyTree');
    const chips=document.getElementById('generationChips');
    const views=$$('.view');
    const observer=new MutationObserver(()=>requestAnimationFrame(decorateAll));
    if(tree)observer.observe(tree,{childList:true,subtree:true});
    if(chips)observer.observe(chips,{childList:true,subtree:true});
    views.forEach(view=>observer.observe(view,{attributes:true,attributeFilter:['hidden','class']}));
  }

  function syncViewport(){
    const vv=window.visualViewport;
    const h=vv?.height||window.innerHeight;
    document.documentElement.style.setProperty('--mobile-vv-height',`${Math.round(h)}px`);
    document.documentElement.style.setProperty('--mobile-vw',`${Math.round(window.innerWidth)}px`);
  }

  function openTreeAsDefault(){
    if(defaultOpened)return;
    defaultOpened=true;
    const treeButton=$('#bottomNav [data-nav="tree"]');
    if(treeButton){
      treeButton.click();
      requestAnimationFrame(()=>{
        window.scrollTo({top:0,left:0,behavior:'auto'});
        decorateAll();
      });
    }
  }

  function init(){
    document.body.classList.add('approved-reference-ui','mobile-tree-first');
    bindMore();
    observeDynamicUI();
    syncViewport();
    decorateAll();
    requestAnimationFrame(openTreeAsDefault);
    window.visualViewport?.addEventListener('resize',syncViewport,{passive:true});
    window.addEventListener('resize',syncViewport,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
