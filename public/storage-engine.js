(() => {
  function formatBytes(bytes){
    const n=Number(bytes)||0;
    if(n<1024) return `${n} B`;
    const units=["KB","MB","GB","TB"];
    let value=n/1024, i=0;
    while(value>=1024 && i<units.length-1){value/=1024;i++;}
    return `${value>=100?value.toFixed(0):value>=10?value.toFixed(1):value.toFixed(2)} ${units[i]}`;
  }

  function localStorageBytes(){
    let bytes=0;
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i)||"";
      const value=localStorage.getItem(key)||"";
      bytes += new Blob([key,value]).size;
    }
    return bytes;
  }

  async function estimate(){
    let usage=0,quota=0,persisted=false;
    try{
      const result=await navigator.storage?.estimate?.();
      usage=Number(result?.usage)||0;
      quota=Number(result?.quota)||0;
    }catch{}
    try{persisted=Boolean(await navigator.storage?.persisted?.());}catch{}
    const available=Math.max(0,quota-usage);
    return {
      usage,quota,available,persisted,
      localStorage:localStorageBytes(),
      percent:quota?Math.min(100,(usage/quota)*100):0,
      labels:{usage:formatBytes(usage),quota:formatBytes(quota),available:formatBytes(available),localStorage:formatBytes(localStorageBytes())}
    };
  }

  async function requestPersistent(){
    if(!navigator.storage?.persist) return false;
    return Boolean(await navigator.storage.persist());
  }

  async function optimize(){
    const keys=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key && (/^temp_|^cache_|__temp__|__cache__/.test(key))) keys.push(key);
    }
    keys.forEach(key=>localStorage.removeItem(key));
    if("caches" in window){
      const names=await caches.keys();
      await Promise.all(names.filter(name=>name.startsWith("giaphaphamvan-old-")).map(name=>caches.delete(name)));
    }
    return keys.length;
  }

  window.PhamVanStorage={estimate,requestPersistent,optimize,formatBytes,localStorageBytes};
})();
