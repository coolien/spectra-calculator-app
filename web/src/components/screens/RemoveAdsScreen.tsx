import { Check, RotateCcw, Sparkles } from 'lucide-react';
import { ScreenHeading } from '@/components/ui/Controls';

export function RemoveAdsScreen() {
  return (
    <div className="standard-screen">
      <ScreenHeading title="Remove ads" subtitle="Spectra stays free thanks to ads — go ad-free anytime." />
      <section className="remove-ads-card">
        <Sparkles size={26} />
        <span>One-time purchase</span>
        <strong>RM 9.90</strong>
        <p>No banners, no interstitials, forever. Calculators and results stay exactly the same.</p>
        <div><Check size={17} />One purchase for this account</div>
        <button type="button" onClick={() => window.alert('Purchases will be enabled with the app-store billing release.')}>Remove ads</button>
      </section>
      <button className="restore-purchase" type="button"><RotateCcw size={17} />Restore purchase</button>
    </div>
  );
}
