/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useContextualSearchFilters } from '@docusaurus/theme-common';

// Translate search-engine agnostic search filters to Algolia search filters
export default function useTypesenseContextualFilters() {
  const {locale, tags} = useContextualSearchFilters();

  // seems safe to convert locale->language, see AlgoliaSearchMetadatas comment
  const languageFilter = `language:=${locale}`;

  let tagsFilter
  if (tags.length > 0) {
    tagsFilter = `docusaurus_tag:=[${tags.join(',')}]`
  }

  return [languageFilter, tagsFilter].filter(e => e).join(' && ');
}
