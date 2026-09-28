(() => {
  'use strict';

  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

  function syncMoreState(){
    const more=$('#bottomNav [data-nav="more"]');
    if(!more)return;
    const secondaryActive=['documents-view','settings-view'].some(id=>{
      const view=document.getElementById(id);
      return view && !view.hidden;
    });
    if(secondaryActive)more.classList.add('active');
    else if(!more.matches(':active'))more.classList.remove('active');
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

  function observeViews(){
    const views=$$('.view');
    if(!views.length)return;
    const observer=new MutationObserver(syncMoreState);
    views.forEach(view=>observer.observe(view,{attributes:true,attributeFilter:['hidden','class']}));
    syncMoreState();
  }

  function syncViewport(){
    const vv=window.visualViewport;
    if(!vv)return;
    document.documentElement.style.setProperty('--ios27-vv-height',`${Math.round(vv.height)}px`);
  }

  function init(){
    document.body.classList.add('ios27-mobile-ready');
    bindMore();
    observeViews();
    syncViewport();
    window.visualViewport?.addEventListener('resize',syncViewport,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
