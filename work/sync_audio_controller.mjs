#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const sourcePath = path.join(root, 'index.html');
const releaseAppPath = path.join(root, 'xhs-dist', 'app.js');
let source = fs.readFileSync(sourcePath, 'utf8');
const releaseApp = fs.readFileSync(releaseAppPath, 'utf8');

const controllerStart = '    const AudioController = (() => {';
const controllerEnd = '    })();';
const helperStart = '    function clearElement(element) {';

function findBlock(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start < 0) throw new Error(`Missing start marker: ${startMarker}`);
  const end = text.indexOf(endMarker, start);
  if (end < 0) throw new Error(`Missing end marker: ${endMarker}`);
  return { start, end:end + endMarker.length, text:text.slice(start, end + endMarker.length) };
}

const sourceController = findBlock(source, controllerStart, controllerEnd);
const releaseHelpers = releaseApp.indexOf(helperStart);
if (releaseHelpers < 0) throw new Error('Release compatibility helpers missing');
const releaseController = findBlock(releaseApp, controllerStart, controllerEnd);
const replacement = releaseApp.slice(releaseHelpers, releaseController.end);

source = source.slice(0, sourceController.start) + replacement + source.slice(sourceController.end);
if (!source.includes('<script src="audio-data.js"></script>')) {
  source = source.replace('  <script>\n', '  <script src="audio-data.js"></script>\n  <script>\n');
}

fs.writeFileSync(sourcePath, source);
console.log(`Updated ${path.basename(sourcePath)} with the release AudioController and embedded-audio data reference.`);
