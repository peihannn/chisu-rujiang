#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const distRoot = path.join(projectRoot, 'xhs-dist');
const htmlPath = path.join(distRoot, 'index.html');
const appPath = path.join(distRoot, 'app.js');

let html = fs.readFileSync(htmlPath, 'utf8');
const inlineScript = /  <script>\n([\s\S]*?)\n  <\/script>\n<\/body>/;
const match = html.match(inlineScript);

if (!match) {
  throw new Error('Expected exactly one final inline application script in xhs-dist/index.html');
}

let app = `${match[1]}\n`;

const exactReplacements = new Map([
  ['const encoded = window.CHISU_AUDIO_DATA?.[name];', "const encoded = window.CHISU_AUDIO_DATA && window.CHISU_AUDIO_DATA[name];"],
  ["if (!audioContext || !buffer || !tracks[name]?.loop) return null;", "if (!audioContext || !buffer || !tracks[name] || !tracks[name].loop) return null;"],
  ['const requested = { river:targets.river ?? 0, bamboo:targets.bamboo ?? 0 };', "const requested = { river:targets.river == null ? 0 : targets.river, bamboo:targets.bamboo == null ? 0 : targets.bamboo };"],
  ['if (played >= (config.max ?? 1)) return false;', 'if (played >= (config.max == null ? 1 : config.max)) return false;'],
  ["try { void context?.suspend().catch(() => false); } catch (_) { /* Silent fallback. */ }", "try {\n            if (context && typeof context.suspend === 'function') {\n              const suspended = context.suspend();\n              if (suspended && typeof suspended.catch === 'function') void suspended.catch(() => false);\n            }\n          } catch (_) { /* Silent fallback. */ }"],
  ["contextState:context?.state || 'unavailable',", "contextState:(context && context.state) || 'unavailable',"],
  ['decoded:[...buffers.keys()],', 'decoded:Array.from(buffers.keys()),'],
  ['decodeFailures:[...decodeFailures],', 'decodeFailures:Array.from(decodeFailures),'],
  ['playCounts:Object.fromEntries(playCounts),', 'playCounts:mapToObject(playCounts),'],
  ["ambience:Object.fromEntries([...ambience].map(([name, record]) => [name, {\n            active:true,\n            gain:Number(record.gainNode.gain.value.toFixed(3))\n          }]))", "ambience:mapToObject(ambience, record => ({\n            active:true,\n            gain:Number(record.gainNode.gain.value.toFixed(3))\n          }))"],
  ['callback?.();', "if (typeof callback === 'function') callback();"],
  ['riverPaperResizeObserver?.disconnect();', 'if (riverPaperResizeObserver) riverPaperResizeObserver.disconnect();'],
  ['riverPaperLayer?.remove();', 'removeElement(riverPaperLayer);'],
  ['riverPaperHitTarget?.remove();', 'removeElement(riverPaperHitTarget);'],
  ["riverPaperHitTarget?.classList.remove('is-enabled');", "if (riverPaperHitTarget) riverPaperHitTarget.classList.remove('is-enabled');"],
  ["riverPaperHitTarget?.setAttribute('aria-disabled', 'true');", "if (riverPaperHitTarget) riverPaperHitTarget.setAttribute('aria-disabled', 'true');"],
  ['journeyBeat.replaceChildren();', 'clearElement(journeyBeat);'],
  ['journeyBeat.append(column);', 'journeyBeat.appendChild(column);'],
  ['act2Narrative.replaceChildren();', 'clearElement(act2Narrative);'],
  ['act2Narrative.append(column);', 'act2Narrative.appendChild(column);'],
  ['act2Scene.append(layer);', 'act2Scene.appendChild(layer);'],
  ['act2Scene.append(hitTarget);', 'act2Scene.appendChild(hitTarget);'],
  ['pavilionNarrative.replaceChildren();', 'clearElement(pavilionNarrative);'],
  ['pavilionNarrative.append(column);', 'pavilionNarrative.appendChild(column);'],
  ['pavilionReflectionHint.replaceChildren();', 'clearElement(pavilionReflectionHint);'],
  ['pavilionReflectionHint.replaceChildren()', 'clearElement(pavilionReflectionHint)']
]);

for (const [before, after] of exactReplacements) {
  if (!app.includes(before)) {
    throw new Error(`Expected application source fragment not found: ${before}`);
  }
  app = app.split(before).join(after);
}

const helperMarker = '    const AudioController = (() => {';
const helpers = `    function clearElement(element) {
      while (element && element.firstChild) element.removeChild(element.firstChild);
    }
    function removeElement(element) {
      if (element && element.parentNode) element.parentNode.removeChild(element);
    }
    function mapToObject(map, projector) {
      const output = {};
      map.forEach((value, key) => {
        output[key] = projector ? projector(value, key) : value;
      });
      return output;
    }
`;

if (!app.includes(helperMarker)) throw new Error('AudioController marker missing');
app = app.replace(helperMarker, helpers + helperMarker);

