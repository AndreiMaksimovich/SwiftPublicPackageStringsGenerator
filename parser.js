import fs from 'node:fs'
import { die, stringCatalogFileToSwiftTableName, sanitizeStringId } from "./misc.js";

/**
 * @param {string} catalogStringIdPrefix 
 * @param {string} catalogPath 
 * @returns {CatalogStringMap}
 */
export function parseStringCatalogFile(catalogStringIdPrefix, catalogPath) {
    const xcodeStringCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const catalogTableName = stringCatalogFileToSwiftTableName(catalogPath)

    const catalogStrings = new Map()

    for (let stringKey of Object.keys(xcodeStringCatalog.strings)) {
        const localizedString = xcodeStringCatalog.strings[stringKey]

        if (localizedString.extractionState !== 'manual') {
            console.log(`Skipping non manual string: ${stringKey}`)
            continue
        }

        const localizations = localizedString.localizations

        const values = getStringUnitValues(localizations)
        const allVariables = []
        for (let stringValue of values) {
            let variables = getVariables(stringValue)
            if (variables) {
                allVariables.push(variables)
            }
        }

        const catalogString = {
            id: sanitizeStringId(`${catalogStringIdPrefix}${stringKey}`),
            tableName: catalogTableName,
            stringKey: stringKey,
            variables: undefined
        }

        if (allVariables.length>0) {
            catalogString.variables = getStringVariables(allVariables)
        }

        if (catalogStrings.has(catalogString.id)) {
            die("Catalog string duplication", catalogString)
        }

        catalogStrings.set(catalogString.id, catalogString)
    }

    return catalogStrings
}

const variableRegEx = /%([0-9]+\$)?(\([^\)]+\))?(lld|llu|lf|\@)/g;

function getStringUnitValues(data) {
    const result = []
    function _getStringUnitValues(data) {
        for (let key of Object.keys(data)) {
            if (key == 'stringUnit') {
                result.push(data[key].value)
            } else if (typeof data[key] == 'object') {
                _getStringUnitValues(data[key])
            }
        }
    }
    _getStringUnitValues(data)
    return result
}

function getVariables(stringValue) {
    const variableMatches = stringValue.matchAll(variableRegEx)
    if (!variableMatches) return null
    const result = []
    for (let match of variableMatches) {
        const variable = {
            value: match[0],
            index: match[1] ? parseInt(match[1].substring(0, match[1].length - 1)) : undefined,
            name: match[2] ? match[2].substring(1, match[2].length - 1) : undefined,
            type: match[3]
        }
        result.push(variable)
    }
    return result.length > 0 ? result : null
}

function getStringVariables(allVariables) {
    let noIndexes = true

    for (let vaiables of allVariables) {
        for (let variable of vaiables) {
            if (variable.index !== undefined) {
                noIndexes = false
                break
            }
        }
    }

    if (noIndexes) {
        return allVariables.sort((a, b) => b.length - a.length)[0]
    }

    const variableByIndex = new Map()

    for (let vaiables of allVariables) {
        for (let variable of vaiables) {
            if (!variableByIndex.has(variable.index)) {
                variableByIndex.set(variable.index, variable)
            }
        }
    }

    return Array.from(variableByIndex.values()).sort((a,b) => a.index - b.index)
}