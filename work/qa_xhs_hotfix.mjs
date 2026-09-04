#!/usr/bin/env node
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const baseUrl = 'http://127.0.0.1:4173/';
const fileUrl = 'file:///Users/jiangpeihan/Documents/Codex/2026-09-01/1-do-anything-2-ui-3/xhs-dist/index.html';

function monitor(page) {
  const issues = [];
  page.on('console', message => {
    if (message.type() === 'error') issues.push(`console: ${message.text()}`);
  });
  page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));
  page.on('requestfailed', request => issues.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`));
  page.on('response', response => {
    if (response.status() >= 400) issues.push(`response ${response.status()}: ${response.url()}`);
  });
  return issues;
}

async function state(page) {
  return page.evaluate(() => window.__CHISU_AUDIO_QA__.getState());
}

async function viewportSnapshot(page) {
  return page.evaluate(() => {
    const visible = element => {
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0;
    };
    const outOfBounds = Array.from(document.querySelectorAll('button, .menu-item, .scene.active [aria-label]'))
      .filter(visible)
      .map(element => {
        const box = element.getBoundingClientRect();
        return { id:element.id || element.className || element.tagName, left:box.left, top:box.top, right:box.right, bottom:box.bottom };
      })
      .filter(box => box.right < 0 || box.bottom < 0 || box.left > innerWidth || box.top > innerHeight);
    return {
      viewport:[innerWidth, innerHeight],
      body:[document.body.scrollWidth, document.body.scrollHeight],
      outOfBounds
    };
  });
}

async function fullTouchFlow(browser, width, height) {
  const context = await browser.newContext({ viewport:{ width, height }, hasTouch:true, isMobile:true, deviceScaleFactor:1 });
  const page = await context.newPage();
  const issues = monitor(page);
  await page.goto(`${baseUrl}?qa=touch-${width}x${height}`, { waitUntil:'load' });
  await page.locator('#landing').tap();
  await page.waitForFunction(() => window.__CHISU_AUDIO_QA__.getState().decoded.length === 6, null, { timeout:10000 });
  const unlock = await state(page);
  await page.waitForSelector('.landing-hint.is-visible', { timeout:22000 });
  await page.locator('#landing').tap();
  await page.waitForSelector('#compose.active');
  const composeLayout = await viewportSnapshot(page);
  await page.locator('#compose .menu-item[data-choice="去"]').tap();
  await page.waitForSelector('#journey.active');
  await page.waitForFunction(() => document.getElementById('journeyBeat').innerText.includes('信箱留着'));
  const firstBeat = (await page.locator('#journeyBeat').innerText()).trim();
  await page.locator('#journey').tap();
  await page.waitForFunction(() => document.querySelector('#journeyBeat').innerText.includes('门里的人'));
  const secondBeat = (await page.locator('#journeyBeat').innerText()).trim();
  await page.locator('#journey').tap();
  await page.waitForSelector('#weave.active');
  const weaveLayout = await viewportSnapshot(page);
  await page.locator('#weave .cinematic-choice[data-destination="water"]').tap();
  await page.waitForSelector('.river-paper-hit-target.is-enabled', { timeout:20000 });
  const boat = await state(page);
  await page.locator('.river-paper-hit-target').tap();
  await page.waitForFunction(() => window.__CHISU_AUDIO_QA__.getState().playCounts.paper === 1, null, { timeout:5000 });
  const paper = await state(page);
  await page.waitForSelector('#pavilionReflectionHitTarget.is-enabled', { timeout:18000 });
  const pavilionLayout = await viewportSnapshot(page);
  const fireflyBox = await page.locator('#pavilionReflectionHitTarget').boundingBox();
  if (!fireflyBox) throw new Error(`Missing firefly touch box at ${width}x${height}`);
  await page.touchscreen.tap(fireflyBox.x + fireflyBox.width / 2, fireflyBox.y + fireflyBox.height / 2);
  await page.waitForFunction(() => {
    const counts = window.__CHISU_AUDIO_QA__.getState().playCounts;
    return counts.firefly === 1 && counts.cup === 1;
  }, null, { timeout:7000 });
  const cues = await state(page);
  await page.waitForFunction(() => window.__CHISU_AUDIO_QA__.getState().currentScene === 'ending', null, { timeout:16000 });
  await page.waitForSelector('#pavilionEndingTitle.is-visible', { timeout:5000 });
  await page.waitForSelector('#pavilionEndingSeal.is-visible', { timeout:5000 });
  const ending = await page.evaluate(() => ({
    state:window.__CHISU_AUDIO_QA__.getState(),
    titleVisible:document.getElementById('pavilionEndingTitle').classList.contains('is-visible'),
    sealVisible:document.getElementById('pavilionEndingSeal').classList.contains('is-visible'),
    narrative:document.getElementById('pavilionNarrative').innerText
  }));
  const result = { size:`${width}x${height}`, unlock, firstBeat, secondBeat, boat, paper, cues, ending, composeLayout, weaveLayout, pavilionLayout, issues };
  await context.close();
  return result;
}

async function smokeViewport(browser, width, height) {
  const mobile = width < 800;
  const context = await browser.newContext({ viewport:{ width, height }, hasTouch:mobile, isMobile:mobile });
  const page = await context.newPage();
  const issues = monitor(page);
  await page.goto(`${baseUrl}?qa=smoke-${width}x${height}`, { waitUntil:'load' });
  await page.evaluate(() => { typed = true; });
  if (mobile) await page.locator('#landing').tap();
  else await page.locator('#landing').click();
  await page.waitForSelector('#compose.active');
  const layout = await viewportSnapshot(page);
  const result = { size:`${width}x${height}`, active:await page.locator('.scene.active').getAttribute('id'), layout, issues };
  await context.close();
  return result;
}

async function originChoice(browser, choice, expected) {
  const context = await browser.newContext({ viewport:{ width:390, height:844 }, hasTouch:true, isMobile:true });
  const page = await context.newPage();
  const issues = monitor(page);
  await page.goto(`${baseUrl}?qa=origin-${encodeURIComponent(choice)}`, { waitUntil:'load' });
  await page.evaluate(() => { typed = true; });
  await page.locator('#landing').tap();
  await page.waitForSelector('#compose.active');
  await page.locator(`#compose .menu-item[data-choice="${choice}"]`).tap();
  await page.waitForSelector('#journey.active');
  await page.waitForFunction(text => document.getElementById('journeyBeat').innerText.includes(text), expected);
  const text = (await page.locator('#journeyBeat').innerText()).trim();
  const result = { choice, text, matched:text.includes(expected), issues };
  await context.close();
  return result;
}

