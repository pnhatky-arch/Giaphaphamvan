import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = p => fs.readFileSync(p,'utf8');
const index=read('public/index.html');
const app=read('public/app.js');
const mobile=read('public/ios27-mobile.js');
const backup=read('public/backup-engine.js');
const cloud=read('public/cloud-adapter.js');
const css=read('public/styles.css');
const theme=read('public/theme-original-red.css');
const icon=read('public/icon.svg');
const sw=read('public/sw.js');
const manifest=read('public/manifest.webmanifest');
const wrangler=read('wrangler.jsonc');

for(const file of ['public/index.html','public/styles.css','public/theme-original-red.css','public/app.js','public/ios27-mobile.js','public/data.js','public/backup-engine.js','public/storage-engine.js','public/cloud-adapter.js','public/manifest.webmanifest','public/icon.svg','public/sw.js']){
  assert.ok(fs.existsSync(file),`missing ${file}`);
}
for(const id of ['bottomNav','tree-view','members-view','events-view','documents-view','settings-view','cloud-sync-now','cloud-connect','export-data','share-data','import-data','delete-local-data','storage-capacity-card']){
  assert.ok(index.includes(`id="${id}"`),`missing #${id}`);
}
assert.ok(index.includes('/styles.css?v=3'),'base stylesheet cache key must be v3');
assert.ok(index.includes('/theme-original-red.css?v=1'),'original red theme must load');
assert.ok(index.includes('/app.js?v=4'),'app cache key must be v4');
assert.ok(index.includes('/ios27-mobile.js?v=1'),'iOS 27 mobile behavior must load');
assert.ok(index.includes('/cloud-adapter.js?v=3'),'cloud adapter must load before app');
assert.ok(index.includes('data-nav="more"'),'mobile navigation must expose More entry');
assert.ok(sw.includes("giaphaphamvan-v7"),'service worker cache version mismatch');
assert.ok(sw.includes('/theme-original-red.css?v=1'),'original red theme must be precached');
assert.ok(sw.includes('/ios27-mobile.js?v=1'),'mobile behavior must be precached');
assert.ok(wrangler.includes('"directory": "./public"'),'Wrangler must deploy ./public');
assert.ok(manifest.includes('"background_color": "#f7f3eb"'),'PWA background must use light ivory');
assert.ok(manifest.includes('"theme_color": "#f7f3eb"'),'PWA theme color must use light ivory');

assert.ok(css.includes('--ui-control-height:44px'),'missing locked 44px control token');
assert.ok(css.includes('--ui-radius-control:14px'),'missing locked 14px control radius');
assert.ok(css.includes('--ui-radius-card:18px'),'missing locked 18px card radius');
assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'missing equal two-column grid');
assert.ok(css.includes('.storage-capacity-actions'),'missing storage action geometry');
assert.ok(theme.includes('Original ChatGPT-site red/gold identity'),'theme must document original identity');
assert.ok(theme.includes('--paper:#f7f3eb'),'light mode must be ivory-led');
assert.ok(theme.includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'mobile bottom nav must use five items');
assert.ok(theme.includes('#2f0208'),'dark deep red token missing');
assert.ok(mobile.includes('data-nav="more"'),'More behavior must intercept the mobile tab');
assert.ok(icon.includes('Cây gia phả họ Phạm Văn'),'tree crest accessibility label missing');
assert.ok(icon.includes('generation nodes'),'tree crest generation nodes missing');
assert.ok(!icon.includes('>PV<'),'tree crest must not fall back to PV text logo');

assert.ok(backup.includes('"app": APP_ID')||backup.includes('app: APP_ID'),'backup must include app metadata');
assert.ok(backup.includes('schemaVersion'),'backup must include schema version');
assert.ok(backup.includes('snapshotCurrent'),'restore must snapshot current data');
assert.ok(!backup.toLowerCase().includes('password plaintext'),'backup engine must not intentionally serialize plaintext password');
assert.ok(cloud.includes('drive.appdata'),'Google Drive must use appDataFolder scope');
assert.ok(cloud.includes('appDataFolder'),'Google Drive file must live in appDataFolder');
assert.ok(cloud.includes('resolveConflict'),'cloud conflicts must be handled explicitly');
assert.ok(app.includes('appConfirm'),'destructive actions must use shared confirm');
assert.ok(!app.includes('window.confirm('),'native window.confirm is forbidden');
assert.ok(!index.includes('id="cloud-use-local"'),'legacy local conflict control must not be permanent');
assert.ok(!index.includes('id="cloud-use-remote"'),'legacy remote conflict control must not be permanent');
console.log('Giaphaphamvan static audit: PASS');