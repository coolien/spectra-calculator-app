import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSpectraExport } from '../src/lib/cloud-sync.ts';

const validBackup = {
  app: 'Spectra Calculator',
  schemaVersion: 2,
  exportedAt: '2026-07-15T00:00:00.000Z',
  data: {
    language: 'bm',
    forms: { home: {}, car: {}, personal: {}, credit: {}, ptptn: {}, faraid: {} },
    lastCalculator: 'car',
    personalProfile: null,
    salaryProfiles: [],
    savedScenarios: [],
    activeLoans: [],
  },
};

test('accepts a supported Spectra export', () => {
  const result = parseSpectraExport(validBackup);
  assert.equal(result.language, 'bm');
  assert.equal(result.lastCalculator, 'car');
});

test('rejects unknown export versions', () => {
  assert.throws(() => parseSpectraExport({ ...validBackup, schemaVersion: 99 }), /not a supported Spectra backup/);
});

test('rejects malformed saved records before they reach app state', () => {
  const malformed = structuredClone(validBackup);
  malformed.data.savedScenarios = [{ id: 'broken' }] as never[];
  assert.throws(() => parseSpectraExport(malformed), /invalid saved records/);
});
