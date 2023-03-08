/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jsx-a11y/no-autofocus */

import React, {useEffect, useState, useReducer, useRef} from 'react';
import clsx from 'clsx';

import algoliaSearchHelper from 'algoliasearch-helper';

import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import {
  HtmlClassNameProvider,
  usePluralForm,
  isRegexpStringMatch,
  useEvent,
  // @ts-ignore
} from '@docusaurus/theme-common';
import {useSearchPage} from '../../hooks/useSearchPage';
// @ts-ignore
import {useTitleFormatter} from '../../utils/generalUtils';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useAllDocsData} from '@docusaurus/plugin-content-docs/client';
import Translate, {translate} from '@docusaurus/Translate';
import Layout from '@theme/Layout';

import styles from './styles.module.css';
import type {ThemeConfig} from 'docusaurus-theme-search-typesense';
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';

// Very simple pluralization: probably good enough for now
function useDocumentsFoundPlural() {
  const {selectMessage} = usePluralForm();
  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          id: 'theme.SearchPage.documentsFound.plurals',
          description:
            'Pluralized label for "{count} documents found". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: 'One document found|{count} documents found',
        },
        {count},
      ),
    );
}

function useDocsSearchVersionsHelpers() {
  const allDocsData = useAllDocsData();

  // State of the version select menus / algolia facet filters
  // docsPluginId -> versionName map
  const [searchVersions, setSearchVersions] = useState<{
    [pluginId: string]: string;
  }>(() =>
    Object.entries(allDocsData).reduce(
      (acc, [pluginId, pluginData]) => ({
        ...acc,
        [pluginId]: pluginData.versions[0]!.name,
      }),
      {},
    ),
  );

  // Set the value of a single select menu
  const setSearchVersion = (pluginId: string, searchVersion: string) =>
    setSearchVersions((s) => ({...s, [pluginId]: searchVersion}));

  const versioningEnabled = Object.values(allDocsData).some(
    (docsData) => docsData.versions.length > 1,
  );

  return {
    allDocsData,
    versioningEnabled,
    searchVersions,
    setSearchVersion,
  };
}

// We want to display one select per versioned docs plugin instance
function SearchVersionSelectList({
  docsSearchVersionsHelpers,
}: {
  docsSearchVersionsHelpers: ReturnType<typeof useDocsSearchVersionsHelpers>;
}) {
  const versionedPluginEntries = Object.entries(
    docsSearchVersionsHelpers.allDocsData,
  )
    // Do not show a version select for unversioned docs plugin instances
    .filter(([, docsData]) => docsData.versions.length > 1);

  return (
    <div
      className={clsx(
        'col',
        'col--3',
        'padding-left--none',
        styles.searchVersionColumn,
      )}>
      {versionedPluginEntries.map(([pluginId, docsData]) => {
        const labelPrefix =
          versionedPluginEntries.length > 1 ? `${pluginId}: ` : '';
        return (
          <select
            key={pluginId}
            onChange={(e) =>
              docsSearchVersionsHelpers.setSearchVersion(
                pluginId,
                e.target.value,
              )
            }
            defaultValue={docsSearchVersionsHelpers.searchVersions[pluginId]}
            className={styles.searchVersionInput}>
            {docsData.versions.map((version, i) => (
              <option
                key={i}
                label={`${labelPrefix}${version.label}`}
                value={version.name}
              />
            ))}
          </select>
        );
      })}
    </div>
  );
}

type ResultDispatcherState = {
  items: {
    title: string;
    url: string;
    summary: string;
    breadcrumbs: string[];
  }[];
  query: string | null;
  totalResults: number | null;
  totalPages: number | null;
  lastPage: number | null;
  hasMore: boolean | null;
  loading: boolean | null;
};

type ResultDispatcher =
  | {type: 'reset'; value?: undefined}
  | {type: 'loading'; value?: undefined}
  | {type: 'update'; value: ResultDispatcherState}
  | {type: 'advance'; value?: undefined};

