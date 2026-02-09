# `docusaurus-theme-search-typesense`

[Typesense](https://typesense.org) search component for Docusaurus powered documentation sites.

This is a fork of the awesome [@docusaurus/theme-search-algolia](https://www.npmjs.com/package/@docusaurus/theme-search-algolia) library customized to work with Typesense.

#### About Typesense

If you're new to Typesense, it is an **open source search engine** that is simple to use, run and scale, with clean APIs and documentation.

Think of it as an open source alternative to Algolia and an easier-to-use, batteries-included alternative to ElasticSearch. Get a quick overview from [this guide](https://typesense.org/guide/).

## Documentation

Read detailed step-by-step instructions on how to first setup the DocSearch scraper and then install this plugin here: [https://typesense.org/docs/guide/docsearch.html](https://typesense.org/docs/guide/docsearch.html).

### Updating the theme

After updating this package (e.g. `npm install` or `yarn`), if you do not see the latest changes (such as translations or UI text), clear the Docusaurus build and cache and rebuild:

- Remove the `.docusaurus` folder and `build` folder in your site directory, then run `npm run build` (or `yarn build`) again.
- Or when using the dev server: remove `.docusaurus` and restart `npm run start` (or `yarn start`).

This forces the bundler to use the updated theme code from `node_modules` instead of cached output.

## Help

If you have any questions or run into any problems, please create a Github issue and we'll try our best to help.
