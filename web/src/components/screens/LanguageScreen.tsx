import { Check } from 'lucide-react';
import { ScreenHeading } from '@/components/ui/Controls';
import type { Language } from '@/lib/i18n';
import { languageOptions } from '@/lib/i18n';
import { useI18n } from '@/components/app-shell/I18nProvider';

export function LanguageScreen({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  const { t } = useI18n();
  return (
    <div className="standard-screen">
      <ScreenHeading title="Language" subtitle="Applies everywhere in the app, right away." />
      <div className="language-list">
        {languageOptions.map((option) => (
          <button className={language === option.code ? 'is-active' : ''} type="button" key={option.code} onClick={() => onChange(option.code)}>
            <span className="language-glyph">{option.glyph}</span>
            <span><strong>{option.label}</strong><small>{option.native}</small></span>
            {language === option.code && <Check size={19} />}
          </button>
        ))}
      </div>
      <p className="detail-footnote">{t('The whole app changes as soon as you pick a language.')}</p>
    </div>
  );
}
