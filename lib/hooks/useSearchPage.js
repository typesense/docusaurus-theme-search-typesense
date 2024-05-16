"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSearchPage = void 0;
const tslib_1 = require("tslib");
// Source: https://github.com/facebook/docusaurus/blob/a308fb7c81832cca354192fe2984f52749441249/packages/docusaurus-theme-common/src/hooks/useSearchPage.ts
// Context: https://github.com/typesense/docusaurus-theme-search-typesense/issues/27#issuecomment-1415757477
const react_1 = require("react");
const router_1 = require("@docusaurus/router");
const useDocusaurusContext_1 = tslib_1.__importDefault(require("@docusaurus/useDocusaurusContext"));
const SEARCH_PARAM_QUERY = 'q';
/** Some utility functions around search queries. */
function useSearchPage() {
    const history = (0, router_1.useHistory)();
    const { siteConfig: { baseUrl }, } = (0, useDocusaurusContext_1.default)();
    const [searchQuery, setSearchQueryState] = (0, react_1.useState)('');
    // Init search query just after React hydration
    (0, react_1.useEffect)(() => {
        const searchQueryStringValue = 
        // @ts-ignore
        new URLSearchParams(window.location.search).get(SEARCH_PARAM_QUERY) ?? '';
        setSearchQueryState(searchQueryStringValue);
    }, []);
    const setSearchQuery = (0, react_1.useCallback)((newSearchQuery) => {
        // @ts-ignore
        const searchParams = new URLSearchParams(window.location.search);
        if (newSearchQuery) {
            searchParams.set(SEARCH_PARAM_QUERY, newSearchQuery);
        }
        else {
            searchParams.delete(SEARCH_PARAM_QUERY);
        }
        history.replace({
            search: searchParams.toString(),
        });
        setSearchQueryState(newSearchQuery);
    }, [history]);
    const generateSearchPageLink = (0, react_1.useCallback)((targetSearchQuery) => 
    // Refer to https://github.com/facebook/docusaurus/pull/2838
    `${baseUrl}search?${SEARCH_PARAM_QUERY}=${encodeURIComponent(targetSearchQuery)}`, [baseUrl]);
    return {
        searchQuery,
        setSearchQuery,
        generateSearchPageLink,
    };
}
exports.useSearchPage = useSearchPage;
