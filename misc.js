import path from 'node:path';

/**
 * @param {string} type
 * @returns {string} Returns the Swift type of a string catalog variable
 */
export function stringCatalogCariableTypeToSwiftType(type) {
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
    let id = value.replace(catalogSrtingKeyCleanRegEx, '')
    return id.charAt(0).toLowerCase() + id.slice(1);
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
    const tableName = fileName.substring(0, fileName.length - path.extname(fileName).length)
    return tableName !== "Localizable" ? tableName : null
}