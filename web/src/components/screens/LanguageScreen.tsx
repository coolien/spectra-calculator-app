import { Check } from 'lucide-react';
import { ScreenHeading } from '@/components/ui/Controls';
import type { Language } from '@/lib/i18n';
import { languageOptions } from '@/lib/i18n';

export function LanguageScreen({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <div className="standard-screen">
      <ScreenHeading title="Language" subtitle="Applies everywhere in the app, right away." />
      <div className="language-list">
        {languageOptions.map((option) => (
          <button className={language === option.code ? 'is-active' : ''} type="button" key={option.code} onClick={() => onChange(option.code)}>
            <span className="language-glyph">{option.glyph}</span>
            <span><strong>{option.label}</strong><small>{option.native}{!option.ready && ' · planned after v1'}</small></span>
            {language === option.code && <Check size={19} />}
          </button>
        ))}
      </div>
      <p className="detail-footnote">English is complete for launch. Bahasa Malaysia, Chinese and Tamil are selected immediately and will receive full interface translations after v1.</p>
    </div>
  );
}
