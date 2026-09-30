(() => {
  'use strict';

  const Store = window.PhamVanStore;
  if (!Store) return;

  const USERS_KEY = 'giaphaphamvan_auth_users_v1';
  const SESSION_KEY = 'giaphaphamvan_auth_session_v1';
  const ROOT_USERNAME = 'devphamgia';
  const ROOT_PASSWORD = 'devphamgia';
  const ROOT_DISPLAY_NAME = 'devphamgia';
  const TRACKED_FIELDS = [
    ['name','Họ và tên'],['generation','Đời'],['parentId','Cha / mẹ'],['role','Vai trò'],
    ['gender','Giới tính'],['birthDate','Ngày sinh'],['deathDate','Ngày mất'],['spouse','Vợ / chồng'],
    ['hometown','Quê quán'],['occupation','Nghề nghiệp'],['note','Ghi chú'],['avatarPhotoId','Ảnh đại diện']
  ];

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clone=v=>JSON.parse(JSON.stringify(v));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid=p=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  const now=()=>new Date().toISOString();
  const normalizeUsername=value=>String(value||'').trim().toLowerCase();
  const formatDateTime=value=>{
    const d=new Date(value||'');
    return Number.isNaN(d.getTime())?'Không xác định':new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);
  };

  function randomSalt(){
    const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);return [...bytes].map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  async function hashPassword(password,salt){
    const data=new TextEncoder().encode(`${salt}:${password}`);
    const digest=await crypto.subtle.digest('SHA-256',data);
    return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  function loadUsers(){try{const value=JSON.parse(localStorage.getItem(USERS_KEY)||'[]');return Array.isArray(value)?value:[];}catch{return [];}}
  function saveUsers(users){localStorage.setItem(USERS_KEY,JSON.stringify(users));}
  function publicUser(user){if(!user)return null;const {passwordHash,salt,...safe}=user;return clone(safe);}
  function currentUser(){
    const id=localStorage.getItem(SESSION_KEY);if(!id)return null;
    return publicUser(loadUsers().find(user=>user.id===id)||null);
  }
  function actorSnapshot(){
    const user=currentUser();
    return user?{userId:user.id,username:user.username,displayName:user.displayName,role:user.role}:{userId:'system',username:'system',displayName:'Hệ thống',role:'system'};
  }
  async function ensureRoot(){
    const users=loadUsers();
    if(users.some(user=>user.username===ROOT_USERNAME))return;
    const salt=randomSalt();
    users.push({id:'root-devphamgia',username:ROOT_USERNAME,displayName:ROOT_DISPLAY_NAME,role:'root',capabilities:['*'],salt,passwordHash:await hashPassword(ROOT_PASSWORD,salt),createdAt:now(),system:true});
    saveUsers(users);
  }
  async function register({displayName,username,password}){
    const clean=normalizeUsername(username);
    if(!/^[a-z0-9._-]{3,32}$/.test(clean))throw new Error('Tên đăng nhập phải dài 3–32 ký tự, chỉ dùng chữ thường, số, dấu chấm, gạch dưới hoặc gạch ngang.');
    if(String(password||'').length<6)throw new Error('Mật khẩu cần ít nhất 6 ký tự.');
    const users=loadUsers();
    if(users.some(user=>user.username===clean))throw new Error('Tên đăng nhập đã tồn tại.');
    const salt=randomSalt();
    const user={id:uid('user'),username:clean,displayName:String(displayName||clean).trim()||clean,role:'member',capabilities:['app:full'],salt,passwordHash:await hashPassword(password,salt),createdAt:now(),system:false};
    users.push(user);saveUsers(users);localStorage.setItem(SESSION_KEY,user.id);return publicUser(user);
  }
  async function login(username,password){
    const clean=normalizeUsername(username);const user=loadUsers().find(item=>item.username===clean);
    if(!user)throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
    const digest=await hashPassword(String(password||''),user.salt);
    if(digest!==user.passwordHash)throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
    localStorage.setItem(SESSION_KEY,user.id);return publicUser(user);
  }
  function logout(){localStorage.removeItem(SESSION_KEY);renderAuthGate();}

  function meaningful(value){if(value===null||value===undefined||value==='')return '—';return String(value);}
  function memberDiff(before,after){
    const changes=[];
    TRACKED_FIELDS.forEach(([key,label])=>{
      const a=meaningful(before?.[key]),b=meaningful(after?.[key]);
      if(a!==b)changes.push({field:key,label,before:a,after:b});
    });
    const beforePhotos=Array.isArray(before?.photos)?before.photos.length:0;
    const afterPhotos=Array.isArray(after?.photos)?after.photos.length:0;
    if(beforePhotos!==afterPhotos)changes.push({field:'photos',label:'Kho ảnh',before:String(beforePhotos),after:String(afterPhotos)});
    return changes;
  }
  function legacyHistory(member,data){
    const recordedAt=data?.updatedAt||now();
    if(member?.sample){
      return [{id:uid('audit'),type:'created',at:recordedAt,actor:{userId:'sample-generator',username:'sample-generator',displayName:'Bộ tạo dữ liệu mẫu',role:'system'},note:'Thành viên được tạo tự động trong vùng dữ liệu mẫu.',changes:[]}];
    }
    return [{id:uid('audit'),type:'legacy',at:recordedAt,actor:{userId:'legacy',username:'legacy',displayName:'Dữ liệu có trước lịch sử',role:'system'},note:'Bản ghi đã tồn tại trước khi chức năng lịch sử được bật. Người khởi tạo và thời điểm khởi tạo gốc chưa được lưu, nên hệ thống chỉ ghi thời điểm bắt đầu theo dõi.',changes:[]}];
  }
  function ensureHistory(member,data){
    if(Array.isArray(member.auditHistory)&&member.auditHistory.length)return member.auditHistory.map(item=>clone(item));
    return legacyHistory(member,data);
  }

  const originalSaveData=Store.saveData.bind(Store);
  function readCurrentRaw(){
    try{
      const key=Store.workspace?.()==='sample'?Store.SAMPLE_DATA_KEY:Store.DATA_KEY;
      return JSON.parse(localStorage.getItem(key)||'null');
    }catch{return null;}
  }
  Store.saveData=function auditedSaveData(input){
    const previous=readCurrentRaw();
    const next=clone(input||{});next.members=Array.isArray(next.members)?next.members:[];
    const oldMap=new Map((previous?.members||[]).map(member=>[member.id,member]));
    const user=actorSnapshot();const stamp=now();
    next.members=next.members.map(member=>{
      const old=oldMap.get(member.id);
      let history=ensureHistory(old||member,previous||next);
      if(!old){
        history=[{id:uid('audit'),type:'created',at:stamp,actor:user,note:'Khởi tạo thành viên.',changes:[]}];
      }else{
        const changes=memberDiff(old,member);
        if(changes.length)history.push({id:uid('audit'),type:'updated',at:stamp,actor:user,note:'Chỉnh sửa thông tin thành viên.',changes});
      }
      return {...member,auditHistory:history};
    });
    if(previous?.members){
      const newIds=new Set(next.members.map(member=>member.id));
      const deleted=previous.members.filter(member=>!newIds.has(member.id));
      if(deleted.length){
        next.auditLog=next.auditLog||{};next.auditLog.memberDeletions=Array.isArray(next.auditLog.memberDeletions)?next.auditLog.memberDeletions:[];
        deleted.forEach(member=>next.auditLog.memberDeletions.push({id:uid('delete'),memberId:member.id,memberName:member.name,at:stamp,actor:user,history:ensureHistory(member,previous)}));
      }
    }
    return originalSaveData(next);
  };

  function migrateExistingHistory(){
    const data=Store.loadData();let changed=false;
    data.members=(data.members||[]).map(member=>{
      if(Array.isArray(member.auditHistory)&&member.auditHistory.length)return member;
      changed=true;return {...member,auditHistory:legacyHistory(member,data)};
    });
    if(changed)originalSaveData(data);
  }

  function installStyles(){
    if($('#phamvan-auth-audit-style'))return;
    const style=document.createElement('style');style.id='phamvan-auth-audit-style';style.textContent=`
      .auth-gate{position:fixed;z-index:2000;inset:0;display:grid;place-items:center;padding:20px;background:linear-gradient(180deg,rgba(101,8,13,.96),rgba(61,6,10,.97));overflow:auto}.auth-gate[hidden]{display:none!important}.auth-card{width:min(100%,420px);border:1px solid rgba(255,226,151,.66);border-radius:28px;padding:22px;background:linear-gradient(145deg,rgba(255,252,246,.90),rgba(242,222,190,.82));-webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);box-shadow:0 26px 70px rgba(34,0,4,.32),inset 0 1px 0 rgba(255,255,255,.82)}.auth-brand{text-align:center}.auth-brand img{width:72px;height:72px;object-fit:contain}.auth-brand h1{margin:8px 0 2px;color:#65080d;font:700 22px Georgia,serif}.auth-brand p{margin:0;color:#766454;font-size:11px}.auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:18px 0 14px;padding:4px;border-radius:15px;background:rgba(101,8,13,.07)}.auth-tabs button{min-height:39px;border:0;border-radius:12px;background:transparent;color:#69594f;font-weight:800}.auth-tabs button.active{background:#65080d;color:#fff2ce}.auth-form{display:grid;gap:10px}.auth-form[hidden]{display:none!important}.auth-field{display:grid;gap:5px}.auth-field span{font-size:10px;font-weight:800;color:#6e5d51}.auth-field input{width:100%;box-sizing:border-box;min-height:48px;border:1px solid rgba(101,8,13,.18);border-radius:14px;padding:0 13px;background:rgba(255,255,255,.66);color:#3b3029;font-size:15px;outline:none}.auth-field input:focus{border-color:rgba(101,8,13,.52);box-shadow:0 0 0 3px rgba(101,8,13,.08)}.auth-submit{min-height:48px;border:1px solid rgba(255,226,151,.86);border-radius:14px;background:#65080d;color:#fff2ce;font-weight:850}.auth-message{min-height:18px;margin:2px 0 0;color:#8b1a20;font-size:10px;line-height:1.4}.auth-note{margin:14px 0 0;padding-top:12px;border-top:1px solid rgba(101,8,13,.10);color:#806d5e;font-size:9px;line-height:1.45}.auth-account-tools{display:grid;gap:8px;margin-top:10px}.auth-root-badge{display:inline-flex;align-items:center;justify-content:center;min-height:24px;padding:0 9px;border-radius:999px;background:#65080d;color:#ffe7a4;font-size:9px;font-weight:900;letter-spacing:.08em}.audit-modal{position:fixed;z-index:1900;inset:0;display:grid;align-items:end;padding:12px;padding-bottom:calc(12px + env(safe-area-inset-bottom))}.audit-modal[hidden]{display:none!important}.audit-backdrop{position:absolute;inset:0;background:rgba(28,17,11,.36);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}.audit-panel{position:relative;z-index:1;width:100%;max-width:680px;max-height:min(82svh,820px);margin:auto;overflow:auto;border:1px solid rgba(255,245,220,.70);border-radius:25px;padding:15px;background:linear-gradient(145deg,rgba(255,253,248,.90),rgba(241,221,188,.84));box-shadow:0 24px 60px rgba(61,25,12,.24)}.audit-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px}.audit-head p{margin:0 0 3px;color:#65080d;font-size:9px;font-weight:900;letter-spacing:.12em}.audit-head h2{margin:0;color:#3e2b1f;font:700 21px Georgia,serif}.audit-close{width:40px;height:40px;border:1px solid rgba(101,8,13,.12);border-radius:999px;background:rgba(255,255,255,.64);font-size:23px}.audit-list{display:grid;gap:9px}.audit-entry{position:relative;padding:12px;border:1px solid rgba(101,8,13,.12);border-radius:16px;background:rgba(255,255,255,.43)}.audit-entry::before{content:'';position:absolute;left:-1px;top:12px;bottom:12px;width:3px;border-radius:4px;background:#b98a35}.audit-entry.updated::before{background:#65080d}.audit-entry.legacy::before{background:#8c8176}.audit-entry strong{display:block;color:#47372d;font-size:12px}.audit-meta{margin-top:4px;color:#78685c;font-size:9px;line-height:1.45}.audit-note{margin-top:7px;color:#64564d;font-size:10px;line-height:1.45}.audit-changes{display:grid;gap:5px;margin-top:8px}.audit-change{padding:7px 8px;border-radius:10px;background:rgba(101,8,13,.05);font-size:9px;color:#5b4b41;line-height:1.4}.audit-change b{color:#65080d}.auth-confirm{position:fixed;z-index:2100;inset:0;display:grid;place-items:center;padding:18px;background:rgba(25,10,10,.46)}.auth-confirm-card{width:min(100%,360px);padding:18px;border-radius:20px;background:#fff9ef;box-shadow:0 24px 70px rgba(0,0,0,.25)}.auth-confirm-card h3{margin:0 0 7px;color:#442f28}.auth-confirm-card p{margin:0 0 15px;color:#746156;font-size:11px}.auth-confirm-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.auth-confirm-actions button{min-height:44px;border-radius:13px;border:1px solid rgba(101,8,13,.16);font-weight:800}.auth-confirm-actions .danger{background:#65080d;color:#fff2ce}
    `;document.head.appendChild(style);
  }

  function authMarkup(){return `<div class="auth-card"><div class="auth-brand"><img src="/reference-crest.webp?v=2" alt="Phạm Văn"><h1>GIA PHẢ HỌ PHẠM VĂN</h1><p>Đăng nhập hoặc đăng ký tài khoản để sử dụng đầy đủ hệ thống</p></div><div class="auth-tabs"><button type="button" data-auth-tab="login" class="active">Đăng nhập</button><button type="button" data-auth-tab="register">Đăng ký</button></div><form class="auth-form" id="authLoginForm"><label class="auth-field"><span>Tên đăng nhập</span><input name="username" autocomplete="username" required></label><label class="auth-field"><span>Mật khẩu</span><input name="password" type="password" autocomplete="current-password" required></label><button class="auth-submit" type="submit">Đăng nhập</button></form><form class="auth-form" id="authRegisterForm" hidden><label class="auth-field"><span>Tên hiển thị</span><input name="displayName" autocomplete="name" required></label><label class="auth-field"><span>Tên đăng nhập</span><input name="username" autocomplete="username" required></label><label class="auth-field"><span>Mật khẩu</span><input name="password" type="password" autocomplete="new-password" minlength="6" required></label><label class="auth-field"><span>Nhập lại mật khẩu</span><input name="confirmPassword" type="password" autocomplete="new-password" minlength="6" required></label><button class="auth-submit" type="submit">Tạo tài khoản</button></form><div class="auth-message" id="authMessage"></div><div class="auth-note">Tài khoản được lưu cục bộ trên thiết bị. Mật khẩu được lưu dưới dạng băm SHA-256 có salt, không lưu nguyên văn.</div></div>`;}
  function ensureGate(){
    installStyles();let gate=$('#authGate');if(gate)return gate;
    gate=document.createElement('div');gate.id='authGate';gate.className='auth-gate';gate.innerHTML=authMarkup();document.body.appendChild(gate);
    $$('[data-auth-tab]',gate).forEach(button=>button.addEventListener('click',()=>{
      $$('[data-auth-tab]',gate).forEach(item=>item.classList.toggle('active',item===button));
      $('#authLoginForm',gate).hidden=button.dataset.authTab!=='login';$('#authRegisterForm',gate).hidden=button.dataset.authTab!=='register';$('#authMessage',gate).textContent='';
    }));
    $('#authLoginForm',gate).addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;const values=Object.fromEntries(new FormData(form).entries());try{await login(values.username,values.password);form.reset();renderAuthGate();}catch(error){$('#authMessage',gate).textContent=error.message||'Không đăng nhập được';}});
    $('#authRegisterForm',gate).addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;const values=Object.fromEntries(new FormData(form).entries());if(values.password!==values.confirmPassword){$('#authMessage',gate).textContent='Hai mật khẩu chưa trùng nhau.';return;}try{await register(values);form.reset();renderAuthGate();}catch(error){$('#authMessage',gate).textContent=error.message||'Không đăng ký được';}});
    return gate;
  }
  function renderAccount(){
    const user=currentUser();if(!user)return;
    const avatar=$('.account-card .account-avatar');if(avatar)avatar.textContent=(user.displayName||user.username).trim().charAt(0).toUpperCase();
    const strong=$('.account-card strong');if(strong)strong.textContent=user.displayName||user.username;
    const small=$('#accountIdText');if(small)small.textContent=`@${user.username} · ${user.role==='root'?'ROOT':'Thành viên'}`;
    const pill=$('.account-card .status-pill');if(pill){pill.textContent=user.role==='root'?'ROOT':'LOCAL';pill.classList.toggle('auth-root-badge',user.role==='root');}
    const accountButton=$('#accountButton');if(accountButton)accountButton.textContent=(user.displayName||user.username).trim().charAt(0).toUpperCase();
    const body=[...$$('#settings-view .settings-group-body')].find(node=>node.querySelector('#accountIdText'));if(body&&!$('#authAccountTools',body)){
      const tools=document.createElement('div');tools.id='authAccountTools';tools.className='auth-account-tools';tools.innerHTML='<button type="button" class="ui-button secondary-button full" id="authLogoutButton">Đăng xuất</button>';body.appendChild(tools);$('#authLogoutButton',tools).addEventListener('click',logout);
    }
  }
  function renderAuthGate(){
    const gate=ensureGate();const user=currentUser();gate.hidden=Boolean(user);document.body.dataset.authenticated=user?'true':'false';
    if(user){renderAccount();window.dispatchEvent(new CustomEvent('phamvan-auth-ready',{detail:{user}}));}
  }

  function closeActionSheet(){const sheet=$('#actionSheet');if(sheet){sheet.hidden=true;sheet.setAttribute('aria-hidden','true');}}
  function openMemberMenu(id){
    const data=Store.loadData();const member=(data.members||[]).find(item=>item.id===id);if(!member)return;
    const sheet=$('#actionSheet'),box=$('#sheetActions');if(!sheet||!box)return;
    $('#sheetTitle').textContent=member.name;$('#sheetDescription').textContent=member.role||`Đời thứ ${member.generation}`;box.innerHTML='';
    const add=(title,description,onClick)=>{const button=document.createElement('button');button.className='sheet-action';button.innerHTML=`<span><strong>${esc(title)}</strong>${description?`<small>${esc(description)}</small>`:''}</span><span>›</span>`;button.addEventListener('click',()=>{closeActionSheet();onClick();});box.appendChild(button);};
    add('Chỉnh sửa','',()=>window.PhamVanMemberFeatures?.openMemberEditor?.(id));
    add('Lịch sử chỉnh sửa','Xem người khởi tạo, thời gian và các lần thay đổi',()=>openMemberHistory(id));
    add('Xóa thành viên','Không thể hoàn tác nếu chưa có bản sao lưu',()=>confirmDeleteMember(member));
    sheet.hidden=false;sheet.setAttribute('aria-hidden','false');
  }
  function openMemberHistory(id){
    installStyles();const data=Store.loadData();const member=(data.members||[]).find(item=>item.id===id);if(!member)return;
    let modal=$('#memberAuditModal');if(!modal){modal=document.createElement('div');modal.id='memberAuditModal';modal.className='audit-modal';modal.innerHTML='<div class="audit-backdrop" data-audit-close></div><section class="audit-panel"><div class="audit-head"><div><p>LỊCH SỬ CHỈNH SỬA</p><h2 id="memberAuditTitle"></h2></div><button type="button" class="audit-close" data-audit-close>×</button></div><div class="audit-list" id="memberAuditList"></div></section>';document.body.appendChild(modal);modal.addEventListener('click',event=>{if(event.target.closest('[data-audit-close]'))modal.hidden=true;});}
    $('#memberAuditTitle',modal).textContent=member.name;
    const history=ensureHistory(member,data).slice().sort((a,b)=>String(a.at||'').localeCompare(String(b.at||'')));
    $('#memberAuditList',modal).innerHTML=history.map(entry=>{
      const title=entry.type==='created'?'Khởi tạo thành viên':entry.type==='updated'?'Chỉnh sửa thành viên':'Bắt đầu ghi nhận lịch sử';
      const actor=entry.actor||{};const meta=`${formatDateTime(entry.at)} · ${actor.displayName||actor.username||'Không xác định'}${actor.username&&actor.displayName!==actor.username?` (@${actor.username})`:''}${actor.role==='root'?' · ROOT':''}`;
      const changes=Array.isArray(entry.changes)&&entry.changes.length?`<div class="audit-changes">${entry.changes.map(change=>`<div class="audit-change"><b>${esc(change.label||change.field)}</b><br>${esc(change.before)} → ${esc(change.after)}</div>`).join('')}</div>`:'';
      return `<article class="audit-entry ${esc(entry.type||'legacy')}"><strong>${esc(title)}</strong><div class="audit-meta">${esc(meta)}</div>${entry.note?`<div class="audit-note">${esc(entry.note)}</div>`:''}${changes}</article>`;
    }).join('');
    modal.hidden=false;
  }
  function confirmDeleteMember(member){
    const wrap=document.createElement('div');wrap.className='auth-confirm';wrap.innerHTML=`<div class="auth-confirm-card"><h3>Xóa thành viên?</h3><p>Xóa ${esc(member.name)} khỏi gia phả? Lịch sử của bản ghi sẽ được lưu trong nhật ký xóa hệ thống.</p><div class="auth-confirm-actions"><button type="button" data-cancel>Hủy</button><button type="button" class="danger" data-delete>Xóa</button></div></div>`;document.body.appendChild(wrap);
    $('[data-cancel]',wrap).addEventListener('click',()=>wrap.remove());
    $('[data-delete]',wrap).addEventListener('click',()=>{const data=Store.loadData();data.members=(data.members||[]).filter(item=>item.id!==member.id).map(item=>item.parentId===member.id?{...item,parentId:null}:item);Store.saveData(data);wrap.remove();location.reload();});
  }

  document.addEventListener('click',event=>{
    const menu=event.target.closest('[data-member-menu]');
    if(!menu)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();openMemberMenu(menu.dataset.memberMenu);
  },true);

  window.PhamVanAuth={currentUser,actorSnapshot,register,login,logout,isRoot:()=>currentUser()?.role==='root',capabilities:()=>currentUser()?.capabilities||[]};
  window.PhamVanAudit={openMemberHistory,ensureHistory};

  async function init(){
    installStyles();await ensureRoot();migrateExistingHistory();renderAuthGate();
  }
  init().catch(error=>{console.error('Không khởi tạo được tài khoản',error);const gate=ensureGate();gate.hidden=false;$('#authMessage',gate).textContent='Không khởi tạo được hệ thống tài khoản trên thiết bị này.';});
})();