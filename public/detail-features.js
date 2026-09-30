(() => {
  'use strict';
  const Store=window.PhamVanStore;
  if(!Store) return;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtDate=v=>{if(!v)return 'Chưa có';const d=new Date(`${v}T00:00:00`);return Number.isNaN(d.getTime())?String(v):new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)};
  const state=()=>Store.loadData();
  const uid=p=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  function installStyle(){
    if($('#phamvan-detail-features-style'))return;
    const style=document.createElement('style');style.id='phamvan-detail-features-style';style.textContent=`
      .record-detail-modal,.record-editor-modal{position:fixed;inset:0;z-index:240;display:grid;align-items:end;padding:12px;padding-bottom:calc(12px + env(safe-area-inset-bottom))}.record-detail-modal[hidden],.record-editor-modal[hidden]{display:none!important}.record-detail-backdrop{position:absolute;inset:0;background:rgba(32,20,12,.34);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
      .record-detail-panel{position:relative;z-index:1;width:100%;max-width:680px;max-height:min(82svh,820px);margin:0 auto;overflow:auto;border:1px solid rgba(255,245,220,.66);border-radius:24px;padding:16px;background:linear-gradient(145deg,rgba(255,253,248,.76),rgba(244,224,194,.66));-webkit-backdrop-filter:blur(18px) saturate(1.08);backdrop-filter:blur(18px) saturate(1.08);box-shadow:0 24px 60px rgba(61,25,12,.22),inset 0 1px 0 rgba(255,255,255,.78)}
      .record-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.record-detail-head p{margin:0 0 3px;color:#65080d;font-size:10px;font-weight:800;letter-spacing:.16em}.record-detail-head h2{margin:0;color:#3e2b1f;font-family:Georgia,serif;font-size:24px;line-height:1.05}.record-close{width:40px;height:40px;flex:0 0 40px;border:1px solid rgba(255,255,255,.72);border-radius:999px;background:rgba(255,252,246,.64);font-size:24px;color:#49372d}
      .record-context{margin:0 0 12px;padding:11px 12px;border-radius:16px;border:1px solid rgba(255,245,224,.54);background:rgba(255,252,246,.30)}.record-context strong,.record-context span{display:block}.record-context strong{font-size:13px;color:#65080d}.record-context span{margin-top:3px;font-size:11px;color:#66584d}
      .record-info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-flow:row dense;align-items:start;gap:8px}.record-info{min-width:0;height:auto;padding:10px 11px;border:1px solid rgba(255,245,224,.56);border-radius:15px;background:rgba(255,252,246,.28)}.record-info.wide{grid-column:1/-1}.record-info span{display:block;margin-bottom:3px;color:#8a786a;font-size:9px}.record-info strong,.record-info p{display:block;margin:0;color:#3e332b;font-size:12px;line-height:1.35;white-space:pre-wrap;overflow-wrap:anywhere}
      .record-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:14px}.record-actions button{min-height:44px;border-radius:14px;border:1px solid rgba(255,245,224,.68);background:rgba(255,252,246,.36);color:#4b3b31;font-weight:700}.record-actions button.primary{background:#65080d;color:#fff4d4;border-color:rgba(255,226,151,.88)}.record-actions button.danger{color:#65080d}
      .document-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:10px}.document-thumb{position:relative;aspect-ratio:1/1;border-radius:13px;overflow:hidden;border:1px solid rgba(255,245,224,.64);background:rgba(255,255,255,.28)}.document-thumb img{width:100%;height:100%;display:block;object-fit:cover}.document-thumb button{position:absolute;right:5px;top:5px;width:26px;height:26px;border:0;border-radius:999px;background:rgba(101,8,13,.88);color:white;font-size:16px}.document-thumb-name{position:absolute;left:5px;right:5px;bottom:5px;padding:3px 5px;border-radius:7px;background:rgba(0,0,0,.42);color:white;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .enhanced-form{display:grid;grid-template-columns:1fr;gap:11px}.enhanced-field{display:grid;gap:5px}.enhanced-field label{font-size:9px;font-weight:800;color:#6f5d50}.enhanced-field input,.enhanced-field select,.enhanced-field textarea{width:100%;min-width:0;box-sizing:border-box;border:1px solid rgba(255,245,224,.64);border-radius:14px;background:rgba(255,252,246,.34);padding:11px 12px;color:#3f332b;font:inherit}.enhanced-field input,.enhanced-field select{min-height:46px}.enhanced-field textarea{min-height:118px;resize:vertical}.image-picker{display:block;width:100%;box-sizing:border-box;padding:12px;border:1px dashed rgba(101,8,13,.36);border-radius:14px;background:rgba(255,252,246,.24);color:#65080d;font-weight:750;text-align:center}.image-picker input{position:absolute;inline-size:1px;block-size:1px;opacity:0;pointer-events:none}.image-note{margin:4px 0 0;color:#806f61;font-size:9px}
      @media(max-width:420px){.record-info-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.record-info.wide{grid-column:1/-1}.record-detail-panel{padding:14px}.document-gallery{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:330px){.record-info-grid{grid-template-columns:1fr}.record-info.wide{grid-column:auto}}
    `;document.head.appendChild(style);
  }

  function ensureUi(){
    installStyle();
    if(!$('#recordDetailModal')){
      const modal=document.createElement('div');modal.id='recordDetailModal';modal.className='record-detail-modal';modal.hidden=true;modal.innerHTML='<div class="record-detail-backdrop" data-record-close></div><section class="record-detail-panel"><div class="record-detail-head"><div><p id="recordDetailEyebrow">THÔNG TIN</p><h2 id="recordDetailTitle"></h2></div><button class="record-close" data-record-close>×</button></div><div id="recordDetailBody"></div><div class="record-actions" id="recordDetailActions"></div></section>';document.body.appendChild(modal);$$('[data-record-close]',modal).forEach(el=>el.addEventListener('click',()=>modal.hidden=true));
    }
    if(!$('#recordEditorModal')){
      const modal=document.createElement('div');modal.id='recordEditorModal';modal.className='record-editor-modal';modal.hidden=true;modal.innerHTML='<div class="record-detail-backdrop" data-editorx-close></div><section class="record-detail-panel"><div class="record-detail-head"><div><p id="recordEditorEyebrow">THÔNG TIN</p><h2 id="recordEditorTitle"></h2></div><button class="record-close" data-editorx-close>×</button></div><form id="recordEnhancedForm" class="enhanced-form"><div id="recordEnhancedFields"></div><div class="record-actions"><button type="button" data-editorx-close>Hủy</button><button type="submit" class="primary">Lưu</button></div></form></section>';document.body.appendChild(modal);$$('[data-editorx-close]',modal).forEach(el=>el.addEventListener('click',()=>modal.hidden=true));
    }
  }

  function openDetail({eyebrow='THÔNG TIN',title='',body='',actions=[]}){
    ensureUi();$('#recordDetailEyebrow').textContent=eyebrow;$('#recordDetailTitle').textContent=title;$('#recordDetailBody').innerHTML=body;const box=$('#recordDetailActions');box.innerHTML='';actions.forEach(a=>{const b=document.createElement('button');b.type='button';b.textContent=a.label;b.className=a.kind||'';b.addEventListener('click',()=>a.onClick?.());box.appendChild(b)});$('#recordDetailModal').hidden=false;
  }
  function hasValue(value){const text=String(value??'').trim();return Boolean(text&&text!=='—'&&text!=='Chưa có')}
  function info(label,value,wide=false,showEmpty=false){if(!showEmpty&&!hasValue(value))return '';const text=hasValue(value)?String(value):'—';const autoWide=wide||text.length>34;return `<div class="record-info${autoWide?' wide':''}"><span>${esc(label)}</span><strong>${esc(text)}</strong></div>`}

  function memberDetail(member,event=null){
    const s=state();const parent=s.members.find(m=>m.id===member.parentId);const children=s.members.filter(m=>m.parentId===member.id);const linked=s.events.filter(e=>e.memberId===member.id);
    const context=event?`<div class="record-context"><strong>${esc(event.title)}</strong><span>${esc(fmtDate(event.date))}${event.note?` · ${esc(event.note)}`:''}</span></div>`:'';
    const body=context+`<div class="record-info-grid">${info('Họ và tên',member.name,true)}${info('Đời',`Đời thứ ${member.generation}`)}${info('Vai trò',member.role||'Thành viên')}${info('Giới tính',member.gender)}${info('Ngày sinh',member.birthDate?fmtDate(member.birthDate):'')}${info('Ngày mất',member.deathDate?fmtDate(member.deathDate):'')}${info('Vợ / chồng',member.spouse)}${info('Quê quán',member.hometown)}${info('Nghề nghiệp',member.occupation)}${info('Cha / mẹ',parent?.name||'')}${info('Con cháu trực tiếp',children.length?children.map(c=>c.name).join(', '):'')}${info('Sự kiện liên quan',String(linked.length),false,true)}${info('Ghi chú',member.note||'')}</div>`;
    openDetail({eyebrow:'HỒ SƠ THÀNH VIÊN',title:member.name,body});
  }

  function eventDetail(event){
    const s=state();const member=s.members.find(m=>m.id===event.memberId);
    if(member){memberDetail(member,event);return}
    openDetail({eyebrow:'SỰ KIỆN',title:event.title,body:`<div class="record-info-grid">${info('Ngày',event.date?fmtDate(event.date):'')}${info('Loại',event.type||'Sự kiện')}${info('Lặp hằng năm',event.recurring?'Có':'Không')}${info('Ghi chú',event.note||'')}</div>`});
  }

  function imageSrc(img){return img?.data||img?.src||''}
  function documentDetail(doc){
    const images=Array.isArray(doc.images)?doc.images:[];
    const gallery=images.length?`<div class="document-gallery">${images.map((img,i)=>`<div class="document-thumb"><img src="${esc(imageSrc(img))}" alt="${esc(img.name||`Ảnh ${i+1}`)}"><span class="document-thumb-name">${esc(img.name||`Ảnh ${i+1}`)}</span></div>`).join('')}</div>`:'<div class="record-context"><span>Chưa có hình ảnh tư liệu.</span></div>';
    const body=`<div class="record-info-grid">${info('Phân loại',doc.category||'Tư liệu')}${info('Số hình ảnh',String(images.length),false,true)}${info('Nội dung',doc.content||'')}</div>${gallery}`;
    openDetail({eyebrow:'TƯ LIỆU',title:doc.title,body,actions:[{label:'Chỉnh sửa',kind:'primary',onClick:()=>{$('#recordDetailModal').hidden=true;openDocumentEditor(doc.id)}}]});
  }

  function memberOptions(selected=''){const s=state();return `<option value="">Không gắn thành viên</option>${s.members.map(m=>`<option value="${esc(m.id)}" ${m.id===selected?'selected':''}>Đời ${m.generation} · ${esc(m.name)}</option>`).join('')}`}
  function field(label,name,type='text',value=''){if(type==='textarea')return `<div class="enhanced-field"><label>${esc(label)}</label><textarea name="${name}">${esc(value)}</textarea></div>`;return `<div class="enhanced-field"><label>${esc(label)}</label><input name="${name}" type="${type}" value="${esc(value)}"></div>`}

  function saveAndReload(s,message){Store.saveData(s);sessionStorage.setItem('phamvan-toast-after-reload',message||'Đã lưu');location.reload()}

  function openEventEditor(id=null){
    ensureUi();const s=state(),event=id?s.events.find(e=>e.id===id):null;$('#recordEditorEyebrow').textContent='SỰ KIỆN';$('#recordEditorTitle').textContent=event?'Chỉnh sửa sự kiện':'Thêm sự kiện';$('#recordEnhancedFields').innerHTML=field('Tên sự kiện','title','text',event?.title||'')+field('Ngày','date','date',event?.date||'')+`<div class="enhanced-field"><label>Thành viên liên quan</label><select name="memberId">${memberOptions(event?.memberId||'')}</select></div>`+field('Ghi chú','note','textarea',event?.note||'');const form=$('#recordEnhancedForm');form.onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(form).entries());if(!String(v.title||'').trim())return;const record={...(event||{}),id:event?.id||uid('ev'),title:String(v.title).trim(),date:v.date||'',memberId:v.memberId||null,note:String(v.note||'')};s.events=event?s.events.map(x=>x.id===event.id?record:x):[...s.events,record];saveAndReload(s,'Đã lưu sự kiện')};$('#recordEditorModal').hidden=false;
  }

  function fileToImage(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({id:uid('img'),name:file.name||'Ảnh tư liệu',type:file.type||'image/*',data:String(reader.result||'')});reader.onerror=()=>reject(reader.error||new Error('Không đọc được ảnh'));reader.readAsDataURL(file)})}
  function renderEditableImages(images){const box=$('#editableDocumentImages');if(!box)return;box.innerHTML=images.length?images.map((img,i)=>`<div class="document-thumb" data-image-index="${i}"><img src="${esc(imageSrc(img))}" alt="${esc(img.name||`Ảnh ${i+1}`)}"><button type="button" data-remove-image="${i}">×</button><span class="document-thumb-name">${esc(img.name||`Ảnh ${i+1}`)}</span></div>`).join(''):'<div class="record-context"><span>Chưa có ảnh. Có thể thêm nhiều lần, không giới hạn số lượng ảnh trong ứng dụng.</span></div>';$$('[data-remove-image]',box).forEach(b=>b.addEventListener('click',()=>{images.splice(Number(b.dataset.removeImage),1);renderEditableImages(images)}))}

  function openDocumentEditor(id=null){
    ensureUi();const s=state(),doc=id?s.documents.find(d=>d.id===id):null,images=[...(doc?.images||[])];$('#recordEditorEyebrow').textContent='TƯ LIỆU';$('#recordEditorTitle').textContent=doc?'Chỉnh sửa tư liệu':'Thêm tư liệu';$('#recordEnhancedFields').innerHTML=field('Tiêu đề','title','text',doc?.title||'')+field('Phân loại','category','text',doc?.category||'')+field('Nội dung','content','textarea',doc?.content||'')+`<div class="enhanced-field"><label>Hình ảnh tư liệu</label><label class="image-picker">＋ Thêm hình ảnh<input id="documentImagePicker" type="file" accept="image/*" multiple></label><p class="image-note">Có thể chọn nhiều ảnh và thêm nhiều lần; ứng dụng không đặt giới hạn số lượng ảnh.</p><div class="document-gallery" id="editableDocumentImages"></div></div>`;renderEditableImages(images);$('#documentImagePicker').addEventListener('change',async e=>{const files=[...(e.target.files||[])];if(!files.length)return;const added=await Promise.all(files.map(fileToImage));images.push(...added);e.target.value='';renderEditableImages(images)});const form=$('#recordEnhancedForm');form.onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(form).entries());if(!String(v.title||'').trim())return;const record={...(doc||{}),id:doc?.id||uid('doc'),title:String(v.title).trim(),category:String(v.category||'Tư liệu'),content:String(v.content||''),images,updatedAt:new Date().toISOString()};s.documents=doc?s.documents.map(x=>x.id===doc.id?record:x):[...s.documents,record];saveAndReload(s,'Đã lưu tư liệu')};$('#recordEditorModal').hidden=false;
  }

  function svgData(svg){return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`}
  function sampleDocumentArt(doc,variant=0){
    const title=String(doc.title||'').toLowerCase();const category=String(doc.category||'Tư liệu');
    const accent=['#65080d','#9a5f23','#315d52','#806523'][variant%4];
    let symbol='book';
    if(title.includes('phần mộ')||title.includes('giỗ')||title.includes('hiệp kỵ'))symbol='memorial';
    else if(title.includes('từ đường')||title.includes('nguồn gốc')||title.includes('thủy tổ'))symbol='house';
    else if(title.includes('hình ảnh')||title.includes('ảnh'))symbol='photo';
    else if(title.includes('sơ đồ')||title.includes('chi'))symbol='tree';
    else if(category==='Lưu trữ'||title.includes('danh mục'))symbol='archive';
    const shapes={
      book:`<path d="M25 31c14-7 26-6 39 0v43c-13-6-25-6-39 1z" fill="#fff7e8" stroke="${accent}" stroke-width="3"/><path d="M103 31c-14-7-26-6-39 0v44c13-7 25-7 39-1z" fill="#fff7e8" stroke="${accent}" stroke-width="3"/><path d="M64 32v43" stroke="#c99b51" stroke-width="2"/>`,
      memorial:`<path d="M48 32h32l8 51H40z" fill="#efe1c4" stroke="${accent}" stroke-width="3"/><path d="M54 46h20M51 57h26" stroke="#9a7441" stroke-width="3" stroke-linecap="round"/><path d="M37 87h54" stroke="#6f4c2d" stroke-width="5" stroke-linecap="round"/>`,
      house:`<path d="M25 55 64 27l39 28" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 53h60v37H34z" fill="#f6e8cb" stroke="${accent}" stroke-width="3"/><path d="M56 66h16v24H56z" fill="#65080d"/><path d="M44 63h8M76 63h8" stroke="#b58a49" stroke-width="4"/>`,
      photo:`<rect x="25" y="28" width="78" height="65" rx="7" fill="#fff9ec" stroke="${accent}" stroke-width="4"/><circle cx="48" cy="49" r="8" fill="#d8b56f"/><path d="m34 82 23-22 14 13 11-10 13 19z" fill="#7b9b78"/>`,
      tree:`<circle cx="64" cy="32" r="8" fill="#d8b56f" stroke="${accent}" stroke-width="3"/><circle cx="37" cy="65" r="8" fill="#f3dfb4" stroke="${accent}" stroke-width="3"/><circle cx="91" cy="65" r="8" fill="#f3dfb4" stroke="${accent}" stroke-width="3"/><circle cx="50" cy="91" r="7" fill="#fff7e8" stroke="${accent}" stroke-width="3"/><circle cx="78" cy="91" r="7" fill="#fff7e8" stroke="${accent}" stroke-width="3"/><path d="M64 40v11M64 51H37v6M64 51h27v6M37 73v8h13v3M91 73v8H78v3" fill="none" stroke="${accent}" stroke-width="3"/>`,
      archive:`<path d="M29 38h70v52H29z" fill="#e9d6ad" stroke="${accent}" stroke-width="4"/><path d="M24 31h80v17H24z" fill="#f7e9cc" stroke="${accent}" stroke-width="4"/><rect x="52" y="59" width="24" height="12" rx="2" fill="#fff8e8" stroke="#9e743b" stroke-width="2"/>`
    };
    const label=category==='Gia phả'?'GIA PHA':category==='Nghi lễ'?'NGHI LE':category==='Ký ức'?'KY UC':'LUU TRU';
    return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="20" fill="#ead8b5"/><path d="M0 20C36 3 88 5 128 24V0H0z" fill="${accent}" opacity=".12"/>${shapes[symbol]||shapes.book}<rect x="21" y="103" width="86" height="15" rx="7.5" fill="${accent}" opacity=".92"/><text x="64" y="114" text-anchor="middle" fill="#fff7e8" font-family="Arial,sans-serif" font-size="8" font-weight="700">${label}</text></svg>`)
  }

  function enrichSample(){
    if(Store.workspace?.()!=='sample')return;const s=state();let changed=false;
    s.events.forEach(e=>{if(e.memberId)return;const name=String(e.title||'').split('·').slice(1).join('·').trim();const m=s.members.find(x=>x.name===name);if(m){e.memberId=m.id;changed=true}});
    s.documents.forEach((d,i)=>{const images=Array.isArray(d.images)?d.images:[];const generated=images.length&&images.every(img=>img.sample&&String(imageSrc(img)).startsWith('data:image/svg+xml'));const legacy=images.length&&images.every(img=>img.sample&&!String(imageSrc(img)).startsWith('data:image/svg+xml'));if(!images.length||legacy){const count=1+(i%2);d.images=Array.from({length:count},(_,k)=>({id:`sample-doc-img-${i+1}-${k+1}`,name:`Minh họa ${d.title} ${k+1}`,src:sampleDocumentArt(d,k),sample:true,generated:true}));changed=true}else if(generated){d.images.forEach(img=>{img.generated=true})}if(!d.category){d.category=['Gia phả','Nghi lễ','Ký ức','Lưu trữ'][i%4];changed=true}});
    if(changed)Store.saveData(s);
  }

  function bind(){
    ensureUi();enrichSample();
    document.addEventListener('click',e=>{
      const addEvent=e.target.closest('#addEventButton');if(addEvent){e.preventDefault();e.stopImmediatePropagation();openEventEditor();return}
      const addDoc=e.target.closest('#addDocumentButton');if(addDoc){e.preventDefault();e.stopImmediatePropagation();openDocumentEditor();return}
      const erow=e.target.closest('#eventList .timeline-item');if(erow){const id=erow.querySelector('[data-event-menu]')?.dataset.eventMenu;if(id){e.preventDefault();e.stopImmediatePropagation();if(e.target.closest('[data-event-menu]'))openEventEditor(id);else{const ev=state().events.find(x=>x.id===id);if(ev)eventDetail(ev)}}return}
      const drow=e.target.closest('#documentList .document-row');if(drow){const id=drow.querySelector('[data-doc-menu]')?.dataset.docMenu;if(id){e.preventDefault();e.stopImmediatePropagation();if(e.target.closest('[data-doc-menu]'))openDocumentEditor(id);else{const doc=state().documents.find(x=>x.id===id);if(doc)documentDetail(doc)}}return}
    },true);
    const toast=sessionStorage.getItem('phamvan-toast-after-reload');if(toast){sessionStorage.removeItem('phamvan-toast-after-reload');setTimeout(()=>{const el=$('#toast');if(el){el.textContent=toast;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}},250)}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();