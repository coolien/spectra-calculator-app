import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'out');
const distDir = join(root, 'dist');
const serverDir = join(distDir, 'server');

const worker = `const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      });
    }

    if (url.pathname.startsWith('/server/')) {
      return new Response('Not Found', { status: 404 });
    }

    const firstPass = await env.ASSETS.fetch(request);
    if (firstPass.status !== 404) {
      return firstPass;
    }

    const fetchAsset = (pathname) => {
      const assetUrl = new URL(request.url);
      assetUrl.pathname = pathname;
      assetUrl.search = '';
      return env.ASSETS.fetch(new Request(assetUrl, request));
    };

    if (url.pathname.endsWith('/')) {
      const indexResponse = await fetchAsset(url.pathname + 'index.html');
      if (indexResponse.status !== 404) {
        return indexResponse;
      }
    }

    if (!url.pathname.includes('.')) {
      const nestedIndexResponse = await fetchAsset(url.pathname + '/index.html');
      if (nestedIndexResponse.status !== 404) {
        return nestedIndexResponse;
      }
    }

    if ((request.headers.get('accept') || '').includes('text/html')) {
      return fetchAsset('/index.html');
    }

    return firstPass;
  },
};

export default worker;
`;

await rm(distDir, { recursive: true, force: true });
await mkdir(serverDir, { recursive: true });
await cp(outDir, distDir, { recursive: true });
await writeFile(join(serverDir, 'index.js'), worker);
