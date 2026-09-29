import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const index=read('public/index.html');
const css=read('public/styles.css');
const exact=read('public/reference-exact.css');
const liquid=read('public/liquid-menu.css');
const heritage=read('public/heritage-bg.svg');
const data=read('public/data.js');
const app=read('public/app.js');
const backup=read('public/backup-engine.js');
const cloud=read('public/cloud-adapter.js');
const sw=read('public/sw.js');
const manifest=read('public/manifest.webmanifest');
const wrangler=read('wrangler.jsonc');

for(const file of [
  'public/index.html','public/styles.css','public/reference-exact.css','public/liquid-menu.css','public/app.js','public/data.js',
  'public/backup-engine.js','public/storage-engine.js','public/cloud-adapter.js','public/manifest.webmanifest','public/icon.svg',
  'public/reference-crest.webp','public/heritage-bg.svg','public/sw.js'
]) assert.ok(fs.existsSync(file),`missing ${file}`);

assert.ok(!fs.existsSync('public/ui.js'),'legacy secondary UI runtime must be deleted');
for(const id of ['bottomNav','tree-view','familyTree','generationChips','members-view','events-view','documents-view','settings-view']) assert.ok(index.includes(`id="${id}"`),`missing #${id}`);
for(const view of ['overview','tree','members','events','documents','settings']) assert.ok(index.includes(`data-nav="${view}"`),`primary navigation missing ${view}`);
assert.ok(!index.includes('data-nav="more"'),'legacy Khác tab must be removed');
assert.ok(!index.includes('id="menuButton"'),'hamburger control must be removed');
assert.ok(!index.includes('id="drawer"'),'duplicate drawer navigation must be removed');
assert.ok(css.includes('.tree-connectors'),'SVG connector layer must be styled');
assert.ok(css.includes('.person-card.ancestor'),'ancestor card styling missing');

assert.ok(data.includes("/reference-exact.css?v=5"),'single-background visual stylesheet must be v5');
assert.ok(data.includes("/liquid-menu.css?v=10"),'navigation stylesheet must be v10');
assert.ok(data.includes("const approvedCrest='/reference-crest.webp?v=2'"),'approved crest must remain canonical');

/* Exactly one decorative background asset is allowed in the final visual layers. */
assert.ok(exact.includes("url('/heritage-bg.svg?v=6')"),'canonical Dong Son background missing');
assert.ok(!exact.includes('reference-hero.webp'),'hero must not use a second background image');
assert.ok(!exact.includes('tree-parchment.svg'),'tree must not use a second background image');
assert.ok(!exact.includes('dongson-header.svg'),'header must not use a second background image');
assert.ok(!liquid.includes('dongson-header.svg'),'navigation must not use its own artwork');
assert.ok(!liquid.includes('url('),'navigation may use color/glass only, never another image');
for(const view of ['#overview-view','#tree-view','#members-view','#events-view','#documents-view','#settings-view']) assert.ok(exact.includes(view),`transparent shared-background view missing ${view}`);
assert.ok(exact.includes("background:transparent!important"),'views must expose the same continuous background');
assert.ok(exact.includes('.surface')&&exact.includes('rgba(255,253,247,.80)'),'cards must be translucent over the same background');
assert.ok(exact.includes('.ui-button')&&exact.includes('rgba(255,251,244,.64)'),'buttons must be translucent over the same background');
assert.ok(liquid.includes('rgba(162,24,39,.88)')&&liquid.includes('rgba(104,7,17,.92)'),'red dock must remain translucent so the same background is visible');
assert.ok(liquid.includes('@keyframes goldTabSweep'),'selected tab must retain the one-shot gold tracer');
assert.ok(liquid.includes('animation:goldTabSweep .9s'),'gold tracer must run once per selection');
assert.ok(liquid.includes('grid-template-columns:repeat(6,minmax(0,1fr))'),'bottom navigation must use six equal tabs');

assert.ok(heritage.includes('Main Dong Son drum medallion'),'Dong Son medallion marker missing');
assert.ok(heritage.includes('central Đông Sơn starburst'),'Dong Son starburst marker missing');
assert.ok(heritage.includes('circular scenes: birds'),'Dong Son bird ring missing');
assert.ok(heritage.includes('circular scenes: people, deer and boats'),'Dong Son narrative ring missing');
assert.ok(heritage.includes('lower waves / water bands'),'Dong Son lower wave band missing');

assert.ok(app.includes('function renderTree'),'family tree renderer missing');
assert.ok(app.includes('function drawConnectors'),'coordinate connector renderer missing');
assert.ok(app.includes('renderAll(); bindEvents();'),'runtime must render before interaction binding');
assert.ok(backup.includes('schemaVersion'),'backup must include schema version');
assert.ok(backup.includes('snapshotCurrent'),'restore must snapshot current data');
assert.ok(cloud.includes('drive.appdata'),'Google Drive must use appDataFolder scope');
assert.ok(cloud.includes('resolveConflict'),'cloud conflicts must be explicit');
assert.ok(app.includes('appConfirm'),'destructive actions must use shared confirm');
assert.ok(!app.includes('window.confirm('),'native window.confirm is forbidden');

assert.ok(sw.includes("giaphaphamvan-v31"),'service worker cache version mismatch');
for(const asset of ['/reference-exact.css?v=5','/liquid-menu.css?v=10','/reference-crest.webp?v=2','/heritage-bg.svg?v=6']) assert.ok(sw.includes(asset),`service worker missing ${asset}`);
for(const retired of ['/reference-hero.webp','/dongson-header.svg','/tree-parchment.svg','/hero-parchment.svg']) assert.ok(!sw.includes(retired),`retired background must not be precached: ${retired}`);
assert.ok(sw.includes("cache:'no-store'"),'service worker must bypass stale HTTP artwork cache');
assert.ok(wrangler.includes('"directory": "./public"'),'Wrangler must deploy ./public');
assert.ok(manifest.includes('"theme_color": "#650912"')||manifest.includes('"theme_color": "#65080d"'),'PWA theme must be heritage red');

console.log('Giaphaphamvan single Dong Son background v31 audit: PASS');
