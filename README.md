# `docusaurus-theme-search-typesense`

[Typesense](https://typesense.org) search component for Docusaurus powered documentation sites.

This is a fork of the awesome [@docusaurus/theme-search-algolia](https://www.npmjs.com/package/@docusaurus/theme-search-algolia) library customized to work with Typesense.

#### About Typesense

If you're new to Typesense, it is an **open source search engine** that is simple to use, run and scale, with clean APIs and documentation.

Think of it as an open source alternative to Algolia and an easier-to-use, batteries-included alternative to ElasticSearch. Get a quick overview from [this guide](https://typesense.org/guide/).

## Usage

**Step 0:** Read detailed step-by-step instructions on how to configure and setup the typesense-docsearch-scraper here: https://typesense.org/docs/latest/guide/docsearch.html

**Step 1:** Once you've setup the scraper, install this plugin:

```shell
npm install docusaurus-theme-search-typesense --save

# or 

yarn add docusaurus-theme-search-typesense
```

**Step 2:** Add the following to `docusaurus.config.js`

```js
{
  themes: ['docusaurus-theme-search-typesense'],
  themeConfig: {
    typesense: {
      typesenseCollectionName: 'docusaurus-2', // Replace with your own doc site's name. Should match the collection name in the scraper settings.
      
      typesenseServerConfig: {
        nodes: [
          {
            host: 'xxx-1.a1.typesense.net',
            port: 443,
            protocol: 'https',
          },
          {
            host: 'xxx-2.a1.typesense.net',
            port: 443,
            protocol: 'https',
          },
          {
            host: 'xxx-3.a1.typesense.net',
            port: 443,
            protocol: 'https',
          },
        ],
        apiKey: 'xyz',
      },

      // Optional: Typesense search parameters: https://typesense.org/docs/0.21.0/api/documents.html#arguments
      typesenseSearchParameters: {},

      // Optional
      contextualSearch: true,
    },
  }
}
```
