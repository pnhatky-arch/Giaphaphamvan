(() => {
  'use strict';
  const SESSION_KEY='giaphaphamvan_auth_session_v1';
  const GATE_VERSION_KEY='giaphaphamvan_auth_gate_revision';
  const GATE_VERSION='4';
  const DATA_KEYS=['giaphaphamvan_data_v1__pham-van-family','giaphaphamvan_sample_data_v1__pham-van-family'];
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  document.body.dataset.authenticated='false';
  const bootstrapStyle=document.createElement('style');
  bootstrapStyle.id='phamvan-auth-bootstrap-style';
  bootstrapStyle.textContent='body[data-authenticated="false"] .app-shell{visibility:hidden!important;pointer-events:none!important}';
  document.head.appendChild(bootstrapStyle);

  if(localStorage.getItem(GATE_VERSION_KEY)!==GATE_VERSION){
    localStorage.removeItem(SESSION_KEY);
    localStorage.setItem(GATE_VERSION_KEY,GATE_VERSION);
  }

  DATA_KEYS.forEach(key=>{
    try{
      const raw=localStorage.getItem(key);if(!raw)return;
      const data=JSON.parse(raw);const account=data?.account;
      if(account&&(account.user==='local-family'||account.name==='Gia phả họ Phạm Văn')){
        delete data.account;data.updatedAt=new Date().toISOString();localStorage.setItem(key,JSON.stringify(data));
      }
    }catch{}
  });

  const card=document.querySelector('.account-card');
  if(card){
    const avatar=card.querySelector('.account-avatar'),title=card.querySelector('strong'),subtitle=card.querySelector('#accountIdText'),pill=card.querySelector('.status-pill');
    if(avatar)avatar.textContent='?';if(title)title.textContent='Chưa đăng nhập';if(subtitle)subtitle.textContent='Tài khoản người dùng';if(pill)pill.textContent='OFFLINE';
  }
  const accountButton=document.getElementById('accountButton');if(accountButton)accountButton.textContent='?';

  function installTheme(){
    if($('#phamvan-dongson-auth-style'))return;
    const style=document.createElement('style');style.id='phamvan-dongson-auth-style';style.textContent=`
      #authGate.auth-gate{z-index:3000!important;inset:0!important;padding:0!important;display:block!important;background:#4c0508!important;overflow:hidden!important}
      #authGate[hidden]{display:none!important}
      #authGate .auth-card{display:none!important}
      .pv-auth{position:absolute;inset:0;overflow:auto;color:#fff4dd;background:#5c080c url('/auth-dongson.svg?v=1') center top/cover no-repeat;-webkit-overflow-scrolling:touch}
      .pv-auth::before{content:'';position:fixed;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(67,2,6,.08),rgba(64,2,6,.35) 54%,rgba(45,1,4,.55));z-index:0}
      .pv-page{position:relative;z-index:1;min-height:100svh;box-sizing:border-box;padding:calc(env(safe-area-inset-top) + 18px) 18px calc(env(safe-area-inset-bottom) + 22px);display:flex;flex-direction:column}
      .pv-page[hidden]{display:none!important}
      .pv-welcome{justify-content:flex-end;text-align:center;padding-top:calc(env(safe-area-inset-top) + 30px)}
      .pv-drum{width:min(74vw,330px);aspect-ratio:1;border-radius:50%;margin:0 auto;background:url('/auth-dongson.svg?v=1') 50% 7%/100% auto no-repeat;border:1px solid rgba(255,221,145,.55);box-shadow:0 0 0 7px rgba(255,195,89,.05),0 0 42px rgba(255,176,54,.30),inset 0 0 34px rgba(78,5,7,.36)}
      .pv-welcome .pv-drum{margin-top:2vh}
      .pv-titleplate{width:min(86%,390px);margin:-18px auto 0;padding:14px 20px 13px;border-radius:20px;border:1px solid rgba(255,221,145,.67);background:linear-gradient(180deg,rgba(121,13,18,.95),rgba(78,4,9,.94));box-shadow:0 18px 34px rgba(35,0,2,.35),inset 0 1px rgba(255,244,213,.18)}
      .pv-titleplate strong,.pv-heading,.pv-brand{font-family:Georgia,'Times New Roman',serif;color:#ffe1a0;text-shadow:0 1px 0 rgba(0,0,0,.22)}
      .pv-titleplate strong{display:block;font-size:clamp(28px,7.4vw,38px);line-height:1.05;letter-spacing:.01em}
      .pv-motto{margin:13px 0 0;color:#ffe0aa;font:500 16px/1.35 Georgia,'Times New Roman',serif}
      .pv-divider{display:flex;align-items:center;justify-content:center;gap:8px;margin:9px auto 4px;color:#f0c96f}.pv-divider::before,.pv-divider::after{content:'';width:50px;height:1px;background:#d5a447}
      .pv-actions{display:grid;gap:10px;margin-top:14px}
      .pv-btn{appearance:none;min-height:60px;border-radius:999px;border:1px solid rgba(255,224,158,.68);display:flex;align-items:center;justify-content:center;gap:10px;font-size:17px;font-weight:850;letter-spacing:.01em}
      .pv-btn.primary{background:linear-gradient(180deg,#ba1d25,#7b070e);color:#fff4dc;box-shadow:0 11px 27px rgba(49,0,3,.34),inset 0 1px rgba(255,236,204,.22)}
      .pv-btn.secondary{background:linear-gradient(180deg,rgba(255,243,216,.98),rgba(229,192,127,.96));color:#54210d;box-shadow:0 9px 22px rgba(49,0,3,.24),inset 0 1px rgba(255,255,255,.72)}
      .pv-btn.ghost{min-height:46px;background:rgba(77,3,7,.55);color:#fff1d0;font-size:13px;font-weight:750}
      .pv-back{position:absolute;left:18px;top:calc(env(safe-area-inset-top) + 18px);width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,230,180,.28);background:rgba(255,245,231,.10);color:#fff0ce;font-size:29px;line-height:1;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
      .pv-form-page{padding-top:calc(env(safe-area-inset-top) + 18px)}
      .pv-form-hero{text-align:center;padding:4px 0 10px}
      .pv-heading{margin:0;font-size:29px}
      .pv-mini-drum{width:142px;aspect-ratio:1;margin:10px auto 6px;border-radius:50%;background:url('/auth-dongson.svg?v=1') 50% 7%/100% auto no-repeat;border:1px solid rgba(255,220,145,.55);box-shadow:0 0 32px rgba(255,177,52,.26),inset 0 0 28px rgba(70,4,7,.38)}
      .pv-brand{font-size:18px;font-weight:700;letter-spacing:.03em}
      .pv-copy{max-width:320px;margin:5px auto 0;color:#f3dcc0;font-size:12px;line-height:1.5}
      .pv-glass{margin-top:7px;padding:16px;border-radius:25px;border:1px solid rgba(255,235,205,.38);background:linear-gradient(160deg,rgba(255,242,221,.20),rgba(229,168,124,.13));-webkit-backdrop-filter:blur(24px) saturate(1.08);backdrop-filter:blur(24px) saturate(1.08);box-shadow:0 18px 44px rgba(31,0,2,.28),inset 0 1px rgba(255,255,255,.16)}
      .pv-field{display:grid;gap:5px;margin-bottom:11px;text-align:left}.pv-field span{font-size:10px;color:#f0d7b9}.pv-field input{box-sizing:border-box;width:100%;min-height:54px;border-radius:18px;border:1px solid rgba(255,244,227,.46);background:rgba(63,7,11,.22);color:#fff8ea;padding:0 15px;font-size:15px;outline:none}.pv-field input::placeholder{color:rgba(255,242,222,.68)}.pv-field input:focus{border-color:#efc66f;box-shadow:0 0 0 3px rgba(239,198,111,.12)}
      .pv-check{display:flex;align-items:center;gap:8px;margin:3px 0 14px;color:#f3dec8;font-size:11px}.pv-check input{width:18px;height:18px;accent-color:#b71922}
      .pv-submit{width:100%;min-height:57px;border-radius:999px;border:1px solid rgba(255,222,149,.72);background:linear-gradient(180deg,#b91c24,#7d070f);color:#fff4dc;font:800 18px Georgia,'Times New Roman',serif;box-shadow:0 8px 23px rgba(49,0,3,.30),inset 0 1px rgba(255,239,208,.23)}
      .pv-message{min-height:17px;margin:8px 2px 0;color:#ffd7b8;font-size:10px;line-height:1.45}
      .pv-foot{display:flex;justify-content:space-between;gap:12px;margin:14px 2px 0;color:#f4dcc1;font-size:10px}.pv-link{border:0;background:transparent;color:#ffda86;padding:0;font:inherit}
      .pv-register-note{margin:12px 0 0;padding:10px 12px;border-radius:14px;background:rgba(255,245,228,.10);color:#e9d2ba;font-size:9px;line-height:1.5}
      .pv-info{position:fixed;z-index:3400;inset:0;display:grid;place-items:center;padding:18px;background:rgba(35,1,4,.70);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
      .pv-info-card{width:min(100%,380px);box-sizing:border-box;padding:18px;border:1px solid rgba(255,223,155,.50);border-radius:24px;background:linear-gradient(155deg,#801017,#4e0408);box-shadow:0 28px 68px rgba(0,0,0,.36);color:#f6e3cb}.pv-info-card h3{margin:0 0 8px;color:#ffe1a0;font:700 22px Georgia,serif}.pv-info-card p{margin:0;color:#efd5b9;font-size:11px;line-height:1.58}.pv-info-card button{width:100%;min-height:46px;margin-top:15px;border-radius:999px;border:1px solid rgba(255,224,159,.54);background:#a9161f;color:#fff4dc;font-weight:800}
      @media (min-width:700px){.pv-page{max-width:480px;margin:auto}.pv-auth{background-size:auto 110%;background-position:center top}.pv-welcome .pv-drum{width:300px}}
    `;document.head.appendChild(style);
  }

  function markup(){return `<div class="pv-auth" id="pvAuthShell">
    <section class="pv-page pv-welcome" data-pv-screen="welcome">
      <div class="pv-drum" aria-hidden="true"></div>
      <div class="pv-titleplate"><strong>GIA PHẢ<br>HỌ PHẠM VĂN</strong></div>
      <p class="pv-motto">Giữ cội nguồn · Kết nối muôn đời</p><div class="pv-divider">◆</div>
      <div class="pv-actions"><button type="button" class="pv-btn primary" data-pv-open="login">♙ <span>Đăng nhập</span> ›</button><button type="button" class="pv-btn secondary" data-pv-open="register">♙＋ <span>Đăng ký tài khoản</span> ›</button><button type="button" class="pv-btn ghost" data-pv-intro>ⓘ <span>Giới thiệu ứng dụng</span></button></div>
    </section>
    <section class="pv-page pv-form-page" data-pv-screen="login" hidden><button type="button" class="pv-back" data-pv-open="welcome">‹</button><div class="pv-form-hero"><h1 class="pv-heading">Đăng nhập</h1><div class="pv-mini-drum" aria-hidden="true"></div><div class="pv-brand">GIA PHẢ HỌ PHẠM VĂN</div><div class="pv-divider">◆</div><p class="pv-copy">Đăng nhập để sử dụng đầy đủ các chức năng của hệ thống</p></div><form class="pv-glass" id="pvLoginForm"><label class="pv-field"><span>Tên đăng nhập</span><input name="username" autocomplete="username" placeholder="Tên đăng nhập" required></label><label class="pv-field"><span>Mật khẩu</span><input name="password" type="password" autocomplete="current-password" placeholder="Mật khẩu" required></label><label class="pv-check"><input type="checkbox" checked><span>Lưu đăng nhập trên thiết bị này</span></label><button class="pv-submit" type="submit">Đăng nhập ›</button><div class="pv-message" id="pvLoginMessage"></div></form><div class="pv-foot"><button type="button" class="pv-link" data-pv-forgot>Quên mật khẩu?</button><button type="button" class="pv-link" data-pv-open="register">Chưa có tài khoản? Đăng ký</button></div></section>
    <section class="pv-page pv-form-page" data-pv-screen="register" hidden><button type="button" class="pv-back" data-pv-open="welcome">‹</button><div class="pv-form-hero"><h1 class="pv-heading">Đăng ký tài khoản</h1><div class="pv-mini-drum" aria-hidden="true"></div><div class="pv-brand">GIA PHẢ HỌ PHẠM VĂN</div><div class="pv-divider">◆</div><p class="pv-copy">Tạo tài khoản để sử dụng đầy đủ các chức năng của hệ thống</p></div><form class="pv-glass" id="pvRegisterForm"><label class="pv-field"><span>Tên hiển thị</span><input name="displayName" autocomplete="name" placeholder="Tên hiển thị" required></label><label class="pv-field"><span>Tên đăng nhập</span><input name="username" autocomplete="username" placeholder="Tên đăng nhập" required></label><label class="pv-field"><span>Mật khẩu</span><input name="password" type="password" autocomplete="new-password" placeholder="Mật khẩu" minlength="6" required></label><label class="pv-field"><span>Nhập lại mật khẩu</span><input name="confirmPassword" type="password" autocomplete="new-password" placeholder="Nhập lại mật khẩu" minlength="6" required></label><label class="pv-field"><span>Email (tùy chọn)</span><input name="email" type="email" autocomplete="email" placeholder="Email để khôi phục sau này"></label><button class="pv-submit" type="submit">Đăng ký ›</button><div class="pv-message" id="pvRegisterMessage"></div><div class="pv-register-note">Bằng việc đăng ký, bạn đồng ý sử dụng ứng dụng cho mục đích lưu trữ và quản lý gia phả dòng họ.</div></form></section>
  </div>`;}

  function showScreen(name,gate){$$('[data-pv-screen]',gate).forEach(node=>node.hidden=node.dataset.pvScreen!==name);gate.querySelector('.pv-auth')?.scrollTo({top:0,behavior:'instant'});}
  function showInfo(title,message){const wrap=document.createElement('div');wrap.className='pv-info';wrap.innerHTML=`<div class="pv-info-card"><h3>${title}</h3><p>${message}</p><button type="button">Đóng</button></div>`;document.body.appendChild(wrap);wrap.querySelector('button').onclick=()=>wrap.remove();wrap.onclick=e=>{if(e.target===wrap)wrap.remove();};}

  function mountGate(){
    const gate=$('#authGate');if(!gate||gate.dataset.pvDongson==='1')return false;
    installTheme();gate.dataset.pvDongson='1';gate.innerHTML=markup();
    $$('[data-pv-open]',gate).forEach(btn=>btn.addEventListener('click',()=>showScreen(btn.dataset.pvOpen,gate)));
    $('[data-pv-intro]',gate)?.addEventListener('click',()=>showInfo('Gia phả họ Phạm Văn','Ứng dụng lưu trữ gia phả theo hướng local-first, hỗ trợ cây gia phả, thành viên, sự kiện, tư liệu, sao lưu và lịch sử chỉnh sửa.'));
    $('[data-pv-forgot]',gate)?.addEventListener('click',()=>showInfo('Khôi phục mật khẩu','Khôi phục mật khẩu qua email sẽ được bổ sung khi lớp tài khoản máy chủ được triển khai.'));
    $('#pvLoginForm',gate)?.addEventListener('submit',async e=>{e.preventDefault();const msg=$('#pvLoginMessage',gate);msg.textContent='';const values=Object.fromEntries(new FormData(e.currentTarget).entries());try{if(!window.PhamVanAuth)throw new Error('Hệ thống tài khoản chưa sẵn sàng');await window.PhamVanAuth.login(values.username,values.password);location.reload();}catch(error){msg.textContent=error.message||'Không đăng nhập được';}});
    $('#pvRegisterForm',gate)?.addEventListener('submit',async e=>{e.preventDefault();const msg=$('#pvRegisterMessage',gate);msg.textContent='';const values=Object.fromEntries(new FormData(e.currentTarget).entries());if(values.password!==values.confirmPassword){msg.textContent='Hai mật khẩu chưa trùng nhau.';return;}try{if(!window.PhamVanAuth)throw new Error('Hệ thống tài khoản chưa sẵn sàng');await window.PhamVanAuth.register(values);location.reload();}catch(error){msg.textContent=error.message||'Không đăng ký được';}});
    showScreen('welcome',gate);return true;
  }

  installTheme();
  const observer=new MutationObserver(()=>{mountGate();});observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountGate,{once:true});else mountGate();
  setTimeout(mountGate,0);setTimeout(mountGate,250);setTimeout(mountGate,1000);
})();