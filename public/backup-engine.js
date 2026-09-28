(() => {
  const APP_ID = "giaphaphamvan";
  const APP_VERSION = 1;
  const SCHEMA_VERSION = 1;
  const DATA_KEY = "giaphaphamvan_data_v1__pham-van-family";
  const SETTINGS_KEY = "giaphaphamvan_settings_v1__pham-van-family";
  const LAST_GOOD_KEY = "giaphaphamvan_last_good_v1__pham-van-family";

  function clone(value){ return JSON.parse(JSON.stringify(value)); }

  function seed(){
    return clone(window.PHAM_VAN_SEED || {members:[],events:[],documents:[],account:{id:"pham-van-family"},meta:{}});
  }

  function loadData(){
    try{
      const raw = localStorage.getItem(DATA_KEY);
      if(!raw){
        const initial = seed();
        saveData(initial);
        return initial;
      }
      const parsed = JSON.parse(raw);
      if(!parsed || !Array.isArray(parsed.members)) throw new Error("invalid local data");
      return parsed;
    }catch(error){
      console.warn("Không đọc được dữ liệu local, dùng seed an toàn", error);
      return seed();
    }
  }

  function saveData(data){
    const payload = clone(data);
    payload.updatedAt = new Date().toISOString();
    localStorage.setItem(DATA_KEY, JSON.stringify(payload));
    const verify = localStorage.getItem(DATA_KEY);
    if(!verify) throw new Error("Không thể xác minh dữ liệu đã lưu");
    return payload;
  }

  function loadSettings(){
    try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}")||{};}catch{return {};}
  }

  function saveSettings(settings){
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings||{}));
    return settings||{};
  }

  function account(){
    return clone(loadData().account || seed().account || {id:"pham-van-family",user:"local-family",name:"Gia phả họ Phạm Văn"});
  }

  function createBackupPayload(){
    const current = loadData();
    return {
      app: APP_ID,
      version: APP_VERSION,
      createdAt: new Date().toISOString(),
      account: clone(current.account || account()),
      data: clone(current),
      media: [],
      meta: {
        schemaVersion: SCHEMA_VERSION,
        source: "Giaphaphamvan local-first backup",
        containsSecrets: false
      }
    };
  }

  function timestamp(date = new Date()){
    const p = n => String(n).padStart(2,"0");
    return `${date.getFullYear()}${p(date.getMonth()+1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}`;
  }

  function backupFile(){
    const payload = createBackupPayload();
    const file = new File([JSON.stringify(payload,null,2)], `gia-pha-pham-van-${payload.account?.id||"local"}-${timestamp()}.json`, {type:"application/json"});
    return {file,payload};
  }

  function downloadBackup(){
    const {file} = backupFile();
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href=url; a.download=file.name; a.hidden=true;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    return file.name;
  }

  async function shareBackup(){
    const {file}=backupFile();
    if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
      await navigator.share({files:[file],title:"Sao lưu Gia phả họ Phạm Văn"});
      return {shared:true,fileName:file.name};
    }
    downloadBackup();
    return {shared:false,fileName:file.name};
  }

  function validateBackup(payload){
    if(!payload || typeof payload!=="object") throw new Error("File sao lưu không hợp lệ");
    if(payload.app!==APP_ID) throw new Error("File không thuộc ứng dụng Gia phả họ Phạm Văn");
    if(Number(payload.meta?.schemaVersion)!==SCHEMA_VERSION) throw new Error("Phiên bản dữ liệu không tương thích");
    const currentAccount = account();
    if(payload.account?.id && currentAccount?.id && payload.account.id!==currentAccount.id){
      throw new Error("File sao lưu thuộc tài khoản/gia phả khác");
    }
    if(!payload.data || !Array.isArray(payload.data.members)) throw new Error("File thiếu dữ liệu thành viên");
    return true;
  }

  function previewBackup(payload){
    validateBackup(payload);
    return {
      members: payload.data.members?.length||0,
      events: payload.data.events?.length||0,
      documents: payload.data.documents?.length||0,
      createdAt: payload.createdAt||null
    };
  }

  function snapshotCurrent(){
    const snap = {
      createdAt:new Date().toISOString(),
      data:loadData(),
      settings:loadSettings()
    };
    localStorage.setItem(LAST_GOOD_KEY,JSON.stringify(snap));
    return snap;
  }

  function restorePayload(payload){
    validateBackup(payload);
    const snap = snapshotCurrent();
    try{
      saveData(payload.data);
      const verify=loadData();
      if(!Array.isArray(verify.members)) throw new Error("Xác minh restore thất bại");
      return previewBackup(payload);
    }catch(error){
      try{saveData(snap.data); saveSettings(snap.settings);}catch{}
      throw error;
    }
  }

  async function readBackupFile(file){
    if(!file) throw new Error("Chưa chọn file sao lưu");
    const text = await file.text();
    let payload;
    try{payload=JSON.parse(text);}catch{throw new Error("File JSON bị lỗi hoặc không đọc được");}
    validateBackup(payload);
    return payload;
  }

  function resetToSeed(){
    snapshotCurrent();
    return saveData(seed());
  }

  function clearAppData(){
    snapshotCurrent();
    const empty = seed();
    empty.members=[]; empty.events=[]; empty.documents=[];
    empty.meta = {...empty.meta, clearedAt:new Date().toISOString()};
    return saveData(empty);
  }

  window.PhamVanStore = {
    APP_ID, APP_VERSION, SCHEMA_VERSION, DATA_KEY, SETTINGS_KEY, LAST_GOOD_KEY,
    loadData, saveData, loadSettings, saveSettings, account,
    createBackupPayload, downloadBackup, shareBackup, readBackupFile,
    validateBackup, previewBackup, restorePayload, snapshotCurrent,
    resetToSeed, clearAppData
  };
})();
