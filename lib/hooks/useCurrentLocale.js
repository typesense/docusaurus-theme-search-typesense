"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCurrentLocale = useCurrentLocale;
const react_1 = require("react");
const useDocusaurusContext_1 = require("@docusaurus/useDocusaurusContext");
const useDocusaurusContext = useDocusaurusContext_1.default ?? useDocusaurusContext_1;
const DEFAULT_LOCALE = 'en';
/**
 * Returns the current locale with fallback chain:
 * 1. Docusaurus context (i18n.currentLocale)
 * 2. document.documentElement.lang (after mount)
 * 3. themeConfig.typesense.localeOverride
 * 4. window.__SEARCH_THEME_LOCALE__ or window.env?.LOCALE
 * 5. 'en'
 * Reads document/window only in useEffect to avoid hydration mismatch.
 */
function useCurrentLocale() {
    const { i18n, siteConfig } = useDocusaurusContext();
    const themeConfig = siteConfig?.themeConfig;
    const fromContext = i18n?.currentLocale;
    const fromConfig = themeConfig?.typesense?.localeOverride;
    const [clientLocale, setClientLocale] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (typeof document === 'undefined' && typeof window === 'undefined') {
            return;
        }
        const docLang = typeof document !== 'undefined'
            ? document.documentElement?.lang || null
            : null;
        const winLocale = typeof window !== 'undefined'
            ? (window.__SEARCH_THEME_LOCALE__ ?? window.env?.LOCALE) || null
            : null;
        const fromClient = docLang || winLocale;
        setClientLocale(fromClient);
    }, []);
    const locale = fromContext || clientLocale || fromConfig || DEFAULT_LOCALE;
    (0, react_1.useEffect)(() => {
        let source = 'default';
        if (fromContext) {
            source = 'context';
        }
        else if (clientLocale) {
            source =
                typeof document !== 'undefined' &&
                    document.documentElement?.lang === clientLocale
                    ? 'document'
                    : 'window';
        }
        else if (fromConfig) {
            source = 'config';
        }
        console.log('[docusaurus-theme-search-typesense] locale:', locale, '| source:', source);
    }, [locale, fromContext, clientLocale, fromConfig]);
    return locale;
}
