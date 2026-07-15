# Spectra AdSense Setup

Spectra's PWA uses Google AdSense for web advertising. Keep ads disabled until the site is approved and consent messaging is ready.

## 1. Add and verify the site

1. In AdSense, open **Sites** and add `spectramsia.com`. AdSense does not accept an ordinary subdomain such as `calculatorapp.spectramsia.com` as a separate site.
2. Copy the publisher ID in the format `ca-pub-1234567890123456`.
3. Verify ownership from the root domain using either the AdSense meta tag on the `spectramsia.com` homepage or the real publisher line at `https://spectramsia.com/ads.txt`.
4. In the calculator's Cloudflare Pages project, add `NEXT_PUBLIC_ADSENSE_CLIENT` for both Production and Preview. This prepares the calculator subdomain but does not replace root-domain verification.
5. Redeploy. Spectra will publish a `google-adsense-account` meta tag on the calculator without loading ads.
6. In AdSense, confirm verification and request review. Leave `NEXT_PUBLIC_ADSENSE_ENABLED=false` while the site is being reviewed.

Site review can take several days and sometimes two to four weeks.

## 2. Prepare privacy and consent

1. In AdSense, open **Privacy & messaging**.
2. Create Google's certified European regulations message for visitors in the EEA, UK, and Switzerland.
3. Choose the consent options appropriate for Spectra and publish the message before ads are enabled.
4. Keep Spectra's Legal & privacy disclosure current whenever advertising or analytics providers change.
5. Before the first ad-enabled release, update the first-use privacy notice and increment `LEGAL_CONSENT_VERSION` so existing users are asked to agree to the changed data practice.

## 3. Create the ad unit

1. After the site status is **Ready**, open **Ads**, then **By ad unit**.
2. Create one responsive display ad for the Spectra home screen.
3. Copy the numeric `data-ad-slot` value into Cloudflare as `NEXT_PUBLIC_ADSENSE_HOME_SLOT`.
4. Set `NEXT_PUBLIC_ADSENSE_ENABLED=true` and redeploy.

The app only loads Google's ad script when the switch is `true` and both IDs pass validation. The single home placement is below the calculator grid and is not sticky, auto-refreshed, or placed beside navigation controls.

## 4. Publish ads.txt

After receiving the real publisher ID, publish this exact pattern at the domain root, replacing the example number and removing `ca-`:

```text
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

The root-domain publisher line normally covers the calculator when both use the same publisher ID. Only if the root site and calculator subdomain use different authorized sellers or publisher IDs should the root file point to a separate subdomain file with:

```text
subdomain=calculatorapp.spectramsia.com
```

Do not commit a placeholder `ads.txt`; publish it only with the real publisher ID.

## Policy guardrails

- Never click Spectra's own ads or ask users to click them.
- Label placements only as **Advertisement** or **Sponsored links**.
- Do not place ads where they can be mistaken for calculator controls, navigation, or results.
- Do not add floating, pop-up, or automatic-refresh behavior.
- Keep privacy disclosures and consent controls live wherever required.
