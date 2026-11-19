import "../styles/globals.scss";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { ThemeProvider } from "context/ThemeContext";
import { Seo } from "components/Seo";
import * as gtag from "lib/gtag";

const isProduction = process.env.NODE_ENV === "production";
const isBrowser = typeof window !== "undefined";

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const { events } = useRouter();
  useEffect(() => {
    if (!isProduction || !isBrowser) {
      return;
    }

    const handleRouteChange = (url: string) => {
      gtag.reportPageView(url);
    };

    // Read `events` from the router instance rather than closing over `router`:
    // the old effect had an empty dependency array while touching router.events,
    // so it kept a reference to a possibly-replaced events object.
    events.on("routeChangeComplete", handleRouteChange);

    return () => {
      events.off("routeChangeComplete", handleRouteChange);
    };
  }, [events]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, user-scalable=yes, initial-scale=1.0, viewport-fit=cover" />
      </Head>

      <Seo />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Component {...pageProps} />
          <Analytics />
        </ThemeProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
