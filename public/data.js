window.PHAM_VAN_SEED = {
  schemaVersion: 1,
  source: "ChatGPT Site projection · Gia phả họ Phạm",
  family: {
    name: "Gia phả họ Phạm Văn",
    shortName: "Họ Phạm Văn",
    motto: "Gìn giữ cội nguồn · Kết nối thế hệ"
  },
  account: {
    id: "pham-van-family",
    user: "local-family",
    name: "Gia phả họ Phạm Văn"
  },
  members: [
    {id:"pv-001",name:"Phạm Văn An",generation:1,parentId:null,role:"Thủy tổ",note:""},
    {id:"pv-002",name:"Phạm Văn Bình",generation:2,parentId:"pv-001",role:"",note:""},
    {id:"pv-003",name:"Phạm Văn Cường",generation:2,parentId:"pv-001",role:"",note:""},
    {id:"pv-004",name:"Phạm Văn Dũng",generation:2,parentId:"pv-001",role:"",note:""},
    {id:"pv-005",name:"Phạm Minh Đức",generation:3,parentId:"pv-002",role:"",note:""},
    {id:"pv-006",name:"Phạm Minh Tuấn",generation:3,parentId:"pv-002",role:"",note:""},
    {id:"pv-007",name:"Phạm Minh Khang",generation:3,parentId:"pv-003",role:"",note:""},
    {id:"pv-008",name:"Phạm Minh Long",generation:3,parentId:"pv-003",role:"",note:""},
    {id:"pv-009",name:"Phạm Minh Nam",generation:3,parentId:"pv-004",role:"",note:""},
    {id:"pv-010",name:"Phạm Minh Phúc",generation:3,parentId:"pv-004",role:"",note:""},
    {id:"pv-011",name:"Phạm Gia Huy",generation:4,parentId:"pv-005",role:"",note:""},
    {id:"pv-012",name:"Phạm Gia Bảo",generation:4,parentId:"pv-006",role:"",note:""},
    {id:"pv-013",name:"Phạm Gia Khánh",generation:4,parentId:"pv-007",role:"",note:""},
    {id:"pv-014",name:"Phạm Gia Long",generation:4,parentId:"pv-008",role:"",note:""},
    {id:"pv-015",name:"Phạm Gia Nam",generation:4,parentId:"pv-009",role:"",note:""},
    {id:"pv-016",name:"Phạm Gia Phúc",generation:4,parentId:"pv-010",role:"",note:""}
  ],
  events: [],
  documents: [],
  meta: {
    restoredMemberCount: 16,
    restoredGenerationCount: 4,
    note: "Chỉ lưu dữ liệu thực tế đọc được từ Site projection; không tự tạo thêm thành viên."
  }
};

(() => {
  const ensureStyle = (id, href) => {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };
  ensureStyle('pham-van-approved-reference-css','/target-ui.css?v=3');
  ensureStyle('pham-van-reference-polish-css','/reference-polish.css?v=1');
  ensureStyle('pham-van-parchment-v4-css','/parchment-v4.css?v=4');
  ensureStyle('pham-van-reference-exact-css','/reference-exact.css?v=1');
  ensureStyle('pham-van-liquid-menu-css','/liquid-menu.css?v=8');

  const referenceCrest='/reference-crest.webp?v=1';
  const legacyCrest='/crest.svg?v=4';
  const refreshCrest = () => document.querySelectorAll('img[src="/crest.svg"],img[src^="/crest.svg?"],img.top-logo').forEach(img => {
    img.onerror=()=>{ if(!img.src.includes('crest.svg')) img.src=legacyCrest; };
    if(!img.src.includes('reference-crest.webp')) img.src=referenceCrest;
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refreshCrest, {once:true});
  else refreshCrest();
})();