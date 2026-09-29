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
const sw=read('public/sw.js');
const manifest=read('public/manifest.webmanifest');
const wrangler=read('wrangler.jsonc');

for(const file of [
  'public/index.html','public/styles.css','public/target-ui.css','public/reference-polish.css','public/parchment-v4.css','public/reference-exact.css','public/liquid-menu.css','public/app.js','public/data.js','public/backup-engine.js','public/storage-engine.js','public/cloud-adapter.js',
  'public/manifest.webmanifest','public/icon.svg','public/crest.svg','public/reference-crest.webp','public/reference-hero.webp','public/reference-tree.webp','public/dongson-header.svg','public/hero-parchment.svg','public/tree-parchment.svg','public/heritage-bg.svg','public/sw.js'
]) assert.ok(fs.existsSync(file),`missing ${file}`);

assert.ok(!fs.existsSync('public/ui.js'),'legacy secondary UI runtime must be deleted');
for(const id of ['bottomNav','tree-view','familyTree','generationChips','members-view','events-view','documents-view','settings-view']) assert.ok(index.includes(`id="${id}"`),`missing #${id}`);
assert.ok(index.includes('/styles.css?v=12'),'reference stylesheet version must be v12');
assert.ok(index.includes('/app.js?v=12'),'single application runtime must be v12');
assert.ok(index.includes('GIA PHẢ HỌ PHẠM VĂN'),'brand copy missing');
assert.ok(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'bottom navigation must use five equal tabs');
assert.ok(css.includes('.tree-connectors'),'SVG connector layer must be styled');
assert.ok(css.includes('.person-card.ancestor'),'ancestor card styling missing');

assert.ok(data.includes("/target-ui.css?v=3"),'approved target reference stylesheet v3 must be loaded');
assert.ok(data.includes("/reference-polish.css?v=1"),'reference polish stylesheet must be loaded');
assert.ok(data.includes("/parchment-v4.css?v=4"),'warm parchment stylesheet must be loaded');
assert.ok(data.includes("/reference-exact.css?v=1"),'exact reference artwork stylesheet must be loaded');
assert.ok(data.includes("/liquid-menu.css?v=5"),'glossy active-tab Liquid Glass stylesheet must be loaded last');
assert.ok(data.includes('/reference-crest.webp?v=1'),'approved reference crest must be routed at runtime');

assert.ok(target.includes('.topbar')&&target.includes('height:calc(58px + env(safe-area-inset-top))'),'target header safe-area geometry missing');
assert.ok(target.includes('.hero-panel')&&target.includes('height:130px'),'target hero geometry missing');
assert.ok(target.includes('.tree-controls')&&target.includes('height:80px'),'target control geometry missing');
assert.ok(polish.includes('justify-content:space-between!important'),'tall mobile genealogy must distribute generations across parchment');
assert.ok(parchment.includes("url('/heritage-bg.svg?v=4')"),'parchment artwork routing missing');

assert.ok(liquid.includes('linear-gradient(180deg,var(--lg-dock-red-top),var(--lg-dock-red-bottom))'),'dock must remain heritage red');
assert.ok(liquid.includes('backdrop-filter:blur(21px)')&&liquid.includes('-webkit-backdrop-filter:blur(21px)'),'selected tab must use glossy glass blur');
assert.ok(liquid.includes('rgba(255,255,255,.52)'),'selected tab must include a strong specular highlight');
assert.ok(liquid.includes('0 0 16px rgba(244,206,118,.16)'),'selected tab must include a restrained gold glow');
assert.ok(liquid.includes('.menu-button')&&liquid.includes('.language-button')&&liquid.includes('.avatar-button'),'top controls must use Liquid Glass material');
assert.ok(liquid.includes('border-radius:26px!important'),'floating dock geometry missing');

assert.ok(app.includes('function renderTree'),'family tree renderer missing');
assert.ok(app.includes('function drawConnectors'),'coordinate connector renderer missing');
assert.ok(app.includes('renderAll(); bindEvents();'),'runtime must render before interaction binding');
assert.ok(backup.includes('schemaVersion'),'backup must include schema version');
assert.ok(backup.includes('snapshotCurrent'),'restore must snapshot current data');
assert.ok(cloud.includes('drive.appdata'),'Google Drive must use appDataFolder scope');
assert.ok(cloud.includes('resolveConflict'),'cloud conflicts must be explicit');
assert.ok(app.includes('appConfirm'),'destructive actions must use shared confirm');
assert.ok(!app.includes('window.confirm('),'native window.confirm is forbidden');

assert.ok(sw.includes("giaphaphamvan-v24"),'service worker cache version mismatch');
for(const asset of ['/styles.css?v=12','/target-ui.css?v=3','/reference-polish.css?v=1','/parchment-v4.css?v=4','/reference-exact.css?v=1','/liquid-menu.css?v=5','/app.js?v=12','/reference-crest.webp?v=1','/reference-hero.webp?v=1','/reference-tree.webp?v=1']) assert.ok(sw.includes(asset),`service worker missing ${asset}`);
assert.ok(sw.includes("cache:'no-store'"),'service worker must bypass stale HTTP artwork cache');
assert.ok(wrangler.includes('"directory": "./public"'),'Wrangler must deploy ./public');
assert.ok(manifest.includes('"theme_color": "#650912"')||manifest.includes('"theme_color": "#65080d"'),'PWA theme must be heritage red');

console.log('Giaphaphamvan glossy active-tab Liquid Glass v24 audit: PASS');
