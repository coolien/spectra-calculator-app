export type AdsenseConfig = {
  client: string | null;
  homeSlot: string | null;
  enabled: boolean;
  ready: boolean;
};

const ADSENSE_CLIENT_PATTERN = /^ca-pub-\d{16}$/;
const ADSENSE_SLOT_PATTERN = /^\d+$/;

export function parseAdsenseConfig(env: Record<string, string | undefined>): AdsenseConfig {
  const client = env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() ?? '';
  const homeSlot = env.NEXT_PUBLIC_ADSENSE_HOME_SLOT?.trim() ?? '';
  const enabled = env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';
  const validClient = ADSENSE_CLIENT_PATTERN.test(client);
  const validSlot = ADSENSE_SLOT_PATTERN.test(homeSlot);

  return {
    client: validClient ? client : null,
    homeSlot: validSlot ? homeSlot : null,
    enabled,
    ready: enabled && validClient && validSlot,
  };
}

export const adsenseConfig = parseAdsenseConfig({
  NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
  NEXT_PUBLIC_ADSENSE_HOME_SLOT: process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT,
  NEXT_PUBLIC_ADSENSE_ENABLED: process.env.NEXT_PUBLIC_ADSENSE_ENABLED,
});
