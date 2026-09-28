(() => {
  'use strict';

  const Store = window.PhamVanStore;
  const Storage = window.PhamVanStorage;
  const Cloud = window.PhamVanCloud;
  if (!Store) throw new Error('PhamVanStore chưa được nạp');

  let state = Store.loadData();
  let settings = { theme:'auto', displayMode:'auto', syncMode:'manual', lastSync:null, ...(Store.loadSettings()||{}) };
  let currentView = 'tree';
  let generationFilter = 'all';
  let editorContext = null;
  let confirmResolver = null;
  let toastTimer = null;

  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];
  const byId = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const avatarPool = ['/avatar-1.svg','/avatar-2.svg','/avatar-3.svg','/avatar-4.svg'];
  const referenceIds = new Set(['pv-001','pv-002','pv-003','pv-005','pv-006','pv-007','pv-011','pv-012','pv-015','pv-016']);

  function toast(message){
    const el=byId('toast'); if(!el) return;
    clearTimeout(toastTimer); el.textContent=message; el.classList.add('show');
    toastTimer=setTimeout(()=>el.classList.remove('show'),2500);
  }
  function setText(id,value){ const el=byId(id); if(el) el.textContent=value; }
  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function generations(){ return [...new Set((state.members||[]).map(m=>Number(m.generation)||1))].sort((a,b)=>a-b); }
  function maxGeneration(){ const g=generations(); return g.length?g[g.length-1]:0; }
  function initials(name){ const p=String(name||'').trim().split(/\s+/).filter(Boolean); return (p.at(-1)?.[0]||p[0]?.[0]||'P').toUpperCase(); }
  function formatDate(value){ if(!value) return 'Chưa đặt ngày'; const d=new Date(`${value}T00:00:00`); return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d); }

  function applyTheme(){
    document.documentElement.dataset.theme=settings.theme||'auto';
    $$('#themeSegment [data-theme-choice]').forEach(btn=>btn.classList.toggle('active',btn.dataset.themeChoice===settings.theme));
  }
  function applyDisplayMode(){
    document.body.dataset.displayMode=settings.displayMode||'auto';
    $$('[data-display],[data-display-setting]').forEach(btn=>{
      const value=btn.dataset.display||btn.dataset.displaySetting;
      btn.classList.toggle('active',value===settings.displayMode);
    });
    renderTree();
  }
  function saveSettings(){ Store.saveSettings(settings); }
  function saveState(){ state=Store.saveData(state); renderAll(); }

  function navigate(view){
    if(view==='more'){ openDrawer(); return; }
    if(!byId(`${view}-view`)) view='tree';
    currentView=view;
    $$('.view').forEach(el=>{ const active=el.dataset.view===view; el.hidden=!active; el.classList.toggle('active',active); });
    $$('#bottomNav [data-nav]').forEach(btn=>btn.classList.toggle('active',btn.dataset.nav===view));
    closeDrawer();
    window.scrollTo({top:0,behavior:'instant'});
    if(view==='tree') requestAnimationFrame(()=>{renderTree();drawConnectors();});
    if(view==='settings') refreshStorage();
  }

  function renderStats(){
    const members=state.members?.length||0, events=state.events?.length||0, docs=state.documents?.length||0, gens=maxGeneration();
    setText('statMembers',members); setText('statGenerations',gens); setText('statEvents',events); setText('statDocuments',docs);
    setText('sourceStatus',`${members} thành viên · ${gens} đời`); setText('treeMemberCount',members); setText('treeGenerationCount',gens); setText('membersSubtitle',`${members} thành viên`);
  }

  function renderGenerationControls(){
    const chips=byId('generationChips'); if(!chips) return;
    const gens=generations();
    chips.innerHTML=[`<button class="generation-chip ${generationFilter==='all'?'active':''}" data-generation="all">Tất cả</button>`]
      .concat(gens.map(g=>`<button class="generation-chip ${String(generationFilter)===String(g)?'active':''}" data-generation="${g}">Đời thứ ${g}</button>`)).join('');
    $$('[data-generation]',chips).forEach(btn=>btn.addEventListener('click',()=>{generationFilter=btn.dataset.generation;renderGenerationControls();renderTree();}));
    const select=byId('memberGenerationFilter');
    if(select){ const old=select.value||'all'; select.innerHTML='<option value="all">Tất cả</option>'+gens.map(g=>`<option value="${g}">Đời ${g}</option>`).join(''); if([...select.options].some(o=>o.value===old)) select.value=old; }
  }

  function treeMembersForGeneration(g){
    let people=(state.members||[]).filter(m=>Number(m.generation)===g);
    if(generationFilter!=='all') return people;
    if((settings.displayMode||'auto')==='desktop') return people;
    const preferred=people.filter(m=>referenceIds.has(m.id));
    return preferred.length?preferred:people;
  }

  function renderTree(){
    const tree=byId('familyTree'); if(!tree) return;
    const gens=generations().filter(g=>generationFilter==='all'||String(g)===String(generationFilter));
    if(!gens.length){ tree.innerHTML='<div class="empty-state"><strong>Chưa có thành viên</strong><p>Hãy thêm thành viên để dựng cây gia phả.</p></div>'; return; }
    tree.innerHTML=gens.map(g=>{
      const people=treeMembersForGeneration(g);
      return `<section class="generation-column" data-generation="${g}" data-count="${Math.max(1,people.length)}">
        <div class="generation-title">ĐỜI THỨ ${g}</div>
        ${people.map((person,index)=>{
          const ancestor=person.role==='Thủy tổ'||g===1;
          const portrait=ancestor?'/avatar-ancestor.svg':avatarPool[(g+index-2+avatarPool.length)%avatarPool.length];
          const role=ancestor?'Thủy tổ':`Đời thứ ${g}`;
          return `<button class="person-card ${ancestor?'ancestor':''}" data-person-id="${esc(person.id)}" data-parent-id="${esc(person.parentId||'')}">
            <span class="person-avatar"><img src="${portrait}" alt=""></span>
            <span class="person-copy"><strong>${esc(person.name)}</strong><span>${esc(role)}${ancestor?' · Đời thứ 1':''}</span></span>
            <span class="person-badge">${ancestor?'祖':esc(initials(person.name))}</span>
          </button>`;
        }).join('')}
      </section>`;
    }).join('');
    $$('[data-person-id]',tree).forEach(card=>card.addEventListener('click',()=>openPersonActions(card.dataset.personId)));
    requestAnimationFrame(()=>requestAnimationFrame(drawConnectors));
  }

  function ensureConnectorSvg(){
    const stage=$('.tree-stage'); if(!stage) return null;
    let svg=$('.tree-connectors',stage);
    if(!svg){ svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.classList.add('tree-connectors'); stage.prepend(svg); }
    return svg;
  }
  function drawConnectors(){
    if(currentView!=='tree') return;
    const stage=$('.tree-stage'), tree=byId('familyTree'); if(!stage||!tree) return;
    const svg=ensureConnectorSvg(); if(!svg) return;
    const stageRect=stage.getBoundingClientRect(); const columns=$$('.generation-column',tree);
    const width=Math.max(1,stage.scrollWidth), height=Math.max(stage.scrollHeight,stageRect.height);
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`); svg.setAttribute('width',width); svg.setAttribute('height',height); svg.innerHTML='';
    const NS='http://www.w3.org/2000/svg';
    const line=(x1,y1,x2,y2)=>{ const el=document.createElementNS(NS,'line'); Object.entries({x1,y1,x2,y2}).forEach(([k,v])=>el.setAttribute(k,String(v))); svg.appendChild(el); return el; };
    const circle=(cx,cy,r=4)=>{ const el=document.createElementNS(NS,'circle'); el.setAttribute('cx',cx);el.setAttribute('cy',cy);el.setAttribute('r',r);svg.appendChild(el); };
    const centerX=rect=>rect.left-stageRect.left+rect.width/2;
    columns.forEach((column,i)=>{
      if(i===0) return;
      const prev=columns[i-1], prevCards=$$('.person-card',prev), cards=$$('.person-card',column);
      if(!prevCards.length||!cards.length) return;
      const prevRects=prevCards.map(c=>c.getBoundingClientRect()), cardRects=cards.map(c=>c.getBoundingClientRect());
      const sourceX=prevRects.reduce((s,r)=>s+centerX(r),0)/prevRects.length;
      const sourceY=Math.max(...prevRects.map(r=>r.bottom-stageRect.top));
      const targetY=Math.min(...cardRects.map(r=>r.top-stageRect.top));
      const railY=sourceY+Math.max(18,(targetY-sourceY)*.48);
      const xs=cardRects.map(centerX);
      line(sourceX,sourceY,sourceX,railY);
      line(Math.min(...xs),railY,Math.max(...xs),railY);
      circle(sourceX,sourceY,3.4);
      xs.forEach((x,index)=>{ line(x,railY,x,targetY); circle(x,railY,3.2); if(index===0||index===xs.length-1) circle(x,targetY,2.8); });
    });
  }

  function memberMatches(m){
    const search=byId('memberSearch'), select=byId('memberGenerationFilter');
    const q=(search?.value||'').trim().toLocaleLowerCase('vi'), gen=select?.value||'all';
    return (!q||m.name.toLocaleLowerCase('vi').includes(q))&&(gen==='all'||String(m.generation)===gen);
  }
  function renderMembers(){
    const list=byId('memberList'); if(!list) return;
    const members=(state.members||[]).filter(memberMatches).sort((a,b)=>(a.generation-b.generation)||a.name.localeCompare(b.name,'vi'));
    list.innerHTML=members.length?members.map((m,index)=>`<article class="member-row" data-member-row="${esc(m.id)}"><span class="person-avatar"><img src="${m.role==='Thủy tổ'?'/avatar-ancestor.svg':avatarPool[index%avatarPool.length]}" alt=""></span><div class="member-row-copy"><strong>${esc(m.name)}</strong><span>${esc(m.role||`Đời thứ ${m.generation}`)}</span><small>${m.parentId?'Đã liên kết trong cây':'Gốc dòng họ'}</small></div><button class="row-action" data-member-menu="${esc(m.id)}" aria-label="Tùy chọn">•••</button></article>`).join(''):`<article class="empty-state"><strong>Chưa có thành viên phù hợp</strong></article>`;
    $$('[data-member-row]',list).forEach(row=>row.addEventListener('click',e=>{if(e.target.closest('[data-member-menu]'))return;openMemberEditor(row.dataset.memberRow);}));
    $$('[data-member-menu]',list).forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();openPersonActions(btn.dataset.memberMenu);}));
  }
  function renderEvents(){
    const list=byId('eventList'); if(!list) return;
    const events=[...(state.events||[])].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    list.innerHTML=events.length?events.map(e=>`<article class="timeline-item"><span class="timeline-icon">◷</span><div class="timeline-copy"><strong>${esc(e.title)}</strong><span>${esc(formatDate(e.date))}${e.note?` · ${esc(e.note)}`:''}</span></div><button class="row-action" data-event-menu="${esc(e.id)}">•••</button></article>`).join(''):`<article class="empty-state"><strong>Chưa có sự kiện</strong><p>Thêm ngày giỗ, họp họ hoặc dấu mốc quan trọng.</p></article>`;
    $$('[data-event-menu]',list).forEach(btn=>btn.addEventListener('click',()=>openEventActions(btn.dataset.eventMenu)));
  }
  function renderDocuments(){
    const list=byId('documentList'); if(!list) return;
    const docs=state.documents||[];
    list.innerHTML=docs.length?docs.map(d=>`<article class="document-row"><span class="document-icon">▤</span><div class="document-copy"><strong>${esc(d.title)}</strong><span>${esc((d.content||'').slice(0,100))}</span></div><button class="row-action" data-doc-menu="${esc(d.id)}">•••</button></article>`).join(''):`<article class="empty-state"><strong>Chưa có tư liệu</strong><p>Thêm ghi chép và câu chuyện của dòng họ.</p></article>`;
    $$('[data-doc-menu]',list).forEach(btn=>btn.addEventListener('click',()=>openDocumentActions(btn.dataset.docMenu)));
  }
  function renderCloudStatus(){
    const el=byId('cloudStatus'); if(!el) return;
    if(!Cloud){el.textContent='Google Drive chưa sẵn sàng';return;}
    const s=Cloud.getState(); el.textContent=s.detail||'Google Drive chưa kết nối';
  }
  function renderAll(){ renderStats(); renderGenerationControls(); renderTree(); renderMembers(); renderEvents(); renderDocuments(); renderCloudStatus(); }

  function openDrawer(){ const d=byId('drawer'); if(d){d.classList.add('open');d.setAttribute('aria-hidden','false');} }
  function closeDrawer(){ const d=byId('drawer'); if(d){d.classList.remove('open');d.setAttribute('aria-hidden','true');} }
  function openSheet({title='Tùy chọn',description='',actions=[]}){
    const sheet=byId('actionSheet'); if(!sheet) return;
    setText('sheetTitle',title); setText('sheetDescription',description);
    const box=byId('sheetActions'); box.innerHTML='';
    actions.forEach(action=>{ const btn=document.createElement('button');btn.className=`sheet-action${action.selected?' selected':''}`;btn.innerHTML=`<span><strong>${esc(action.title)}</strong>${action.description?`<small>${esc(action.description)}</small>`:''}</span><span>${action.selected?'✓':'›'}</span>`;btn.addEventListener('click',async()=>{if(action.keepOpen!==true)closeSheet();try{await action.onSelect?.();}catch(error){toast(error.message||'Không thể thực hiện');}});box.appendChild(btn); });
    sheet.hidden=false;sheet.setAttribute('aria-hidden','false');
  }
  function closeSheet(){ const s=byId('actionSheet');if(s){s.hidden=true;s.setAttribute('aria-hidden','true');} }
  function appConfirm({title='Xác nhận',message='',confirmText='Đồng ý',danger=false}={}){
    return new Promise(resolve=>{confirmResolver=resolve;setText('confirmTitle',title);setText('confirmMessage',message);const ok=byId('confirmOk');if(ok){ok.textContent=confirmText;ok.classList.toggle('danger-confirm',danger);}const modal=byId('confirmModal');modal.hidden=false;modal.setAttribute('aria-hidden','false');});
  }
  function resolveConfirm(value){const modal=byId('confirmModal');if(modal){modal.hidden=true;modal.setAttribute('aria-hidden','true');}const fn=confirmResolver;confirmResolver=null;fn?.(Boolean(value));}

  function field(label,name,type='text',value='',options=[]){
    if(type==='textarea')return `<div class="form-field"><label>${esc(label)}</label><textarea name="${name}">${esc(value)}</textarea></div>`;
    if(type==='select')return `<div class="form-field"><label>${esc(label)}</label><select name="${name}">${options.map(o=>`<option value="${esc(o.value)}" ${String(o.value)===String(value)?'selected':''}>${esc(o.label)}</option>`).join('')}</select></div>`;
    return `<div class="form-field"><label>${esc(label)}</label><input name="${name}" type="${type}" value="${esc(value)}"></div>`;
  }
  function openEditor({kind,id=null,title,eyebrow='THÔNG TIN',fields='',onSave}){editorContext={kind,id,onSave};setText('editorTitle',title);setText('editorEyebrow',eyebrow);const box=byId('editorFields');box.innerHTML=fields;const modal=byId('editorModal');modal.hidden=false;modal.setAttribute('aria-hidden','false');}
  function closeEditor(){const modal=byId('editorModal');if(modal){modal.hidden=true;modal.setAttribute('aria-hidden','true');}editorContext=null;}

  function parentOptions(member){return [{value:'',label:'Không chọn'},...(state.members||[]).filter(m=>!member||m.id!==member.id).map(m=>({value:m.id,label:`Đời ${m.generation} · ${m.name}`}))];}
  function openMemberEditor(id=null){
    const member=id?state.members.find(m=>m.id===id):null; const gen=member?.generation||Math.max(1,maxGeneration());
    openEditor({kind:'member',id,title:member?'Chỉnh sửa thành viên':'Thêm thành viên',eyebrow:'THÀNH VIÊN',fields:field('Họ và tên','name','text',member?.name||'')+field('Đời','generation','number',gen)+field('Cha/mẹ','parentId','select',member?.parentId||'',parentOptions(member))+field('Vai trò','role','text',member?.role||'')+field('Ghi chú','note','textarea',member?.note||''),onSave:v=>{
      if(!String(v.name||'').trim())throw new Error('Cần nhập họ tên');
      const record={id:member?.id||`pv-${Date.now()}`,name:String(v.name).trim(),generation:Math.max(1,Number(v.generation)||1),parentId:v.parentId||null,role:String(v.role||''),note:String(v.note||'')};
      if(member)state.members=state.members.map(m=>m.id===member.id?record:m);else state.members=[...(state.members||[]),record];saveState();toast('Đã lưu thành viên');
    }});
  }
  function openEventEditor(id=null){const event=id?state.events.find(e=>e.id===id):null;openEditor({kind:'event',id,title:event?'Chỉnh sửa sự kiện':'Thêm sự kiện',eyebrow:'SỰ KIỆN',fields:field('Tên sự kiện','title','text',event?.title||'')+field('Ngày','date','date',event?.date||'')+field('Ghi chú','note','textarea',event?.note||''),onSave:v=>{if(!String(v.title||'').trim())throw new Error('Cần nhập tên sự kiện');const record={id:event?.id||`ev-${Date.now()}`,title:String(v.title).trim(),date:v.date||'',note:String(v.note||'')};state.events=event?state.events.map(e=>e.id===event.id?record:e):[...(state.events||[]),record];saveState();toast('Đã lưu sự kiện');}});}
  function openDocumentEditor(id=null){const doc=id?state.documents.find(d=>d.id===id):null;openEditor({kind:'document',id,title:doc?'Chỉnh sửa tư liệu':'Thêm tư liệu',eyebrow:'TƯ LIỆU',fields:field('Tiêu đề','title','text',doc?.title||'')+field('Nội dung','content','textarea',doc?.content||''),onSave:v=>{if(!String(v.title||'').trim())throw new Error('Cần nhập tiêu đề');const record={id:doc?.id||`doc-${Date.now()}`,title:String(v.title).trim(),content:String(v.content||'')};state.documents=doc?state.documents.map(d=>d.id===doc.id?record:d):[...(state.documents||[]),record];saveState();toast('Đã lưu tư liệu');}});}

  function openPersonActions(id){const member=state.members.find(m=>m.id===id);if(!member)return;openSheet({title:member.name,description:member.role||`Đời thứ ${member.generation}`,actions:[{title:'Chỉnh sửa',onSelect:()=>openMemberEditor(id)},{title:'Xóa thành viên',description:'Không thể hoàn tác nếu chưa có bản sao lưu',onSelect:async()=>{const ok=await appConfirm({title:'Xóa thành viên?',message:`Xóa ${member.name} khỏi gia phả?`,confirmText:'Xóa',danger:true});if(!ok)return;state.members=state.members.filter(m=>m.id!==id).map(m=>m.parentId===id?{...m,parentId:null}:m);saveState();toast('Đã xóa thành viên');}}]});}
  function openEventActions(id){const event=state.events.find(e=>e.id===id);if(!event)return;openSheet({title:event.title,actions:[{title:'Chỉnh sửa',onSelect:()=>openEventEditor(id)},{title:'Xóa',onSelect:async()=>{if(await appConfirm({title:'Xóa sự kiện?',message:event.title,confirmText:'Xóa',danger:true})){state.events=state.events.filter(e=>e.id!==id);saveState();}}}]});}
  function openDocumentActions(id){const doc=state.documents.find(d=>d.id===id);if(!doc)return;openSheet({title:doc.title,actions:[{title:'Chỉnh sửa',onSelect:()=>openDocumentEditor(id)},{title:'Xóa',onSelect:async()=>{if(await appConfirm({title:'Xóa tư liệu?',message:doc.title,confirmText:'Xóa',danger:true})){state.documents=state.documents.filter(d=>d.id!==id);saveState();}}}]});}

  async function refreshStorage(){if(!Storage)return;const info=await Storage.estimate();setText('storageUsed',info.labels.usage);setText('storageAvailable',info.labels.available);setText('localStorageUsed',info.labels.localStorage);setText('persistentState',info.persisted?'Đã bật':'Chưa bật');setText('storageSummary',`Khả dụng ${info.labels.available}`);const p=byId('storageProgress');if(p)p.style.width=`${Math.max(1,info.percent)}%`;}
  async function syncNow(){if(!Cloud){toast('Google Drive chưa sẵn sàng');return;}try{const result=await Cloud.syncNow();if(result?.conflict){openSheet({title:'Xung đột dữ liệu',description:'Máy và Google Drive cùng có thay đổi.',actions:[{title:'Dùng bản trên máy',onSelect:()=>Cloud.resolveConflict('local').then(()=>toast('Đã dùng bản trên máy'))},{title:'Dùng bản Google Drive',onSelect:async()=>{await Cloud.resolveConflict('remote');state=Store.loadData();renderAll();toast('Đã dùng bản Google Drive');}}]});}else{state=Store.loadData();renderAll();toast('Đồng bộ hoàn tất');}}catch(e){toast(e.message||'Không đồng bộ được');}}
  function cloudSetup(){if(!Cloud)return;const current=Cloud.getClientId?.()||'';openEditor({kind:'cloud',title:'Thiết lập Google Drive',eyebrow:'GOOGLE DRIVE',fields:field('OAuth Client ID','clientId','text',current),onSave:async v=>{Cloud.setClientId(v.clientId||'');if(v.clientId)await Cloud.connect();renderCloudStatus();toast(v.clientId?'Đã kết nối Google Drive':'Đã xóa cấu hình Google Drive');}});}
  async function restoreLocalFile(file){try{const payload=await Store.readBackupFile(file);const preview=Store.previewBackup(payload);if(await appConfirm({title:'Phục hồi dữ liệu',message:`${preview.members} thành viên · ${preview.events} sự kiện · ${preview.documents} tư liệu`,confirmText:'Phục hồi'})){Store.restorePayload(payload);state=Store.loadData();renderAll();toast('Phục hồi hoàn tất');}}catch(e){toast(e.message||'Không phục hồi được');}finally{if(byId('backupFileInput'))byId('backupFileInput').value='';}}

  function bindEvents(){
    $$('#bottomNav [data-nav]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.nav)));
    $$('[data-go]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.go)));
    byId('menuButton')?.addEventListener('click',openDrawer); byId('accountButton')?.addEventListener('click',()=>navigate('settings'));
    byId('drawer')?.addEventListener('click',e=>{if(e.target===byId('drawer'))closeDrawer();}); $$('[data-drawer-go]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.drawerGo)));
    byId('languageButton')?.addEventListener('click',()=>openSheet({title:'Ngôn ngữ',actions:[{title:'🇻🇳 Tiếng Việt',selected:true,onSelect:()=>{}}]}));
    byId('treeFilterButton')?.addEventListener('click',()=>byId('generationChips')?.classList.toggle('expanded'));
    $$('#themeSegment [data-theme-choice]').forEach(btn=>btn.addEventListener('click',()=>{settings.theme=btn.dataset.themeChoice;saveSettings();applyTheme();}));
    $$('[data-display],[data-display-setting]').forEach(btn=>btn.addEventListener('click',()=>{settings.displayMode=btn.dataset.display||btn.dataset.displaySetting;saveSettings();applyDisplayMode();}));
    byId('memberSearch')?.addEventListener('input',renderMembers);byId('memberGenerationFilter')?.addEventListener('change',renderMembers);
    byId('addMemberButton')?.addEventListener('click',()=>openMemberEditor());byId('addEventButton')?.addEventListener('click',()=>openEventEditor());byId('addDocumentButton')?.addEventListener('click',()=>openDocumentEditor());
    $$('[data-sheet-close]').forEach(el=>el.addEventListener('click',closeSheet));$$('[data-editor-close]').forEach(el=>el.addEventListener('click',closeEditor));
    byId('confirmCancel')?.addEventListener('click',()=>resolveConfirm(false));byId('confirmOk')?.addEventListener('click',()=>resolveConfirm(true));byId('confirmModal')?.querySelector('.modal-backdrop')?.addEventListener('click',()=>resolveConfirm(false));
    byId('editorForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!editorContext)return;const values=Object.fromEntries(new FormData(e.currentTarget).entries());try{await editorContext.onSave?.(values);closeEditor();}catch(error){toast(error.message||'Không thể lưu');}});
    byId('export-data')?.addEventListener('click',()=>openSheet({title:'Tải file sao lưu',actions:[{title:'Lưu vào máy',onSelect:()=>{Store.downloadBackup();toast('Đã tạo file sao lưu');}},{title:'Lưu lên Google Drive',onSelect:async()=>{if(!Cloud)throw new Error('Google Drive chưa sẵn sàng');await Cloud.backupToDrive();toast('Đã sao lưu lên Google Drive');}}]}));
    byId('share-data')?.addEventListener('click',async()=>{try{await Store.shareBackup();}catch(e){if(e.name!=='AbortError')toast('Không thể chia sẻ');}});
    byId('import-data')?.addEventListener('click',()=>openSheet({title:'Phục hồi dữ liệu',actions:[{title:'Chọn file trên máy',onSelect:()=>byId('backupFileInput')?.click()},{title:'Phục hồi từ Google Drive',onSelect:async()=>{if(!Cloud)throw new Error('Google Drive chưa sẵn sàng');const env=await Cloud.fetchBackupFromDrive();Store.restorePayload(env.payload);state=Store.loadData();renderAll();toast('Đã phục hồi từ Google Drive');}}]}));
    byId('backupFileInput')?.addEventListener('change',e=>restoreLocalFile(e.target.files?.[0]));
    byId('cloud-sync-now')?.addEventListener('click',syncNow);byId('cloud-connect')?.addEventListener('click',cloudSetup);
    byId('delete-local-data')?.addEventListener('click',async()=>{if(await appConfirm({title:'Xóa toàn bộ dữ liệu?',message:'Hệ thống sẽ tạo snapshot trước khi xóa.',confirmText:'Xóa dữ liệu',danger:true})){Store.clearAppData();state=Store.loadData();renderAll();toast('Đã xóa dữ liệu');}});
    byId('resetSeedButton')?.addEventListener('click',async()=>{if(await appConfirm({title:'Khôi phục dữ liệu gốc?',message:'Khôi phục bộ dữ liệu đã xác minh.',confirmText:'Khôi phục'})){Store.resetToSeed();state=Store.loadData();renderAll();toast('Đã khôi phục dữ liệu');}});
    byId('refreshStorage')?.addEventListener('click',refreshStorage);byId('persistStorage')?.addEventListener('click',async()=>{if(Storage){await Storage.requestPersistent();refreshStorage();}});byId('optimizeStorage')?.addEventListener('click',async()=>{if(Storage){await Storage.optimize();refreshStorage();toast('Đã tối ưu dung lượng');}});
    window.addEventListener('resize',()=>requestAnimationFrame(drawConnectors),{passive:true});window.visualViewport?.addEventListener('resize',()=>requestAnimationFrame(drawConnectors),{passive:true});window.addEventListener('phamvan-cloud-state',renderCloudStatus);
  }

  async function init(){
    applyTheme(); renderAll(); bindEvents(); navigate('tree'); refreshStorage();
    try{await Cloud?.resume?.();renderCloudStatus();}catch{}
    if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}),{once:true});
  }
  init();
})();
