import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const index=read('public/index.html');
const css=read('public/styles.css');
const exact=read('public/reference-exact.css');
const liquid=read('public/liquid-menu.css');
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
  'public/reference-crest.webp','public/heritage-background.webp','public/sw.js'
]) assert.ok(fs.existsSync(file),`missing ${file}`);

for(const retired of [
  'public/heritage-bg.svg','public/heritage-background.svg','public/reference-polish.css','public/parchment-v4.css','public/final-polish.css','public/reference-hero.webp',
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

assert.ok(data.includes("/target-ui.css?v=4"),'geometry stylesheet must be v4');
assert.ok(data.includes("/reference-exact.css?v=14"),'approved visual stylesheet must be v14');
assert.ok(data.includes("/liquid-menu.css?v=11"),'navigation stylesheet must be v11');
assert.ok(data.includes("const approvedCrest='/reference-crest.webp?v=2'"),'approved crest must remain canonical');

/* Safari-safe direct raster background: no embedded raster SVG. */
assert.ok(exact.includes("url('/heritage-background.webp?v=1')"),'direct WebP heritage background must be canonical');
assert.ok(exact.includes('background-repeat:no-repeat!important'),'heritage background must not tile the drum');
assert.ok(exact.includes('background-size:100% auto!important'),'heritage background must preserve aspect ratio');
assert.ok(exact.includes('.heritage-canvas::before,.heritage-canvas::after{content:none!important'),'old pseudo background layers must stay disabled');
assert.ok(exact.includes('.heritage-canvas>img,.heritage-continuation{display:none!important}'),'old split DOM background layers must stay disabled');
assert.ok(fs.statSync('public/heritage-background.webp').size>10000,'direct heritage WebP asset looks invalid');
assert.ok(!exact.includes('heritage-background.svg'),'embedded-raster SVG must never render on Safari');
assert.ok(!exact.includes('heritage-approved-top.webp?v=2'),'split top raster must no longer render');
assert.ok(!exact.includes('heritage-approved-cont.webp?v=2'),'split continuation raster must no longer render');
assert.ok(!exact.includes('tree-parchment.svg'),'tree must not use a second background image');
assert.ok(!exact.includes('dongson-header.svg'),'header must not use a second background image');
assert.ok(!liquid.includes('url('),'navigation may use color/glass only, never another artwork image');
for(const view of ['#overview-view','#tree-view','#members-view','#events-view','#documents-view','#settings-view']) assert.ok(exact.includes(view),`transparent shared-background view missing ${view}`);
assert.ok(exact.includes('background:transparent!important'),'views must expose the same continuous background');
assert.ok(liquid.includes('@keyframes goldTabSweep'),'selected tab must retain the one-shot gold tracer');
assert.ok(liquid.includes('animation:goldTabSweep .9s'),'gold tracer must run once per selection');
assert.ok(liquid.includes('grid-template-columns:repeat(6,minmax(0,1fr))'),'bottom navigation must use six equal tabs');

assert.ok(app.includes('function renderTree'),'family tree renderer missing');
assert.ok(app.includes('function drawConnectors'),'coordinate connector renderer missing');
assert.ok(app.includes('renderAll(); bindEvents();'),'runtime must render before interaction binding');
assert.ok(backup.includes('schemaVersion'),'backup must include schema version');
assert.ok(backup.includes('snapshotCurrent'),'restore must snapshot current data');
assert.ok(cloud.includes('drive.appdata'),'Google Drive must use appDataFolder scope');
assert.ok(cloud.includes('resolveConflict'),'cloud conflicts must be explicit');
assert.ok(app.includes('appConfirm'),'destructive actions must use shared confirm');
assert.ok(!app.includes('window.confirm('),'native window.confirm is forbidden');

assert.ok(sw.includes("giaphaphamvan-v40"),'service worker cache version mismatch');
for(const asset of ['/target-ui.css?v=4','/reference-exact.css?v=14','/liquid-menu.css?v=11','/reference-crest.webp?v=2','/heritage-background.webp?v=1','/data.js?v=6']) assert.ok(sw.includes(asset),`service worker missing ${asset}`);
assert.ok(!sw.includes('heritage-background.svg'),'broken embedded SVG must not be precached');
assert.ok(sw.includes("cache:'no-store'"),'service worker must bypass stale HTTP artwork cache');
assert.ok(wrangler.includes('"directory": "./public"'),'Wrangler must deploy ./public');
assert.ok(manifest.includes('"theme_color": "#650912"')||manifest.includes('"theme_color": "#65080d"'),'PWA theme must be heritage red');

console.log('Giaphaphamvan Safari-safe direct heritage background v40 audit: PASS');
