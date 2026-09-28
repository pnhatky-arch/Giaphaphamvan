(() => {
  'use strict';
  const Store=window.PhamVanStore;
  const APP='giaphaphamvan';
  const SCOPE='https://www.googleapis.com/auth/drive.appdata';
  const GIS='https://accounts.google.com/gsi/client';
  const CID='giaphaphamvan_google_client_id_v1';
  const AT='giaphaphamvan_google_access_token_v1__';
  const EX='giaphaphamvan_google_access_expiry_v1__';
  const GRANT='giaphaphamvan_google_granted_v1__';
  const FILE='giaphaphamvan_drive_file_v1__';
  const BACKUP='giaphaphamvan_drive_backup_file_v1__';
  const REV='giaphaphamvan_drive_revision_v1__';
  const HASH='giaphaphamvan_drive_hash_v1__';
  let token='',expires=0,gisPromise=null,conflict=null;
  let state={status:'idle',detail:'Google Drive chưa kết nối',connected:false,syncing:false};

  const account=()=>Store?.account?.()||{id:'pham-van-family',user:'local-family',name:'Gia phả họ Phạm Văn'};
  const key=p=>`${p}${account().id}`;
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const set=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
  const del=k=>{try{localStorage.removeItem(k);return true}catch{return false}};
  const valid=()=>!!token&&Date.now()<expires;
  const clientId=()=>String(get(CID)||'').trim();
  const granted=()=>get(key(GRANT))==='1';

  function emit(status,detail=''){
    state={status,detail,connected:valid(),syncing:status==='syncing'||status==='checking',clientId:clientId(),granted:granted(),conflict:!!conflict};
    window.dispatchEvent(new CustomEvent('phamvan-cloud-state',{detail:{...state}}));
    return state;
  }
  function getState(){return {...state,connected:valid(),clientId:clientId(),granted:granted(),conflict:!!conflict};}

  function setClientId(value){
    const next=String(value||'').trim();
    if(next && !/^[a-z0-9._-]+\.apps\.googleusercontent\.com$/i.test(next)) throw new Error('OAuth Client ID không đúng định dạng');
    const old=clientId();
    if(next)set(CID,next);else del(CID);
    if(old!==next){clearSession(true);clearBaseline();}
    emit(next?'auth':'setup',next?'Đã lưu OAuth Client ID':'Google Drive chưa được thiết lập');
    return next;
  }

  function persistSession(){if(!token||!expires)return false;set(key(AT),token);set(key(EX),String(expires));set(key(GRANT),'1');return true;}
  function restoreSession(){const t=String(get(key(AT))||''),e=Number(get(key(EX))||0);if(t&&e>Date.now()+5000){token=t;expires=e;emit('auth','Đã khôi phục phiên Google Drive');return true;}if(t||e){del(key(AT));del(key(EX));}return false;}
  function clearSession(forgetGrant=false){del(key(AT));del(key(EX));if(forgetGrant)del(key(GRANT));token='';expires=0;}
  function clearBaseline(){[FILE,BACKUP,REV,HASH].forEach(prefix=>del(key(prefix)));conflict=null;}

  function loadGIS(){
    if(globalThis.google?.accounts?.oauth2)return Promise.resolve(true);
    if(gisPromise)return gisPromise;
    gisPromise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src=GIS;s.async=true;s.defer=true;s.dataset.phamvanGis='1';
      const timeout=setTimeout(()=>reject(new Error('Google Identity Services tải quá thời gian')),12000);
      s.onload=()=>{clearTimeout(timeout);globalThis.google?.accounts?.oauth2?resolve(true):reject(new Error('Google Identity Services chưa sẵn sàng'));};
      s.onerror=()=>{clearTimeout(timeout);reject(new Error('Không tải được Google Identity Services'));};document.head.appendChild(s);
    }).catch(error=>{gisPromise=null;throw error;});
    return gisPromise;
  }

  async function authorize({silent=false,switchAccount=false}={}){
    const cid=clientId();if(!cid)throw new Error('Google Drive chưa được thiết lập');
    await loadGIS();
    return new Promise((resolve,reject)=>{
      const client=google.accounts.oauth2.initTokenClient({client_id:cid,scope:SCOPE,include_granted_scopes:true,callback:r=>{
        if(r?.error)return reject(new Error(r.error_description||r.error));
        token=String(r.access_token||'');expires=Date.now()+(Math.max(60,Number(r.expires_in)||3600)*1000)-60000;
        if(!token)return reject(new Error('Google không trả access token'));
        persistSession();emit('auth','Đã kết nối Google Drive');resolve(true);
      },error_callback:e=>reject(new Error(e?.type==='popup_failed_to_open'?'Safari đã chặn cửa sổ Google':e?.type==='popup_closed'?'Đã đóng cửa sổ Google trước khi hoàn tất':e?.message||e?.type||'Không mở được Google'))});
      client.requestAccessToken({prompt:silent?'none':switchAccount?'select_account':''});
    });
  }

  async function connect({switchAccount=false}={}){
    if(!navigator.onLine)throw new Error('Thiết bị đang offline');
    if(switchAccount){clearSession(true);clearBaseline();}
    emit('checking','Đang kết nối Google Drive…');
    await authorize({switchAccount});
    emit('auth','Google Drive đã sẵn sàng');
    return true;
  }
  async function disconnect(){
    const old=token;clearSession(true);conflict=null;
    try{if(old&&globalThis.google?.accounts?.oauth2?.revoke)await new Promise(resolve=>google.accounts.oauth2.revoke(old,()=>resolve(true)));}catch{}
    emit(clientId()?'auth':'setup','Đã ngắt Google Drive · file trên Drive vẫn được giữ nguyên');return true;
  }

  async function dfetch(url,opt={},timeoutMs=60000){
    if(!valid())throw new Error('Google Drive chưa kết nối');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const response=await fetch(url,{cache:'no-store',...opt,headers:{Authorization:`Bearer ${token}`,...(opt.headers||{})},signal:controller.signal});
      if(response.status===401){clearSession(false);emit('auth','Phiên Google Drive đã hết hạn');throw new Error('Cần kết nối lại Google Drive');}
      return response;
    }finally{clearTimeout(timer);}
  }

  const syncName=()=>`${APP}-sync-${account().id}.json`;
  const backupName=()=>`${APP}-backup-${account().id}.json`;
  const esc=s=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");

  async function findNamed(name,prefix){
    const saved=get(key(prefix));
    if(saved){const r=await dfetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(saved)}?fields=id,name,modifiedTime,trashed`);if(r.ok){const f=await r.json();if(!f.trashed&&f.name===name)return f;}if(r.status===404)del(key(prefix));}
    const q=new URLSearchParams({spaces:'appDataFolder',q:`name = '${esc(name)}' and trashed = false`,fields:'files(id,name,modifiedTime,size)',orderBy:'modifiedTime desc',pageSize:'20'});
    const r=await dfetch(`https://www.googleapis.com/drive/v3/files?${q}`);if(!r.ok)throw new Error(`Không tìm được tệp Drive (${r.status})`);
    const f=(await r.json()).files?.[0]||null;if(f?.id)set(key(prefix),f.id);return f;
  }
  async function createNamed(name,envelope,prefix){
    const boundary=`phamvan_${crypto.randomUUID?.()||Date.now()}`;
    const meta={name,parents:['appDataFolder'],mimeType:'application/json'};
    const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n`,`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(envelope)}\r\n`,`--${boundary}--`],{type:`multipart/related; boundary=${boundary}`});
    const r=await dfetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime,size',{method:'POST',headers:{'Content-Type':`multipart/related; boundary=${boundary}`},body});
    if(!r.ok)throw new Error((await r.json().catch(()=>null))?.error?.message||`Không tạo được tệp Drive (${r.status})`);const f=await r.json();if(f?.id)set(key(prefix),f.id);return f;
  }
  async function updateFile(id,envelope){
    const r=await dfetch(`https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(id)}?uploadType=media&fields=id,modifiedTime,size`,{method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:JSON.stringify(envelope)});
    if(!r.ok)throw new Error((await r.json().catch(()=>null))?.error?.message||`Không cập nhật được Drive (${r.status})`);return r.json();
  }
  async function downloadEnvelope(id){const r=await dfetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`);if(!r.ok)throw new Error(`Không tải được Drive (${r.status})`);let x;try{x=JSON.parse(await r.text());}catch{throw new Error('Tệp Drive không phải JSON hợp lệ');}return x;}

  function stable(value){if(Array.isArray(value))return value.map(stable);if(value&&typeof value==='object'){const o={};Object.keys(value).sort().forEach(k=>o[k]=stable(value[k]));return o;}return value;}
  async function hash(value){const bytes=new TextEncoder().encode(JSON.stringify(stable(value))),buf=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');}
  function emptyData(data){return !(data?.members?.length||data?.events?.length||data?.documents?.length);}
  function revision(){return Number(get(key(REV))||0)||0;}
  function baselineHash(){return get(key(HASH))||'';}
  function mark(rev,h,fileId){set(key(REV),String(rev));set(key(HASH),h);if(fileId)set(key(FILE),fileId);}
  function syncEnvelope(data,rev,h){return {app:`${APP}-drive`,schema:1,storage:'google-drive-appDataFolder',account:account(),revision:rev,updatedAt:new Date().toISOString(),hash:h,data};}
  function validateRemote(env,expectedApp){if(env?.app!==expectedApp||Number(env?.schema)!==1)throw new Error('Tệp Google Drive không đúng định dạng');if(env.account?.id&&env.account.id!==account().id)throw new Error('Tệp Google Drive thuộc gia phả khác');return env;}

  async function push(file,remoteRev,data,localHash){const next=Math.max(0,Number(remoteRev)||0)+1,env=syncEnvelope(data,next,localHash),out=file?await updateFile(file.id,env):await createNamed(syncName(),env,FILE);mark(next,localHash,out?.id||file?.id||'');emit('synced',`Đã lưu Google Drive · revision ${next}`);return true;}
  async function applyRemote(env,file){Store.snapshotCurrent();Store.saveData(env.data);const h=env.hash||await hash(env.data);mark(Number(env.revision)||0,h,file?.id||'');return true;}

  async function syncNow(){
    if(!navigator.onLine)throw new Error('Thiết bị đang offline');
    if(!valid())await connect();
    emit('syncing','Đang đồng bộ Google Drive…');
    try{
      const local=Store.loadData(),localHash=await hash(local),file=await findNamed(syncName(),FILE);
      if(!file)return await push(null,0,local,localHash);
      const remote=validateRemote(await downloadEnvelope(file.id),`${APP}-drive`),remoteHash=remote.hash||await hash(remote.data),remoteRev=Number(remote.revision)||0,localRev=revision(),base=baselineHash();
      if(localHash===remoteHash){mark(remoteRev,remoteHash,file.id);emit('synced',`Dữ liệu đã đồng nhất · revision ${remoteRev}`);return {ok:true,action:'same'};}
      if(!base){
        if(emptyData(local)&&!emptyData(remote.data)){await applyRemote(remote,file);emit('synced',`Đã tải dữ liệu từ Drive · revision ${remoteRev}`);return {ok:true,action:'pull'};}
        if(!emptyData(local)&&emptyData(remote.data)){await push(file,remoteRev,local,localHash);return {ok:true,action:'push'};}
        conflict={file,remote,local,localHash};emit('conflict','Máy và Drive đều có dữ liệu khác nhau');return {ok:false,conflict:true};
      }
      const localChanged=localHash!==base,remoteChanged=remoteRev!==localRev||remoteHash!==base;
      if(localChanged&&!remoteChanged){await push(file,remoteRev,local,localHash);return {ok:true,action:'push'};}
      if(!localChanged&&remoteChanged){await applyRemote(remote,file);emit('synced',`Đã nhận thay đổi từ Drive · revision ${remoteRev}`);return {ok:true,action:'pull'};}
      conflict={file,remote,local,localHash};emit('conflict','Máy và Drive cùng có thay đổi');return {ok:false,conflict:true};
    }catch(error){emit('error',error.message||'Đồng bộ Google Drive thất bại');throw error;}
  }

  async function resolveConflict(which){
    const c=conflict;if(!c)throw new Error('Không có xung đột dữ liệu');
    if(which==='remote'){await applyRemote(c.remote,c.file);conflict=null;emit('synced',`Đã dùng bản Google Drive · revision ${c.remote.revision||0}`);return {action:'remote'};}
    await push(c.file,c.remote.revision,c.local,c.localHash);conflict=null;return {action:'local'};
  }

  async function backupToDrive(){
    if(!valid())await connect();emit('checking','Đang tạo bản sao Google Drive…');
    const payload=Store.createBackupPayload(),env={app:`${APP}-backup`,schema:1,storage:'google-drive-appDataFolder',account:account(),createdAt:new Date().toISOString(),payload};
    const file=await findNamed(backupName(),BACKUP),out=file?await updateFile(file.id,env):await createNamed(backupName(),env,BACKUP);if(out?.id)set(key(BACKUP),out.id);emit('synced','Đã sao lưu thủ công lên Google Drive');return true;
  }

  async function fetchBackupFromDrive(){
    if(!valid())await connect();emit('checking','Đang đọc bản sao Google Drive…');const file=await findNamed(backupName(),BACKUP);if(!file)throw new Error('Không tìm thấy bản sao trên Google Drive');
    const env=validateRemote(await downloadEnvelope(file.id),`${APP}-backup`);Store.validateBackup(env.payload);emit('auth','Đã đọc bản sao Google Drive');return env;
  }

  async function resume(){
    if(restoreSession()&&valid())return true;
    if(!clientId()||!granted()||!navigator.onLine)return false;
    try{await authorize({silent:true});return true;}catch{return false;}
  }

  window.PhamVanCloud={getState,getClientId:clientId,setClientId,connect,disconnect,switchAccount:()=>connect({switchAccount:true}),syncNow,resolveConflict,backupToDrive,fetchBackupFromDrive,resume,clearBaseline};
  restoreSession();emit(clientId()?'auth':'setup',valid()?'Đã khôi phục phiên Google Drive':clientId()?'Google Drive đã được cấu hình':'Google Drive chưa được thiết lập');
})();
