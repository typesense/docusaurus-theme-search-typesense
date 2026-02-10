/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module 'docusaurus-theme-search-typesense' {
  import type {DeepPartial} from 'utility-types';
  import type {TypesenseConfigurationOptions} from 'typesense/lib/Typesense/Configuration';
  import type {TypesenseSearchParams} from 'typesense/lib/Typesense/Documents';

  export type ThemeConfig = {
    typesense: {
      contextualSearch: boolean;
      externalUrlRegex?: string;
      typesenseCollectionName: string;
      typesenseServerConfig: TypesenseConfigurationOptions;
      typesenseSearchParameters: TypesenseSearchParams;
      searchPagePath: string | false | null;
      /** Override locale for search (e.g. when Docusaurus context is unavailable). Falls back after context and document.lang. */
      localeOverride?: string;
    };
  };
  export type UserThemeConfig = DeepPartial<ThemeConfig>;
}

declare module 'docusaurus-theme-search-typesense/client' {
  export function useTypesenseContextualFacetFilters(): [string, string[]];
}

declare module '@theme/SearchPage' {
  export default function SearchPage(): JSX.Element;
}

declare module '@theme/SearchBar' {
  export default function SearchBar(): JSX.Element;
}
