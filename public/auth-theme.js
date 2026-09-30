(() => {
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const Auth=()=>window.PhamVanAuth;

  function installStyle(){
    if($('#phamvan-auth-theme-style'))return;
    const style=document.createElement('style');
    style.id='phamvan-auth-theme-style';
    style.textContent=`
      #authGate.auth-gate{padding:0!important;place-items:stretch!important;background:#65080d!important;overflow:hidden!important}
      #authGate .auth-card{display:none!important}
      .heritage-auth{position:relative;isolation:isolate;min-height:100svh;width:100%;overflow:auto;color:#fff4dc;background:#65080d}
      .heritage-auth::before{content:'';position:fixed;inset:0;z-index:-3;background:linear-gradient(180deg,rgba(72,3,8,.14),rgba(82,4,10,.70)),url('/heritage-approved-full.webp?v=4') center/cover no-repeat;filter:saturate(1.16) contrast(1.03)}
      .heritage-auth::after{content:'';position:fixed;inset:0;z-index:-2;background:radial-gradient(circle at 50% 14%,rgba(255,202,99,.14),transparent 29%),linear-gradient(180deg,rgba(71,3,8,.08),rgba(71,3,8,.62))}
      .heritage-auth-page{min-height:100svh;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top) + 18px) 18px calc(env(safe-area-inset-bottom) + 18px);box-sizing:border-box}
      .heritage-auth-page[hidden]{display:none!important}
      .heritage-auth-back{align-self:flex-start;width:44px;height:44px;border-radius:999px;border:1px solid rgba(255,229,171,.25);background:rgba(255,245,227,.10);color:#fff1d2;font-size:28px;line-height:1;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:inset 0 1px rgba(255,255,255,.14)}
      .heritage-auth-hero{display:flex;flex-direction:column;align-items:center;text-align:center;margin:auto 0 18px}
      .heritage-auth-drum{width:min(64vw,270px);aspect-ratio:1;border-radius:50%;position:relative;background:url('/heritage-approved-full.webp?v=4') 50% 11%/190% auto no-repeat;border:1px solid rgba(255,214,126,.46);box-shadow:0 0 0 8px rgba(255,179,72,.04),0 0 46px rgba(255,172,48,.22),inset 0 0 38px rgba(52,4,6,.34)}
      .heritage-auth-drum::after{content:'';position:absolute;inset:16%;border-radius:50%;border:1px solid rgba(255,225,160,.55);box-shadow:inset 0 0 22px rgba(255,181,68,.18)}
      .heritage-auth-titleplate{margin-top:-8px;padding:14px 25px 12px;border:1px solid rgba(255,218,139,.58);border-radius:18px;background:linear-gradient(180deg,rgba(118,12,18,.90),rgba(84,5,11,.88));box-shadow:0 12px 30px rgba(35,0,2,.28),inset 0 1px rgba(255,233,184,.18)}
      .heritage-auth-titleplate strong,.heritage-auth-heading{font-family:Georgia,'Times New Roman',serif;color:#ffe3a5;text-shadow:0 1px 0 rgba(0,0,0,.18)}
      .heritage-auth-titleplate strong{display:block;font-size:clamp(26px,7vw,34px);line-height:1.05;letter-spacing:.01em}
      .heritage-auth-motto{margin:13px 0 0;color:#ffdfaa;font:500 15px/1.45 Georgia,'Times New Roman',serif}
      .heritage-divider{display:flex;align-items:center;justify-content:center;gap:8px;margin:10px auto;color:#edc76c}.heritage-divider::before,.heritage-divider::after{content:'';width:56px;height:1px;background:linear-gradient(90deg,transparent,#d8ab4a)}.heritage-divider::after{transform:scaleX(-1)}
      .heritage-welcome-actions{display:grid;gap:10px;margin-top:auto;padding-top:14px}
      .heritage-btn{min-height:58px;border-radius:999px;border:1px solid rgba(255,221,155,.62);display:flex;align-items:center;justify-content:center;gap:11px;font-weight:850;font-size:17px;letter-spacing:.01em}
      .heritage-btn.primary{background:linear-gradient(180deg,#b21922,#7f0710);color:#fff5de;box-shadow:0 10px 24px rgba(57,0,4,.30),inset 0 1px rgba(255,232,191,.20)}
      .heritage-btn.secondary{background:linear-gradient(180deg,rgba(255,242,212,.94),rgba(229,193,132,.94));color:#58240f;box-shadow:0 10px 20px rgba(57,0,4,.20),inset 0 1px rgba(255,255,255,.62)}
      .heritage-btn.ghost{min-height:44px;background:rgba(92,7,12,.52);color:#fff0d0;font-size:13px;font-weight:750}
      .heritage-auth-form-page .heritage-auth-hero{margin:8px 0 12px}
      .heritage-auth-form-page .heritage-auth-drum{width:138px}
      .heritage-auth-heading{margin:4px 0 0;font-size:28px}
      .heritage-auth-brand{margin:10px 0 4px;font:700 18px/1.2 Georgia,'Times New Roman',serif;color:#ffe3a5;letter-spacing:.02em}
      .heritage-auth-copy{margin:5px auto 0;max-width:320px;color:#f5dfc2;font-size:12px;line-height:1.55}
      .heritage-glass{margin-top:6px;padding:16px;border-radius:24px;border:1px solid rgba(255,236,207,.36);background:linear-gradient(160deg,rgba(255,244,226,.18),rgba(235,184,138,.13));-webkit-backdrop-filter:blur(22px) saturate(1.12);backdrop-filter:blur(22px) saturate(1.12);box-shadow:0 18px 42px rgba(32,0,2,.24),inset 0 1px rgba(255,255,255,.15)}
      .heritage-field{display:grid;gap:5px;margin-bottom:11px}.heritage-field span{font-size:10px;color:#efd7ba}.heritage-field input{box-sizing:border-box;width:100%;min-height:54px;border-radius:17px;border:1px solid rgba(255,244,227,.45);background:rgba(62,8,12,.20);color:#fff7e9;padding:0 15px;font-size:15px;outline:none}.heritage-field input::placeholder{color:rgba(255,242,222,.68)}.heritage-field input:focus{border-color:#f0c56e;box-shadow:0 0 0 3px rgba(240,197,110,.11)}
      .heritage-check{display:flex;align-items:center;gap:8px;margin:4px 0 14px;color:#f4dfc7;font-size:11px}.heritage-check input{width:18px;height:18px;accent-color:#b11a21}
      .heritage-submit{width:100%;min-height:56px;border-radius:999px;border:1px solid rgba(255,219,143,.70);background:linear-gradient(180deg,#b11b23,#7e0710);color:#fff4dd;font:800 18px Georgia,'Times New Roman',serif;box-shadow:inset 0 1px rgba(255,238,206,.24),0 8px 22px rgba(52,0,3,.25)}
      .heritage-form-foot{display:flex;justify-content:space-between;gap:10px;margin:14px 2px 0;color:#f4ddc2;font-size:10px}.heritage-link{border:0;background:transparent;color:#ffd985;padding:0;text-decoration:none;font:inherit}
      .heritage-auth-message{min-height:18px;margin:8px 3px 0;color:#ffd6b8;font-size:10px;line-height:1.45}
      .heritage-register-note{margin:12px 0 0;padding:11px 12px;border-radius:14px;background:rgba(255,245,227,.10);color:#e9d2bb;font-size:9px;line-height:1.5}
      .heritage-info{position:fixed;z-index:2300;inset:0;display:grid;place-items:center;padding:18px;background:rgba(40,2,5,.68);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}.heritage-info-card{width:min(100%,380px);border:1px solid rgba(255,224,158,.45);border-radius:24px;padding:18px;background:linear-gradient(155deg,#7e0b13,#4f0409);box-shadow:0 28px 70px rgba(0,0,0,.34);color:#f8e7d1}.heritage-info-card h3{margin:0 0 8px;color:#ffe1a2;font:700 22px Georgia,serif}.heritage-info-card p{margin:0;color:#f1d8bd;font-size:11px;line-height:1.6}.heritage-info-card button{margin-top:15px;width:100%;min-height:46px;border-radius:999px;border:1px solid rgba(255,223,153,.55);background:#a9161f;color:#fff4dd;font-weight:800}
      @media (min-width:700px){.heritage-auth-page{max-width:480px;margin:auto}.heritage-auth{background:#52060a}.heritage-auth::before{background-size:900px auto;background-position:center top}.heritage-auth-drum{width:245px}}
    `;
    document.head.appendChild(style);
  }

  function template(){
    return `<div class="heritage-auth" id="heritageAuthShell">
      <section class="heritage-auth-page" data-auth-screen="welcome">
        <div class="heritage-auth-hero">
          <div class="heritage-auth-drum" aria-hidden="true"></div>
          <div class="heritage-auth-titleplate"><strong>GIA PHẢ<br>HỌ PHẠM VĂN</strong></div>
          <p class="heritage-auth-motto">Giữ cội nguồn · Kết nối muôn đời</p>
          <div class="heritage-divider">◆</div>
        </div>
        <div class="heritage-welcome-actions">
          <button type="button" class="heritage-btn primary" data-open-auth="login">♙ <span>Đăng nhập</span> ›</button>
          <button type="button" class="heritage-btn secondary" data-open-auth="register">♙＋ <span>Đăng ký tài khoản</span> ›</button>
          <button type="button" class="heritage-btn ghost" data-open-intro>ⓘ <span>Giới thiệu ứng dụng</span></button>
        </div>
      </section>
      <section class="heritage-auth-page heritage-auth-form-page" data-auth-screen="login" hidden>
        <button type="button" class="heritage-auth-back" data-open-auth="welcome">‹</button>
        <div class="heritage-auth-hero">
          <h1 class="heritage-auth-heading">Đăng nhập</h1>
          <div class="heritage-auth-drum" aria-hidden="true"></div>
          <div class="heritage-auth-brand">GIA PHẢ HỌ PHẠM VĂN</div>
          <div class="heritage-divider">◆</div>
          <p class="heritage-auth-copy">Đăng nhập để sử dụng đầy đủ các chức năng của hệ thống</p>
        </div>
        <form class="heritage-glass" id="heritageLoginForm">
          <label class="heritage-field"><span>Tên đăng nhập</span><input name="username" autocomplete="username" placeholder="Tên đăng nhập" required></label>
          <label class="heritage-field"><span>Mật khẩu</span><input name="password" type="password" autocomplete="current-password" placeholder="Mật khẩu" required></label>
          <label class="heritage-check"><input name="remember" type="checkbox" checked><span>Lưu đăng nhập trên thiết bị này</span></label>
          <button class="heritage-submit" type="submit">Đăng nhập ›</button>
          <div class="heritage-auth-message" id="heritageLoginMessage"></div>
        </form>
        <div class="heritage-form-foot"><button class="heritage-link" type="button" data-forgot>Quên mật khẩu?</button><button class="heritage-link" type="button" data-open-auth="register">Chưa có tài khoản? Đăng ký</button></div>
      </section>
      <section class="heritage-auth-page heritage-auth-form-page" data-auth-screen="register" hidden>
        <button type="button" class="heritage-auth-back" data-open-auth="welcome">‹</button>
        <div class="heritage-auth-hero">
          <h1 class="heritage-auth-heading">Đăng ký tài khoản</h1>
          <div class="heritage-auth-drum" aria-hidden="true"></div>
          <div class="heritage-auth-brand">GIA PHẢ HỌ PHẠM VĂN</div>
          <div class="heritage-divider">◆</div>
          <p class="heritage-auth-copy">Tạo tài khoản để sử dụng đầy đủ các chức năng của hệ thống</p>
        </div>
        <form class="heritage-glass" id="heritageRegisterForm">
          <label class="heritage-field"><span>Tên hiển thị</span><input name="displayName" autocomplete="name" placeholder="Tên hiển thị" required></label>
          <label class="heritage-field"><span>Tên đăng nhập</span><input name="username" autocomplete="username" placeholder="Tên đăng nhập" required></label>
          <label class="heritage-field"><span>Mật khẩu</span><input name="password" type="password" autocomplete="new-password" placeholder="Mật khẩu" minlength="6" required></label>
          <label class="heritage-field"><span>Nhập lại mật khẩu</span><input name="confirmPassword" type="password" autocomplete="new-password" placeholder="Nhập lại mật khẩu" minlength="6" required></label>
          <label class="heritage-field"><span>Email (tùy chọn)</span><input name="email" type="email" autocomplete="email" placeholder="Email để khôi phục sau này"></label>
          <button class="heritage-submit" type="submit">Đăng ký ›</button>
          <div class="heritage-auth-message" id="heritageRegisterMessage"></div>
          <div class="heritage-register-note">Bằng việc đăng ký, bạn đồng ý sử dụng ứng dụng cho mục đích lưu trữ và quản lý gia phả dòng họ trên thiết bị.</div>
        </form>
      </section>
    </div>`;
  }

  function showScreen(name){
    $$('[data-auth-screen]').forEach(screen=>screen.hidden=screen.dataset.authScreen!==name);
    document.querySelector('.heritage-auth')?.scrollTo({top:0,behavior:'instant'});
  }

  function showInfo(title,message){
    const wrap=document.createElement('div');wrap.className='heritage-info';wrap.innerHTML=`<div class="heritage-info-card"><h3>${title}</h3><p>${message}</p><button type="button">Đóng</button></div>`;document.body.appendChild(wrap);wrap.querySelector('button').addEventListener('click',()=>wrap.remove());wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.remove();});
  }

  function mount(){
    const gate=$('#authGate');
    if(!gate||gate.dataset.heritageTheme==='1')return false;
    gate.dataset.heritageTheme='1';
    gate.innerHTML=template();
    $$('[data-open-auth]',gate).forEach(btn=>btn.addEventListener('click',()=>showScreen(btn.dataset.openAuth)));
    $('[data-open-intro]',gate)?.addEventListener('click',()=>showInfo('Gia phả họ Phạm Văn','Ứng dụng lưu trữ gia phả theo hướng local-first, hỗ trợ thành viên, cây gia phả, sự kiện, tư liệu, sao lưu và lịch sử chỉnh sửa.'));
    $('[data-forgot]',gate)?.addEventListener('click',()=>showInfo('Khôi phục mật khẩu','Chức năng khôi phục tài khoản sẽ được bổ sung ở lớp tài khoản máy chủ. Tài khoản hiện tại đang được quản lý cục bộ trên thiết bị.'));
    $('#heritageLoginForm',gate)?.addEventListener('submit',async e=>{
      e.preventDefault();const message=$('#heritageLoginMessage',gate);message.textContent='';
      const values=Object.fromEntries(new FormData(e.currentTarget).entries());
      try{await Auth()?.login(values.username,values.password);location.reload();}catch(error){message.textContent=error.message||'Không đăng nhập được';}
    });
    $('#heritageRegisterForm',gate)?.addEventListener('submit',async e=>{
      e.preventDefault();const message=$('#heritageRegisterMessage',gate);message.textContent='';
      const values=Object.fromEntries(new FormData(e.currentTarget).entries());
      if(values.password!==values.confirmPassword){message.textContent='Hai mật khẩu chưa trùng nhau.';return;}
      try{await Auth()?.register(values);location.reload();}catch(error){message.textContent=error.message||'Không đăng ký được';}
    });
    showScreen('welcome');
    return true;
  }

  function boot(){
    installStyle();
    if(mount())return;
    const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>{mount();observer.disconnect();},5000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();