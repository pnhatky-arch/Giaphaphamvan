import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const index=read('public/index.html');
const css=read('public/styles.css');
const target=read('public/target-ui.css');
const polish=read('public/reference-polish.css');
const parchment=read('public/parchment-v4.css');
const liquid=read('public/liquid-menu.css');
const data=read('public/data.js');
const app=read('public/app.js');
const backup=read('public/backup-engine.js');
const cloud=read('public/cloud-adapter.js');
const crest=read('public/crest.svg');
const dongson=read('public/dongson-header.svg');
const hero=read('public/hero-parchment.svg');
const treebg=read('public/tree-parchment.svg');
const heritage=read('public/heritage-bg.svg');
const sw=read('public/sw.js');
const manifest=read('public/manifest.webmanifest');
const wrangler=read('wrangler.jsonc');

for(const file of [
  'public/index.html','public/styles.css','public/target-ui.css','public/reference-polish.css','public/parchment-v4.css','public/reference-exact.css','public/liquid-menu.css','public/app.js','public/data.js','public/backup-engine.js','public/storage-engine.js','public/cloud-adapter.js',
  'public/manifest.webmanifest','public/icon.svg','public/crest.svg','public/reference-crest.webp','public/reference-hero.webp','public/reference-tree.webp','public/dongson-header.svg','public/hero-parchment.svg','public/tree-parchment.svg','public/heritage-bg.svg',
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

assert.ok(data.includes("/target-ui.css?v=3"),'approved target reference stylesheet v3 must be loaded');
assert.ok(data.includes("/reference-polish.css?v=1"),'final genealogy polish stylesheet must be loaded');
assert.ok(data.includes("/parchment-v4.css?v=4"),'warm parchment v4 stylesheet must be loaded');
assert.ok(data.includes("/reference-exact.css?v=1"),'exact reference artwork stylesheet must be loaded');
assert.ok(data.includes("/liquid-menu.css?v=1"),'Liquid Glass menu stylesheet must be loaded last');
assert.ok(data.includes('/reference-crest.webp?v=1'),'approved reference crest must be routed at runtime');
assert.ok(target.includes('.topbar')&&target.includes('height:calc(58px + env(safe-area-inset-top))'),'target header safe-area geometry missing');
assert.ok(target.includes('.hero-panel')&&target.includes('height:130px'),'target hero geometry missing');
assert.ok(target.includes('.source-status')&&target.includes('.stats-grid')&&target.includes('.quick-card'),'overview premium card system missing');
assert.ok(target.includes('.tree-controls')&&target.includes('height:80px'),'target control geometry missing');
assert.ok(target.includes('.tree-stage')&&target.includes('height:clamp(320px,calc(100svh - 356px),488px)'),'adaptive target tree geometry missing');
assert.ok(polish.includes('justify-content:space-between!important'),'tall mobile genealogy must distribute generations across parchment');
assert.ok(polish.includes('#overview-view:after'),'overview heritage background layer missing');
assert.ok(parchment.includes("url('/heritage-bg.svg?v=4')")&&parchment.includes("url('/hero-parchment.svg?v=4')")&&parchment.includes("url('/tree-parchment.svg?v=4')"),'parchment v4 artwork routing missing');
assert.ok(liquid.includes('backdrop-filter:blur(26px)')&&liquid.includes('-webkit-backdrop-filter:blur(26px)'),'bottom navigation must use true Liquid Glass blur');
assert.ok(liquid.includes('.menu-button')&&liquid.includes('.language-button')&&liquid.includes('.avatar-button'),'top controls must use Liquid Glass material');
assert.ok(liquid.includes('.bottom-nav button.active')&&liquid.includes('rgba(255,255,255,.23)'),'active navigation tab must be translucent rather than opaque red');
assert.ok(liquid.includes('border-radius:25px!important'),'floating dock geometry missing');

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
assert.ok(crest.length>4000,'crest artwork unexpectedly simple');
assert.ok(dongson.length>1000,'Dong Son artwork unexpectedly small');
assert.ok(hero.length>3000,'hero artwork unexpectedly simple');
assert.ok(treebg.length>3000,'tree parchment artwork unexpectedly simple');
assert.ok(heritage.length>3000,'full-page heritage background missing');

assert.ok(sw.includes("giaphaphamvan-v20"),'service worker cache version mismatch');
for(const asset of ['/styles.css?v=12','/target-ui.css?v=3','/reference-polish.css?v=1','/parchment-v4.css?v=4','/reference-exact.css?v=1','/liquid-menu.css?v=1','/app.js?v=12','/reference-crest.webp?v=1','/reference-hero.webp?v=1','/reference-tree.webp?v=1']) assert.ok(sw.includes(asset),`service worker missing ${asset}`);
assert.ok(sw.includes("cache:'no-store'"),'service worker must bypass stale HTTP artwork cache');
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

console.log('Giaphaphamvan Liquid Glass v20 audit: PASS');
