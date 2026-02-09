/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { translate } from '@docusaurus/Translate';
const translations = {
    button: {
        buttonText: translate({
            id: 'theme.SearchBar.label',
            message: 'جستجو',
            description: 'The ARIA label and placeholder for search button',
        }),
        buttonAriaLabel: translate({
            id: 'theme.SearchBar.label',
            message: 'جستجو',
            description: 'The ARIA label and placeholder for search button',
        }),
    },
    modal: {
        searchBox: {
            resetButtonTitle: translate({
                id: 'theme.SearchModal.searchBox.resetButtonTitle',
                message: 'پاک کردن عبارت جستجو',
                description: 'The label and ARIA label for search box reset button',
            }),
            resetButtonAriaLabel: translate({
                id: 'theme.SearchModal.searchBox.resetButtonTitle',
                message: 'پاک کردن عبارت جستجو',
                description: 'The label and ARIA label for search box reset button',
            }),
            cancelButtonText: translate({
                id: 'theme.SearchModal.searchBox.cancelButtonText',
                message: 'لغو',
                description: 'The label and ARIA label for search box cancel button',
            }),
            cancelButtonAriaLabel: translate({
                id: 'theme.SearchModal.searchBox.cancelButtonText',
                message: 'لغو',
                description: 'The label and ARIA label for search box cancel button',
            }),
        },
        startScreen: {
            recentSearchesTitle: translate({
                id: 'theme.SearchModal.startScreen.recentSearchesTitle',
                message: 'اخیر',
                description: 'The title for recent searches',
            }),
            noRecentSearchesText: translate({
                id: 'theme.SearchModal.startScreen.noRecentSearchesText',
                message: 'جستجوهای اخیری وجود ندارد',
                description: 'The text when no recent searches',
            }),
            saveRecentSearchButtonTitle: translate({
                id: 'theme.SearchModal.startScreen.saveRecentSearchButtonTitle',
                message: 'ذخیره این جستجو',
                description: 'The label for save recent search button',
            }),
            removeRecentSearchButtonTitle: translate({
                id: 'theme.SearchModal.startScreen.removeRecentSearchButtonTitle',
                message: 'حذف این جستجو از تاریخچه',
                description: 'The label for remove recent search button',
            }),
            favoriteSearchesTitle: translate({
                id: 'theme.SearchModal.startScreen.favoriteSearchesTitle',
                message: 'مورد علاقه',
                description: 'The title for favorite searches',
            }),
            removeFavoriteSearchButtonTitle: translate({
                id: 'theme.SearchModal.startScreen.removeFavoriteSearchButtonTitle',
                message: 'حذف این جستجو از مورد علاقه‌ها',
                description: 'The label for remove favorite search button',
            }),
        },
        errorScreen: {
            titleText: translate({
                id: 'theme.SearchModal.errorScreen.titleText',
                message: 'دریافت نتایج ممکن نیست',
                description: 'The title for error screen of search modal',
            }),
            helpText: translate({
                id: 'theme.SearchModal.errorScreen.helpText',
                message: 'اتصال شبکه خود را بررسی کنید.',
                description: 'The help text for error screen of search modal',
            }),
        },
        footer: {
            selectText: translate({
                id: 'theme.SearchModal.footer.selectText',
                message: 'برای انتخاب',
                description: 'The explanatory text of the action for the enter key',
            }),
            selectKeyAriaLabel: translate({
                id: 'theme.SearchModal.footer.selectKeyAriaLabel',
                message: 'دکمه اینتر',
                description: 'The ARIA label for the Enter key button that makes the selection',
            }),
            navigateText: translate({
                id: 'theme.SearchModal.footer.navigateText',
                message: 'برای حرکت',
                description: 'The explanatory text of the action for the Arrow up and Arrow down key',
            }),
            navigateUpKeyAriaLabel: translate({
                id: 'theme.SearchModal.footer.navigateUpKeyAriaLabel',
                message: 'فلش بالا',
                description: 'The ARIA label for the Arrow up key button that makes the navigation',
            }),
            navigateDownKeyAriaLabel: translate({
                id: 'theme.SearchModal.footer.navigateDownKeyAriaLabel',
                message: 'فلش پایین',
                description: 'The ARIA label for the Arrow down key button that makes the navigation',
            }),
            closeText: translate({
                id: 'theme.SearchModal.footer.closeText',
                message: 'برای بستن',
                description: 'The explanatory text of the action for Escape key',
            }),
            closeKeyAriaLabel: translate({
                id: 'theme.SearchModal.footer.closeKeyAriaLabel',
                message: 'دکمه Escape',
                description: 'The ARIA label for the Escape key button that close the modal',
            }),
            searchByText: translate({
                id: 'theme.SearchModal.footer.searchByText',
                message: 'جستجو با',
                description: 'The text explain that the search is making by Typesense',
            }),
        },
        noResultsScreen: {
            noResultsText: translate({
                id: 'theme.SearchModal.noResultsScreen.noResultsText',
                message: 'نتیجه‌ای برای',
                description: 'The text explains that there are no results for the following search',
            }),
            suggestedQueryText: translate({
                id: 'theme.SearchModal.noResultsScreen.suggestedQueryText',
                message: 'جستجو برای',
                description: 'The text for the suggested query when no results are found for the following search',
            }),
            reportMissingResultsText: translate({
                id: 'theme.SearchModal.noResultsScreen.reportMissingResultsText',
                message: 'فکر می‌کنید این جستجو باید نتیجه داشته باشد؟',
                description: 'The text for the question where the user thinks there are missing results',
            }),
            reportMissingResultsLinkText: translate({
                id: 'theme.SearchModal.noResultsScreen.reportMissingResultsLinkText',
                message: 'به ما بگویید.',
                description: 'The text for the link to report missing results',
            }),
        },
    },
    placeholder: translate({
        id: 'theme.SearchModal.placeholder',
        message: 'جستجو در مستندات',
        description: 'The placeholder of the input of the DocSearch pop-up modal',
    }),
};
export default translations;
