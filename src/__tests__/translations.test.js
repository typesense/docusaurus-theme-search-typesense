/**
 * Basic sanity checks that our i18n JSON contains
 * different values for fa/en for key search labels.
 *
 * These tests do NOT spin up Docusaurus; they only
 * verify the data that Docusaurus will consume.
 */

const fa = require('../../i18n/fa/theme.json');
const en = require('../../i18n/en/theme.json');

describe('theme i18n translations', () => {
  test('SearchBar label differs between fa and en', () => {
    expect(fa['theme.SearchBar.label'].message).toBe('جستجو');
    expect(en['theme.SearchBar.label'].message).toBe('Search');
  });

  test('SearchModal placeholder differs between fa and en', () => {
    expect(fa['theme.SearchModal.placeholder'].message).toBe('جستجو در مستندات');
    expect(en['theme.SearchModal.placeholder'].message).toBe('Search the docs');
  });

  test('SearchPage input placeholder differs between fa and en', () => {
    expect(fa['theme.SearchPage.inputPlaceholder'].message).toBe(
      'عبارت خود را برای جستجو تایپ کنید',
    );
    expect(en['theme.SearchPage.inputPlaceholder'].message).toBe(
      'Type your search query',
    );
  });
});

