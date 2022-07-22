/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Joi} from '@docusaurus/utils-validation';
import type {
  ThemeConfig,
  Validate,
  ThemeConfigValidationContext,
} from '@docusaurus/types';

export const DEFAULT_CONFIG = {
  // enabled by default, as it makes sense in most cases
  // see also https://github.com/facebook/docusaurus/issues/5880
  contextualSearch: true,

  typesenseSearchParameters: {},
  searchPagePath: 'search',
};

const Schema = Joi.object({
  typesense: Joi.object({
    // Docusaurus attributes
    contextualSearch: Joi.boolean().default(DEFAULT_CONFIG.contextualSearch),
    externalUrlRegex: Joi.string().optional(),

    // Typesense attributes
    typesenseServerConfig: Joi.object(),
    typesenseCollectionName: Joi.string().required(),
    typesenseSearchParameters: Joi.object()
      .default(DEFAULT_CONFIG.typesenseSearchParameters)
      .unknown(),

    searchPagePath: Joi.alternatives()
      .try(Joi.boolean().invalid(true), Joi.string())
      .allow(null)
      .default(DEFAULT_CONFIG.searchPagePath),
  })
    .label('themeConfig.typesense')
    .required()
    .unknown(), // DocSearch 3 is still alpha: don't validate the rest for now
});

export function validateThemeConfig({
  validate,
  themeConfig,
}: ThemeConfigValidationContext<ThemeConfig>): ThemeConfig {
  return validate(Schema, themeConfig);
}
