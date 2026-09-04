#!/usr/bin/env node
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const baseUrl = 'http://127.0.0.1:4173/';
const outputRoot = '/Users/jiangpeihan/Documents/Codex/2026-09-01/1-do-anything-2-ui-3/work';

function monitor(page) {
  const issues = [];
  page.on('console', message => { if (message.type() === 'error') issues.push(`console: ${message.text()}`); });
  page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));
  page.on('requestfailed', request => issues.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`));
  return issues;
}

async function artState(page, sceneId) {
  return page.evaluate(sceneId => {
    const scene = document.getElementById(sceneId);
    const art = scene.querySelector(':scope > .scene-art-frame > .scene-art');
    const style = getComputedStyle(art);
    const box = art.getBoundingClientRect();
    return {
      src:art.getAttribute('src'),
      currentSrc:new URL(art.currentSrc).pathname,
      objectPosition:style.objectPosition,
      objectFit:style.objectFit,
      complete:art.complete,
      naturalSize:[art.naturalWidth, art.naturalHeight],
      box:[box.left, box.top, box.right, box.bottom],
      covers:box.left <= 0 && box.top <= 0 && box.right >= innerWidth && box.bottom >= innerHeight,
      sceneBackground:getComputedStyle(scene).backgroundImage
    };
  }, sceneId);
}

async function flow(browser, width, height) {
  const size = `${width}x${height}`;
  const context = await browser.newContext({ viewport:{ width, height }, hasTouch:true, isMobile:true, deviceScaleFactor:1 });
  const page = await context.newPage();
  const issues = monitor(page);
  await page.goto(`${baseUrl}?qa=mobile-framing-${size}`, { waitUntil:'load' });

  const opening = await artState(page, 'landing');
  const openingTitle = await page.locator('.landing-title').boundingBox();
  const openingText = await page.evaluate(() => {
    lineIndex = lines.length;
    charIndex = 0;
    typed = true;
    container.innerHTML = lines.slice(0, 5).join('<br>');
    const range = document.createRange();
    range.selectNodeContents(container);
    const box = range.getBoundingClientRect();
    return { x:box.x, y:box.y, width:box.width, height:box.height, right:box.right, bottom:box.bottom };
  });
  await page.screenshot({ path:`${outputRoot}/mobile-framing-${size}-opening.png` });

  await page.locator('#landing').tap();
  await page.waitForSelector('#compose.active');
  await page.locator('#compose .menu-item[data-choice="去"]').tap();
  await page.waitForSelector('#journey.active');
  await page.waitForFunction(() => document.getElementById('journeyBeat').innerText.includes('信箱留着'));
  await page.locator('#journey').tap();
  await page.waitForFunction(() => document.getElementById('journeyBeat').innerText.includes('门里的人'));
  await page.locator('#journey').tap();
  await page.waitForSelector('#weave.active');
  await page.locator('#weave .cinematic-choice[data-destination="water"]').tap();

  await page.waitForSelector('.river-paper-hit-target.is-enabled', { timeout:20000 });
  const farewell = await artState(page, 'act2');
  const paperTarget = await page.locator('.river-paper-hit-target').boundingBox();
  await page.locator('.river-paper-hit-target').tap();

  await page.waitForSelector('#pavilionArrival.active.is-visible', { timeout:7000 });
  const pavilion = await artState(page, 'pavilionArrival');
  await page.screenshot({ path:`${outputRoot}/mobile-framing-${size}-pavilion.png` });
  await page.waitForSelector('#pavilionReflectionHitTarget.is-enabled', { timeout:7000 });
  const fireflyTarget = await page.locator('#pavilionReflectionHitTarget').boundingBox();
  if (!fireflyTarget) throw new Error(`Missing firefly target at ${size}`);
  await page.touchscreen.tap(fireflyTarget.x + fireflyTarget.width / 2, fireflyTarget.y + fireflyTarget.height / 2);

  await page.waitForSelector('body.is-pavilion-ending', { timeout:15000 });
  await page.waitForSelector('#pavilionEndingTitle.is-visible', { timeout:5000 });
  await page.waitForTimeout(1500);
  const ending = await artState(page, 'pavilionArrival');
  const final = await page.evaluate(() => ({
    title:document.getElementById('pavilionEndingTitle').textContent.trim(),
    titleVisible:document.getElementById('pavilionEndingTitle').classList.contains('is-visible'),
    endingStill:document.getElementById('pavilionArrival').classList.contains('is-cinematic-ending-still'),
    animation:getComputedStyle(document.querySelector('#pavilionArrival > .scene-art-frame > .scene-art')).animationName,
    viewport:[innerWidth, innerHeight],
    body:[document.body.scrollWidth, document.body.scrollHeight]
  }));
  await page.screenshot({ path:`${outputRoot}/mobile-framing-${size}-ending.png` });

  const inViewport = box => box && box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height;
  const titleMovedInward = openingTitle
    && openingTitle.x + openingTitle.width <= width * 0.85
    && openingTitle.y + openingTitle.height <= height * 0.81;
  const openingTextSafe = openingText.x >= 24
    && openingText.right <= width
    && openingText.y >= height * 0.16
    && openingText.bottom < openingTitle.y;
  const pass = opening.currentSrc.endsWith('/assets/bg_warm_mobile.webp')
    && farewell.currentSrc.endsWith('/assets/bg_farewell_mobile.webp')
    && pavilion.currentSrc.endsWith('/assets/bg_pavilion_close_mobile.webp')
    && ending.currentSrc.endsWith('/assets/bg_pavilion_close_mobile.webp')
    && [opening, farewell, pavilion, ending].every(state => state.objectPosition === '50% 50%' && state.complete && state.naturalSize[0] > 0 && state.covers && state.sceneBackground === 'none')
    && titleMovedInward && openingTextSafe && inViewport(openingTitle) && inViewport(paperTarget) && inViewport(fireflyTarget)
    && final.title === '尺素入江' && final.titleVisible && final.endingStill && final.animation === 'none'
    && final.body[0] === width && final.body[1] === height
    && issues.length === 0;
  await context.close();
  return { size, pass, opening, farewell, pavilion, ending, openingText, openingTitle, paperTarget, fireflyTarget, final, issues };
}

async function desktopInvariant(browser) {
  const context = await browser.newContext({ viewport:{ width:1440, height:810 } });
  const page = await context.newPage();
  const issues = monitor(page);
  await page.goto(`${baseUrl}?qa=desktop-framing-invariant`, { waitUntil:'load' });
  const opening = await artState(page, 'landing');
  await page.evaluate(() => {
    document.getElementById('landing').classList.remove('active');
    document.getElementById('pavilionArrival').classList.add('active', 'is-visible');
  });
  const pavilion = await artState(page, 'pavilionArrival');
  const pass = opening.currentSrc.endsWith('/assets/bg_warm.webp')
    && pavilion.currentSrc.endsWith('/assets/bg_pavilion_close.webp')
    && opening.objectPosition === '50% 50%'
    && pavilion.objectPosition === '50% 50%'
    && issues.length === 0;
  await context.close();
  return { pass, opening:opening.objectPosition, pavilion:pavilion.objectPosition, issues };
}

const browser = await chromium.launch({ channel:'chrome', headless:true, args:['--autoplay-policy=no-user-gesture-required'] });
try {
  const results = await Promise.all([
    flow(browser, 360, 800),
    flow(browser, 375, 812),
    flow(browser, 390, 844),
    flow(browser, 430, 932)
  ]);
  const desktop = await desktopInvariant(browser);
  const report = { pass:results.every(result => result.pass) && desktop.pass, results, desktop };
  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) process.exitCode = 1;
} finally {
  await browser.close();
}
