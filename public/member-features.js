(() => {
  'use strict';

  const Store = window.PhamVanStore;
  if (!Store) return;

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = p => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const avatarFallbacks = ['/avatar-1.svg','/avatar-2.svg','/avatar-3.svg','/avatar-4.svg'];
  let lastMemberId = null;
  let editingPhotos = [];
  let editingAvatarId = null;

  const state = () => Store.loadData();
  const fmtDate = v => {
    if (!v) return '—';
    const d = new Date(`${v}T00:00:00`);
    return Number.isNaN(d.getTime()) ? String(v) : new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
  };
  const imageSrc = img => img?.data || img?.src || '';
  const memberAvatar = member => {
    const photos = Array.isArray(member?.photos) ? member.photos : [];
    const selected = photos.find(p => p.id === member?.avatarPhotoId) || photos[0];
    return imageSrc(selected) || null;
  };

  function installStyle(){
    if ($('#phamvan-member-features-style')) return;
    const style = document.createElement('style');
    style.id = 'phamvan-member-features-style';
    style.textContent = `
      #memberSearch{padding-left:14px!important;padding-right:12px!important;text-indent:0!important}
      .member-profile-modal,.member-editor-modal{position:fixed;inset:0;z-index:255;display:grid;align-items:end;padding:12px;padding-bottom:calc(12px + env(safe-area-inset-bottom))}.member-profile-modal[hidden],.member-editor-modal[hidden]{display:none!important}.member-modal-backdrop{position:absolute;inset:0;background:rgba(28,17,11,.32);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
      .member-modal-panel{position:relative;z-index:1;width:100%;max-width:680px;max-height:min(86svh,860px);margin:0 auto;overflow:auto;border:1px solid rgba(255,245,220,.64);border-radius:24px;padding:16px;background:linear-gradient(145deg,rgba(255,253,248,.78),rgba(244,224,194,.68));-webkit-backdrop-filter:blur(18px) saturate(1.08);backdrop-filter:blur(18px) saturate(1.08);box-shadow:0 24px 60px rgba(61,25,12,.22),inset 0 1px 0 rgba(255,255,255,.78)}
      .member-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:13px}.member-modal-titlewrap{display:flex;align-items:center;gap:11px;min-width:0}.member-detail-avatar{width:64px;height:64px;flex:0 0 64px;border-radius:50%;overflow:hidden;border:2px solid rgba(196,143,54,.70);background:rgba(242,218,169,.72);display:grid;place-items:center;color:#65080d;font:700 20px Georgia,serif}.member-detail-avatar img{width:100%;height:100%;object-fit:cover;display:block}.member-modal-head p{margin:0 0 3px;color:#65080d;font-size:9px;font-weight:850;letter-spacing:.15em}.member-modal-head h2{margin:0;color:#3e2b1f;font-family:Georgia,serif;font-size:22px;line-height:1.08;overflow-wrap:anywhere}.member-modal-close{width:40px;height:40px;flex:0 0 40px;border:1px solid rgba(255,255,255,.72);border-radius:999px;background:rgba(255,252,246,.60);font-size:24px;color:#49372d}
      .member-info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.member-info{min-width:0;padding:10px 11px;border:1px solid rgba(255,245,224,.56);border-radius:15px;background:rgba(255,252,246,.28)}.member-info.wide{grid-column:1/-1}.member-info span{display:block;margin-bottom:3px;color:#8a786a;font-size:9px}.member-info strong,.member-info p{display:block;margin:0;color:#3e332b;font-size:12px;line-height:1.38;white-space:pre-wrap;overflow-wrap:anywhere}
      .member-gallery-title{margin:14px 0 7px;color:#65080d;font-size:10px;font-weight:850;letter-spacing:.08em}.member-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.member-photo{position:relative;aspect-ratio:1/1;border-radius:13px;overflow:hidden;border:1px solid rgba(255,245,224,.66);background:rgba(255,255,255,.28)}.member-photo img{width:100%;height:100%;display:block;object-fit:cover}.member-photo.is-avatar{outline:2px solid #d9a73c;outline-offset:-2px}.member-photo-badge{position:absolute;left:5px;bottom:5px;padding:3px 6px;border-radius:8px;background:rgba(101,8,13,.86);color:#fff4d4;font-size:7px;font-weight:800}.member-photo-remove{position:absolute;right:5px;top:5px;width:27px;height:27px;border:0;border-radius:999px;background:rgba(101,8,13,.90);color:white;font-size:16px}.member-photo-select{position:absolute;inset:0;border:0;background:transparent;color:transparent}
      .member-modal-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:14px}.member-modal-actions button{min-height:45px;border-radius:14px;border:1px solid rgba(255,245,224,.68);background:rgba(255,252,246,.36);color:#4b3b31;font-weight:750}.member-modal-actions button.primary{background:#65080d;color:#fff4d4;border-color:rgba(255,226,151,.88)}
      .member-form{display:grid;gap:11px}.member-fields{display:grid;grid-template-columns:1fr;gap:11px}.member-field{display:grid;gap:5px}.member-field label{font-size:9px;font-weight:800;color:#6f5d50}.member-field input,.member-field select,.member-field textarea{width:100%;min-width:0;box-sizing:border-box;border:1px solid rgba(255,245,224,.64);border-radius:14px;background:rgba(255,252,246,.34);padding:11px 12px;color:#3f332b;font:inherit}.member-field input,.member-field select{min-height:46px}.member-field textarea{min-height:100px;resize:vertical}.member-image-picker{display:block;width:100%;box-sizing:border-box;padding:12px;border:1px dashed rgba(101,8,13,.36);border-radius:14px;background:rgba(255,252,246,.24);color:#65080d;font-weight:780;text-align:center}.member-image-picker input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.member-image-help{margin:4px 0 0;color:#806f61;font-size:9px;line-height:1.35}.member-empty-gallery{padding:12px;border-radius:14px;border:1px solid rgba(255,245,224,.52);background:rgba(255,252,246,.22);color:#75675d;font-size:10px;text-align:center}
      @media(max-width:420px){.member-info-grid{grid-template-columns:1fr}.member-info.wide{grid-column:auto}.member-modal-panel{padding:14px}.member-gallery{grid-template-columns:repeat(3,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function ensureUi(){
    installStyle();
    if (!$('#memberProfileModal')) {
      const modal = document.createElement('div');
      modal.id = 'memberProfileModal';
      modal.className = 'member-profile-modal';
      modal.hidden = true;
      modal.innerHTML = '<div class="member-modal-backdrop" data-member-profile-close></div><section class="member-modal-panel"><div id="memberProfileContent"></div></section>';
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target.closest('[data-member-profile-close]')) modal.hidden = true; });
    }
    if (!$('#memberEditorModal')) {
      const modal = document.createElement('div');
      modal.id = 'memberEditorModal';
      modal.className = 'member-editor-modal';
      modal.hidden = true;
      modal.innerHTML = '<div class="member-modal-backdrop" data-member-editor-close></div><section class="member-modal-panel"><div class="member-modal-head"><div><p>THÀNH VIÊN</p><h2 id="memberEditorTitle">Thêm thành viên</h2></div><button type="button" class="member-modal-close" data-member-editor-close>×</button></div><form id="memberEnhancedForm" class="member-form"><div id="memberEnhancedFields" class="member-fields"></div><div><div class="member-gallery-title">KHO ẢNH THÀNH VIÊN</div><label class="member-image-picker">＋ Thêm hình ảnh<input id="memberImageInput" type="file" accept="image/*" multiple></label><p class="member-image-help">Có thể chọn nhiều ảnh và thêm nhiều lần. Chạm vào ảnh để đặt làm ảnh đại diện.</p><div class="member-gallery" id="memberEditableGallery"></div></div><div class="member-modal-actions"><button type="button" data-member-editor-close>Hủy</button><button type="submit" class="primary">Lưu</button></div></form></section>';
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target.closest('[data-member-editor-close]')) modal.hidden = true; });
      $('#memberImageInput',modal).addEventListener('change', async e => {
        const files = [...(e.target.files || [])];
        for (const file of files) editingPhotos.push(await fileToPhoto(file));
        if (!editingAvatarId && editingPhotos[0]) editingAvatarId = editingPhotos[0].id;
        renderEditableGallery();
        e.target.value = '';
      });
    }
  }

  const info = (label,value,wide=false) => `<div class="member-info${wide?' wide':''}"><span>${esc(label)}</span><strong>${esc(value || '—')}</strong></div>`;

  function openMemberDetail(id){
    ensureUi();
    const s = state();
    const member = s.members.find(m => m.id === id);
    if (!member) return;
    lastMemberId = id;
    const parent = s.members.find(m => m.id === member.parentId);
    const children = s.members.filter(m => m.parentId === member.id);
    const linkedEvents = s.events.filter(e => e.memberId === member.id);
    const photos = Array.isArray(member.photos) ? member.photos : [];
    const avatar = memberAvatar(member);
    const initial = String(member.name || 'P').trim().split(/\s+/).at(-1)?.[0] || 'P';
    const gallery = photos.length ? `<div class="member-gallery-title">KHO ẢNH THÀNH VIÊN · ${photos.length} ẢNH</div><div class="member-gallery">${photos.map(p=>`<div class="member-photo ${p.id===member.avatarPhotoId?'is-avatar':''}"><img src="${esc(imageSrc(p))}" alt="${esc(p.name||'Ảnh thành viên')}">${p.id===member.avatarPhotoId?'<span class="member-photo-badge">ĐẠI DIỆN</span>':''}</div>`).join('')}</div>` : '<div class="member-gallery-title">KHO ẢNH THÀNH VIÊN</div><div class="member-empty-gallery">Chưa có hình ảnh thành viên.</div>';
    $('#memberProfileContent').innerHTML = `<div class="member-modal-head"><div class="member-modal-titlewrap"><div class="member-detail-avatar">${avatar?`<img src="${esc(avatar)}" alt="">`:esc(initial)}</div><div><p>HỒ SƠ THÀNH VIÊN</p><h2>${esc(member.name)}</h2></div></div><button type="button" class="member-modal-close" data-member-profile-close>×</button></div><div class="member-info-grid">${info('Đời',`Đời thứ ${member.generation}`)}${info('Vai trò',member.role||'Thành viên')}${info('Giới tính',member.gender)}${info('Ngày sinh',fmtDate(member.birthDate))}${info('Ngày mất',member.deathDate?fmtDate(member.deathDate):'—')}${info('Vợ / chồng',member.spouse)}${info('Quê quán',member.hometown)}${info('Nghề nghiệp',member.occupation)}${info('Cha / mẹ',parent?.name||'—')}${info('Con trực tiếp',children.length?children.map(c=>c.name).join(', '):'—',true)}${info('Sự kiện liên quan',String(linkedEvents.length))}${info('Ghi chú',member.note||'—',true)}</div>${gallery}<div class="member-modal-actions"><button type="button" data-member-profile-close>Đóng</button><button type="button" class="primary" data-member-profile-edit>Chỉnh sửa</button></div>`;
    $('#memberProfileContent').querySelector('[data-member-profile-edit]')?.addEventListener('click',()=>{ $('#memberProfileModal').hidden=true; openMemberEditor(id); });
    $('#memberProfileModal').hidden = false;
  }

  function memberOptions(s, member){
    return `<option value="">Không chọn</option>${s.members.filter(m=>!member||m.id!==member.id).map(m=>`<option value="${esc(m.id)}" ${m.id===member?.parentId?'selected':''}>Đời ${m.generation} · ${esc(m.name)}</option>`).join('')}`;
  }
  function field(label,name,type='text',value=''){
    if (type === 'textarea') return `<div class="member-field"><label>${esc(label)}</label><textarea name="${name}">${esc(value)}</textarea></div>`;
    return `<div class="member-field"><label>${esc(label)}</label><input name="${name}" type="${type}" value="${esc(value)}"></div>`;
  }

  function openMemberEditor(id=null){
    ensureUi();
    const s = state();
    const member = id ? s.members.find(m=>m.id===id) : null;
    editingPhotos = (member?.photos || []).map(p=>({...p}));
    editingAvatarId = member?.avatarPhotoId || editingPhotos[0]?.id || null;
    const maxGen = Math.max(1,...s.members.map(m=>Number(m.generation)||1));
    $('#memberEditorTitle').textContent = member ? 'Chỉnh sửa thành viên' : 'Thêm thành viên';
    $('#memberEnhancedFields').innerHTML = field('Họ và tên','name','text',member?.name||'') + field('Đời','generation','number',member?.generation||maxGen) + `<div class="member-field"><label>Cha / mẹ</label><select name="parentId">${memberOptions(s,member)}</select></div>` + `<div class="member-field"><label>Giới tính</label><select name="gender"><option value="">Chưa chọn</option><option value="Nam" ${member?.gender==='Nam'?'selected':''}>Nam</option><option value="Nữ" ${member?.gender==='Nữ'?'selected':''}>Nữ</option><option value="Khác" ${member?.gender==='Khác'?'selected':''}>Khác</option></select></div>` + field('Ngày sinh','birthDate','date',member?.birthDate||'') + field('Ngày mất','deathDate','date',member?.deathDate||'') + field('Vợ / chồng','spouse','text',member?.spouse||'') + field('Quê quán','hometown','text',member?.hometown||'') + field('Nghề nghiệp','occupation','text',member?.occupation||'') + field('Vai trò','role','text',member?.role||'') + field('Ghi chú','note','textarea',member?.note||'');
    renderEditableGallery();
    const form = $('#memberEnhancedForm');
    form.onsubmit = e => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(form).entries());
      if (!String(v.name||'').trim()) return;
      const record = {
        ...(member||{}),
        id: member?.id || uid('pv'),
        name: String(v.name).trim(),
        generation: Math.max(1,Number(v.generation)||1),
        parentId: v.parentId || null,
        gender: String(v.gender||''),
        birthDate: v.birthDate || '',
        deathDate: v.deathDate || '',
        spouse: String(v.spouse||''),
        hometown: String(v.hometown||''),
        occupation: String(v.occupation||''),
        role: String(v.role||''),
        note: String(v.note||''),
        photos: editingPhotos.map(p=>({...p})),
        avatarPhotoId: editingPhotos.some(p=>p.id===editingAvatarId) ? editingAvatarId : (editingPhotos[0]?.id || null)
      };
      s.members = member ? s.members.map(m=>m.id===member.id?record:m) : [...s.members,record];
      Store.saveData(s);
      location.reload();
    };
    $('#memberEditorModal').hidden = false;
  }

  function fileToPhoto(file){
    return new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = () => resolve({id:uid('member-img'),name:file.name||'Ảnh thành viên',type:file.type||'image/*',data:String(reader.result||'')});
      reader.onerror = () => reject(reader.error || new Error('Không đọc được ảnh'));
      reader.readAsDataURL(file);
    });
  }

  function renderEditableGallery(){
    const box = $('#memberEditableGallery');
    if (!box) return;
    if (!editingPhotos.length) {
      box.innerHTML = '<div class="member-empty-gallery" style="grid-column:1/-1">Chưa có ảnh. Thêm ảnh để tạo kho ảnh thành viên và chọn ảnh đại diện.</div>';
      return;
    }
    box.innerHTML = editingPhotos.map((p,i)=>`<div class="member-photo ${p.id===editingAvatarId?'is-avatar':''}" data-member-photo="${i}"><img src="${esc(imageSrc(p))}" alt="${esc(p.name||`Ảnh ${i+1}`)}"><button class="member-photo-select" type="button" data-avatar-photo="${i}" aria-label="Đặt làm ảnh đại diện">Chọn</button><button class="member-photo-remove" type="button" data-remove-member-photo="${i}" aria-label="Xóa ảnh">×</button>${p.id===editingAvatarId?'<span class="member-photo-badge">ĐẠI DIỆN</span>':''}</div>`).join('');
    $$('[data-avatar-photo]',box).forEach(btn=>btn.addEventListener('click',()=>{ editingAvatarId = editingPhotos[Number(btn.dataset.avatarPhoto)]?.id || null; renderEditableGallery(); }));
    $$('[data-remove-member-photo]',box).forEach(btn=>btn.addEventListener('click',e=>{ e.stopPropagation(); const i=Number(btn.dataset.removeMemberPhoto); const removed=editingPhotos[i]; editingPhotos.splice(i,1); if (removed?.id===editingAvatarId) editingAvatarId=editingPhotos[0]?.id||null; renderEditableGallery(); }));
  }

  function applyMemberAvatars(){
    const s = state();
    for (const member of s.members) {
      const src = memberAvatar(member);
      if (!src) continue;
      const row = document.querySelector(`[data-member-row="${CSS.escape(member.id)}"] .person-avatar img`);
      if (row) row.src = src;
      const tree = document.querySelector(`[data-person-id="${CSS.escape(member.id)}"] .person-avatar img`);
      if (tree) tree.src = src;
    }
  }

  function enrichSampleMemberMedia(){
    if (Store.workspace?.() !== 'sample') return;
    const s = state();
    let changed = false;
    s.members = s.members.map((m,i)=>{
      if (Array.isArray(m.photos) && m.photos.length) return m;
      changed = true;
      const photos = [0,1].map(offset=>({id:`sample-member-photo-${m.id}-${offset+1}`,name:`Ảnh mẫu ${offset+1} · ${m.name}`,src:avatarFallbacks[(i+offset)%avatarFallbacks.length],sample:true}));
      return {...m,photos,avatarPhotoId:photos[0].id};
    });
    if (changed) Store.saveData(s);
  }

  function bindCapture(){
    document.addEventListener('click', e => {
      const menu = e.target.closest('[data-member-menu]');
      const treeCard = e.target.closest('[data-person-id]');
      if (menu) lastMemberId = menu.dataset.memberMenu;
      if (treeCard) lastMemberId = treeCard.dataset.personId;

      const row = e.target.closest('[data-member-row]');
      if (row && !menu) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openMemberDetail(row.dataset.memberRow);
        return;
      }

      const add = e.target.closest('#addMemberButton');
      if (add) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openMemberEditor();
        return;
      }

      const sheetAction = e.target.closest('#sheetActions .sheet-action');
      if (sheetAction && lastMemberId) {
        const member = state().members.find(m=>m.id===lastMemberId);
        const sheetTitle = $('#sheetTitle')?.textContent?.trim();
        const actionTitle = sheetAction.querySelector('strong')?.textContent?.trim();
        if (member && sheetTitle===member.name && actionTitle==='Chỉnh sửa') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          const sheet=$('#actionSheet'); if(sheet){sheet.hidden=true;sheet.setAttribute('aria-hidden','true');}
          openMemberEditor(member.id);
        }
      }
    }, true);
  }

  function init(){
    ensureUi();
    enrichSampleMemberMedia();
    bindCapture();
    applyMemberAvatars();
    const observer = new MutationObserver(()=>applyMemberAvatars());
    const members = $('#memberList'), tree = $('#familyTree');
    if (members) observer.observe(members,{childList:true,subtree:true});
    if (tree) observer.observe(tree,{childList:true,subtree:true});
    window.PhamVanMemberFeatures = {openMemberDetail,openMemberEditor,applyMemberAvatars};
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
