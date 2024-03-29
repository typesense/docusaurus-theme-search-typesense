/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/** Some utility functions around search queries. */
export declare function useSearchPage(): {
    /**
     * Works hand-in-hand with `setSearchQuery`; whatever the user has inputted
     * into the search box.
     */
    searchQuery: string;
    /**
     * Set a new search query. In addition to updating `searchQuery`, this handle
     * also mutates the location and appends the query.
     */
    setSearchQuery: (newSearchQuery: string) => void;
    /**
     * Given a query, this handle generates the corresponding search page link,
     * with base URL prepended.
     */
    generateSearchPageLink: (targetSearchQuery: string) => string;
};
