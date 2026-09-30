import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const index=read('public/index.html');
const css=read('public/styles.css');
const exact=read('public/reference-exact.css');
const liquid=read('public/liquid-menu.css');
const safariShell=read('public/safari-shell.css');
const data=read('public/data.js');
const app=read('public/app.js');
const detail=read('public/detail-features.js');
const memberFeatures=read('public/member-features.js');
const sample=read('public/sample-data.js');
const backup=read('public/backup-engine.js');
const cloud=read('public/cloud-adapter.js');
const sw=read('public/sw.js');
const manifest=read('public/manifest.webmanifest');
const wrangler=read('wrangler.jsonc');

for(const file of ['public/index.html','public/styles.css','public/target-ui.css','public/reference-exact.css','public/liquid-menu.css','public/safari-shell.css','public/app.js','public/detail-features.js','public/member-features.js','public/data.js','public/sample-data.js','public/backup-engine.js','public/storage-engine.js','public/cloud-adapter.js','public/manifest.webmanifest','public/icon.svg','public/dongson-pattern.svg','public/reference-crest.webp','public/heritage-approved-full.webp','public/sw.js']) assert.ok(fs.existsSync(file),`missing ${file}`);
for(const retired of ['public/heritage-bg.svg','public/heritage-background.svg','public/heritage-background.webp','public/reference-polish.css','public/parchment-v4.css','public/final-polish.css','public/reference-hero.webp','public/reference-tree.webp','public/dongson-header.svg','public/tree-parchment.svg','public/hero-parchment.svg']) assert.ok(!fs.existsSync(retired),`retired visual layer must be deleted: ${retired}`);
assert.ok(!fs.existsSync('public/ui.js'),'legacy secondary UI runtime must be deleted');

for(const id of ['bottomNav','tree-view','familyTree','generationChips','members-view','events-view','documents-view','settings-view']) assert.ok(index.includes(`id="${id}"`),`missing #${id}`);
for(const view of ['overview','tree','members','events','documents','settings']) assert.ok(index.includes(`data-nav="${view}"`),`primary navigation missing ${view}`);
assert.ok(!index.includes('data-nav="more"'),'legacy Khác tab must be removed');
assert.ok(!index.includes('id="menuButton"'),'hamburger control must be removed');
assert.ok(!index.includes('id="drawer"'),'duplicate drawer navigation must be removed');
assert.ok(index.includes('class="heritage-bg-image" src="/heritage-approved-full.webp?v=4"'),'canonical full background image must be present directly in HTML');
assert.ok(index.includes('/detail-features.js?v=1'),'detail enhancement runtime must load');
assert.ok(index.includes('/member-features.js?v=1'),'member profile runtime must load');
assert.ok(index.includes('/sample-data.js?v=1'),'sample data runtime must load');
assert.ok(index.includes('/safari-shell.css?v=3'),'Safari shell stabilization must load before runtime');
assert.ok(index.includes('/liquid-menu.css?v=17'),'latest liquid menu stylesheet must load');
assert.ok(!index.includes('heritage-approved-top.webp')&&!index.includes('heritage-approved-cont.webp'),'split background must not render');

assert.ok(css.includes('.tree-connectors'),'SVG connector layer must be styled');
assert.ok(data.includes("/reference-exact.css?v=24"),'approved visual stylesheet must remain v24');
assert.ok(data.includes("img.src='/heritage-approved-full.webp?v=4'"),'runtime must keep approved background canonical');
assert.ok(!data.includes("window.addEventListener('scroll'"),'Safari toolbar scroll events must not auto-hide navigation');
assert.ok(data.includes("const scrollOffset=()=>scroller?.scrollTop||0"),'nav auto-hide must read the internal main scroller');
assert.ok(exact.includes('opacity:.10!important'),'heritage artwork must remain at ten percent visibility');
assert.ok(exact.includes('filter:none!important'),'approved artwork must not be image-blurred');
assert.ok(exact.includes('-webkit-backdrop-filter:blur(7px)'),'cards must retain Liquid Glass blur');
assert.ok(exact.includes('#tree-view .generation-title{position:relative!important;z-index:8!important'),'generation labels must sit above connectors');
assert.ok(fs.statSync('public/heritage-approved-full.webp').size>10000,'approved full heritage WebP asset looks invalid');

assert.ok(liquid.includes('--heritage-burgundy:#65080d'),'canonical burgundy token missing');
assert.ok(liquid.includes('.topbar{')&&liquid.includes('background:var(--heritage-burgundy)!important'),'top bar must use canonical burgundy');
assert.ok(liquid.includes('.bottom-nav{')&&liquid.includes('background:var(--heritage-burgundy-raised)!important'),'bottom nav must use canonical burgundy');
assert.ok(liquid.includes("url('/dongson-pattern.svg?v=2')"),'Dong Son motif v2 must render on app bars');
assert.ok(liquid.includes('.topbar::before')&&liquid.includes('.bottom-nav::after'),'both top and bottom bars must carry Dong Son motif layers');
assert.ok(liquid.includes('opacity:.58')&&liquid.includes('opacity:.46'),'Dong Son motif must remain visibly present on both bars');
assert.ok(liquid.includes('.topbar .top-copy{')&&liquid.includes('text-align:center!important'),'header title and motto must share a centered axis');
assert.ok(liquid.includes('.top-header-ornament>span{display:none!important}'),'header ornament must render diamond only');
assert.ok(liquid.includes('grid-template-columns:repeat(6,minmax(0,1fr))'),'bottom nav must use six equal tabs');
assert.ok(liquid.includes('@keyframes goldTabSweep')&&liquid.includes('animation:goldTabSweep .9s'),'selected tab must retain one-shot gold tracer');

