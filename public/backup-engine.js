(() => {
  const APP_ID = "giaphaphamvan";
  const APP_VERSION = 1;
  const SCHEMA_VERSION = 1;
  const DATA_KEY = "giaphaphamvan_data_v1__pham-van-family";
  const SETTINGS_KEY = "giaphaphamvan_settings_v1__pham-van-family";
  const LAST_GOOD_KEY = "giaphaphamvan_last_good_v1__pham-van-family";
  const SAMPLE_DATA_KEY = "giaphaphamvan_sample_data_v1__pham-van-family";
  const SAMPLE_LAST_GOOD_KEY = "giaphaphamvan_sample_last_good_v1__pham-van-family";
  const WORKSPACE_KEY = "giaphaphamvan_workspace_v1__pham-van-family";

  function clone(value){ return JSON.parse(JSON.stringify(value)); }

  function seed(){
    return clone(window.PHAM_VAN_SEED || {members:[],events:[],documents:[],account:{id:"pham-van-family"},meta:{}});
  }

  function sampleSeed(){
    if(typeof window.PHAM_VAN_SAMPLE_DATA!=="function") throw new Error("Bộ dữ liệu mẫu chưa tải xong");
    const sample=window.PHAM_VAN_SAMPLE_DATA();
    if(!sample || !Array.isArray(sample.members) || sample.members.length!==168) throw new Error("Bộ dữ liệu mẫu không hợp lệ");
    return clone(sample);
  }

  function sampleExists(){
    try{return Boolean(localStorage.getItem(SAMPLE_DATA_KEY));}catch{return false;}
  }

  function workspace(){
    try{
      const requested=localStorage.getItem(WORKSPACE_KEY)==="sample"?"sample":"main";
      if(requested==="sample" && sampleExists()) return "sample";
      if(requested==="sample") localStorage.setItem(WORKSPACE_KEY,"main");
    }catch{}
    return "main";
  }

  function currentDataKey(){ return workspace()==="sample"?SAMPLE_DATA_KEY:DATA_KEY; }
  function currentSnapshotKey(){ return workspace()==="sample"?SAMPLE_LAST_GOOD_KEY:LAST_GOOD_KEY; }

  function loadData(){
    try{
      const key=currentDataKey();
      const raw = localStorage.getItem(key);
      if(!raw){
        const initial = workspace()==="sample"?sampleSeed():seed();
        saveData(initial);
        return initial;
      }
      const parsed = JSON.parse(raw);
      if(!parsed || !Array.isArray(parsed.members)) throw new Error("invalid local data");
      return parsed;
    }catch(error){
      console.warn("Không đọc được dữ liệu local, dùng seed an toàn", error);
      if(workspace()==="sample"){
        try{return sampleSeed();}catch{}
      }
      return seed();
    }
  }

  function saveData(data){
    const payload = clone(data);
    payload.updatedAt = new Date().toISOString();
    const key=currentDataKey();
    localStorage.setItem(key, JSON.stringify(payload));
    const verify = localStorage.getItem(key);
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
    return clone(loadData().account || (workspace()==="sample"?{id:"pham-van-family-sample",user:"sample-workspace",name:"Gia phả họ Phạm Văn · Dữ liệu mẫu"}:seed().account) || {id:"pham-van-family",user:"local-family",name:"Gia phả họ Phạm Văn"});
  }

  function createBackupPayload(){
    const current = loadData();
    return {
      app: APP_ID,
      version: APP_VERSION,
      createdAt: new Date().toISOString(),
      workspace: workspace(),
      account: clone(current.account || account()),
      data: clone(current),
      media: [],
      meta: {
        schemaVersion: SCHEMA_VERSION,
        source: workspace()==="sample"?"Giaphaphamvan isolated sample backup":"Giaphaphamvan local-first backup",
        containsSecrets: false,
        sample: workspace()==="sample"
      }
    };
  }

  function timestamp(date = new Date()){
    const p = n => String(n).padStart(2,"0");
    return `${date.getFullYear()}${p(date.getMonth()+1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}`;
  }

  function backupFile(){
    const payload = createBackupPayload();
    const suffix=workspace()==="sample"?"-sample":"";
    const file = new File([JSON.stringify(payload,null,2)], `gia-pha-pham-van${suffix}-${payload.account?.id||"local"}-${timestamp()}.json`, {type:"application/json"});
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
      await navigator.share({files:[file],title:workspace()==="sample"?"Sao lưu dữ liệu mẫu Gia phả họ Phạm Văn":"Sao lưu Gia phả họ Phạm Văn"});
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
      throw new Error(workspace()==="sample"?"File sao lưu không thuộc vùng dữ liệu mẫu":"File sao lưu thuộc tài khoản/gia phả khác");
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
      workspace:workspace(),
      data:loadData(),
      settings:loadSettings()
    };
    localStorage.setItem(currentSnapshotKey(),JSON.stringify(snap));
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
    return saveData(workspace()==="sample"?sampleSeed():seed());
  }

  function clearAppData(){
    snapshotCurrent();
    const empty = workspace()==="sample"?sampleSeed():seed();
    empty.members=[]; empty.events=[]; empty.documents=[];
    empty.meta = {...empty.meta, clearedAt:new Date().toISOString(), sample:workspace()==="sample"};
    return saveData(empty);
  }

  function createSampleData(){
    const sample=sampleSeed();
    sample.updatedAt=new Date().toISOString();
    localStorage.setItem(SAMPLE_DATA_KEY,JSON.stringify(sample));
    localStorage.setItem(WORKSPACE_KEY,"sample");
    const verify=JSON.parse(localStorage.getItem(SAMPLE_DATA_KEY)||"null");
    if(!verify || verify.members?.length!==168) throw new Error("Không thể xác minh dữ liệu mẫu");
    return clone(verify);
  }

  function deleteSampleData(){
    if(workspace()==="sample") localStorage.setItem(WORKSPACE_KEY,"main");
    localStorage.removeItem(SAMPLE_DATA_KEY);
    localStorage.removeItem(SAMPLE_LAST_GOOD_KEY);
    return true;
  }

  function useMainData(){ localStorage.setItem(WORKSPACE_KEY,"main"); return "main"; }

  window.PhamVanStore = {
    APP_ID, APP_VERSION, SCHEMA_VERSION, DATA_KEY, SETTINGS_KEY, LAST_GOOD_KEY,
    SAMPLE_DATA_KEY, SAMPLE_LAST_GOOD_KEY, WORKSPACE_KEY,
    loadData, saveData, loadSettings, saveSettings, account,
    createBackupPayload, downloadBackup, shareBackup, readBackupFile,
    validateBackup, previewBackup, restorePayload, snapshotCurrent,
    resetToSeed, clearAppData,
    workspace, sampleExists, createSampleData, deleteSampleData, useMainData
  };

  if(!document.querySelector('script[data-phamvan-sample-data]')){
    const script=document.createElement('script');
    script.src='/sample-data.js?v=1';
    script.dataset.phamvanSampleData='1';
    document.head.appendChild(script);
  }
})();