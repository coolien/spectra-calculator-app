import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { FormState, PersonalProfile, SalaryProfile, SavedScenario } from '@/lib/app-model';
import type { CalculatorKey } from '@/lib/calculators';
import type { Language } from '@/lib/i18n';

export const SPECTRA_APP_ID = 'spectra-calculator';
export const CLOUD_SCHEMA_VERSION = 1;
export const CLOUD_CONSENT_VERSION = 'cloud-sync-v1-2026-07-14';

export type CloudPayload = {
  language: Language;
  forms: Record<CalculatorKey, FormState>;
  lastCalculator: CalculatorKey;
  personalProfile: PersonalProfile | null;
  salaryProfiles: SalaryProfile[];
  savedScenarios: SavedScenario[];
};

export type CloudSnapshot = {
  payload: CloudPayload;
  clientUpdatedAt: string;
};

export async function readCloudSnapshot(client: SupabaseClient, userId: string): Promise<CloudSnapshot | null> {
  const { data, error } = await client
    .from('app_snapshots')
    .select('payload, client_updated_at')
    .eq('user_id', userId)
    .eq('app_id', SPECTRA_APP_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { payload: data.payload as CloudPayload, clientUpdatedAt: data.client_updated_at as string };
}

export async function writeCloudSnapshot(
  client: SupabaseClient,
  session: Session,
  payload: CloudPayload,
  clientUpdatedAt: string,
) {
  const user = session.user;
  const profileResult = await client.from('profiles').upsert({
    id: user.id,
    email: user.email ?? null,
    display_name: typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : null,
  }, { onConflict: 'id' });
  if (profileResult.error) throw profileResult.error;

  const consentResult = await client.from('user_consents').upsert({
    user_id: user.id,
    consent_type: 'cloud_sync',
    consent_version: CLOUD_CONSENT_VERSION,
    granted_at: new Date().toISOString(),
    revoked_at: null,
    metadata: { app_id: SPECTRA_APP_ID },
  }, { onConflict: 'user_id,consent_type,consent_version' });
  if (consentResult.error) throw consentResult.error;

  const snapshotResult = await client.from('app_snapshots').upsert({
    user_id: user.id,
    app_id: SPECTRA_APP_ID,
    schema_version: CLOUD_SCHEMA_VERSION,
    payload,
    client_updated_at: clientUpdatedAt,
  }, { onConflict: 'user_id,app_id' });
  if (snapshotResult.error) throw snapshotResult.error;
}

export async function deleteCloudData(client: SupabaseClient, userId: string) {
  const snapshot = await client.from('app_snapshots').delete().eq('user_id', userId).eq('app_id', SPECTRA_APP_ID);
  if (snapshot.error) throw snapshot.error;
  const consent = await client.from('user_consents').delete().eq('user_id', userId).eq('consent_type', 'cloud_sync');
  if (consent.error) throw consent.error;
  const profile = await client.from('profiles').delete().eq('id', userId);
  if (profile.error) throw profile.error;
}

export function mergeCloudPayload(local: CloudPayload, cloud: CloudPayload): CloudPayload {
  const salaryProfiles = mergeById(cloud.salaryProfiles, local.salaryProfiles);
  const savedScenarios = mergeById(cloud.savedScenarios, local.savedScenarios, (left, right) => {
    return Date.parse(right.savedAt) >= Date.parse(left.savedAt) ? right : left;
  });

  return {
    language: cloud.language ?? local.language,
    forms: cloud.forms ?? local.forms,
    lastCalculator: cloud.lastCalculator ?? local.lastCalculator,
    personalProfile: cloud.personalProfile ?? local.personalProfile,
    salaryProfiles: salaryProfiles.slice(0, 15),
    savedScenarios,
  };
}

function mergeById<T extends { id: string }>(
  cloud: T[] = [],
  local: T[] = [],
  resolve: (cloudItem: T, localItem: T) => T = (_cloudItem, localItem) => localItem,
) {
  const merged = new Map(cloud.map((item) => [item.id, item]));
  for (const item of local) {
    const cloudItem = merged.get(item.id);
    merged.set(item.id, cloudItem ? resolve(cloudItem, item) : item);
  }
  return [...merged.values()];
}