assert.ok(safariShell.includes('overflow:hidden!important'),'root page must be scroll-locked');
assert.ok(safariShell.includes('height:100lvh!important'),'app shell must cover the stable large viewport');
assert.ok(safariShell.includes('overflow-y:auto!important'),'main must own vertical scrolling');
assert.ok(safariShell.includes('.view,.view.active'),'tab transitions must be optically stable');
assert.ok(safariShell.includes('animation:none!important'),'full-view fade must be disabled');
assert.ok(safariShell.includes("background-image:url('/dongson-pattern.svg?v=2')"),'outer shell must use Dong Son motif v2');

assert.ok(app.includes('function renderTree'),'family tree renderer missing');
assert.ok(app.includes('function drawConnectors'),'coordinate connector renderer missing');
assert.ok(app.includes('appConfirm'),'destructive actions must use shared confirm');
assert.ok(!app.includes('window.confirm('),'native window.confirm is forbidden');

assert.ok(detail.includes('function memberDetail('),'event-linked member detail viewer missing');
for(const field of ['Giới tính','Ngày sinh','Ngày mất','Vợ / chồng','Quê quán','Nghề nghiệp','Cha / mẹ','Con cháu trực tiếp','Sự kiện liên quan','Ghi chú']) assert.ok(detail.includes(field),`member detail missing ${field}`);
assert.ok(detail.includes('event.memberId'),'event-to-member linkage missing');
assert.ok(detail.includes('function documentDetail('),'document full detail viewer missing');
assert.ok(detail.includes('type="file" accept="image/*" multiple'),'document image picker must allow multiple images');
assert.ok(detail.includes('images.push(...added)'),'document editor must support repeated unlimited image additions');
assert.ok(detail.includes('data-remove-image'),'document image removal control missing');
assert.ok(detail.includes('function enrichSample('),'sample feature enrichment missing');
assert.ok(detail.includes('sample-doc-img-'),'sample documents must receive image fixtures');

assert.ok(memberFeatures.includes('function openMemberDetail('),'member tab must open full member detail');
assert.ok(memberFeatures.includes('memberImageInput'),'member editor must include image picker');
assert.ok(memberFeatures.includes('multiple'),'member editor must support multiple photos');
assert.ok(memberFeatures.includes('avatarPhotoId'),'member profile must support a selected avatar');
assert.ok(memberFeatures.includes('#memberSearch{padding-left:14px'),'member search field needs safe left padding');

assert.ok(sample.includes('SAMPLE_MEMBER_COUNT = 168'),'sample dataset must contain 168 members');
assert.ok(sample.includes('SAMPLE_GENERATION_COUNTS = [1,3,6,12,24,36,42,44]'),'sample dataset must cover eight generations');
assert.ok(sample.includes("type:'birthday'")&&sample.includes("type:'memorial'"),'sample birthdays and memorials missing');
assert.ok(sample.includes('memberId:member.id'),'sample personal events must link to members');
assert.ok(backup.includes('SAMPLE_DATA_KEY')&&backup.includes('WORKSPACE_KEY'),'sample data must remain isolated from main data');
assert.ok(backup.includes('snapshotCurrent'),'restore must snapshot current data');
assert.ok(cloud.includes('drive.appdata'),'Google Drive must use appDataFolder scope');
assert.ok(cloud.includes('resolveConflict'),'cloud conflicts must be explicit');

assert.ok(sw.includes("giaphaphamvan-v60"),'service worker cache version mismatch');
for(const asset of ['/target-ui.css?v=4','/reference-exact.css?v=24','/liquid-menu.css?v=17','/safari-shell.css?v=3','/detail-features.js?v=1','/member-features.js?v=1','/sample-data.js?v=1','/dongson-pattern.svg?v=2','/reference-crest.webp?v=2','/heritage-approved-full.webp?v=4','/data.js?v=9']) assert.ok(sw.includes(asset),`service worker missing ${asset}`);
assert.ok(!sw.includes('heritage-approved-top.webp')&&!sw.includes('heritage-approved-cont.webp'),'split backgrounds must not be precached');
assert.ok(sw.includes("cache:'no-store'"),'service worker must bypass stale HTTP cache');
assert.ok(wrangler.includes('"directory": "./public"'),'Wrangler must deploy ./public');
assert.ok(/"theme_color"\s*:\s*"#65080D"/i.test(manifest),'PWA theme must be canonical burgundy');

console.log('Giaphaphamvan centered header + visible Dong Son motif + member/document detail audit: PASS');
