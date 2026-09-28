import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const index=read('public/index.html');
const app=read('public/app.js');
const mobile=read('public/ios27-mobile.js');
const backup=read('public/backup-engine.js');
const cloud=read('public/cloud-adapter.js');
const css=read('public/styles.css');
const theme=read('public/theme-original-red.css');
const icon=read('public/icon.svg');
const crest=read('public/crest.svg');
const heritage=read('public/heritage-bg.svg');
const sw=read('public/sw.js');
const manifest=read('public/manifest.webmanifest');
const wrangler=read('wrangler.jsonc');

for(const file of [
  'public/index.html','public/styles.css','public/theme-original-red.css','public/app.js','public/ios27-mobile.js','public/data.js',
  'public/backup-engine.js','public/storage-engine.js','public/cloud-adapter.js','public/manifest.webmanifest','public/icon.svg','public/crest.svg',
  'public/heritage-bg.svg','public/avatar-ancestor.svg','public/avatar-1.svg','public/avatar-2.svg','public/avatar-3.svg','public/avatar-4.svg','public/sw.js'
]) assert.ok(fs.existsSync(file),`missing ${file}`);

for(const id of ['bottomNav','tree-view','members-view','events-view','documents-view','settings-view','cloud-sync-now','cloud-connect','export-data','share-data','import-data','delete-local-data','storage-capacity-card']){
  assert.ok(index.includes(`id="${id}"`),`missing #${id}`);
}

assert.ok(index.includes('/styles.css?v=3'),'base stylesheet cache key must be v3');
assert.ok(index.includes('/theme-original-red.css?v=3'),'approved heritage theme must load');
assert.ok(index.includes('/app.js?v=4'),'app cache key must be v4');
assert.ok(index.includes('/ios27-mobile.js?v=2'),'approved mobile behavior must load');
assert.ok(index.includes('/cloud-adapter.js?v=3'),'cloud adapter must load before app');
assert.ok(index.includes('data-nav="more"'),'mobile navigation must expose More entry');
assert.ok(index.includes('/crest.svg'),'crest must be used by UI');
assert.ok(sw.includes("giaphaphamvan-v9"),'service worker cache version mismatch');
assert.ok(sw.includes('/theme-original-red.css?v=3'),'heritage theme must be precached');
assert.ok(sw.includes('/ios27-mobile.js?v=2'),'mobile behavior must be precached');
assert.ok(sw.includes('/crest.svg')&&sw.includes('/heritage-bg.svg'),'heritage assets must be precached');
assert.ok(sw.includes('/avatar-ancestor.svg')&&sw.includes('/avatar-4.svg'),'genealogy portrait assets must be precached');
assert.ok(wrangler.includes('"directory": "./public"'),'Wrangler must deploy ./public');
assert.ok(manifest.includes('"background_color": "#f4ead7"'),'PWA background must use parchment');
assert.ok(manifest.includes('"theme_color": "#650912"'),'PWA theme must use heritage red');

assert.ok(css.includes('--ui-control-height:44px'),'missing locked 44px control token');
assert.ok(css.includes('--ui-radius-control:14px'),'missing locked 14px control radius');
assert.ok(css.includes('--ui-radius-card:18px'),'missing locked 18px card radius');
assert.ok(css.includes('.storage-capacity-actions'),'missing storage action geometry');
assert.ok(theme.includes('APPROVED REFERENCE UI v4'),'locked reference UI marker missing');
assert.ok(theme.includes('width:100vw!important'),'mobile canvas must be full viewport width');
assert.ok(theme.includes("url('/heritage-bg.svg')"),'heritage background missing');
assert.ok(theme.includes('flex-direction:column!important'),'family tree must be vertical');
assert.ok(theme.includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'bottom navigation must have five equal tabs');
assert.ok(theme.includes("content:attr(data-initial)"),'tree member badge mapping missing');
assert.ok(mobile.includes('openTreeAsDefault'),'tree must open as default mobile view');
assert.ok(mobile.includes('decorateTree'),'dynamic tree decoration missing');
assert.ok(mobile.includes('ĐỜI THỨ'),'generation headings must use approved wording');
assert.ok(mobile.includes('data-nav="more"'),'More behavior must intercept the mobile tab');
assert.ok(icon.includes('Cây gia phả họ Phạm Văn'),'tree app icon accessibility label missing');
assert.ok(crest.includes('PHẠM VĂN'),'brand crest missing Phạm Văn text');
assert.ok(heritage.includes('mist'),'heritage background must include mist layer');

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

console.log('Giaphaphamvan locked reference mobile UI audit: PASS');
