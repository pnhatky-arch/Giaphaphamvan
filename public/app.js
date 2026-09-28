(() => {
  'use strict';

  const Store = window.PhamVanStore;
  const Storage = window.PhamVanStorage;
  if(!Store) throw new Error('PhamVanStore chưa được nạp');

  let state = Store.loadData();
  let settings = {
    theme:'auto', displayMode:'auto', syncMode:'manual', driveClientId:'', driveConnected:false,
    lastSync:null, ...(Store.loadSettings()||{})
  };
  let currentView='overview';
  let treeZoom=1;
  let generationFilter='all';
  let editorContext=null;
  let confirmResolver=null;
  let toastTimer=null;

  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const escapeHtml = value => String(value??'').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const byId = id => document.getElementById(id);

  function saveSettings(){ Store.saveSettings(settings); }
  function saveState(){ state=Store.saveData(state); renderAll(); }
  function generations(){ return [...new Set((state.members||[]).map(m=>Number(m.generation)||1))].sort((a,b)=>a-b); }
  function maxGeneration(){ return generations().at(-1)||0; }
  function initials(name){
    const words=String(name||'').trim().split(/\s+/).filter(Boolean);
    return (words.at(-1)?.[0]||words[0]?.[0]||'P').toUpperCase();
  }
  function formatDate(value){
    if(!value) return 'Chưa đặt ngày';
    const d=new Date(`${value}T00:00:00`);
    return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
  }

  function toast(message){
    const el=byId('toast');
    if(!el) return;
    clearTimeout(toastTimer); el.textContent=message; el.classList.add('show');
    toastTimer=setTimeout(()=>el.classList.remove('show'),2600);
  }

  function applyTheme(){
    document.documentElement.dataset.theme=settings.theme||'auto';
    $$('#themeSegment button').forEach(btn=>{
      const active=btn.dataset.themeChoice===settings.theme;
      btn.classList.toggle('active',active); btn.setAttribute('aria-checked',String(active));
    });
  }

  function applyDisplayMode(){
    document.body.dataset.displayMode=settings.displayMode||'auto';
    $$('.display-segment button[data-display], .settings-display-segment button[data-display-setting]').forEach(btn=>{
      const value=btn.dataset.display||btn.dataset.displaySetting;
      const active=value===settings.displayMode;
      btn.classList.toggle('active',active); btn.setAttribute('aria-checked',String(active));
    });
    requestAnimationFrame(fitTree);
  }

  function navigate(view){
    if(!byId(`${view}-view`)) view='overview';
    currentView=view;
    $$('.view').forEach(el=>{const active=el.dataset.view===view;el.hidden=!active;el.classList.toggle('active',active);});
    $$('#bottomNav button').forEach(btn=>btn.classList.toggle('active',btn.dataset.nav===view));
    closeDrawer();
    window.scrollTo({top:0,behavior:'smooth'});
    if(view==='tree') requestAnimationFrame(fitTree);
    if(view==='settings') refreshStorage();
  }

  function renderStats(){
    const members=state.members?.length||0, events=state.events?.length||0, docs=state.documents?.length||0, gens=maxGeneration();
    byId('statMembers').textContent=members; byId('statGenerations').textContent=gens;
    byId('statEvents').textContent=events; byId('statDocuments').textContent=docs;
    byId('sourceStatus').textContent=`${members} thành viên · ${gens} đời`;
    byId('treeMemberCount').textContent=members; byId('treeGenerationCount').textContent=gens;
    byId('membersSubtitle').textContent=`${members} thành viên`;
  }

  function renderGenerationControls(){
    const gens=generations();
    const chips=byId('generationChips');
    chips.innerHTML=[`<button class="generation-chip ${generationFilter==='all'?'active':''}" data-generation="all">Tất cả ${state.members.length}</button>`]
      .concat(gens.map(g=>`<button class="generation-chip ${String(generationFilter)===String(g)?'active':''}" data-generation="${g}">Đời ${g} · ${state.members.filter(m=>Number(m.generation)===g).length}</button>`)).join('');
    chips.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{generationFilter=btn.dataset.generation;renderGenerationControls();renderTree();}));

    const select=byId('memberGenerationFilter');
    const old=select.value||'all';
    select.innerHTML='<option value="all">Tất cả</option>'+gens.map(g=>`<option value="${g}">Đời ${g}</option>`).join('');
    if([...select.options].some(o=>o.value===old)) select.value=old;
  }

  function renderTree(){
    const tree=byId('familyTree');
    const gens=generations().filter(g=>generationFilter==='all'||String(g)===String(generationFilter));
    if(!gens.length){tree.innerHTML='<div class="empty-state glass-card"><strong>Chưa có thành viên</strong></div>';return;}
    tree.innerHTML=gens.map(g=>{
      const people=state.members.filter(m=>Number(m.generation)===g);
      return `<section class="generation-column" data-generation="${g}"><div class="generation-title">ĐỜI ${g}</div>${people.map(person=>{
        const parent=state.members.find(m=>m.id===person.parentId);
        const ancestor=person.role==='Thủy tổ'||g===1;
        return `<button class="person-card ${ancestor?'ancestor':''}" data-person-id="${escapeHtml(person.id)}"><span class="person-avatar">${ancestor?'祖':escapeHtml(initials(person.name))}</span><span class="person-copy"><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(person.role||`Đời thứ ${g}`)}${parent?` · Con ${escapeHtml(parent.name)}`:''}</span></span></button>`;
      }).join('')}</section>`;
    }).join('');
    tree.querySelectorAll('[data-person-id]').forEach(el=>el.addEventListener('click',()=>openPersonActions(el.dataset.personId)));
    applyTreeZoom(treeZoom);
  }

  function naturalTreeWidth(){
    const count=generations().filter(g=>generationFilter==='all'||String(g)===String(generationFilter)).length||1;
    return count*190+(count-1)*20;
  }
  function applyTreeZoom(value){
    treeZoom=Math.max(.55,Math.min(1.35,Number(value)||1));
    const tree=byId('familyTree');
    tree.style.transform=`scale(${treeZoom})`;
    tree.style.width=`${100/treeZoom}%`;
    byId('zoomValue').textContent=`${Math.round(treeZoom*100)}%`;
  }
  function fitTree(){
    if(currentView!=='tree') return;
    const viewport=byId('treeViewport');
    if(!viewport) return;
    const available=Math.max(290,viewport.clientWidth-4), natural=naturalTreeWidth();
    let target=1;
    if(settings.displayMode==='mobile') target=Math.min(.72,available/natural);
    else if(settings.displayMode==='desktop') target=1;
    else target=Math.min(1,available/natural);
    applyTreeZoom(target);
    viewport.scrollTo({left:0,top:0,behavior:'smooth'});
  }

  function memberMatches(member){
    const q=(byId('memberSearch').value||'').trim().toLocaleLowerCase('vi');
    const gen=byId('memberGenerationFilter').value;
    return (!q||member.name.toLocaleLowerCase('vi').includes(q))&&(gen==='all'||String(member.generation)===gen);
  }
  function renderMembers(){
    const list=byId('memberList');
    const members=(state.members||[]).filter(memberMatches).sort((a,b)=>(a.generation-b.generation)||a.name.localeCompare(b.name,'vi'));
    if(!members.length){list.innerHTML=emptyState('人','Chưa có dữ liệu phù hợp','Thử đổi từ khóa hoặc bộ lọc theo đời.');return;}
    list.innerHTML=members.map(m=>{
      const parent=state.members.find(p=>p.id===m.parentId);
      return `<article class="member-row glass-card" data-member-row="${escapeHtml(m.id)}"><span class="person-avatar">${m.role==='Thủy tổ'?'祖':escapeHtml(initials(m.name))}</span><div class="member-row-copy"><strong>${escapeHtml(m.name)}</strong><span>${escapeHtml(m.role||`Đời thứ ${m.generation}`)}</span><small>${parent?`Cha/mẹ: ${escapeHtml(parent.name)}`:'Gốc dòng họ'}</small></div><button class="row-action" data-member-menu="${escapeHtml(m.id)}" aria-label="Tùy chọn">•••</button></article>`;
    }).join('');
    list.querySelectorAll('[data-member-menu]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();openPersonActions(btn.dataset.memberMenu);}));
    list.querySelectorAll('[data-member-row]').forEach(row=>row.addEventListener('click',()=>openMemberEditor(row.dataset.memberRow)));
  }

  function renderEvents(){
    const list=byId('eventList'), events=[...(state.events||[])].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    if(!events.length){list.innerHTML=emptyState('◷','Chưa có sự kiện','Thêm ngày giỗ, họp họ, lễ tưởng niệm hoặc dấu mốc quan trọng.');return;}
    list.innerHTML=events.map(e=>`<article class="timeline-item glass-card"><span class="timeline-icon">◷</span><div class="timeline-copy"><strong>${escapeHtml(e.title)}</strong><span>${escapeHtml(e.note||'Không có ghi chú')}</span></div><button class="row-action" data-event-menu="${escapeHtml(e.id)}" aria-label="Tùy chọn"><span class="event-date">${escapeHtml(formatDate(e.date))}</span></button></article>`).join('');
    list.querySelectorAll('[data-event-menu]').forEach(btn=>btn.addEventListener('click',()=>openEventActions(btn.dataset.eventMenu)));
  }

  function renderDocuments(){
    const list=byId('documentList'), docs=state.documents||[];
    if(!docs.length){list.innerHTML=emptyState('▤','Chưa có tư liệu','Thêm ghi chép, câu chuyện, di huấn hoặc thông tin lịch sử của dòng họ.');return;}
    list.innerHTML=docs.map(d=>`<article class="document-row glass-card"><span class="document-icon">▤</span><div class="document-copy"><strong>${escapeHtml(d.title)}</strong><span>${escapeHtml((d.content||'').slice(0,90)||'Không có nội dung')}</span></div><button class="row-action" data-doc-menu="${escapeHtml(d.id)}" aria-label="Tùy chọn">•••</button></article>`).join('');
    list.querySelectorAll('[data-doc-menu]').forEach(btn=>btn.addEventListener('click',()=>openDocumentActions(btn.dataset.docMenu)));
  }

  function emptyState(icon,title,message){return `<article class="empty-state glass-card"><span class="empty-icon">${icon}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p></article>`;}

  function renderCloudStatus(){
    const el=byId('cloudStatus');
    const modeLabels={manual:'Thủ công','6h':'Mỗi 6 giờ','1d':'Mỗi 1 ngày','1w':'Mỗi 1 tuần','1m':'Mỗi 1 tháng'};
    if(settings.driveConnected) el.textContent=`Google Drive đã kết nối · ${modeLabels[settings.syncMode]||'Thủ công'}`;
    else if(settings.driveClientId) el.textContent=`Đã lưu OAuth Client ID · Chưa hoàn tất kết nối Google Drive`;
    else el.textContent='Google Drive chưa được thiết lập';
  }

  function renderAll(){
    renderStats(); renderGenerationControls(); renderTree(); renderMembers(); renderEvents(); renderDocuments(); renderCloudStatus();
  }

  function openDrawer(){byId('drawer').classList.add('open');byId('drawer').setAttribute('aria-hidden','false');}
  function closeDrawer(){byId('drawer').classList.remove('open');byId('drawer').setAttribute('aria-hidden','true');}

  function openSheet({title='Tùy chọn',description='',actions=[]}){
    const sheet=byId('actionSheet'); byId('sheetTitle').textContent=title; byId('sheetDescription').textContent=description;
    const box=byId('sheetActions'); box.innerHTML='';
    actions.forEach(action=>{
      const btn=document.createElement('button'); btn.className=`sheet-action${action.selected?' selected':''}`;
      btn.innerHTML=`<span><strong>${escapeHtml(action.title)}</strong>${action.description?`<small>${escapeHtml(action.description)}</small>`:''}</span><span>${action.selected?'✓':'›'}</span>`;
      btn.addEventListener('click',async()=>{ if(action.keepOpen!==true) closeSheet(); try{await action.onSelect?.();}catch(error){toast(error.message||'Không thể thực hiện lúc này');} });
      box.appendChild(btn);
    });
    sheet.hidden=false; sheet.setAttribute('aria-hidden','false');
  }
  function closeSheet(){const sheet=byId('actionSheet');sheet.hidden=true;sheet.setAttribute('aria-hidden','true');}

  function appConfirm({title='Xác nhận',message='',confirmText='Đồng ý',danger=false}={}){
    return new Promise(resolve=>{
      confirmResolver=resolve; byId('confirmTitle').textContent=title; byId('confirmMessage').textContent=message;
      byId('confirmOk').textContent=confirmText; byId('confirmOk').classList.toggle('danger-confirm',danger);
      const modal=byId('confirmModal'); modal.hidden=false; modal.setAttribute('aria-hidden','false');
    });
  }
  function resolveConfirm(value){
    const modal=byId('confirmModal');modal.hidden=true;modal.setAttribute('aria-hidden','true');
    const fn=confirmResolver;confirmResolver=null;fn?.(Boolean(value));
  }

  function field(label,name,type='text',value='',options=null){
    if(type==='textarea') return `<div class="form-field"><label for="edit-${name}">${escapeHtml(label)}</label><textarea id="edit-${name}" name="${name}">${escapeHtml(value)}</textarea></div>`;
    if(type==='select') return `<div class="form-field"><label for="edit-${name}">${escapeHtml(label)}</label><select id="edit-${name}" name="${name}">${(options||[]).map(o=>`<option value="${escapeHtml(o.value)}" ${String(o.value)===String(value)?'selected':''}>${escapeHtml(o.label)}</option>`).join('')}</select></div>`;
    return `<div class="form-field"><label for="edit-${name}">${escapeHtml(label)}</label><input id="edit-${name}" name="${name}" type="${type}" value="${escapeHtml(value)}"></div>`;
  }

  function openEditor({kind,id=null,title,eyebrow,fields,onSave}){
    editorContext={kind,id,onSave}; byId('editorTitle').textContent=title;byId('editorEyebrow').textContent=eyebrow;
    byId('editorFields').innerHTML=fields; const modal=byId('editorModal'); modal.hidden=false;modal.setAttribute('aria-hidden','false');
    requestAnimationFrame(()=>$('#editorFields input, #editorFields select, #editorFields textarea')?.focus());
  }
  function closeEditor(){byId('editorModal').hidden=true;byId('editorModal').setAttribute('aria-hidden','true');editorContext=null;byId('editorForm').reset();}

  function parentOptions(member){
    const maxGen=Math.max(1,Number(member?.generation||2)-1);
    return [{value:'',label:'Không chọn'}].concat(state.members.filter(m=>!member||m.id!==member.id).filter(m=>Number(m.generation)<=maxGen).map(m=>({value:m.id,label:`Đời ${m.generation} · ${m.name}`})));
  }
  function openMemberEditor(id=null){
    const member=id?state.members.find(m=>m.id===id):null;
    const generation=member?.generation||Math.max(1,maxGeneration());
    const genOptions=Array.from({length:Math.max(8,maxGeneration()+2)},(_,i)=>({value:i+1,label:`Đời thứ ${i+1}`}));
    openEditor({kind:'member',id,title:member?'Chỉnh sửa thành viên':'Thêm thành viên',eyebrow:'THÀNH VIÊN',fields:
      field('Họ và tên','name','text',member?.name||'')+
      field('Đời','generation','select',generation,genOptions)+
      field('Cha / mẹ trực hệ','parentId','select',member?.parentId||'',parentOptions(member))+
      field('Vai trò','role','text',member?.role||'')+
      field('Ghi chú','note','textarea',member?.note||''),
      onSave:values=>{
        if(!values.name.trim()) throw new Error('Vui lòng nhập họ tên');
        const next={id:member?.id||`pv-${Date.now().toString(36)}`,name:values.name.trim(),generation:Number(values.generation)||1,parentId:values.parentId||null,role:values.role.trim(),note:values.note.trim()};
        if(member) state.members=state.members.map(m=>m.id===member.id?next:m); else state.members=[...state.members,next];
        saveState();toast(member?'Đã cập nhật thành viên':'Đã thêm thành viên');
      }
    });
  }
  function openEventEditor(id=null){
    const event=id?(state.events||[]).find(e=>e.id===id):null;
    openEditor({kind:'event',id,title:event?'Chỉnh sửa sự kiện':'Thêm sự kiện',eyebrow:'SỰ KIỆN',fields:field('Tên sự kiện','title','text',event?.title||'')+field('Ngày','date','date',event?.date||'')+field('Ghi chú','note','textarea',event?.note||''),onSave:values=>{
      if(!values.title.trim()) throw new Error('Vui lòng nhập tên sự kiện');
      const next={id:event?.id||`event-${Date.now().toString(36)}`,title:values.title.trim(),date:values.date||'',note:values.note.trim()};
      state.events=event?state.events.map(e=>e.id===event.id?next:e):[...(state.events||[]),next];saveState();toast(event?'Đã cập nhật sự kiện':'Đã thêm sự kiện');
    }});
  }
  function openDocumentEditor(id=null){
    const doc=id?(state.documents||[]).find(d=>d.id===id):null;
    openEditor({kind:'document',id,title:doc?'Chỉnh sửa tư liệu':'Thêm tư liệu',eyebrow:'TƯ LIỆU',fields:field('Tiêu đề','title','text',doc?.title||'')+field('Nội dung','content','textarea',doc?.content||''),onSave:values=>{
      if(!values.title.trim()) throw new Error('Vui lòng nhập tiêu đề');
      const next={id:doc?.id||`doc-${Date.now().toString(36)}`,title:values.title.trim(),content:values.content.trim(),updatedAt:new Date().toISOString()};
      state.documents=doc?state.documents.map(d=>d.id===doc.id?next:d):[...(state.documents||[]),next];saveState();toast(doc?'Đã cập nhật tư liệu':'Đã thêm tư liệu');
    }});
  }

  function openPersonActions(id){
    const person=state.members.find(m=>m.id===id);if(!person)return;
    openSheet({title:person.name,description:person.role||`Đời thứ ${person.generation}`,actions:[
      {title:'Chỉnh sửa',description:'Cập nhật thông tin thành viên',onSelect:()=>openMemberEditor(id)},
      {title:'Xóa thành viên',description:'Chỉ xóa sau khi xác nhận',onSelect:async()=>{const ok=await appConfirm({title:'Xóa thành viên?',message:`Xóa ${person.name} khỏi dữ liệu gia phả trên thiết bị này?`,confirmText:'Xóa',danger:true});if(!ok)return;state.members=state.members.filter(m=>m.id!==id).map(m=>m.parentId===id?{...m,parentId:null}:m);saveState();toast('Đã xóa thành viên');}}
    ]});
  }
  function openEventActions(id){const event=state.events.find(e=>e.id===id);if(!event)return;openSheet({title:event.title,description:formatDate(event.date),actions:[{title:'Chỉnh sửa',onSelect:()=>openEventEditor(id)},{title:'Xóa sự kiện',onSelect:async()=>{if(await appConfirm({title:'Xóa sự kiện?',message:'Sự kiện sẽ bị xóa khỏi dữ liệu local.',confirmText:'Xóa',danger:true})){state.events=state.events.filter(e=>e.id!==id);saveState();toast('Đã xóa sự kiện');}}}]});}
  function openDocumentActions(id){const doc=state.documents.find(d=>d.id===id);if(!doc)return;openSheet({title:doc.title,description:'Tư liệu dòng họ',actions:[{title:'Chỉnh sửa',onSelect:()=>openDocumentEditor(id)},{title:'Xóa tư liệu',onSelect:async()=>{if(await appConfirm({title:'Xóa tư liệu?',message:'Tư liệu này sẽ bị xóa khỏi dữ liệu local.',confirmText:'Xóa',danger:true})){state.documents=state.documents.filter(d=>d.id!==id);saveState();toast('Đã xóa tư liệu');}}}]});}

  function openSyncModeSheet(){
    const modes=[['manual','Thủ công','Chỉ đồng bộ khi bạn chủ động nhấn nút.'],['6h','Mỗi 6 giờ','Khi app được mở lại sau mốc đồng bộ.'],['1d','Mỗi 1 ngày','Khi app được mở lại sau mốc đồng bộ.'],['1w','Mỗi 1 tuần','Khi app được mở lại sau mốc đồng bộ.'],['1m','Mỗi 1 tháng','Khi app được mở lại sau mốc đồng bộ.']];
    openSheet({title:'Đồng bộ Google Drive',description:'iOS/PWA không đảm bảo chạy nền liên tục.',actions:modes.map(([value,title,description])=>({title,description,selected:settings.syncMode===value,onSelect:()=>{settings.syncMode=value;saveSettings();renderCloudStatus();toast(`Đã chọn đồng bộ ${title.toLowerCase()}`);if(value==='manual') attemptCloudSync();}}))});
  }
  function attemptCloudSync(){
    if(!settings.driveClientId){toast('Google Drive chưa được thiết lập');return;}
    if(!settings.driveConnected){toast('Đã lưu OAuth Client ID nhưng chưa có phiên Google Drive');return;}
    toast('Google Drive adapter chưa được cấp phiên trong bản này');
  }
  function openDriveSheet(){
    openSheet({title:'Thiết lập Google Drive',description:settings.driveClientId?'OAuth Client ID đã được lưu cho gia phả này.':'Cấu hình được tách riêng, không sao chép token từ phần mềm khác.',actions:[
      {title:settings.driveClientId?'Thay đổi OAuth Client ID':'Nhập OAuth Client ID',description:'Client ID không phải mật khẩu và có thể lưu local.',onSelect:()=>openDriveClientEditor()},
      {title:'Kết nối / kết nối lại',description:'Cần phiên OAuth hợp lệ của Google Drive.',onSelect:()=>toast('Luồng OAuth Google Drive sẽ được nối ở bước Cloud tiếp theo')},
      ...(settings.driveClientId?[{title:'Xóa cấu hình Google Drive',description:'Không xóa bất kỳ file nào trên Drive.',onSelect:async()=>{if(await appConfirm({title:'Xóa cấu hình Google Drive?',message:'Chỉ xóa cấu hình trên thiết bị này; file đã có trên Google Drive không bị xóa.',confirmText:'Đồng ý'})){settings.driveClientId='';settings.driveConnected=false;saveSettings();renderCloudStatus();toast('Đã xóa cấu hình Google Drive');}}}]:[])
    ]});
  }
  function openDriveClientEditor(){
    openEditor({kind:'drive',title:'OAuth Client ID',eyebrow:'GOOGLE DRIVE',fields:field('Google OAuth Client ID','clientId','text',settings.driveClientId||''),onSave:values=>{settings.driveClientId=values.clientId.trim();settings.driveConnected=false;saveSettings();renderCloudStatus();toast(settings.driveClientId?'Đã lưu OAuth Client ID':'Đã xóa OAuth Client ID');}});
  }

  function backupDestinationSheet(){
    openSheet({title:'Tải file sao lưu',description:'Chọn nơi lưu bản sao dữ liệu.',actions:[
      {title:'Local · tải về thiết bị',description:'Tạo file JSON đầy đủ trên thiết bị.',onSelect:()=>{const name=Store.downloadBackup();toast(`Đã tạo ${name}`);}},
      {title:'Cloud · Google Drive',description:'Dùng Google Drive đã cài đặt.',onSelect:()=>attemptCloudSync()}
    ]});
  }
  function restoreSourceSheet(){
    openSheet({title:'Phục hồi dữ liệu',description:'Chọn nguồn bản sao. Hệ thống sẽ tạo snapshot trước khi ghi.',actions:[
      {title:'Local · chọn file trên thiết bị',description:'Nhận file JSON đúng app và đúng gia phả.',onSelect:()=>byId('backupFileInput').click()},
      {title:'Cloud · Google Drive',description:'Phục hồi từ Google Drive đã cài đặt.',onSelect:()=>attemptCloudSync()}
    ]});
  }

  async function handleBackupFile(file){
    try{
      const payload=await Store.readBackupFile(file);const preview=Store.previewBackup(payload);
      const ok=await appConfirm({title:'Phục hồi dữ liệu',message:`Bản sao có ${preview.members} thành viên, ${preview.events} sự kiện và ${preview.documents} tư liệu. Dữ liệu hiện tại sẽ được snapshot trước khi thay đổi.`,confirmText:'Phục hồi'});
      if(!ok)return;
      Store.restorePayload(payload);state=Store.loadData();renderAll();toast('Phục hồi dữ liệu hoàn tất');
    }catch(error){toast(error.message||'Không thể phục hồi dữ liệu');}
    finally{byId('backupFileInput').value='';}
  }

  async function refreshStorage(){
    if(!Storage)return;
    const info=await Storage.estimate();
    byId('storageUsed').textContent=info.labels.usage; byId('storageAvailable').textContent=info.labels.available;
    byId('localStorageUsed').textContent=info.labels.localStorage; byId('persistentState').textContent=info.persisted?'Đã bật':'Chưa bật';
    byId('storageSummary').textContent=`Khả dụng ${info.labels.available}`; byId('storageProgress').style.width=`${Math.max(1,info.percent)}%`;
  }

  function bindEvents(){
    $$('#bottomNav [data-nav]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.nav)));
    $$('[data-go]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.go)));
    byId('menuButton').addEventListener('click',openDrawer); byId('drawer').addEventListener('click',e=>{if(e.target===byId('drawer'))closeDrawer();});
    $$('[data-drawer-go]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.drawerGo)));
    byId('accountButton').addEventListener('click',()=>navigate('settings'));
    byId('languageButton').addEventListener('click',()=>openSheet({title:'Ngôn ngữ',description:'Phiên bản hiện tại dùng tiếng Việt.',actions:[{title:'🇻🇳 Tiếng Việt',description:'Ngôn ngữ đang sử dụng',selected:true,onSelect:()=>toast('Đang sử dụng Tiếng Việt')}]}));

    $$('#themeSegment button').forEach(btn=>btn.addEventListener('click',()=>{settings.theme=btn.dataset.themeChoice;saveSettings();applyTheme();}));
    $$('[data-display],[data-display-setting]').forEach(btn=>btn.addEventListener('click',()=>{settings.displayMode=btn.dataset.display||btn.dataset.displaySetting;saveSettings();applyDisplayMode();}));
    byId('zoomOut').addEventListener('click',()=>applyTreeZoom(treeZoom-.1));byId('zoomIn').addEventListener('click',()=>applyTreeZoom(treeZoom+.1));byId('fitTreeButton').addEventListener('click',fitTree);
    byId('memberSearch').addEventListener('input',renderMembers);byId('memberGenerationFilter').addEventListener('change',renderMembers);
    byId('addMemberButton').addEventListener('click',()=>openMemberEditor());byId('addEventButton').addEventListener('click',()=>openEventEditor());byId('addDocumentButton').addEventListener('click',()=>openDocumentEditor());

    $$('[data-sheet-close]').forEach(el=>el.addEventListener('click',closeSheet));
    byId('confirmCancel').addEventListener('click',()=>resolveConfirm(false));byId('confirmOk').addEventListener('click',()=>resolveConfirm(true));byId('confirmModal').querySelector('.modal-backdrop').addEventListener('click',()=>resolveConfirm(false));
    $$('[data-editor-close]').forEach(el=>el.addEventListener('click',closeEditor));
    byId('editorForm').addEventListener('submit',e=>{e.preventDefault();if(!editorContext)return;const values=Object.fromEntries(new FormData(e.currentTarget).entries());try{editorContext.onSave?.(values);closeEditor();}catch(error){toast(error.message||'Không thể lưu');}});

    byId('cloud-sync-now').addEventListener('click',openSyncModeSheet);byId('cloud-connect').addEventListener('click',openDriveSheet);
    byId('export-data').addEventListener('click',backupDestinationSheet);
    byId('share-data').addEventListener('click',async()=>{try{const result=await Store.shareBackup();toast(result.shared?'Đã mở bảng chia sẻ':'Thiết bị không hỗ trợ chia sẻ file; đã tải bản sao');}catch(error){if(error.name!=='AbortError')toast('Không thể chia sẻ file lúc này');}});
    byId('import-data').addEventListener('click',restoreSourceSheet);byId('backupFileInput').addEventListener('change',e=>handleBackupFile(e.target.files?.[0]));
    byId('delete-local-data').addEventListener('click',async()=>{const ok=await appConfirm({title:'Xóa toàn bộ dữ liệu?',message:'Thao tác này xóa thành viên, sự kiện và tư liệu của gia phả hiện tại trên thiết bị. Hệ thống tạo snapshot trước khi xóa.',confirmText:'Xóa dữ liệu',danger:true});if(!ok)return;Store.clearAppData();state=Store.loadData();renderAll();toast('Đã xóa dữ liệu local');});
    byId('resetSeedButton').addEventListener('click',async()=>{const ok=await appConfirm({title:'Khôi phục dữ liệu đã đọc từ Site?',message:'Bộ 16 thành viên / 4 đời đã xác minh sẽ thay thế dữ liệu local hiện tại sau khi tạo snapshot.',confirmText:'Khôi phục'});if(!ok)return;Store.resetToSeed();state=Store.loadData();renderAll();toast('Đã khôi phục dữ liệu từ Site projection');});

    byId('refreshStorage').addEventListener('click',async()=>{await refreshStorage();toast('Đã cập nhật dung lượng lưu trữ');});
    byId('persistStorage').addEventListener('click',async()=>{const ok=await appConfirm({title:'Bật lưu trữ bền vững',message:'Yêu cầu trình duyệt ưu tiên giữ dữ liệu Gia phả trên thiết bị. Dữ liệu vẫn nên được sao lưu định kỳ.',confirmText:'Đồng ý'});if(!ok)return;const granted=await Storage.requestPersistent();await refreshStorage();toast(granted?'Đã bật lưu trữ bền vững':'Thiết bị chưa cấp quyền lưu trữ bền vững');});
    byId('optimizeStorage').addEventListener('click',async()=>{const ok=await appConfirm({title:'Tối ưu dung lượng',message:'Dọn dữ liệu tạm và cache cũ. Thành viên, sự kiện, tư liệu và bản dữ liệu chính không bị xóa.',confirmText:'Đồng ý'});if(!ok)return;await Storage.optimize();await refreshStorage();toast('Đã tối ưu dung lượng');});

    window.addEventListener('resize',()=>{if(currentView==='tree')fitTree();});
    bindAutoHideNavigation();
  }

  function bindAutoHideNavigation(){
    let lastY=window.scrollY,lastToggle=0,hidden=false;
    const topbar=byId('topbar'),nav=byId('bottomNav');
    const setHidden=value=>{hidden=value;topbar.classList.toggle('nav-hidden',value);nav.classList.toggle('nav-hidden',value);lastToggle=Date.now();};
    window.addEventListener('scroll',()=>{
      if(!byId('actionSheet').hidden||!byId('editorModal').hidden||!byId('confirmModal').hidden)return;
      const y=window.scrollY,delta=y-lastY;lastY=y;
      if(y<70){if(hidden)setHidden(false);return;}
      if(Date.now()-lastToggle<320||Math.abs(delta)<10)return;
      if(delta>28&&!hidden)setHidden(true);else if(delta<-22&&hidden)setHidden(false);
    },{passive:true});
  }

  function maybeRunScheduledSync(){
    const intervals={"6h":21600000,"1d":86400000,"1w":604800000,"1m":2592000000};
    const delay=intervals[settings.syncMode];if(!delay||!settings.driveConnected)return;
    const last=settings.lastSync?new Date(settings.lastSync).getTime():0;
    if(Date.now()-last>=delay) attemptCloudSync();
  }

  function init(){
    applyTheme();applyDisplayMode();renderAll();bindEvents();refreshStorage();navigate('overview');maybeRunScheduledSync();
    if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }

  init();
})();
