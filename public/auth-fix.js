(() => {
  'use strict';
  const SESSION_KEY='giaphaphamvan_auth_session_v1';
  const GATE_VERSION_KEY='giaphaphamvan_auth_gate_revision';
  const GATE_VERSION='3';
  const DATA_KEYS=['giaphaphamvan_data_v1__pham-van-family','giaphaphamvan_sample_data_v1__pham-van-family'];

  document.body.dataset.authenticated='false';
  const style=document.createElement('style');
  style.id='phamvan-auth-bootstrap-style';
  style.textContent='body[data-authenticated="false"] .app-shell{visibility:hidden!important;pointer-events:none!important}';
  document.head.appendChild(style);

  if(localStorage.getItem(GATE_VERSION_KEY)!==GATE_VERSION){
    localStorage.removeItem(SESSION_KEY);
    localStorage.setItem(GATE_VERSION_KEY,GATE_VERSION);
  }

  DATA_KEYS.forEach(key=>{
    try{
      const raw=localStorage.getItem(key);
      if(!raw)return;
      const data=JSON.parse(raw);
      const account=data?.account;
      if(account&&(account.user==='local-family'||account.name==='Gia phả họ Phạm Văn')){
        delete data.account;
        data.updatedAt=new Date().toISOString();
        localStorage.setItem(key,JSON.stringify(data));
      }
    }catch{}
  });

  const card=document.querySelector('.account-card');
  if(card){
    const avatar=card.querySelector('.account-avatar');
    const title=card.querySelector('strong');
    const subtitle=card.querySelector('#accountIdText');
    const pill=card.querySelector('.status-pill');
    if(avatar)avatar.textContent='?';
    if(title)title.textContent='Chưa đăng nhập';
    if(subtitle)subtitle.textContent='Tài khoản người dùng';
    if(pill)pill.textContent='OFFLINE';
  }
  const accountButton=document.getElementById('accountButton');
  if(accountButton)accountButton.textContent='?';

  if(!document.querySelector('script[data-phamvan-auth-theme]')){
    const script=document.createElement('script');
    script.src='/auth-theme.js?v=1';
    script.dataset.phamvanAuthTheme='1';
    script.defer=true;
    document.head.appendChild(script);
  }
})();