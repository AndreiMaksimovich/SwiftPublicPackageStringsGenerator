import path from 'node:path';

/**
 * @param {string} type
 * @returns {string} Returns the Swift type of a string catalog variable
 */
export function stringCatalogVariableTypeToSwiftType(type) {
    switch (type) {
        case "lld":
            return "Int"
        case "llu":
            return "UInt"
        case "lf":
            return "Double"
        case "@":
            return "String"
    }
}

/**
 * @description Terminates the app and logs an error message.
 * @param {...any} message 
 */
export function die(...message) {
    console.error(message)
    process.exit(1)
}

const catalogSrtingKeyCleanRegEx =  /[^a-zA-Z0-9]/g

/**
 * @description Converts a string catalog key into an Xcode-compatible Swift variable name.
 * @param {string} value 
 * @returns {string}
 */
export function stringCatalogKeyToSwiftCodeVariableName(value) {
    const parts = value.split(catalogSrtingKeyCleanRegEx)
    parts[0] = parts[0].charAt(0).toLowerCase() + parts[0].slice(1)
    for (let i=1; i<parts.length; i++) {
        parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1)
    }
    return parts.join('')
}

const stringIdCleanRegEx = /[^a-zA-Z0-9\.]/g

/**
 * @param {string} stringId 
 * @returns {string} Returns a sanitized string identifier.
 */
export function sanitizeStringId(stringId) {
    const value = stringId.replace(stringIdCleanRegEx, '')
    return value.replaceAll(/\.+/g, '.')
}

/**
 * 
 * @param {string} catalogFilePath 
 * @returns {string} Returns the Xcode-generated table name for the specified string catalog.
 */
export function stringCatalogFileToSwiftTableName(catalogFilePath) {
    const fileName = path.basename(catalogFilePath)
    let tableName = fileName.substring(0, fileName.length - path.extname(fileName).length)
    tableName = tableName.replace(catalogSrtingKeyCleanRegEx, '')
    return tableName !== "Localizable" ? tableName : null
}