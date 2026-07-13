import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const templatePath = join(root, 'src', 'pwa', 'sw.template.js');
const serviceWorkerPath = join(root, 'public', 'sw.js');
const buildInfoPath = join(root, 'public', 'spectra_build.json');

const buildId = resolveBuildId();
const cacheName = `spectra-next-${buildId}`;

const serviceWorker = readFileSync(templatePath, 'utf8')
  .replaceAll('__SPECTRA_BUILD_ID__', buildId)
  .replaceAll('__SPECTRA_CACHE_NAME__', cacheName);

mkdirSync(dirname(serviceWorkerPath), { recursive: true });
writeFileSync(serviceWorkerPath, serviceWorker);
writeFileSync(
  buildInfoPath,
  JSON.stringify({
    buildId,
    cacheName,
    builtAt: new Date().toISOString(),
    framework: 'nextjs',
  }),
);

function resolveBuildId() {
  const environmentBuildId =
    process.env.SPECTRA_BUILD_ID ||
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.GITHUB_SHA;

  if (environmentBuildId) {
    return sanitizeBuildId(environmentBuildId);
  }

  try {
    return sanitizeBuildId(
      execSync('git rev-parse --short HEAD', {
        cwd: dirname(root),
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .toString()
        .trim(),
    );
  } catch {
    return sanitizeBuildId(new Date().toISOString());
  }
}

function sanitizeBuildId(value) {
  const sanitized = value
    .toLowerCase()
    .replaceAll(/[^a-z0-9._-]+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-|-$/g, '');

  return sanitized || 'dev';
}
