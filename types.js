/**
 * @global
 * @typedef {{value: string, index: number | undefined, name: string | undefined, type: string}} CatalogStringVariable
 */

/**
 * @global
 * @typedef {{id: string, tableName: string, stringKey: string, variables: CatalogStringVariable[] | undefined}} CatalogString
 */

/**
 * @global
 * @typedef {Map<string, CatalogString>} CatalogStringMap
 */

/** 
 * @global
 * @typedef {{
 * prefix: string, 
 * path: string, 
 * modules: {
 *  path: string, 
 *  prefix: string | undefined, 
 *  outputPath: string | undefined, 
 *  catalogs: {
 *      path: string, 
 *      prefix: string | undefined
 *  }[]
 * }[]
 * }} Configuration
 */