async function reducedMotion(browser) {
  const context = await browser.newContext({ viewport:{ width:390, height:844 }, hasTouch:true, isMobile:true, reducedMotion:'reduce' });
  const page = await context.newPage();
  const issues = monitor(page);
  await page.goto(`${baseUrl}?qa=reduced-motion`, { waitUntil:'load' });
  await page.evaluate(() => { typed = true; });
  await page.locator('#landing').tap();
  await page.waitForSelector('#compose.active');
  const result = await page.evaluate(() => ({
    reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
    active:document.querySelector('.scene.active').id,
    sceneBeforeAnimation:getComputedStyle(document.querySelector('.scene.active'), '::before').animationName
  }));
  result.issues = issues;
  await context.close();
  return result;
}

async function visibilityAndRestart(browser) {
  const context = await browser.newContext({ viewport:{ width:390, height:844 }, hasTouch:true, isMobile:true });
  const page = await context.newPage();
  const issues = monitor(page);
  await page.goto(`${baseUrl}?qa=visibility-restart`, { waitUntil:'load' });
  await page.locator('#landing').tap();
  await page.waitForFunction(() => window.__CHISU_AUDIO_QA__.getState().decoded.length === 6);
  const before = await state(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Page.setWebLifecycleState', { state:'frozen' });
  await new Promise(resolve => setTimeout(resolve, 700));
  const hidden = await page.evaluate(() => ({ hidden:document.hidden, state:window.__CHISU_AUDIO_QA__.getState() }));
  await cdp.send('Page.setWebLifecycleState', { state:'active' });
  await page.waitForFunction(() => document.hidden === false && window.__CHISU_AUDIO_QA__.getState().contextState === 'running', null, { timeout:10000 });
  const restored = await state(page);
  const restart = await page.evaluate(async () => {
    window.__CHISU_AUDIO_QA__.resetRun();
    window.__CHISU_AUDIO_QA__.resetRun();
    await new Promise(resolve => setTimeout(resolve, 800));
    const firstBoat = window.__CHISU_AUDIO_QA__.playOneShot('boat');
    const secondBoat = window.__CHISU_AUDIO_QA__.playOneShot('boat');
    await new Promise(resolve => setTimeout(resolve, 80));
    return { firstBoat, secondBoat, state:window.__CHISU_AUDIO_QA__.getState() };
  });
  const result = { before, hidden, restored, restart, issues };
  await context.close();
  return result;
}

async function silentFailure(browser) {
  const context = await browser.newContext({ viewport:{ width:390, height:844 }, hasTouch:true, isMobile:true });
  const page = await context.newPage();
  const issues = monitor(page);
  await page.route('**/audio-data.js', route => route.fulfill({ status:200, contentType:'text/javascript', body:'window.CHISU_AUDIO_DATA=Object.freeze({codec:"audio/mpeg",river:"!",bamboo:"!",boat:"!",paper:"!",firefly:"!",cup:"!"});' }));
  await page.goto(`${baseUrl}?qa=silent-failure`, { waitUntil:'load' });
  await page.evaluate(() => { typed = true; });
  await page.locator('#landing').tap();
  await page.waitForTimeout(1200);
  const stateAfter = await state(page);
  const active = await page.locator('.scene.active').getAttribute('id');
  const result = { state:stateAfter, active, issues };
  await context.close();
  return result;
}

async function offlineFile(browser) {
  const context = await browser.newContext({ viewport:{ width:390, height:844 }, hasTouch:true, isMobile:true });
  const page = await context.newPage();
  const issues = monitor(page);
  await page.goto(fileUrl, { waitUntil:'load' });
  await page.evaluate(() => { typed = true; });
  await page.locator('#landing').tap();
  await page.waitForSelector('#compose.active');
  const result = { url:page.url(), active:await page.locator('.scene.active').getAttribute('id'), issues };
  await context.close();
  return result;
}

const browser = await chromium.launch({ channel:'chrome', headless:true, args:['--autoplay-policy=no-user-gesture-required'] });
try {
  const touchFlows = await Promise.all([
    fullTouchFlow(browser, 390, 844),
    fullTouchFlow(browser, 430, 932)
  ]);
  const origins = await Promise.all([
    originChoice(browser, '去', '信箱留着'),
    originChoice(browser, '做', '桌上摆着'),
    originChoice(browser, '说', '聊天框停在'),
    originChoice(browser, '放', '纸箱上压着'),
    originChoice(browser, '写', '信纸旁压着')
  ]);
  const smoke = await Promise.all([
    smokeViewport(browser, 360, 800),
    smokeViewport(browser, 375, 812),
    smokeViewport(browser, 1440, 810),
    smokeViewport(browser, 1920, 1080)
  ]);
  const extras = await Promise.all([
    reducedMotion(browser),
    visibilityAndRestart(browser),
    silentFailure(browser),
    offlineFile(browser)
  ]);
  const report = { touchFlows, origins, smoke, reducedMotion:extras[0], visibilityAndRestart:extras[1], silentFailure:extras[2], offlineFile:extras[3] };
  if (process.env.QA_SUMMARY === '1') {
    console.log(JSON.stringify({
      touchFlows:touchFlows.map(result => ({
        size:result.size,
        decoded:result.unlock.decoded.sort(),
        decodeFailures:result.unlock.decodeFailures,
        firstBeat:result.firstBeat,
        secondBeat:result.secondBeat,
        playCounts:result.ending.state.playCounts,
        ending:[result.ending.titleVisible, result.ending.sealVisible],
        layouts:[result.composeLayout, result.weaveLayout, result.pavilionLayout].map(layout => ({viewport:layout.viewport, body:layout.body, outOfBounds:layout.outOfBounds.length})),
        issues:result.issues
      })),
      origins:origins.map(result => ({choice:result.choice, matched:result.matched, issues:result.issues})),
      smoke:smoke.map(result => ({size:result.size, active:result.active, viewport:result.layout.viewport, body:result.layout.body, outOfBounds:result.layout.outOfBounds.length, issues:result.issues})),
      reducedMotion:extras[0],
      visibilityAndRestart:{hidden:extras[1].hidden.hidden, restart:extras[1].restart, issues:extras[1].issues},
      silentFailure:extras[2],
      offlineFile:extras[3]
    }, null, 2));
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
} finally {
  await browser.close();
}
