import type { AppProps } from 'next/app';
import { I18nProvider } from 'next-localization';
import { SitecorePageProps } from 'lib/page-props';
import Bootstrap from 'src/Bootstrap';

import 'assets/main.scss';
import { WidgetsProvider } from '@sitecore-search/react';

function App({ Component, pageProps }: AppProps<SitecorePageProps>): JSX.Element {
  const { dictionary, ...rest } = pageProps;

  return (
    <>
      <WidgetsProvider
        env="prod"
        customerKey="11111-30037416"
        apiKey="01-3a518c01-e19e5b5ac2213b539613b5a36e140a8f612124e2"
      >
        <Bootstrap {...pageProps} />
        {/*
        // Use the next-localization (w/ rosetta) library to provide our translation dictionary to the app.
        // Note Next.js does not (currently) provide anything for translation, only i18n routing.
        // If your app is not multilingual, next-localization and references to it can be removed.
      */}
        <I18nProvider lngDict={dictionary} locale={pageProps.locale}>
          <Component {...rest} />
        </I18nProvider>
      </WidgetsProvider>
    </>
  );
}

export default App;
