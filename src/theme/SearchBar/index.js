/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState, useRef, useCallback, useMemo} from 'react';
import {createPortal} from 'react-dom';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useHistory} from '@docusaurus/router';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import useSearchQuery from '@theme/hooks/useSearchQuery';
import {DocSearchButton, useDocSearchKeyboardEvents} from '@docsearch/react';
import useTypesenseContextualFilters from '@theme/hooks/useTypesenseContextualFilters';
import {translate} from '@docusaurus/Translate';
import styles from './styles.module.css';
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";

let DocSearchModal = null;

function Hit({hit, children}) {
  return <Link to={hit.url}>{children}</Link>;
}

function ResultsFooter({state, onClose}) {
  const {generateSearchPageLink} = useSearchQuery();

  return (
    <Link to={generateSearchPageLink(state.query)} onClick={onClose}>
      See all {state.context.nbHits} results
    </Link>
  );
}

function DocSearch({contextualSearch, ...props}) {
  const {siteMetadata} = useDocusaurusContext();

  const contextualSearchFilters = useTypesenseContextualFilters();

  const configFilters = props.searchParameters?.filterBy ?? [];

  const filterBy = contextualSearch
    ? // Merge contextual search filters with config filters
      [...contextualSearchFilters, ...configFilters]
    : // ... or use config facetFilters
      configFilters;

  // we let user override default searchParameters if he wants to
  const searchParameters = {
    ...props.searchParameters,
    filterBy,
    queryBy: 'hierarchy.lvl0,hierarchy.lvl1,hierarchy.lvl2,hierarchy.lvl3,hierarchy.lvl4,hierarchy.lvl5,hierarchy.lvl6,content',
    includeFields:
      'hierarchy.lvl0,hierarchy.lvl1,hierarchy.lvl2,hierarchy.lvl3,hierarchy.lvl4,hierarchy.lvl5,hierarchy.lvl6,content,anchor,url,type,id',
    highlightFullFields:
      'hierarchy.lvl0,hierarchy.lvl1,hierarchy.lvl2,hierarchy.lvl3,hierarchy.lvl4,hierarchy.lvl5,hierarchy.lvl6,content',
    group_by: 'url',
    group_limit: 3,
  };

  const typesenseServerConfig = props.serverConfig;

  const {withBaseUrl} = useBaseUrlUtils();
  const history = useHistory();
  const searchContainer = useRef(null);
  const searchButtonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState(null);

  const importDocSearchModalIfNeeded = useCallback(() => {
    if (DocSearchModal) {
      return Promise.resolve();
    }

    return Promise.all([
      import('@docsearch/react/modal'),
      import('@docsearch/react/style'),
      import('./styles.css'),
    ]).then(([{DocSearchModal: Modal}]) => {
      DocSearchModal = Modal;
    });
  }, []);

  const onOpen = useCallback(() => {
    importDocSearchModalIfNeeded().then(() => {
      searchContainer.current = document.createElement('div');
      document.body.insertBefore(
        searchContainer.current,
        document.body.firstChild,
      );
      setIsOpen(true);
    });
  }, [importDocSearchModalIfNeeded, setIsOpen]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    searchContainer.current.remove();
  }, [setIsOpen]);

  const onInput = useCallback(
    (event) => {
      importDocSearchModalIfNeeded().then(() => {
        setIsOpen(true);
        setInitialQuery(event.key);
      });
    },
    [importDocSearchModalIfNeeded, setIsOpen, setInitialQuery],
  );

  const navigator = useRef({
    navigate({itemUrl}) {
      history.push(itemUrl);
    },
  }).current;

  const transformItems = useRef((items) => {
    return items.map((item) => {
      // We transform the absolute URL into a relative URL.
      // Alternatively, we can use `new URL(item.url)` but it's not
      // supported in IE.
      const a = document.createElement('a');
      a.href = item.url;

      return {
        ...item,
        url: withBaseUrl(`${a.pathname}${a.hash}`),
      };
    });
  }).current;

  const resultsFooterComponent = useMemo(
    () => (footerProps) => <ResultsFooter {...footerProps} onClose={onClose} />,
    [onClose],
  );

  const transformSearchClient = useCallback(
    (searchClient) => {
      const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
        server: typesenseServerConfig,
        // The following parameters are directly passed to Typesense's search API endpoint.
        //  So you can pass any parameters supported by the search endpoint below.
        //  queryBy is required.
        additionalSearchParameters: searchParameters,
      });

      return typesenseInstantsearchAdapter.searchClient;
    },
    [siteMetadata.docusaurusVersion],
  );

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
    onInput,
    searchButtonRef,
  });

  const translatedSearchLabel = translate({
    id: 'theme.SearchBar.label',
    message: 'Search',
    description: 'The ARIA label and placeholder for search button',
  });

  return (
    <>
      <div className={styles.searchBox}>
        <DocSearchButton
          onTouchStart={importDocSearchModalIfNeeded}
          onFocus={importDocSearchModalIfNeeded}
          onMouseOver={importDocSearchModalIfNeeded}
          onClick={onOpen}
          ref={searchButtonRef}
          translations={{
            buttonText: translatedSearchLabel,
            buttonAriaLabel: translatedSearchLabel,
          }}
        />
      </div>

      {isOpen &&
        createPortal(
          <DocSearchModal
            onClose={onClose}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery}
            navigator={navigator}
            transformItems={transformItems}
            hitComponent={Hit}
            resultsFooterComponent={resultsFooterComponent}
            transformSearchClient={transformSearchClient}
            {...props}
            searchParameters={searchParameters}
          />,
          searchContainer.current,
        )}
    </>
  );
}

function SearchBar() {
  const {siteConfig} = useDocusaurusContext();
  return <DocSearch {...siteConfig.themeConfig.typesense} />;
}

export default SearchBar;
