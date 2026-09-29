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
  'public/index.html','public/styles.css','public/target-ui.css','public/reference-exact.css','public/liquid-menu.css','public/app.js','public/data.js',
  'public/backup-engine.js','public/storage-engine.js','public/cloud-adapter.js','public/manifest.webmanifest','public/icon.svg',
  'public/reference-crest.webp','public/heritage-bg.svg','public/heritage-approved-top.webp','public/heritage-approved-cont.webp','public/sw.js'
]) assert.ok(fs.existsSync(file),`missing ${file}`);

for(const retired of [
  'public/reference-polish.css','public/parchment-v4.css','public/final-polish.css','public/reference-hero.webp',
  'public/reference-tree.webp','public/dongson-header.svg','public/tree-parchment.svg','public/hero-parchment.svg'
]) assert.ok(!fs.existsSync(retired),`retired visual layer must be deleted: ${retired}`);

assert.ok(!fs.existsSync('public/ui.js'),'legacy secondary UI runtime must be deleted');
for(const id of ['bottomNav','tree-view','familyTree','generationChips','members-view','events-view','documents-view','settings-view']) assert.ok(index.includes(`id="${id}"`),`missing #${id}`);
for(const view of ['overview','tree','members','events','documents','settings']) assert.ok(index.includes(`data-nav="${view}"`),`primary navigation missing ${view}`);
assert.ok(!index.includes('data-nav="more"'),'legacy Khác tab must be removed');
assert.ok(!index.includes('id="menuButton"'),'hamburger control must be removed');
assert.ok(!index.includes('id="drawer"'),'duplicate drawer navigation must be removed');
assert.ok(css.includes('.tree-connectors'),'SVG connector layer must be styled');
assert.ok(css.includes('.person-card.ancestor'),'ancestor card styling missing');

assert.ok(data.includes("/reference-exact.css?v=9"),'approved visual stylesheet must be v9');
assert.ok(data.includes("/liquid-menu.css?v=11"),'navigation stylesheet must be v11');
assert.ok(!data.includes('reference-polish.css'),'retired polish stylesheet must not load');
assert.ok(!data.includes('parchment-v4.css'),'retired parchment stylesheet must not load');
assert.ok(data.includes("const approvedCrest='/reference-crest.webp?v=2'"),'approved crest must remain canonical');
assert.ok(index.includes('/heritage-bg.svg?v=10'),'index must preload approved background v10');
assert.ok(index.includes('/data.js?v=5'),'index must load current visual bootstrap');

/* Exactly one canonical background wrapper uses the approved raster artwork. */
assert.ok(exact.includes("url('/heritage-bg.svg?v=10')"),'canonical approved background missing');
assert.ok(exact.includes('100% auto no-repeat'),'approved artwork must preserve aspect ratio');
assert.ok(!exact.includes('reference-hero.webp'),'hero must not use a second background image');
assert.ok(!exact.includes('tree-parchment.svg'),'tree must not use a second background image');
assert.ok(!exact.includes('dongson-header.svg'),'header must not use a second background image');
assert.ok(!liquid.includes('url('),'navigation may use color/glass only, never another artwork image');
for(const view of ['#overview-view','#tree-view','#members-view','#events-view','#documents-view','#settings-view']) assert.ok(exact.includes(view),`transparent shared-background view missing ${view}`);
assert.ok(exact.includes('background:transparent!important'),'views must expose the same continuous background');
assert.ok(liquid.includes('@keyframes goldTabSweep'),'selected tab must retain the one-shot gold tracer');
assert.ok(liquid.includes('animation:goldTabSweep .9s'),'gold tracer must run once per selection');
assert.ok(liquid.includes('grid-template-columns:repeat(6,minmax(0,1fr))'),'bottom navigation must use six equal tabs');

/* The approved drum image appears once; only its approved continuation tile repeats below. */
assert.ok(heritage.includes('width="375" height="6000"'),'background wrapper must support long pages');
assert.ok(heritage.includes('pattern id="continuation"'),'approved continuation pattern missing');
assert.ok(heritage.includes('/heritage-approved-top.webp?v=1'),'approved Dong Son image missing');
assert.ok(heritage.includes('/heritage-approved-cont.webp?v=1'),'approved continuation image missing');
assert.equal((heritage.match(/heritage-approved-top\.webp/g)||[]).length,1,'approved drum image must appear exactly once');
assert.ok(heritage.includes('y="666"'),'continuation must start directly below approved top image');
assert.ok(!heritage.includes('<circle'),'background wrapper must not redraw the drum with SVG geometry');
assert.ok(!heritage.includes('mountain'),'mountain scenery is forbidden');
assert.ok(!heritage.includes('pavilion'),'pavilion scenery is forbidden');

assert.ok(app.includes('function renderTree'),'family tree renderer missing');
assert.ok(app.includes('function drawConnectors'),'coordinate connector renderer missing');
assert.ok(app.includes('renderAll(); bindEvents();'),'runtime must render before interaction binding');
assert.ok(backup.includes('schemaVersion'),'backup must include schema version');
assert.ok(backup.includes('snapshotCurrent'),'restore must snapshot current data');
assert.ok(cloud.includes('drive.appdata'),'Google Drive must use appDataFolder scope');
assert.ok(cloud.includes('resolveConflict'),'cloud conflicts must be explicit');
assert.ok(app.includes('appConfirm'),'destructive actions must use shared confirm');
assert.ok(!app.includes('window.confirm('),'native window.confirm is forbidden');

assert.ok(sw.includes("giaphaphamvan-v35"),'service worker cache version mismatch');
for(const asset of ['/reference-exact.css?v=9','/liquid-menu.css?v=11','/reference-crest.webp?v=2','/heritage-bg.svg?v=10','/heritage-approved-top.webp?v=1','/heritage-approved-cont.webp?v=1','/data.js?v=5']) assert.ok(sw.includes(asset),`service worker missing ${asset}`);
for(const retired of ['/reference-polish.css','/parchment-v4.css','/reference-hero.webp','/reference-tree.webp','/dongson-header.svg','/tree-parchment.svg','/hero-parchment.svg']) assert.ok(!sw.includes(retired),`retired layer must not be precached: ${retired}`);
assert.ok(sw.includes("cache:'no-store'"),'service worker must bypass stale HTTP artwork cache');
assert.ok(wrangler.includes('"directory": "./public"'),'Wrangler must deploy ./public');
assert.ok(manifest.includes('"theme_color": "#650912"')||manifest.includes('"theme_color": "#65080d"'),'PWA theme must be heritage red');

console.log('Giaphaphamvan approved raster Dong Son v35 audit: PASS');
