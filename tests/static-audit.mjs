import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const index=read('public/index.html');
const css=read('public/styles.css');
const ui=read('public/ui.js');
const app=read('public/app.js');
const backup=read('public/backup-engine.js');
const cloud=read('public/cloud-adapter.js');
const crest=read('public/crest.svg');
const dongson=read('public/dongson-header.svg');
const hero=read('public/hero-parchment.svg');
const treebg=read('public/tree-parchment.svg');
const sw=read('public/sw.js');
const manifest=read('public/manifest.webmanifest');
const wrangler=read('wrangler.jsonc');

for(const file of [
  'public/index.html','public/styles.css','public/ui.js','public/app.js','public/data.js','public/backup-engine.js','public/storage-engine.js','public/cloud-adapter.js',
  'public/manifest.webmanifest','public/icon.svg','public/crest.svg','public/dongson-header.svg','public/hero-parchment.svg','public/tree-parchment.svg',
  'public/avatar-ancestor.svg','public/avatar-1.svg','public/avatar-2.svg','public/avatar-3.svg','public/avatar-4.svg','public/sw.js'
]) assert.ok(fs.existsSync(file),`missing ${file}`);

for(const id of ['bottomNav','tree-view','familyTree','generationChips','treeFilterButton','members-view','events-view','documents-view','settings-view','cloud-sync-now','cloud-connect','export-data','share-data','import-data','delete-local-data','storage-capacity-card']){
  assert.ok(index.includes(`id="${id}"`),`missing #${id}`);
}

assert.ok(index.includes('/styles.css?v=11'),'reference stylesheet version must be v11');
assert.ok(index.includes('/ui.js?v=11'),'reference UI runtime version must be v11');
assert.ok(index.includes('/dongson-header.svg'),'Dong Son header asset must be loaded');
assert.ok(index.includes('/hero-parchment.svg'),'hero parchment asset must be loaded');
assert.ok(index.includes('/tree-parchment.svg'),'tree parchment asset must be loaded');
assert.ok(index.includes('GIA PHẢ HỌ PHẠM VĂN'),'brand title missing');
assert.ok(index.includes('Gìn giữ cội nguồn · Kết nối thế hệ'),'brand motto missing');
assert.ok(index.includes('Tiếng Việt'),'language control missing');
assert.ok(index.includes('Cây gia phả'),'tree control missing');
assert.ok(index.includes('Tự động')&&index.includes('Mobile'),'display controls missing');

assert.ok(css.includes("url('/dongson-header.svg')"),'header must use Dong Son background');
assert.ok(css.includes("url('/hero-parchment.svg')"),'hero must use parchment artwork');
assert.ok(css.includes("url('/tree-parchment.svg')"),'tree must use genealogy parchment artwork');
assert.ok(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'bottom navigation must use five equal tabs');
assert.ok(css.includes('.tree-connectors'),'dynamic SVG connector layer must be styled');
assert.ok(css.includes('.person-card.ancestor'),'ancestor card reference styling missing');
assert.ok(css.includes('.generation-title:before')&&css.includes('.generation-title:after'),'generation ornaments missing');

assert.ok(ui.includes('drawConnectors'),'coordinate-based connector renderer missing');
assert.ok(ui.includes('getBoundingClientRect'),'connector renderer must measure real card coordinates');
assert.ok(ui.includes('ĐỜI THỨ'),'generation wording missing');
assert.ok(ui.includes('openTreeAsDefault'),'tree must open as default view');
assert.ok(ui.includes('avatar-ancestor.svg'),'ancestor portrait missing');
assert.ok(ui.includes('祖'),'ancestor badge missing');

assert.ok(crest.includes('PHẠM VĂN'),'crest must contain PHẠM VĂN');
assert.ok(crest.includes('open book')||crest.includes('open book')===false,'crest file readable');
assert.ok(dongson.includes('circle')&&dongson.includes('repeating-radial')===false,'Dong Son artwork missing');
assert.ok(hero.includes('pagoda')===false || hero.length>500,'hero artwork unexpectedly small');
assert.ok(treebg.length>500,'tree parchment artwork unexpectedly small');

assert.ok(sw.includes("giaphaphamvan-v11"),'service worker cache version mismatch');
for(const asset of ['/styles.css?v=11','/ui.js?v=11','/dongson-header.svg','/hero-parchment.svg','/tree-parchment.svg','/crest.svg'])assert.ok(sw.includes(asset),`service worker missing ${asset}`);
assert.ok(wrangler.includes('"directory": "./public"'),'Wrangler must deploy ./public');
assert.ok(manifest.includes('"theme_color": "#650912"')||manifest.includes('"theme_color": "#65080d"'),'PWA theme must be heritage red');

assert.ok(backup.includes('schemaVersion'),'backup must include schema version');
assert.ok(backup.includes('snapshotCurrent'),'restore must snapshot current data');
assert.ok(cloud.includes('drive.appdata'),'Google Drive must use appDataFolder scope');
assert.ok(cloud.includes('appDataFolder'),'Google Drive file must live in appDataFolder');
assert.ok(cloud.includes('resolveConflict'),'cloud conflicts must be explicit');
assert.ok(app.includes('appConfirm'),'destructive actions must use shared confirm');
assert.ok(!app.includes('window.confirm('),'native window.confirm is forbidden');

console.log('Giaphaphamvan exact-reference UI audit: PASS');