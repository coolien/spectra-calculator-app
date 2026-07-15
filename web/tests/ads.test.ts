import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAdsenseConfig } from '../src/lib/ads.ts';
import { translate } from '../src/lib/i18n.ts';

test('AdSense stays off when settings are missing or invalid', () => {
  const config = parseAdsenseConfig({
    NEXT_PUBLIC_ADSENSE_CLIENT: 'ca-pub-not-valid',
    NEXT_PUBLIC_ADSENSE_HOME_SLOT: '',
    NEXT_PUBLIC_ADSENSE_ENABLED: 'true',
  });

  assert.equal(config.client, null);
  assert.equal(config.homeSlot, null);
  assert.equal(config.ready, false);
});

test('AdSense is ready only with explicit enablement and valid IDs', () => {
  const settings = {
    NEXT_PUBLIC_ADSENSE_CLIENT: 'ca-pub-1234567890123456',
    NEXT_PUBLIC_ADSENSE_HOME_SLOT: '1234567890',
  };

  assert.equal(parseAdsenseConfig(settings).ready, false);
  assert.deepEqual(parseAdsenseConfig({ ...settings, NEXT_PUBLIC_ADSENSE_ENABLED: 'true' }), {
    client: settings.NEXT_PUBLIC_ADSENSE_CLIENT,
    homeSlot: settings.NEXT_PUBLIC_ADSENSE_HOME_SLOT,
    enabled: true,
    ready: true,
  });
});

test('advertising labels and disclosures translate in every supported language', () => {
  const sources = [
    'Advertisement',
    'Advertising',
    'How Google uses advertising data',
    'When advertising is enabled, Google AdSense and its partners may use cookies, local storage, device information, IP address, and interaction data to select, deliver, measure, and protect ads. Where required, Spectra will use a Google-certified consent platform before ad storage or personalized advertising.',
  ];

  for (const language of ['bm', 'zh', 'ta'] as const) {
    for (const source of sources) assert.notEqual(translate(language, source), source);
  }
});
