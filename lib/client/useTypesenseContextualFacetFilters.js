/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @ts-ignore Imported from peer dependency
import { useContextualSearchFilters } from '@docusaurus/theme-common';
export function useTypesenseContextualFilters() {
    const { locale, tags } = useContextualSearchFilters();
    const languageFilter = `language:=${locale}`;
    let tagsFilter;
    if (tags.length > 0) {
        tagsFilter = `docusaurus_tag:=[${tags.join(',')}]`;
    }
    return [languageFilter, tagsFilter].filter((e) => e).join(' && ');
}
