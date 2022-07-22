"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateThemeConfig = exports.DEFAULT_CONFIG = void 0;
const utils_validation_1 = require("@docusaurus/utils-validation");
exports.DEFAULT_CONFIG = {
    // enabled by default, as it makes sense in most cases
    // see also https://github.com/facebook/docusaurus/issues/5880
    contextualSearch: true,
    typesenseSearchParameters: {},
    searchPagePath: 'search',
};
const Schema = utils_validation_1.Joi.object({
    typesense: utils_validation_1.Joi.object({
        // Docusaurus attributes
        contextualSearch: utils_validation_1.Joi.boolean().default(exports.DEFAULT_CONFIG.contextualSearch),
        externalUrlRegex: utils_validation_1.Joi.string().optional(),
        // Typesense attributes
        typesenseServerConfig: utils_validation_1.Joi.object(),
        typesenseCollectionName: utils_validation_1.Joi.string().required(),
        typesenseSearchParameters: utils_validation_1.Joi.object()
            .default(exports.DEFAULT_CONFIG.typesenseSearchParameters)
            .unknown(),
        searchPagePath: utils_validation_1.Joi.alternatives()
            .try(utils_validation_1.Joi.boolean().invalid(true), utils_validation_1.Joi.string())
            .allow(null)
            .default(exports.DEFAULT_CONFIG.searchPagePath),
    })
        .label('themeConfig.typesense')
        .required()
        .unknown(), // DocSearch 3 is still alpha: don't validate the rest for now
});
function validateThemeConfig({ validate, themeConfig, }) {
    return validate(Schema, themeConfig);
}
exports.validateThemeConfig = validateThemeConfig;
