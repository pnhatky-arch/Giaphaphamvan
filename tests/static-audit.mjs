import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const index=read('public/index.html');
const app=read('public/app.js');
const ui=read('public/ui.js');
const backup=read('public/backup-engine.js');
const cloud=read('public/cloud-adapter.js');
const css=read('public/styles.css');
const icon=read('public/icon.svg');
const crest=read('public/crest.svg');
const heritage=read('public/heritage-bg.svg');
const sw=read('public/sw.js');
const manifest=read('public/manifest.webmanifest');
const wrangler=read('wrangler.jsonc');

for(const file of [
  'public/index.html','public/styles.css','public/app.js','public/ui.js','public/data.js','public/backup-engine.js','public/storage-engine.js',
  'public/cloud-adapter.js','public/manifest.webmanifest','public/icon.svg','public/crest.svg','public/heritage-bg.svg','public/avatar-ancestor.svg',
  'public/avatar-1.svg','public/avatar-2.svg','public/avatar-3.svg','public/avatar-4.svg','public/sw.js'
]) assert.ok(fs.existsSync(file),`missing ${file}`);

assert.ok(!fs.existsSync('public/theme-original-red.css'),'legacy theme file must be deleted');
assert.ok(!fs.existsSync('public/ios27-mobile.js'),'legacy mobile UI file must be deleted');

for(const id of ['bottomNav','tree-view','members-view','events-view','documents-view','settings-view','familyTree','generationChips','displaySegment','cloud-sync-now','cloud-connect','export-data','share-data','import-data','delete-local-data','storage-capacity-card']){
  assert.ok(index.includes(`id="${id}"`),`missing #${id}`);
}

assert.ok(index.includes('/styles.css?v=10'),'rebuilt stylesheet cache key must be v10');
assert.ok(index.includes('/ui.js?v=1'),'rebuilt UI runtime must load');
assert.ok(!index.includes('theme-original-red.css'),'legacy theme must not load');
assert.ok(!index.includes('ios27-mobile.js'),'legacy mobile runtime must not load');
assert.ok(index.includes('data-nav="tree" class="active"'),'tree tab must be marked default in markup');
assert.ok(sw.includes("giaphaphamvan-v10"),'service worker cache version mismatch');
assert.ok(sw.includes('/styles.css?v=10'),'rebuilt stylesheet must be precached');
assert.ok(sw.includes('/ui.js?v=1'),'rebuilt UI runtime must be precached');
assert.ok(!sw.includes('theme-original-red.css'),'legacy theme must not be precached');
assert.ok(!sw.includes('ios27-mobile.js'),'legacy mobile runtime must not be precached');
assert.ok(wrangler.includes('"directory": "./public"'),'Wrangler must deploy ./public');
assert.ok(manifest.includes('"background_color": "#f4ead7"'),'PWA background must use parchment');
assert.ok(manifest.includes('"theme_color": "#650912"'),'PWA theme must use heritage red');

assert.ok(css.includes('UI REBUILT FROM ZERO'),'new UI marker missing');
assert.ok(css.includes('.app-shell{width:100%'),'app canvas must be full width');
assert.ok(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'bottom navigation must use five equal tabs');
assert.ok(css.includes('flex-direction:column!important'),'family tree must be vertical');
assert.ok(css.includes("url('/heritage-bg.svg')"),'heritage background missing');
assert.ok(ui.includes('openTreeAsDefault'),'tree must open by default');
assert.ok(ui.includes('decorateTree'),'dynamic genealogy decoration missing');
assert.ok(ui.includes('ĐỜI THỨ'),'generation wording must be normalized');
assert.ok(ui.includes('data-nav="more"'),'More behavior must be intercepted');
assert.ok(icon.includes('Cây gia phả họ Phạm Văn'),'tree app icon accessibility label missing');
assert.ok(crest.includes('PHẠM VĂN'),'brand crest missing Phạm Văn text');
assert.ok(heritage.includes('mist'),'heritage background must include mist layer');

assert.ok(backup.includes('"app": APP_ID')||backup.includes('app: APP_ID'),'backup must include app metadata');
assert.ok(backup.includes('schemaVersion'),'backup must include schema version');
assert.ok(backup.includes('snapshotCurrent'),'restore must snapshot current data');
assert.ok(cloud.includes('drive.appdata'),'Google Drive must use appDataFolder scope');
assert.ok(cloud.includes('appDataFolder'),'Google Drive file must live in appDataFolder');
assert.ok(cloud.includes('resolveConflict'),'cloud conflicts must be handled explicitly');
assert.ok(app.includes('appConfirm'),'destructive actions must use shared confirm');
assert.ok(!app.includes('window.confirm('),'native window.confirm is forbidden');
assert.ok(!index.includes('id="cloud-use-local"'),'legacy local conflict control must not be permanent');
assert.ok(!index.includes('id="cloud-use-remote"'),'legacy remote conflict control must not be permanent');

console.log('Giaphaphamvan rebuilt UI audit: PASS');