const resizeDeclaration = '    let riverPaperContext = null, riverPaperFrame = 0, riverPaperStartedAt = 0, riverPaperPressedAt = 0, riverPaperOcclusionAt = 0, riverPaperHintAt = 0, riverPaperHintTimer = 0, riverPaperResizeObserver = null;';
if (!app.includes(resizeDeclaration)) throw new Error('River paper state declaration missing');
app = app.replace(resizeDeclaration, resizeDeclaration.replace(';', ', riverPaperWindowResizeListening = false;'));

const resizeCleanup = `      if (riverPaperResizeObserver) riverPaperResizeObserver.disconnect();
      riverPaperResizeObserver = null;`;
if (!app.includes(resizeCleanup)) throw new Error('River paper resize cleanup missing');
app = app.replace(resizeCleanup, `${resizeCleanup}
      if (riverPaperWindowResizeListening) {
        window.removeEventListener('resize', resizeRiverPaperCanvas);
        riverPaperWindowResizeListening = false;
      }`);

const resizeSetup = `      riverPaperResizeObserver = new ResizeObserver(resizeRiverPaperCanvas);
      riverPaperResizeObserver.observe(act2Scene);`;
if (!app.includes(resizeSetup)) throw new Error('River paper ResizeObserver setup missing');
app = app.replace(resizeSetup, `      if (typeof window.ResizeObserver === 'function') {
        riverPaperResizeObserver = new window.ResizeObserver(resizeRiverPaperCanvas);
        riverPaperResizeObserver.observe(act2Scene);
      } else {
        window.addEventListener('resize', resizeRiverPaperCanvas);
        riverPaperWindowResizeListening = true;
      }`);

if (/\?\.|\?\?|Object\.fromEntries|\.\.\.(?:buffers|decodeFailures|ambience)/.test(app)) {
  throw new Error('ES2018+ application syntax/API remains after compatibility rewrite');
}

const fallbackCss = `
    /* Chrome 61 baseline; later declarations remain the visual enhancement layer. */
    button { -webkit-appearance:none; }
    .audio-toggle { top:10px; right:10px; }
    .audio-toggle:focus,
    #compose .topic:focus,
    #weave .cinematic-choice:focus,
    .weave-paper:focus,
    .destination:focus,
    #result .result-seal:focus,
    #act2 .act2-choice:focus { outline:1px solid rgba(58,42,26,.45); outline-offset:5px; }
    #landing::before { font-size:58px; }
    #landing::after { font-size:15px; }
    #compose .season { font-size:27px; }
    #compose .subtitle { font-size:17px; }
    #compose .prompt { font-size:21px; }
    #compose .guide { font-size:15px; }
    #compose .topic { min-height:31vh; }
    #compose .topic-title { font-size:42px; }
    #compose .topic-note { font-size:12px; }
    #journey .journey-paper { width:57vw; height:76vh; }
    #journey .journey-copy { left:16vw; height:61vh; font-size:18px; }
    #weave .paper-a { width:23vw; height:67vh; }
    #weave .paper-b { width:19vw; height:62vh; }
    #weave .paper-c { width:19vw; height:69vh; }
    #pavilionArrival .pavilion-narrative { width:17vw; }
`;

if (!html.includes('  <style>')) throw new Error('Style block missing');
html = html.replace('  <style>', `  <style>${fallbackCss}`);

function insetFallback(value) {
  const important = /\s*!important\s*$/.test(value) ? ' !important' : '';
  const clean = value.replace(/\s*!important\s*$/, '').trim();
  const parts = clean.split(/\s+/);
  let top;
  let right;
  let bottom;
  let left;
  if (parts.length === 1) [top, right, bottom, left] = [parts[0], parts[0], parts[0], parts[0]];
  else if (parts.length === 2) [top, right, bottom, left] = [parts[0], parts[1], parts[0], parts[1]];
  else if (parts.length === 3) [top, right, bottom, left] = [parts[0], parts[1], parts[2], parts[1]];
  else if (parts.length === 4) [top, right, bottom, left] = parts;
  else return `inset:${value};`;
  return `top:${top}${important};right:${right}${important};bottom:${bottom}${important};left:${left}${important};inset:${value};`;
}

html = html.replace(/inset:\s*([^;]+);/g, (_, value) => insetFallback(value));
html = html.replace(/([\w-]+):\s*(clamp|min|max)\(([^()]+)\)(\s*!important)?;/g, (whole, property, fn, args, important = '') => {
  const values = args.split(',').map(value => value.trim());
  const fallback = values[0];
  return `${property}:${fallback}${important};${whole}`;
});
html = html.replace(/([\w-]+):\s*(-?[\d.]+)svh(\s*!important)?;/g, (whole, property, value, important = '') => `${property}:${value}vh${important};${whole}`);

html = html.replace(inlineScript, '  <script src="./audio-data.js"></script>\n  <script src="./app.js"></script>\n</body>');
html = html.replace('  <script src="audio-data.js"></script>\n', '');

if (/<script>(?:.|\n)*?<\/script>/.test(html)) throw new Error('Inline script remains in final HTML');

fs.writeFileSync(appPath, app);
fs.writeFileSync(htmlPath, html);
console.log(`Wrote ${path.relative(projectRoot, appPath)} (${Buffer.byteLength(app)} bytes)`);
console.log(`Wrote ${path.relative(projectRoot, htmlPath)} (${Buffer.byteLength(html)} bytes)`);
