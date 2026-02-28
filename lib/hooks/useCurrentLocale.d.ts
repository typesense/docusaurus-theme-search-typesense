/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * Returns the current locale with fallback chain:
 * 1. Docusaurus context (i18n.currentLocale)
 * 2. document.documentElement.lang (after mount)
 * 3. themeConfig.typesense.localeOverride
 * 4. window.__SEARCH_THEME_LOCALE__ or window.env?.LOCALE
 * 5. 'en'
 */
export declare function useCurrentLocale(): string;
