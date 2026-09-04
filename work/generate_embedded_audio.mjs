import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const sourceRoot = resolve(projectRoot, 'assets', 'audio');
const temporaryRoot = mkdtempSync(join(tmpdir(), 'chisu-audio-'));

const tracks = [
  ['river', 'river_ambience_loop.ogg', '96k'],
  ['bamboo', 'bamboo_wind_loop.ogg', '96k'],
  ['boat', 'boat_pole_water.ogg', '80k'],
  ['paper', 'paper_water_touch.ogg', '80k'],
  ['firefly', 'firefly_lantern_merge.ogg', '80k'],
  ['cup', 'cup_chime_distant.ogg', '80k']
];

try {
  const encoded = {};
  for (const [name, sourceName, bitrate] of tracks) {
    const mp3Path = join(temporaryRoot, `${name}.mp3`);
    execFileSync('ffmpeg', [
      '-nostdin', '-y', '-v', 'error',
      '-i', resolve(sourceRoot, sourceName),
      '-map_metadata', '-1', '-vn',
      '-c:a', 'libmp3lame', '-b:a', bitrate,
      '-joint_stereo', '1', '-ar', '44100',
      mp3Path
    ]);
    encoded[name] = readFileSync(mp3Path).toString('base64');
  }

  const lines = [
    '/* Generated from the six approved audio masters. Do not edit by hand. */',
    'window.CHISU_AUDIO_DATA=Object.freeze({',
    '  codec:"audio/mpeg",',
    ...tracks.map(([name], index) => `  ${name}:"${encoded[name]}"${index === tracks.length - 1 ? '' : ','}`),
    '});',
    ''
  ];
  const output = lines.join('\n');
  writeFileSync(resolve(projectRoot, 'audio-data.js'), output);
  writeFileSync(resolve(projectRoot, 'xhs-dist', 'audio-data.js'), output);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
