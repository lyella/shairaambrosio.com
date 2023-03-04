import type { DocumentContext } from "next/document";
import Document, { Head, Html, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en-EN" dir="ltr">
        <Head>
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/LeagueMono-Medium.woff2"
          />
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/LeagueMono-Regular.woff2"
          />
          <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href="/fonts/MabryPro-Black.woff2" />
          <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href="/fonts/MabryPro-Medium.woff2" />
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/MabryPro-Regular.woff2"
          />
          <link rel="preload" as="font" type="font/ttf" crossOrigin="anonymous" href="/fonts/Montserrat-Regular.ttf" />
          <link rel="preload" as="font" type="font/ttf" crossOrigin="anonymous" href="/fonts/Montserrat-Medium.ttf" />
          <link rel="preload" as="font" type="font/ttf" crossOrigin="anonymous" href="/fonts/Montserrat-Bold.ttf" />

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
