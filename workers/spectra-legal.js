const LEGAL_PAGE = 'https://calculatorapp.spectramsia.com/legal/';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== '/legal' && url.pathname !== '/legal/' && !url.pathname.startsWith('/legal/')) {
      return new Response('Not found', { status: 404 });
    }

    const upstream = await fetch(LEGAL_PAGE, {
      headers: { Accept: 'text/html' },
      cf: { cacheEverything: true, cacheTtl: 300 },
    });
    if (!upstream.ok) return new Response('Legal page is temporarily unavailable.', { status: 503 });

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    });
  },
};
