/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useEffect, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {ThemeConfig} from 'docusaurus-theme-search-typesense';

type LocaleSource =
  | 'context'
  | 'document'
  | 'config'
  | 'window'
  | 'default';

const DEFAULT_LOCALE = 'en';

declare global {
  interface Window {
    __SEARCH_THEME_LOCALE__?: string;
    env?: {LOCALE?: string};
  }
}

/**
 * Returns the current locale with fallback chain:
 * 1. Docusaurus context (i18n.currentLocale)
 * 2. document.documentElement.lang (after mount)
 * 3. themeConfig.typesense.localeOverride
 * 4. window.__SEARCH_THEME_LOCALE__ or window.env?.LOCALE
 * 5. 'en'
 * Reads document/window only in useEffect to avoid hydration mismatch.
 */
export function useCurrentLocale(): string {
  const {i18n, siteConfig} = useDocusaurusContext();
  const themeConfig = siteConfig?.themeConfig as ThemeConfig | undefined;
  const fromContext = i18n?.currentLocale;
  const fromConfig = themeConfig?.typesense?.localeOverride;

  const [clientLocale, setClientLocale] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined' && typeof window === 'undefined') {
      return;
    }
    const docLang =
      typeof document !== 'undefined'
        ? document.documentElement?.lang || null
        : null;
    const winLocale =
      typeof window !== 'undefined'
        ? (window.__SEARCH_THEME_LOCALE__ ?? window.env?.LOCALE) || null
        : null;
    const fromClient = docLang || winLocale;
    setClientLocale(fromClient);
  }, []);

  const locale =
    fromContext || clientLocale || fromConfig || DEFAULT_LOCALE;

  useEffect(() => {
    let source: LocaleSource = 'default';
    if (fromContext) {
      source = 'context';
    } else if (clientLocale) {
      source =
        typeof document !== 'undefined' &&
        document.documentElement?.lang === clientLocale
          ? 'document'
          : 'window';
    } else if (fromConfig) {
      source = 'config';
    }
    console.log(
      '[docusaurus-theme-search-typesense] locale:',
      locale,
      '| source:',
      source,
    );
  }, [locale, fromContext, clientLocale, fromConfig]);

  return locale;
}
