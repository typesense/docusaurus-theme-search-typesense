"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTitleFormatter = void 0;
const tslib_1 = require("tslib");
// Source: https://github.com/facebook/docusaurus/blob/a308fb7c81832cca354192fe2984f52749441249/packages/docusaurus-theme-common/src/utils/generalUtils.ts
// Context: https://github.com/typesense/docusaurus-theme-search-typesense/issues/27#issuecomment-1415757477
const useDocusaurusContext_1 = tslib_1.__importDefault(require("@docusaurus/useDocusaurusContext"));
/**
 * Formats the page's title based on relevant site config and other contexts.
 */
function useTitleFormatter(title) {
    const { siteConfig } = (0, useDocusaurusContext_1.default)();
    const { title: siteTitle, titleDelimiter } = siteConfig;
    return title?.trim().length
        ? `${title.trim()} ${titleDelimiter} ${siteTitle}`
        : siteTitle;
}
exports.useTitleFormatter = useTitleFormatter;
