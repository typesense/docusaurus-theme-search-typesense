# [Work in Progress] `docusaurus-theme-search-typesense`

Typesense search component for Docusaurus.

## Usage

```shell
npm install docusaurus-theme-search-typesense --save

# or 

yarn add docusaurus-theme-search-typesense
```

Add the following to `docusaurus.config.js`

```js
{
  themes: ['docusaurus-theme-search-typesense'],
  themeConfig: {
    typesense: {
      typesenseCollectionName: 'docusaurus-2',
      
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

      // Optional: Typesense search parameters
      typesenseSearchParameters: {},

      // Optional
      contextualSearch: true,
    },
  }
}
```
