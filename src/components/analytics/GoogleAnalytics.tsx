import { Suspense } from "react";
import Script from "next/script";
import { GA_MEASUREMENT_ID, isAnalyticsEnabled } from "@/lib/analytics/ga";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { InteractionTracker } from "@/components/analytics/InteractionTracker";

export function GoogleAnalytics() {
  if (!isAnalyticsEnabled()) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <InteractionTracker />
    </>
  );
}
