import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const index=read('public/index.html');
const css=read('public/styles.css');
const target=read('public/target-ui.css');
const data=read('public/data.js');
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
  'public/index.html','public/styles.css','public/target-ui.css','public/app.js','public/data.js','public/backup-engine.js','public/storage-engine.js','public/cloud-adapter.js',
  'public/manifest.webmanifest','public/icon.svg','public/crest.svg','public/dongson-header.svg','public/hero-parchment.svg','public/tree-parchment.svg',
  'public/avatar-ancestor.svg','public/avatar-1.svg','public/avatar-2.svg','public/avatar-3.svg','public/avatar-4.svg','public/sw.js'
]) assert.ok(fs.existsSync(file),`missing ${file}`);
assert.ok(!fs.existsSync('public/ui.js'),'legacy secondary UI runtime must be deleted');

for(const id of ['bottomNav','tree-view','familyTree','generationChips','treeFilterButton','members-view','events-view','documents-view','settings-view','cloud-sync-now','cloud-connect','export-data','share-data','import-data','delete-local-data','storage-capacity-card']) assert.ok(index.includes(`id="${id}"`),`missing #${id}`);
assert.ok(index.includes('/styles.css?v=12'),'reference stylesheet version must be v12');
assert.ok(index.includes('/app.js?v=12'),'single application runtime must be v12');
assert.ok(!index.includes('/ui.js'),'legacy UI runtime must not be loaded');
assert.ok(index.includes('/dongson-header.svg')&&index.includes('/hero-parchment.svg')&&index.includes('/tree-parchment.svg'),'heritage artwork assets missing');
assert.ok(index.includes('GIA PHẢ HỌ PHẠM VĂN')&&index.includes('Gìn giữ cội nguồn · Kết nối thế hệ'),'brand copy missing');
assert.ok(index.includes('Tiếng Việt')&&index.includes('Cây gia phả')&&index.includes('Tự động')&&index.includes('Mobile'),'reference controls missing');

assert.ok(css.includes("url('/dongson-header.svg')"),'header must use Dong Son background');
assert.ok(css.includes("url('/hero-parchment.svg')"),'hero must use parchment artwork');
assert.ok(css.includes("url('/tree-parchment.svg')"),'tree must use genealogy parchment artwork');
assert.ok(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'bottom navigation must use five equal tabs');
assert.ok(css.includes('.tree-connectors'),'SVG connector layer must be styled');
assert.ok(css.includes('.person-card.ancestor'),'ancestor card styling missing');
assert.ok(css.includes('.generation-title:before')&&css.includes('.generation-title:after'),'generation ornaments missing');
assert.ok(css.includes('.hero-panel{')&&css.includes('height:130px'),'base mobile hero geometry must remain 130px');
assert.ok(css.includes('height:78px')&&css.includes('.tree-controls'),'base tree control geometry must remain compact');

assert.ok(data.includes("/target-ui.css?v=1"),'approved target reference stylesheet must be loaded');
assert.ok(target.includes('.topbar')&&target.includes('height:58px'),'target header geometry missing');
assert.ok(target.includes('.hero-panel')&&target.includes('height:130px'),'target hero geometry missing');
assert.ok(target.includes('.tree-controls')&&target.includes('height:80px'),'target control geometry missing');
assert.ok(target.includes('.tree-stage')&&target.includes('height:clamp(320px,calc(100svh - 356px),488px)'),'adaptive target tree geometry missing');
assert.ok(target.includes('.bottom-nav')&&target.includes('height:70px'),'target bottom navigation geometry missing');

assert.ok(app.includes('function renderGenerationControls'),'generation chips renderer missing');
assert.ok(app.includes('function renderTree'),'family tree renderer missing');
assert.ok(app.includes('tree.innerHTML=gens.map'),'tree renderer must write cards into DOM');
assert.ok(app.includes('ĐỜI THỨ'),'generation wording missing');
assert.ok(app.includes('avatar-ancestor.svg'),'ancestor portrait missing');
assert.ok(app.includes('祖'),'ancestor badge missing');
assert.ok(app.includes('function drawConnectors'),'coordinate connector renderer missing');
assert.ok(app.includes('getBoundingClientRect'),'connector renderer must measure real card coordinates');
assert.ok(app.includes("navigate('tree')"),'tree must open as default view');
assert.ok(app.includes('renderAll(); bindEvents();'),'runtime must render before interaction binding');

assert.ok(crest.includes('PHẠM VĂN'),'crest must contain PHẠM VĂN');
assert.ok(crest.length>2000,'crest artwork unexpectedly simple');
assert.ok(dongson.length>1000,'Dong Son artwork unexpectedly small');
assert.ok(hero.length>1500,'hero artwork unexpectedly small');
assert.ok(treebg.length>1500,'tree parchment artwork unexpectedly small');

assert.ok(sw.includes("giaphaphamvan-v15"),'service worker cache version mismatch');
for(const asset of ['/styles.css?v=12','/target-ui.css?v=1','/app.js?v=12','/dongson-header.svg','/hero-parchment.svg','/tree-parchment.svg','/crest.svg']) assert.ok(sw.includes(asset),`service worker missing ${asset}`);
assert.ok(!sw.includes('/ui.js'),'service worker must not cache legacy UI runtime');
assert.ok(wrangler.includes('"directory": "./public"'),'Wrangler must deploy ./public');
assert.ok(manifest.includes('"theme_color": "#650912"')||manifest.includes('"theme_color": "#65080d"'),'PWA theme must be heritage red');

assert.ok(backup.includes('schemaVersion'),'backup must include schema version');
assert.ok(backup.includes('snapshotCurrent'),'restore must snapshot current data');
assert.ok(cloud.includes('drive.appdata'),'Google Drive must use appDataFolder scope');
assert.ok(cloud.includes('appDataFolder'),'Google Drive file must live in appDataFolder');
assert.ok(cloud.includes('resolveConflict'),'cloud conflicts must be explicit');
assert.ok(app.includes('appConfirm'),'destructive actions must use shared confirm');
assert.ok(!app.includes('window.confirm('),'native window.confirm is forbidden');

console.log('Giaphaphamvan approved responsive reference v15 audit: PASS');
