#!/usr/bin/env node
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const fileUrl = 'file:///Users/jiangpeihan/Documents/Codex/2026-09-01/1-do-anything-2-ui-3/xhs-dist/index.html';

const browser = await chromium.launch({ channel:'chrome', headless:true, args:['--autoplay-policy=no-user-gesture-required'] });
try {
  const context = await browser.newContext({ viewport:{ width:390, height:844 }, hasTouch:true, isMobile:true });
  const page = await context.newPage();
  const issues = [];
  page.on('console', message => { if (message.type() === 'error') issues.push(`console: ${message.text()}`); });
  page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));
  page.on('requestfailed', request => issues.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`));
  await page.addInitScript(() => {
    window.__offlineAudioProbe = { decodes:0, starts:0 };
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const decode = Context.prototype.decodeAudioData;
    Context.prototype.decodeAudioData = function(...args) {
      window.__offlineAudioProbe.decodes += 1;
      return decode.apply(this, args);
    };
    const createBufferSource = Context.prototype.createBufferSource;
    Context.prototype.createBufferSource = function(...args) {
      const source = createBufferSource.apply(this, args);
      const start = source.start;
      source.start = function(...startArgs) {
        window.__offlineAudioProbe.starts += 1;
        return start.apply(this, startArgs);
      };
      return source;
    };
  });
  await page.goto(fileUrl, { waitUntil:'load' });
  await page.evaluate(() => { typed = true; });
  await page.locator('#landing').tap();
  await page.waitForSelector('#compose.active');
  await page.waitForFunction(() => window.__offlineAudioProbe.decodes >= 6, null, { timeout:10000 });
  const result = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('.scene > .scene-art')).map(image => ({
      src:image.getAttribute('src'),
      currentSrc:image.currentSrc,
      complete:image.complete,
      naturalSize:[image.naturalWidth, image.naturalHeight]
    }));
    return {
      active:document.querySelector('.scene.active')?.id || null,
      images,
      audio:window.__offlineAudioProbe,
      scripts:Array.from(document.scripts).map(script => script.getAttribute('src')),
      viewport:[innerWidth, innerHeight],
      body:[document.body.scrollWidth, document.body.scrollHeight]
    };
  });
  result.issues = issues;
  result.pass = result.active === 'compose'
    && result.images.length === 6
    && result.images.every(image => image.complete && image.naturalSize[0] > 0 && image.naturalSize[1] > 0)
    && result.audio.decodes >= 6
    && result.audio.starts >= 1
    && result.scripts.join(',') === './audio-data.js,./app.js'
    && result.body[0] === 390 && result.body[1] === 844
    && issues.length === 0;
  console.log(JSON.stringify(result, null, 2));
  if (!result.pass) process.exitCode = 1;
  await context.close();
} finally {
  await browser.close();
}
