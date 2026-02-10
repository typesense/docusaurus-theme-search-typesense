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

  const [docLang, setDocLang] = useState<string | null>(null);
  const [winLocale, setWinLocale] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined' && typeof window === 'undefined') {
      return;
    }
    if (typeof document !== 'undefined') {
      setDocLang(document.documentElement?.lang || null);
    }
    if (typeof window !== 'undefined') {
      setWinLocale(
        (window.__SEARCH_THEME_LOCALE__ ?? window.env?.LOCALE) || null,
      );
    }
  }, []);

  const locale =
    fromContext || docLang || fromConfig || winLocale || DEFAULT_LOCALE;

  useEffect(() => {
    let source: LocaleSource = 'default';
    if (fromContext) {
      source = 'context';
    } else if (docLang) {
      source = 'document';
    } else if (fromConfig) {
      source = 'config';
    } else if (winLocale) {
      source = 'window';
    }
    console.log(
      '[docusaurus-theme-search-typesense] locale:',
      locale,
      '| source:',
      source,
    );
  }, [locale, fromContext, docLang, fromConfig, winLocale]);

  return locale;
}
