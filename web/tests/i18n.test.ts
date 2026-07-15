import assert from 'node:assert/strict';
import test from 'node:test';
import { translate } from '../src/lib/i18n.ts';

test('navigation and casual interface copy translate in every supported language', () => {
  assert.equal(translate('bm', 'Settings'), 'Tetapan');
  assert.equal(translate('zh', 'Calculate'), '开始算');
  assert.equal(translate('ta', 'Good evening'), 'மாலை வணக்கம்');
});

test('dynamic MYR result copy handles non-breaking currency spaces', () => {
  const source = 'RM\u00a081,000.00 financed after RM\u00a09,000.00 down payment.';
  assert.equal(translate('bm', source), 'RM 81,000.00 dibiayai selepas bayaran muka RM 9,000.00.');
  assert.equal(translate('zh', source), '首付 RM 9,000.00，贷款 RM 81,000.00。');
  assert.equal(translate('ta', source), 'RM 9,000.00 முன்பணம் கட்டிய பிறகு RM 81,000.00 கடன்.');
});

test('validation errors remain casual and understandable', () => {
  assert.equal(translate('bm', 'Son count must be a whole number.'), 'Bilangan anak lelaki mesti nombor bulat.');
  assert.equal(translate('zh', 'Minimum payment must be 100% or below.'), '最低还款必须是 100% 或以下。');
  assert.equal(translate('ta', 'Extra monthly payment cannot be negative.'), 'மாத கூடுதல் பணம் negative-ஆக இருக்க முடியாது.');
});
