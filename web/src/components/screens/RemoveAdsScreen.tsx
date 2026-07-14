import { Check, RotateCcw, Sparkles } from 'lucide-react';
import { ScreenHeading } from '@/components/ui/Controls';

export function RemoveAdsScreen() {
  return (
    <div className="standard-screen">
      <ScreenHeading title="Remove ads" subtitle="Spectra stays free thanks to ads — go ad-free anytime." />
      <section className="remove-ads-card">
        <Sparkles size={26} />
        <span>Planned one-time price</span>
        <strong>RM 88.88</strong>
        <p>No banners, no interstitials, forever. Calculators and results stay exactly the same.</p>
        <div><Check size={17} />One purchase for this account</div>
        <button type="button" onClick={() => window.alert('RM88.88 is a preview price for now. Payment is not enabled yet.')}>Remove ads - RM88.88</button>
      </section>
      <button className="restore-purchase" type="button" onClick={() => window.alert('There are no purchases to restore yet.')}><RotateCcw size={17} />Restore purchase</button>
    </div>
  );
}
