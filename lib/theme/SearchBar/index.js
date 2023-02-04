/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
// @ts-ignore
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// @ts-ignore
import { useHistory } from '@docusaurus/router';
// @ts-ignore
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
// @ts-ignore
import Link from '@docusaurus/Link';
// @ts-ignore
import { isRegexpStringMatch } from '@docusaurus/theme-common';
// @ts-ignore
import { useSearchPage } from '../../hooks/useSearchPage';
import { DocSearchButton, useDocSearchKeyboardEvents, } from 'typesense-docsearch-react';
import { useTypesenseContextualFilters } from '../../client';
// @ts-ignore
import Translate from '@docusaurus/Translate';
// @ts-ignore
import translations from '@theme/SearchTranslations';
let DocSearchModal = null;
function Hit({ hit, children, }) {
    return <Link to={hit.url}>{children}</Link>;
}
function ResultsFooter({ state, onClose }) {
    const { generateSearchPageLink } = useSearchPage();
    return (<Link to={generateSearchPageLink(state.query)} onClick={onClose}>
      <Translate id="theme.SearchBar.seeAll" values={{ count: state.context.nbHits }}>
        {'See all {count} results'}
      </Translate>
    </Link>);
}
function DocSearch({ contextualSearch, externalUrlRegex, ...props }) {
    const { siteMetadata } = useDocusaurusContext();
    const contextualSearchFacetFilters = useTypesenseContextualFilters();
    const configFacetFilters = props.typesenseSearchParameters?.filter_by ?? '';
    const facetFilters = contextualSearch
        ? // Merge contextual search filters with config filters
            [contextualSearchFacetFilters, configFacetFilters]
                .filter((e) => e)
                .join(' && ')
        : // ... or use config facetFilters
            configFacetFilters;
    // we let user override default searchParameters if he wants to
    const typesenseSearchParameters = {
        filter_by: facetFilters,
        ...props.typesenseSearchParameters,
    };
    const typesenseServerConfig = props.typesenseServerConfig;
    const typesenseCollectionName = props.typesenseCollectionName;
    const { withBaseUrl } = useBaseUrlUtils();
    const history = useHistory();
    const searchContainer = useRef(null);
    const searchButtonRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [initialQuery, setInitialQuery] = useState(undefined);
    const importDocSearchModalIfNeeded = useCallback(() => {
        if (DocSearchModal) {
            return Promise.resolve();
        }
        return Promise.all([
            // @ts-ignore
            import('typesense-docsearch-react/modal'),
            // @ts-ignore
            import('typesense-docsearch-react/style'),
            // @ts-ignore
            import('./styles.css'),
        ]).then(([{ DocSearchModal: Modal }]) => {
            DocSearchModal = Modal;
        });
    }, []);
    const onOpen = useCallback(() => {
        importDocSearchModalIfNeeded().then(() => {
            searchContainer.current = document.createElement('div');
            document.body.insertBefore(searchContainer.current, document.body.firstChild);
            setIsOpen(true);
        });
    }, [importDocSearchModalIfNeeded, setIsOpen]);
    const onClose = useCallback(() => {
        setIsOpen(false);
        searchContainer.current?.remove();
    }, [setIsOpen]);
    const onInput = useCallback((event) => {
        importDocSearchModalIfNeeded().then(() => {
            setIsOpen(true);
            setInitialQuery(event.key);
        });
    }, [importDocSearchModalIfNeeded, setIsOpen, setInitialQuery]);
    const navigator = useRef({
        navigate({ itemUrl }) {
            // Algolia results could contain URL's from other domains which cannot
            // be served through history and should navigate with window.location
            if (isRegexpStringMatch(externalUrlRegex, itemUrl)) {
                window.location.href = itemUrl;
            }
            else {
                history.push(itemUrl);
            }
        },
    }).current;
    const transformItems = useRef((items) => items.map((item) => {
        // If result contains a external domain, we should navigate without
        // relative URL
        if (isRegexpStringMatch(externalUrlRegex, item.url)) {
            return item;
        }
        // We transform the absolute URL into a relative URL.
        const url = new URL(item.url);
        return {
            ...item,
            url: withBaseUrl(`${url.pathname}${url.hash}`),
        };
    })).current;
    const resultsFooterComponent = useMemo(() => 
    // eslint-disable-next-line react/no-unstable-nested-components
    (footerProps) => <ResultsFooter {...footerProps} onClose={onClose}/>, [onClose]);
    useDocSearchKeyboardEvents({
        isOpen,
        onOpen,
        onClose,
        onInput,
        searchButtonRef,
    });
    return (<>
      <DocSearchButton onTouchStart={importDocSearchModalIfNeeded} onFocus={importDocSearchModalIfNeeded} onMouseOver={importDocSearchModalIfNeeded} onClick={onOpen} ref={searchButtonRef} translations={translations.button}/>

      {isOpen &&
            DocSearchModal &&
            searchContainer.current &&
            createPortal(<DocSearchModal onClose={onClose} initialScrollY={window.scrollY} initialQuery={initialQuery} navigator={navigator} transformItems={transformItems} hitComponent={Hit} {...(props.searchPagePath && {
                resultsFooterComponent,
            })} {...props} typesenseSearchParameters={typesenseSearchParameters} typesenseServerConfig={typesenseServerConfig} typesenseCollectionName={typesenseCollectionName} placeholder={translations.placeholder} translations={translations.modal}/>, searchContainer.current)}
    </>);
}
export default function SearchBar() {
    const { siteConfig } = useDocusaurusContext();
    return (<DocSearch {...siteConfig.themeConfig.typesense}/>);
}
