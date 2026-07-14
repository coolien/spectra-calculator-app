import type { PersonalProfile } from '@/lib/app-model';

export function profileMetrics(profile: PersonalProfile) {
  const gross = numeric(profile.grossSalary);
  const epf = gross * numeric(profile.epfRate) / 100;
  const tax = numeric(profile.tax);
  const socsoAndEis = Math.min(75, gross * 0.0065);
  const takeHome = Math.max(0, gross - epf - tax - socsoAndEis);
  const targetCommitment = gross * numeric(profile.targetDsr) / 100;
  const roomLeft = Math.max(0, targetCommitment - numeric(profile.commitments));
  const dsrUsed = gross > 0 ? numeric(profile.commitments) / gross * 100 : 0;
  return { gross, takeHome, roomLeft, dsrUsed };
}

export function numeric(value: string | number) {
  const parsed = Number(String(value).replaceAll(',', '').replaceAll('RM', '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatRinggit(value: number, decimals = 0) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency', currency: 'MYR', minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  }).format(value);
}