function SearchPageContent(): JSX.Element {
  const {
    siteConfig: {themeConfig},
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const {
    typesense: {
      typesenseCollectionName,
      typesenseServerConfig,
      typesenseSearchParameters,
      externalUrlRegex,
    },
  } = themeConfig as ThemeConfig;
  const documentsFoundPlural = useDocumentsFoundPlural();

  const docsSearchVersionsHelpers = useDocsSearchVersionsHelpers();
  const {searchQuery, setSearchQuery} = useSearchPage();
  const initialSearchResultState: ResultDispatcherState = {
    items: [],
    query: null,
    totalResults: null,
    totalPages: null,
    lastPage: null,
    hasMore: null,
    loading: null,
  };
  const [searchResultState, searchResultStateDispatcher] = useReducer(
    (prevState: ResultDispatcherState, data: ResultDispatcher) => {
      switch (data.type) {
        case 'reset': {
          return initialSearchResultState;
        }
        case 'loading': {
          return {...prevState, loading: true};
        }
        case 'update': {
          if (searchQuery !== data.value.query) {
            return prevState;
          }

          return {
            ...data.value,
            items:
              data.value.lastPage === 0
                ? data.value.items
                : prevState.items.concat(data.value.items),
          };
        }
        case 'advance': {
          const hasMore = prevState.totalPages! > prevState.lastPage! + 1;

          return {
            ...prevState,
            lastPage: hasMore ? prevState.lastPage! + 1 : prevState.lastPage,
            hasMore,
          };
        }
        default:
          return prevState;
      }
    },
    initialSearchResultState,
  );

  const typesenseInstantSearchAdapter = new TypesenseInstantSearchAdapter({
    server: typesenseServerConfig,
    additionalSearchParameters: {
      query_by:
        'hierarchy.lvl0,hierarchy.lvl1,hierarchy.lvl2,hierarchy.lvl3,hierarchy.lvl4,hierarchy.lvl5,hierarchy.lvl6,content',
      include_fields:
        'hierarchy.lvl0,hierarchy.lvl1,hierarchy.lvl2,hierarchy.lvl3,hierarchy.lvl4,hierarchy.lvl5,hierarchy.lvl6,content,anchor,url,type,id',
      highlight_full_fields:
        'hierarchy.lvl0,hierarchy.lvl1,hierarchy.lvl2,hierarchy.lvl3,hierarchy.lvl4,hierarchy.lvl5,hierarchy.lvl6,content',
      group_by: 'url',
      group_limit: 3,
      highlight_affix_num_tokens: 50,
      ...typesenseSearchParameters,
    },
  });
  const algoliaHelper = algoliaSearchHelper(
    typesenseInstantSearchAdapter.searchClient,
    typesenseCollectionName,
    {
      hitsPerPage: 15,
      advancedSyntax: true,
      disjunctiveFacets: ['language', 'docusaurus_tag'],
    },
  );

  algoliaHelper.on(
    'result',
    ({results: {query, hits, page, nbHits, nbPages}}) => {
      if (query === '' || !Array.isArray(hits)) {
        searchResultStateDispatcher({type: 'reset'});
        return;
      }

      const sanitizeValue = (value: string) =>
        value.replace(
          /algolia-docsearch-suggestion--highlight/g,
          'search-result-match',
        );

      const items = hits.map(
        ({
          url,
          _highlightResult,
          _snippetResult: snippet = {},
        }: {
          url: string;
          _highlightResult: {[key: string]: {value: string}};
          _snippetResult: {content?: {value: string}};
        }) => {
          const parsedURL = new URL(url);
          const titles = [0, 1, 2, 3, 4, 5, 6]
            .map((lvl) => {
              const highlightResult = _highlightResult[`hierarchy.lvl${lvl}`];
              return highlightResult
                ? sanitizeValue(highlightResult.value)
                : '';
            })
            .filter((v) => v);

          return {
            title: titles.pop()!,
            url: isRegexpStringMatch(externalUrlRegex, parsedURL.href)
              ? parsedURL.href
              : parsedURL.pathname + parsedURL.hash,
            summary: snippet.content
              ? `${sanitizeValue(snippet.content.value)}...`
              : '',
            breadcrumbs: titles,
          };
        },
      );

      searchResultStateDispatcher({
        type: 'update',
        value: {
          items,
          query,
          totalResults: nbHits,
          totalPages: nbPages,
          lastPage: page,
          hasMore: nbPages > page + 1,
          loading: false,
        },
      });
    },
  );

  algoliaHelper.on('error', function (e) {
    console.error(e);
  });

  const [loaderRef, setLoaderRef] = useState<HTMLDivElement | null>(null);
  const prevY = useRef(0);
  const observer = useRef(
    ExecutionEnvironment.canUseIntersectionObserver &&
      new IntersectionObserver(
        (entries) => {
          const {
            isIntersecting,
            boundingClientRect: {y: currentY},
          } = entries[0]!;

          if (isIntersecting && prevY.current > currentY) {
            searchResultStateDispatcher({type: 'advance'});
          }

          prevY.current = currentY;
        },
        {threshold: 1},
      ),
  );

  const getTitle = () =>
    searchQuery
      ? translate(
          {
            id: 'theme.SearchPage.existingResultsTitle',
            message: 'Search results for "{query}"',
            description: 'The search page title for non-empty query',
          },
          {
            query: searchQuery,
          },
        )
      : translate({
          id: 'theme.SearchPage.emptyResultsTitle',
          message: 'Search the documentation',
          description: 'The search page title for empty query',
        });

  const makeSearch = useEvent((page: number = 0) => {
    algoliaHelper.addDisjunctiveFacetRefinement('docusaurus_tag', 'default');
    algoliaHelper.addDisjunctiveFacetRefinement('language', currentLocale);

    Object.entries(docsSearchVersionsHelpers.searchVersions).forEach(
      ([pluginId, searchVersion]) => {
        algoliaHelper.addDisjunctiveFacetRefinement(
          'docusaurus_tag',
          `docs-${pluginId}-${searchVersion}`,
        );
      },
    );

    algoliaHelper.setQuery(searchQuery).setPage(page).search();
  });

  useEffect(() => {
    if (!loaderRef) {
      return undefined;
    }
    const currentObserver = observer.current;
    if (currentObserver) {
      currentObserver.observe(loaderRef);
      return () => currentObserver.unobserve(loaderRef);
    }
    return () => true;
  }, [loaderRef]);

  useEffect(() => {
    searchResultStateDispatcher({type: 'reset'});

    if (searchQuery) {
      searchResultStateDispatcher({type: 'loading'});

      setTimeout(() => {
        makeSearch();
      }, 300);
    }
  }, [searchQuery, docsSearchVersionsHelpers.searchVersions, makeSearch]);

  useEffect(() => {
    if (!searchResultState.lastPage || searchResultState.lastPage === 0) {
      return;
    }

    makeSearch(searchResultState.lastPage);
  }, [makeSearch, searchResultState.lastPage]);

  return (
    <Layout>
      <Head>
        <title>{useTitleFormatter(getTitle())}</title>
        {/*
         We should not index search pages
          See https://github.com/facebook/docusaurus/pull/3233
        */}
        <meta property="robots" content="noindex, follow" />
      </Head>

      <div className="container margin-vert--lg">
        <h1>{getTitle()}</h1>

        <form className="row" onSubmit={(e) => e.preventDefault()}>
          <div
            className={clsx('col', styles.searchQueryColumn, {
              'col--9': docsSearchVersionsHelpers.versioningEnabled,
              'col--12': !docsSearchVersionsHelpers.versioningEnabled,
            })}>
            <input
              type="search"
              name="q"
              className={styles.searchQueryInput}
              placeholder={translate({
                id: 'theme.SearchPage.inputPlaceholder',
                message: 'Type your search here',
                description: 'The placeholder for search page input',
              })}
              aria-label={translate({
                id: 'theme.SearchPage.inputLabel',
                message: 'Search',
                description: 'The ARIA label for search page input',
              })}
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              autoComplete="off"
              autoFocus
            />
          </div>

          {docsSearchVersionsHelpers.versioningEnabled && (
            <SearchVersionSelectList
              docsSearchVersionsHelpers={docsSearchVersionsHelpers}
            />
          )}
        </form>

        <div className="row">
          <div className={clsx('col', 'col--8', styles.searchResultsColumn)}>
            {!!searchResultState.totalResults &&
              documentsFoundPlural(searchResultState.totalResults)}
          </div>

          <div
            className={clsx(
              'col',
              'col--4',
              'text--right',
              styles.searchLogoColumn,
            )}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://typesense.org/?utm_medium=referral&utm_content=powered_by&utm_campaign=docsearch`}
              aria-label={translate({
                id: 'theme.SearchPage.typesenseLabel',
                message: 'Search by Typesense',
                description: 'The ARIA label for Typesense mention',
              })}>
              <svg
                fill="none"
                height="21"
                viewBox="0 0 141 21"
                width="141"
                xmlns="http://www.w3.org/2000/svg">
                <clipPath id="a">
                  <path d="m0 0h141v21h-141z" />
                </clipPath>
                <g clipPath="url(#a)">
                  <g fill="#1035bc">
                    <path d="m62.0647 6.453c.0371.19.0557.37367.0557.551 0 .16467-.0186.342-.0557.532l-2.3561-.019v6.384c0 .532.2412.798.7235.798h1.41c.0866.2153.1299.4307.1299.646s-.0124.3483-.0371.399c-.569.076-1.1564.114-1.7625.114-1.1997 0-1.7995-.5257-1.7995-1.577v-6.764l-1.3172.019c-.0371-.19-.0557-.36733-.0557-.532 0-.17733.0186-.361.0557-.551l1.3172.019v-1.995c0-.342.0494-.58267.1484-.722.0989-.152.2906-.228.5751-.228h.5009l.1113.114v2.85z" />
                    <path d="m71.0419 6.548-2.5416 8.911c-.47 1.634-.9709 2.7867-1.5027 3.458s-1.3296 1.007-2.3932 1.007c-.5442 0-1.0452-.0823-1.5028-.247-.0371-.3547.0619-.6967.2969-1.026.3834.1393.7915.209 1.2244.209.6555 0 1.1564-.228 1.5027-.684s.6617-1.1653.9462-2.128l.0556-.19c-.3215-.0253-.5689-.1013-.742-.228-.1608-.1267-.2969-.361-.4082-.703l-2.5973-8.36c.3834-.16467.6555-.247.8163-.247.3587 0 .5999.22167.7235.665l1.4657 4.769c.0494.152.3339 1.14.8534 2.964.0247.0887.0865.133.1855.133l2.2633-8.398c.1608-.05067.3711-.076.6308-.076.2721 0 .5009.038.6864.114z" />
                    <path d="m74.6067 15.155v3.762c0 .342-.0495.5827-.1484.722-.0989.152-.2968.228-.5937.228h-.5009l-.1113-.114v-13.243l.1113-.114h.4824c.2968 0 .4947.08233.5936.247.1114.152.167.40533.167.76v.095c.7421-.84867 1.6264-1.273 2.653-1.273 1.0513 0 1.8428.437 2.3746 1.311.5319.86133.7978 2.05834.7978 3.591 0 .7473-.099 1.4187-.2968 2.014-.1856.5953-.4391 1.102-.7607 1.52-.3092.4053-.6679.722-1.076.95-.4082.2153-.8287.323-1.2616.323-.8534 0-1.6635-.2597-2.4303-.779zm0-6.175v4.883c.7545.57 1.4656.855 2.1335.855s1.2183-.304 1.6512-.912c.4328-.608.6493-1.5263.6493-2.755 0-.608-.0557-1.13366-.167-1.577-.0989-.456-.235-.82967-.4081-1.121-.1732-.304-.3773-.52567-.6123-.665-.2226-.152-.4638-.228-.7235-.228-.4947 0-.9647.133-1.41.399-.4452.266-.8163.63967-1.1131 1.121z" />
                    <path d="m89.8263 11.545h-5.7512c.0619 2.1533.8596 3.23 2.3932 3.23.8411 0 1.7378-.266 2.6901-.798.2721.2533.4391.5763.5009.969-1.0142.7093-2.152 1.064-3.4136 1.064-.6431 0-1.1935-.1203-1.6511-.361-.4576-.2533-.8349-.5953-1.1317-1.026-.2845-.4433-.4947-.9627-.6308-1.558-.136-.5953-.204-1.2477-.204-1.957 0-.722.0803-1.38067.2411-1.976.1732-.59533.4205-1.10833.7421-1.539s.705-.76633 1.1503-1.007c.4576-.24067.977-.361 1.5583-.361.569 0 1.0761.10767 1.5213.323.4576.20267.8349.48767 1.1317.855.3092.35467.5442.78533.705 1.292.1608.494.2411 1.026.2411 1.596 0 .228-.0123.4497-.0371.665-.0123.2027-.0309.399-.0556.589zm-5.7512-1.083h4.4525v-.247c0-.874-.1793-1.577-.538-2.109s-.8967-.798-1.614-.798c-.705 0-1.2554.285-1.6512.855-.3834.57-.5998 1.33633-.6493 2.299z" />
                    <path d="m91.7359 15.117c.0123-.2787.0865-.5827.2226-.912.1484-.342.3154-.608.5009-.798.9771.5447 1.8367.817 2.5787.817.4082 0 .7359-.0823.9833-.247.2597-.1647.3896-.3863.3896-.665 0-.4433-.3339-.798-1.0018-1.064l-1.0389-.399c-1.5584-.5827-2.3376-1.5137-2.3376-2.793 0-.456.0804-.86133.2412-1.216.1731-.36733.4081-.67767.705-.931.3092-.266.674-.46867 1.0945-.608s.8905-.209 1.41-.209c.235 0 .4947.019.7792.057.2968.038.5937.095.8905.171.2968.06333.5813.13933.8534.228s.5071.18367.705.285c0 .31667-.0619.646-.1856.988-.1236.342-.2906.59533-.5009.76-.977-.44333-1.8243-.665-2.5416-.665-.3216 0-.5751.08233-.7606.247-.1856.152-.2783.35467-.2783.608 0 .39267.3092.703.9276.931l1.1317.418c.8163.2913 1.4223.6903 1.8181 1.197.3957.5067.5936 1.0957.5936 1.767 0 .8993-.3277 1.6213-.9832 2.166-.6555.532-1.5955.798-2.8199.798-1.1998 0-2.3253-.3103-3.3765-.931z" />
                    <path d="m107.996 11.868h-5.121c.037.6967.192 1.2477.464 1.653.284.3927.773.589 1.466.589.717 0 1.539-.2153 2.467-.646.359.38.587.8803.686 1.501-.989.722-2.176 1.083-3.562 1.083-1.311 0-2.306-.4117-2.987-1.235-.667-.836-1.001-2.071-1.001-3.705 0-.76.086-1.444.259-2.052.174-.62067.427-1.14633.761-1.577.334-.44333.742-.78533 1.224-1.026.483-.24067 1.033-.361 1.652-.361.63 0 1.187.10133 1.669.304.483.19.891.46867 1.225.836.334.35467.581.779.742 1.273.173.494.26 1.03233.26 1.615 0 .3167-.019.6207-.056.912-.037.2787-.087.5573-.148.836zm-3.581-3.99c-.965 0-1.484.74733-1.558 2.242h3.079v-.228c0-.608-.123-1.09567-.371-1.463-.247-.36733-.631-.551-1.15-.551z" />
                    <path d="m118.163 9.436v4.142c0 .8107.13 1.4123.39 1.805-.396.3547-.872.532-1.429.532-.532 0-.897-.1203-1.095-.361-.197-.2533-.296-.646-.296-1.178v-4.427c0-.57-.068-.969-.204-1.197-.137-.228-.39-.342-.761-.342-.656 0-1.268.304-1.837.912v6.46c-.185.038-.383.0633-.593.076-.198.0127-.402.019-.613.019-.21 0-.42-.0063-.63-.019-.198-.0127-.39-.038-.576-.076v-9.405l.112-.133h.927c.693 0 1.126.38 1.299 1.14.903-.798 1.8-1.197 2.69-1.197.891 0 1.546.29767 1.967.893.433.58267.649 1.368.649 2.356z" />
                    <path d="m120.109 15.117c.012-.2787.087-.5827.223-.912.148-.342.315-.608.501-.798.977.5447 1.836.817 2.578.817.408 0 .736-.0823.984-.247.259-.1647.389-.3863.389-.665 0-.4433-.334-.798-1.002-1.064l-1.039-.399c-1.558-.5827-2.337-1.5137-2.337-2.793 0-.456.08-.86133.241-1.216.173-.36733.408-.67767.705-.931.309-.266.674-.46867 1.095-.608.42-.13933.89-.209 1.41-.209.235 0 .494.019.779.057.297.038.593.095.89.171.297.06333.582.13933.854.228s.507.18367.705.285c0 .31667-.062.646-.186.988s-.291.59533-.501.76c-.977-.44333-1.824-.665-2.541-.665-.322 0-.576.08233-.761.247-.186.152-.278.35467-.278.608 0 .39267.309.703.927.931l1.132.418c.816.2913 1.422.6903 1.818 1.197s.594 1.0957.594 1.767c0 .8993-.328 1.6213-.984 2.166-.655.532-1.595.798-2.819.798-1.2 0-2.326-.3103-3.377-.931z" />
                    <path d="m136.369 11.868h-5.121c.037.6967.192 1.2477.464 1.653.285.3927.773.589 1.466.589.717 0 1.54-.2153 2.467-.646.359.38.588.8803.687 1.501-.99.722-2.177 1.083-3.562 1.083-1.311 0-2.307-.4117-2.987-1.235-.668-.836-1.002-2.071-1.002-3.705 0-.76.086-1.444.26-2.052.173-.62067.426-1.14633.76-1.577.334-.44333.742-.78533 1.225-1.026.482-.24067 1.032-.361 1.651-.361.631 0 1.187.10133 1.67.304.482.19.89.46867 1.224.836.334.35467.581.779.742 1.273.173.494.26 1.03233.26 1.615 0 .3167-.019.6207-.056.912-.037.2787-.086.5573-.148.836zm-3.581-3.99c-.965 0-1.484.74733-1.558 2.242h3.079v-.228c0-.608-.123-1.09567-.371-1.463-.247-.36733-.63-.551-1.15-.551z" />
                    <path d="m139.245 18.442v-17.385c.186-.038.396-.057.631-.057.247 0 .476.019.686.057v17.385c-.21.038-.439.057-.686.057-.235 0-.445-.019-.631-.057z" />
                  </g>
                  <path
                    d="m2.648 14.604c.216.144.556.272 1.02.384s.872.168 1.224.168c.592 0 1.104-.092 1.536-.276.44-.184.772-.436.996-.756.232-.32.348-.688.348-1.104 0-.384-.08-.712-.24-.984-.16-.28-.396-.528-.708-.744-.304-.216-.708-.44-1.212-.672-.56-.256-.984-.468-1.272-.636s-.512-.352-.672-.552c-.152-.208-.228-.456-.228-.744 0-.384.156-.684.468-.9.32-.216.744-.324 1.272-.324.352 0 .648.036.888.108.248.072.52.176.816.312l.324-.732c-.28-.144-.604-.264-.972-.36-.36-.096-.732-.144-1.116-.144-.52 0-.98.092-1.38.276-.392.176-.696.42-.912.732-.208.312-.312.66-.312 1.044 0 .544.172 1.004.516 1.38.352.376.9.724 1.644 1.044.52.224.928.424 1.224.6.304.168.536.36.696.576.16.208.24.452.24.732 0 .392-.172.712-.516.96-.336.24-.816.36-1.44.36-.352 0-.712-.048-1.08-.144-.36-.104-.668-.22-.924-.348zm11.0963-2.364c0-.96-.204-1.736-.612-2.328-.4-.592-1.024-.888-1.872-.888-.56 0-1.048.132-1.46396.396-.408.256-.72.616-.936 1.08-.208.456-.312.98-.312 1.572 0 .936.26 1.684.78 2.244s1.27596.84 2.26796.84c.4 0 .764-.052 1.092-.156.328-.112.656-.26.984-.444l-.3-.696c-.36.176-.672.304-.936.384-.256.08-.54.12-.852.12-.688 0-1.2-.188-1.536-.564-.32796-.384-.50396-.904-.52796-1.56zm-4.19996-.648c.056-.544.224-.972.50396-1.284.288-.32.68-.48 1.176-.48.92 0 1.448.588 1.584 1.764zm5.84426-1.344c.288-.128.552-.224.792-.288.248-.072.544-.108.888-.108.44 0 .76.124.96.372.208.248.312.588.312 1.02v.324h-1.5c-.632 0-1.14.156-1.524.468s-.576.748-.576 1.308c0 .536.168.972.504 1.308.344.336.84.504 1.488.504.304 0 .616-.072.936-.216.32-.152.588-.328.804-.528l.12.588h.708v-4.02c0-.376-.096-.712-.288-1.008s-.46-.528-.804-.696-.736-.252-1.176-.252c-.264 0-.6.048-1.008.144-.4.096-.704.216-.912.36zm.228 3.096c0-.32.104-.588.312-.804.216-.224.512-.336.888-.336h1.536v1.32c-.216.256-.468.464-.756.624-.28.16-.576.24-.888.24-.36 0-.632-.104-.816-.312s-.276-.452-.276-.732zm6.0874-2.352c.272-.28.604-.524.996-.732.392-.216.748-.324 1.068-.324l-.228-.756c-.28 0-.604.1-.972.3s-.684.412-.948.636l-.3-.936h-.564v5.82h.948zm6.9986 2.952c-.28.144-.532.248-.756.312s-.512.096-.864.096c-.584 0-1.036-.212-1.356-.636s-.48-.976-.48-1.656c.008-.648.18-1.18.516-1.596.336-.424.792-.636 1.368-.636.336 0 .608.032.816.096.216.064.484.164.804.3l.288-.672c-.232-.152-.54-.276-.924-.372-.376-.104-.696-.156-.96-.156-.576 0-1.08.132-1.512.396-.432.256-.768.616-1.008 1.08-.232.456-.348.98-.348 1.572 0 .6.112 1.136.336 1.608.224.464.548.828.972 1.092.424.256.924.384 1.5.384.264 0 .588-.052.972-.156.384-.096.696-.22.936-.372zm4.6201-4.944c.616 0 1.072.188 1.368.564.304.368.456.864.456 1.488v3.936h-.948v-3.804c0-.432-.08-.768-.24-1.008s-.428-.36-.804-.36c-.288 0-.616.1-.984.3-.36.2-.68.452-.96.756v4.128h-.948v-8.352l.948-.12v3.396c.28-.272.612-.492.996-.66.392-.176.764-.264 1.116-.264zm8.5136.024c.864 0 1.54.284 2.028.852.496.56.744 1.304.744 2.232 0 .592-.116 1.12-.348 1.584-.224.456-.548.816-.972 1.08-.416.256-.908.384-1.476.384-.24 0-.496-.052-.768-.156-.264-.096-.512-.236-.744-.42l-.204.42h-.564v-8.352l.948-.12v2.94c.216-.144.444-.252.684-.324.24-.08.464-.12.672-.12zm0 5.328c.576 0 1.02-.208 1.332-.624s.472-.952.48-1.608c0-.688-.156-1.24-.468-1.656-.304-.424-.748-.636-1.332-.636-.288 0-.54.044-.756.132s-.42.224-.612.408v3.468c.192.168.396.296.612.384s.464.132.744.132zm5.0915 1.608c-.088.24-.224.42-.408.54-.176.128-.452.28-.828.456l.288.684c.424-.088.796-.26 1.116-.516.328-.256.56-.564.696-.924l2.568-7.02h-.96l-1.668 4.5-1.764-4.68-.84.36 2.16 5.604z"
                    fill="#000"
                    fillOpacity=".25"
                  />
                </g>
              </svg>
            </a>
          </div>
        </div>

        {searchResultState.items.length > 0 ? (
          <main>
            {searchResultState.items.map(
              ({title, url, summary, breadcrumbs}, i) => (
                <article key={i} className={styles.searchResultItem}>
                  <h2 className={styles.searchResultItemHeading}>
                    <Link to={url} dangerouslySetInnerHTML={{__html: title}} />
                  </h2>

                  {breadcrumbs.length > 0 && (
                    <nav aria-label="breadcrumbs">
                      <ul
                        className={clsx(
                          'breadcrumbs',
                          styles.searchResultItemPath,
                        )}>
                        {breadcrumbs.map((html, index) => (
                          <li
                            key={index}
                            className="breadcrumbs__item"
                            // Developer provided the HTML, so assume it's safe.
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{__html: html}}
                          />
                        ))}
                      </ul>
                    </nav>
                  )}

                  {summary && (
                    <p
                      className={styles.searchResultItemSummary}
                      // Developer provided the HTML, so assume it's safe.
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{__html: summary}}
                    />
                  )}
                </article>
              ),
            )}
          </main>
        ) : (
          [
            searchQuery && !searchResultState.loading && (
              <p key="no-results">
                <Translate
                  id="theme.SearchPage.noResultsText"
                  description="The paragraph for empty search result">
                  No results were found
                </Translate>
              </p>
            ),
            !!searchResultState.loading && (
              <div key="spinner" className={styles.loadingSpinner} />
            ),
          ]
        )}

        {searchResultState.hasMore && (
          <div className={styles.loader} ref={setLoaderRef}>
            <Translate
              id="theme.SearchPage.fetchingNewResults"
              description="The paragraph for fetching new search results">
              Fetching new results...
            </Translate>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function SearchPage(): JSX.Element {
  return (
    <HtmlClassNameProvider className="search-page-wrapper">
      <SearchPageContent />
    </HtmlClassNameProvider>
  );
}
