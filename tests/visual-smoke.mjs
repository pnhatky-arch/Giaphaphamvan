import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
await page.waitForSelector('#familyTree .person-card',{timeout:10000});
await page.waitForTimeout(500);
const metrics=await page.evaluate(()=>{
  const tree=document.querySelector('.tree-stage')?.getBoundingClientRect();
  const nav=document.querySelector('#bottomNav')?.getBoundingClientRect();
  return {
    cards:document.querySelectorAll('#familyTree .person-card').length,
    generations:document.querySelectorAll('#familyTree .generation-column').length,
    chips:document.querySelectorAll('#generationChips .generation-chip').length,
    connectors:document.querySelectorAll('.tree-connectors line').length,
    headerHeight:document.querySelector('#topbar')?.getBoundingClientRect().height||0,
    heroHeight:document.querySelector('.tree-hero')?.getBoundingClientRect().height||0,
    controlHeight:document.querySelector('.tree-controls')?.getBoundingClientRect().height||0,
    treeHeight:tree?.height||0,
    treeBottom:tree?.bottom||0,
    navHeight:nav?.height||0,
    navTop:nav?.top||0,
    appWidth:document.querySelector('#appShell')?.getBoundingClientRect().width||0,
    viewport:window.innerWidth,
    visibleTree:!document.querySelector('#tree-view')?.hidden
  };
});
fs.writeFileSync('artifacts/metrics.json',JSON.stringify(metrics,null,2));
await page.screenshot({path:'artifacts/mobile-reference.png',fullPage:true});
assert.equal(metrics.visibleTree,true,'tree view must be visible by default');
assert.equal(metrics.appWidth,metrics.viewport,'app must fill the mobile viewport');
assert.ok(metrics.cards>=10,`expected at least 10 visible family cards, got ${metrics.cards}`);
assert.ok(metrics.generations>=4,`expected at least four generations, got ${metrics.generations}`);
assert.ok(metrics.chips>=5,`expected generation chips, got ${metrics.chips}`);
assert.ok(metrics.connectors>=6,`expected SVG family connectors, got ${metrics.connectors}`);
assert.ok(metrics.headerHeight>=54&&metrics.headerHeight<=60,`header geometry out of range: ${metrics.headerHeight}`);
assert.ok(metrics.heroHeight>=126&&metrics.heroHeight<=134,`hero geometry out of range: ${metrics.heroHeight}`);
assert.ok(metrics.controlHeight>=75&&metrics.controlHeight<=82,`control geometry out of range: ${metrics.controlHeight}`);
assert.ok(metrics.treeHeight>=320&&metrics.treeHeight<=490,`adaptive tree geometry out of range: ${metrics.treeHeight}`);
assert.ok(metrics.navHeight>=67&&metrics.navHeight<=73,`bottom nav geometry out of range: ${metrics.navHeight}`);
const canvasGap=metrics.navTop-metrics.treeBottom;
assert.ok(canvasGap>=0&&canvasGap<=12,`parchment canvas should meet bottom nav, gap: ${canvasGap}`);

/* Overview regression: this is the screen users see most often on iPhone. */
await page.click('#bottomNav [data-nav="overview"]');
await page.waitForSelector('#overview-view:not([hidden])',{timeout:5000});
await page.waitForTimeout(300);
const overview=await page.evaluate(()=>{
  const view=document.querySelector('#overview-view');
  const source=document.querySelector('#overview-view .source-status')?.getBoundingClientRect();
  const nav=document.querySelector('#bottomNav')?.getBoundingClientRect();
  const quick=[...document.querySelectorAll('#overview-view .quick-card')];
  const stats=[...document.querySelectorAll('#overview-view .stat-card')];
  const active=document.querySelector('#bottomNav [data-nav="overview"].active');
  const viewRect=view?.getBoundingClientRect();
  return {
    visible:!!view&&!view.hidden,
    stats:stats.length,
    quick:quick.length,
    sourceHeight:source?.height||0,
    viewHeight:viewRect?.height||0,
    navHeight:nav?.height||0,
    overviewActive:!!active,
    bodyWidth:document.body.getBoundingClientRect().width,
    scrollWidth:document.documentElement.scrollWidth,
    viewport:window.innerWidth
  };
});
fs.writeFileSync('artifacts/overview-metrics.json',JSON.stringify(overview,null,2));
await page.screenshot({path:'artifacts/mobile-overview.png',fullPage:true});
assert.equal(overview.visible,true,'overview must open from bottom navigation');
assert.equal(overview.stats,4,'overview must contain four statistic cards');
assert.equal(overview.quick,4,'overview must contain four quick-access cards');
assert.ok(overview.sourceHeight>=55&&overview.sourceHeight<=75,`source card geometry out of range: ${overview.sourceHeight}`);
assert.equal(overview.overviewActive,true,'overview navigation pill must be active');
assert.equal(overview.bodyWidth,overview.viewport,'overview must fill viewport width');
assert.equal(overview.scrollWidth,overview.viewport,'overview must not overflow horizontally');
assert.ok(overview.navHeight>=67&&overview.navHeight<=73,`overview bottom nav geometry out of range: ${overview.navHeight}`);

assert.deepEqual(errors,[],`browser console errors: ${errors.join('\n')}`);
console.log(JSON.stringify({tree:metrics,overview}));
await browser.close();
