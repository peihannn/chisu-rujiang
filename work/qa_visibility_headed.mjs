#!/usr/bin/env node
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({
  channel:'chrome',
  headless:true,
  args:['--autoplay-policy=no-user-gesture-required'],
  ignoreDefaultArgs:[
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding'
  ]
});
try {
  const context = await browser.newContext({ viewport:{ width:390, height:844 }, hasTouch:true, isMobile:true });
  const page = await context.newPage();
  const issues = [];
  page.on('console', message => { if (message.type() === 'error') issues.push(`console: ${message.text()}`); });
  page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));
  await page.goto('http://127.0.0.1:4173/?qa=visibility-headed', { waitUntil:'load' });
  await page.locator('#landing').tap();
  await page.waitForFunction(() => window.__CHISU_AUDIO_QA__.getState().decoded.length === 6);
  const before = await page.evaluate(() => ({ hidden:document.hidden, state:window.__CHISU_AUDIO_QA__.getState() }));
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable:true, value:true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForFunction(() => window.__CHISU_AUDIO_QA__.getState().contextState !== 'running', null, { timeout:10000 });
  const hidden = await page.evaluate(() => ({ hidden:document.hidden, state:window.__CHISU_AUDIO_QA__.getState() }));
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable:true, value:false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForFunction(() => document.hidden === false && window.__CHISU_AUDIO_QA__.getState().contextState === 'running', null, { timeout:10000 });
  const restored = await page.evaluate(() => ({ hidden:document.hidden, state:window.__CHISU_AUDIO_QA__.getState() }));
  console.log(JSON.stringify({ before, hidden, restored, issues }, null, 2));
} finally {
  await browser.close();
}
