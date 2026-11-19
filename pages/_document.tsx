import type { DocumentContext } from "next/document";
import Document, { Head, Html, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en" dir="ltr">
        <Head>
          {/* Preload only the two faces that paint above the fold. Mabry Pro is the
              body face; Montserrat Regular is every heading. Black/Medium/LeagueMono
              are either unused or below the fold, and preloading them competed for
              bandwidth with the fonts that actually render. LeagueMono-Medium had no
              @font-face rule at all, so it was downloaded and never used. */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/MabryPro-Regular.woff2"
          />
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/Montserrat-Regular.woff2"
          />

          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script defer src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_TRACKING_ID}`} />
          <script
            defer
            id="gtag-init"
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.GA_TRACKING_ID}', {
              page_path: window.location.pathname
            });
          `.trim(),
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
