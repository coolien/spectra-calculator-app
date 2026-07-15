import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { ActiveLoan, FormState, PersonalProfile, SalaryProfile, SavedScenario } from '@/lib/app-model';
import type { CalculatorKey } from '@/lib/calculators';
import type { Language } from '@/lib/i18n';

export const SPECTRA_APP_ID = 'spectra-calculator';
export const CLOUD_SCHEMA_VERSION = 2;
export const CLOUD_CONSENT_VERSION = 'cloud-sync-v2-2026-07-14';

export type CloudPayload = {
  language: Language;
  forms: Record<CalculatorKey, FormState>;
  lastCalculator: CalculatorKey;
  personalProfile: PersonalProfile | null;
  salaryProfiles: SalaryProfile[];
  savedScenarios: SavedScenario[];
  activeLoans: ActiveLoan[];
};

export type CloudSnapshot = {
  payload: CloudPayload;
  clientUpdatedAt: string;
};

export function parseSpectraExport(value: unknown): CloudPayload {
  if (!isRecord(value) || value.app !== 'Spectra Calculator' || value.schemaVersion !== CLOUD_SCHEMA_VERSION) {
    throw new Error('This is not a supported Spectra backup file.');
  }
  const data = value.data;
  if (!isRecord(data) || !isLanguage(data.language) || !isCalculatorKey(data.lastCalculator)) {
    throw new Error('This Spectra backup is missing required app data.');
  }
  if (!isFormCollection(data.forms) || !isPersonalProfile(data.personalProfile)) {
    throw new Error('This Spectra backup contains invalid profile or calculator data.');
  }
  if (!isArrayOf(data.salaryProfiles, isSalaryProfile) || !isArrayOf(data.savedScenarios, isSavedScenario) || !isArrayOf(data.activeLoans, isActiveLoan)) {
    throw new Error('This Spectra backup contains invalid saved records.');
  }

  return data as CloudPayload;
}

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
  const activeLoans = mergeById(cloud.activeLoans ?? [], local.activeLoans ?? [], (left, right) => {
    return Date.parse(right.updatedAt) >= Date.parse(left.updatedAt) ? right : left;
  });

  return {
    language: cloud.language ?? local.language,
    forms: cloud.forms ?? local.forms,
    lastCalculator: cloud.lastCalculator ?? local.lastCalculator,
    personalProfile: cloud.personalProfile ?? local.personalProfile,
    salaryProfiles: salaryProfiles.slice(0, 15),
    savedScenarios,
    activeLoans,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'bm' || value === 'zh' || value === 'ta';
}

function isCalculatorKey(value: unknown): value is CalculatorKey {
  return value === 'home' || value === 'car' || value === 'personal' || value === 'credit' || value === 'ptptn' || value === 'faraid';
}

function isFormCollection(value: unknown): value is CloudPayload['forms'] {
  if (!isRecord(value)) return false;
  return ['home', 'car', 'personal', 'credit', 'ptptn', 'faraid'].every((key) => {
    const form = value[key];
    return isRecord(form) && Object.values(form).every((field) => typeof field === 'string');
  });
}

function isPersonalProfile(value: unknown): value is PersonalProfile | null {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  return ['grossSalary', 'epfRate', 'tax', 'livingExpenses', 'commitments', 'targetDsr']
    .every((key) => typeof value[key] === 'string');
}

function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

function isSalaryProfile(value: unknown): value is SalaryProfile {
  if (!isRecord(value)) return false;
  return ['id', 'name', 'label'].every((key) => typeof value[key] === 'string')
    && ['grossSalary', 'commitments', 'targetDsr', 'takeHome', 'maxInstallment'].every((key) => isFiniteNumber(value[key]));
}

function isSavedScenario(value: unknown): value is SavedScenario {
  if (!isRecord(value) || !isCalculatorKey(value.calculator)) return false;
  const stringsValid = ['id', 'label', 'result', 'secondary', 'savedAt'].every((key) => typeof value[key] === 'string');
  if (!stringsValid || value.comparison === undefined) return stringsValid;
  const comparison = value.comparison;
  if (!isRecord(comparison)) return false;
  return ['monthlyPayment', 'totalRepayment', 'upfrontCash'].every((key) => isFiniteNumber(comparison[key]))
    && (comparison.durationMonths === null || isFiniteNumber(comparison.durationMonths));
}

function isActiveLoan(value: unknown): value is ActiveLoan {
  if (!isRecord(value)) return false;
  const type = value.type;
  const validType = type === 'home' || type === 'car' || type === 'personal' || type === 'credit' || type === 'ptptn' || type === 'other';
  return validType
    && ['id', 'name', 'nextPaymentDate', 'createdAt', 'updatedAt'].every((key) => typeof value[key] === 'string')
    && ['monthlyPayment', 'remainingBalance', 'originalBalance', 'annualRatePercent'].every((key) => isFiniteNumber(value[key]));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
