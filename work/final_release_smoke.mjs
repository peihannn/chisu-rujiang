#!/usr/bin/env node
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel:'chrome', headless:true, args:['--autoplay-policy=no-user-gesture-required'] });
try {
  const context = await browser.newContext({ viewport:{ width:390, height:844 }, hasTouch:true, isMobile:true });
  const page = await context.newPage();
  const issues = [];
  page.on('console', message => { if (message.type() === 'error') issues.push(`console: ${message.text()}`); });
  page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));
  page.on('requestfailed', request => issues.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`));
  await page.goto('file:///Users/jiangpeihan/Documents/Codex/2026-09-01/1-do-anything-2-ui-3/xhs-dist/index.html', { waitUntil:'load' });
  await page.locator('#landing').tap();
  await page.waitForFunction(() => AudioController.getState().decoded.length === 6, null, { timeout:10000 });
  const result = await page.evaluate(() => ({
    ready:document.readyState,
    active:document.querySelector('.scene.active').id,
    audio:AudioController.getState(),
    packagedScripts:Array.from(document.scripts).map(script => script.getAttribute('src')),
    qaProbePackaged:typeof window.__CHISU_AUDIO_QA__ !== 'undefined',
    viewport:[innerWidth, innerHeight],
    body:[document.body.scrollWidth, document.body.scrollHeight]
  }));
  result.issues = issues;
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
