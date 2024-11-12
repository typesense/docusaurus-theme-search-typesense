/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// Source: https://github.com/facebook/docusaurus/blob/a308fb7c81832cca354192fe2984f52749441249/packages/docusaurus-theme-common/src/hooks/useSearchPage.ts
// Context: https://github.com/typesense/docusaurus-theme-search-typesense/issues/27#issuecomment-1415757477
import { useCallback, useEffect, useState } from 'react';
import { useHistory } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
const SEARCH_PARAM_QUERY = 'q';
/** Some utility functions around search queries. */
export function useSearchPage() {
    const history = useHistory();
    const { siteConfig: { baseUrl }, } = useDocusaurusContext();
    const [searchQuery, setSearchQueryState] = useState('');
    // Init search query just after React hydration
    useEffect(() => {
        const searchQueryStringValue = 
        // @ts-ignore
        new URLSearchParams(window.location.search).get(SEARCH_PARAM_QUERY) ?? '';
        setSearchQueryState(searchQueryStringValue);
    }, []);
    const setSearchQuery = useCallback((newSearchQuery) => {
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
    const generateSearchPageLink = useCallback((targetSearchQuery) => 
    // Refer to https://github.com/facebook/docusaurus/pull/2838
    `${baseUrl}search?${SEARCH_PARAM_QUERY}=${encodeURIComponent(targetSearchQuery)}`, [baseUrl]);
    return {
        searchQuery,
        setSearchQuery,
        generateSearchPageLink,
    };
}
