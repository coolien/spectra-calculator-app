import { ScreenHeading, ThemeSwatchGrid } from '@/components/ui/Controls';

export function AppIconScreen() {
  return (
    <div className="standard-screen">
      <ScreenHeading title="App icon" subtitle="The same Spectra ring, in your chosen theme colour." />
      <ThemeSwatchGrid />
      <p className="detail-footnote">Your app icon colour and in-app accent are one shared setting.</p>
    </div>
  );
}
