#!/usr/bin/env node
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const baseUrl = 'http://127.0.0.1:4173/';
const outputRoot = '/Users/jiangpeihan/Documents/Codex/2026-09-01/1-do-anything-2-ui-3/work';

function watchRuntime(page) {
  const issues = [];
  page.on('console', message => {
    if (message.type() === 'error') issues.push(`console: ${message.text()}`);
  });
  page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));
  page.on('requestfailed', request => {
    issues.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`);
  });
  page.on('response', response => {
    if (response.status() >= 400) issues.push(`response ${response.status()}: ${response.url()}`);
  });
  return issues;
}

async function inspectState(page, size, order, label, sceneId, expectedAsset) {
  const result = await page.evaluate(({ sceneId, expectedAsset }) => {
    const scene = document.getElementById(sceneId);
    const image = scene && scene.querySelector(':scope > .scene-art');
    if (!scene || !image) return { pass:false, reason:'missing scene or scene-art' };
    const sceneStyle = getComputedStyle(scene);
    const imageStyle = getComputedStyle(image);
    const imageBox = image.getBoundingClientRect();
    const afterStyle = getComputedStyle(scene, '::after');
    const src = image.getAttribute('src') || '';
    const pass = image.tagName === 'IMG'
      && src === expectedAsset
      && image.complete
      && image.naturalWidth > 0
      && image.naturalHeight > 0
      && imageStyle.display !== 'none'
      && imageStyle.visibility !== 'hidden'
      && Number(imageStyle.opacity) > 0
      && imageStyle.objectFit === 'cover'
      && imageBox.width >= innerWidth
      && imageBox.height >= innerHeight
      && imageBox.left <= 0
      && imageBox.top <= 0
      && imageBox.right >= innerWidth
      && imageBox.bottom >= innerHeight
      && sceneStyle.backgroundImage === 'none'
      && scene.classList.contains('active');
    return {
      pass,
      activeScene:document.querySelector('.scene.active')?.id || null,
      sceneId,
      tag:image.tagName,
      src,
      currentSrc:image.currentSrc,
      complete:image.complete,
      naturalSize:[image.naturalWidth, image.naturalHeight],
      renderedBox:[Math.round(imageBox.width), Math.round(imageBox.height)],
      objectFit:imageStyle.objectFit,
      objectPosition:imageStyle.objectPosition,
      display:imageStyle.display,
      visibility:imageStyle.visibility,
      opacity:imageStyle.opacity,
      animationName:imageStyle.animationName,
      sceneBackgroundImage:sceneStyle.backgroundImage,
      sceneBackgroundColor:sceneStyle.backgroundColor,
      overlayBackground:afterStyle.backgroundImage || afterStyle.backgroundColor,
      overlayOpacity:afterStyle.opacity,
      viewport:[innerWidth, innerHeight]
    };
  }, { sceneId, expectedAsset });
  await page.screenshot({ path:`${outputRoot}/p0-bg-${size}-${String(order).padStart(2, '0')}-${label}.png` });
  return { label, ...result };
}

async function runFlow(browser, width, height) {
  const size = `${width}x${height}`;
  const context = await browser.newContext({ viewport:{ width, height }, hasTouch:true, isMobile:true, deviceScaleFactor:1 });
  const page = await context.newPage();
  const issues = watchRuntime(page);
  const states = [];

  await page.goto(`${baseUrl}?qa=p0-background-${size}`, { waitUntil:'load' });
  states.push(await inspectState(page, size, 1, 'opening', 'landing', './assets/bg_warm.webp'));

  await page.evaluate(() => { typed = true; });
  await page.locator('#landing').tap();
  await page.waitForSelector('#compose.active');
  states.push(await inspectState(page, size, 2, 'topic-selection', 'compose', './assets/bg_warm.webp'));

  await page.locator('#compose .menu-item[data-choice="去"]').tap();
  await page.waitForSelector('#journey.active');
  await page.waitForFunction(() => document.getElementById('journeyBeat').innerText.includes('信箱留着'));
  states.push(await inspectState(page, size, 3, 'journey-narrative', 'journey', './assets/bg_warm.webp'));
  await page.locator('#journey').tap();
  await page.waitForFunction(() => document.getElementById('journeyBeat').innerText.includes('门里的人'));
  await page.locator('#journey').tap();
  await page.waitForSelector('#weave.active');

  await page.locator('#weave .cinematic-choice[data-destination="water"]').tap();
  await page.waitForSelector('#act2.active.is-visible', { timeout:6000 });
  states.push(await inspectState(page, size, 4, 'farewell-wide', 'act2', './assets/bg_farewell.webp'));
  await page.waitForFunction(() => document.getElementById('act2Narrative').innerText.includes('江水替你'), null, { timeout:5000 });
  states.push(await inspectState(page, size, 5, 'boatman-dialogue', 'act2', './assets/bg_farewell.webp'));

  await page.waitForSelector('.river-paper-hit-target.is-enabled', { timeout:12000 });
  states.push(await inspectState(page, size, 6, 'paper-interaction', 'act2', './assets/bg_farewell.webp'));
  await page.locator('.river-paper-hit-target').tap();

  await page.waitForSelector('#pavilionArrival.active.is-visible', { timeout:7000 });
  states.push(await inspectState(page, size, 7, 'pavilion-arrival', 'pavilionArrival', './assets/bg_pavilion_close.webp'));
  await page.waitForSelector('#pavilionReflectionHitTarget.is-enabled', { timeout:7000 });
  states.push(await inspectState(page, size, 8, 'firefly-interaction', 'pavilionArrival', './assets/bg_pavilion_close.webp'));
  const firefly = await page.locator('#pavilionReflectionHitTarget').boundingBox();
  if (!firefly) throw new Error(`Missing firefly target at ${size}`);
  await page.touchscreen.tap(firefly.x + firefly.width / 2, firefly.y + firefly.height / 2);
  await page.waitForFunction(() => document.getElementById('pavilionNarrative').innerText.includes('亭里的杯盏轻轻一响'), null, { timeout:7000 });
  states.push(await inspectState(page, size, 9, 'pavilion-narrative', 'pavilionArrival', './assets/bg_pavilion_close.webp'));

  await page.waitForSelector('body.is-pavilion-ending', { timeout:12000 });
  await page.waitForSelector('#pavilionEndingTitle.is-visible', { timeout:5000 });
  await page.waitForTimeout(1500);
  states.push(await inspectState(page, size, 10, 'final-ending', 'pavilionArrival', './assets/bg_pavilion_close.webp'));

  const final = await page.evaluate(() => ({
    titleVisible:document.getElementById('pavilionEndingTitle').classList.contains('is-visible'),
    titleText:document.getElementById('pavilionEndingTitle').textContent.trim(),
    sealReferences:document.querySelectorAll('[id*="seal" i], [class*="seal" i]').length,
    body:[document.body.scrollWidth, document.body.scrollHeight]
  }));
  const result = {
    size,
    pass:states.length === 10 && states.every(state => state.pass) && issues.length === 0
      && final.titleVisible && final.titleText === '尺素入江' && final.sealReferences === 0
      && final.body[0] === width && final.body[1] === height,
    states,
    final,
    issues
  };
  await context.close();
  return result;
}

const browser = await chromium.launch({ channel:'chrome', headless:true, args:['--autoplay-policy=no-user-gesture-required'] });
try {
  const results = await Promise.all([
    runFlow(browser, 390, 844),
    runFlow(browser, 430, 932)
  ]);
  console.log(JSON.stringify({ pass:results.every(result => result.pass), results }, null, 2));
  if (!results.every(result => result.pass)) process.exitCode = 1;
} finally {
  await browser.close();
}
