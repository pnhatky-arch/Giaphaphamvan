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
await page.waitForTimeout(350);
const metrics=await page.evaluate(()=>({
  cards:document.querySelectorAll('#familyTree .person-card').length,
  generations:document.querySelectorAll('#familyTree .generation-column').length,
  chips:document.querySelectorAll('#generationChips .generation-chip').length,
  connectors:document.querySelectorAll('.tree-connectors line').length,
  heroHeight:document.querySelector('.tree-hero')?.getBoundingClientRect().height||0,
  controlHeight:document.querySelector('.tree-controls')?.getBoundingClientRect().height||0,
  treeHeight:document.querySelector('.tree-stage')?.getBoundingClientRect().height||0,
  navHeight:document.querySelector('#bottomNav')?.getBoundingClientRect().height||0,
  appWidth:document.querySelector('#appShell')?.getBoundingClientRect().width||0,
  viewport:window.innerWidth,
  visibleTree:!document.querySelector('#tree-view')?.hidden
}));
assert.equal(metrics.visibleTree,true,'tree view must be visible by default');
assert.equal(metrics.appWidth,metrics.viewport,'app must fill the mobile viewport');
assert.ok(metrics.cards>=10,`expected at least 10 visible family cards, got ${metrics.cards}`);
assert.ok(metrics.generations>=4,`expected at least four generations, got ${metrics.generations}`);
assert.ok(metrics.chips>=5,`expected generation chips, got ${metrics.chips}`);
assert.ok(metrics.connectors>=6,`expected SVG family connectors, got ${metrics.connectors}`);
assert.ok(metrics.heroHeight>=115&&metrics.heroHeight<=165,`hero geometry out of range: ${metrics.heroHeight}`);
assert.ok(metrics.controlHeight>=75&&metrics.controlHeight<=115,`control geometry out of range: ${metrics.controlHeight}`);
assert.ok(metrics.treeHeight>=260,`tree stage too short: ${metrics.treeHeight}`);
assert.ok(metrics.navHeight>=55&&metrics.navHeight<=95,`bottom nav geometry out of range: ${metrics.navHeight}`);
assert.deepEqual(errors,[],`browser console errors: ${errors.join('\n')}`);
await page.screenshot({path:'artifacts/mobile-reference.png',fullPage:true});
fs.writeFileSync('artifacts/metrics.json',JSON.stringify(metrics,null,2));
console.log(JSON.stringify(metrics));
await browser.close();
