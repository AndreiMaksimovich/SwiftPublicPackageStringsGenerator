import fs from 'node:fs'
import { 
    stringCatalogKeyToSwiftCodeVariableName, 
    stringCatalogCariableTypeToSwiftType,
} from './misc.js';

/**
 * @param {CatalogStringMap} moduleStrings 
 * @param {string} outputPath 
 */
export function generateSwiftLocalizedStringResourceExtension(moduleStrings, outputPath) {
    const codeStrings = []

    function createTreeElement() {
        return {
            strings: new Map(),
            children: new Map()
        }
    }

    const rootElement = createTreeElement()

    for (let moduleString of moduleStrings.values()) {
        const stringPath = moduleString.id.split(".")
        let currentElement = rootElement
        for (let i = 0; i < stringPath.length - 1; i++) {
            const pathPart = stringPath[i]
            if (!currentElement.children.has(pathPart)) {
                currentElement.children.set(pathPart, createTreeElement())
            }
            currentElement = currentElement.children.get(pathPart)
        }
        currentElement.strings.set(stringPath[stringPath.length - 1], moduleString)
    }

    function moduleStringToSwiftCode(id, moduleString, rootLevel) {
        const swiftCodeId = stringCatalogKeyToSwiftCodeVariableName(id)
        const swiftCodeKey = stringCatalogKeyToSwiftCodeVariableName(moduleString.stringKey)
        const key = (moduleString.tableName ? `.${moduleString.tableName}` : '')  + `.${swiftCodeKey}`
        
        if (moduleString.variables === undefined) {
            return `${rootLevel ? '' : 'public '}static let ${swiftCodeId}: LocalizedStringResource = ${key}`
        }
        
        const leftArguments = []
        const rightArguments = []

        for (let [index, variable] of moduleString.variables.entries()) {
            const type = stringCatalogCariableTypeToSwiftType(variable.type)
            const useName = variable.name !== undefined
            leftArguments.push(useName ? `${variable.name}: ${type}` : `_ arg${index+1}: ${type}`)
            rightArguments.push(useName ?`${variable.name}: ${variable.name}` : `arg${index+1}`)
        }

        return `${rootLevel ? '' : 'public '}static func ${swiftCodeId}(${leftArguments.join(", ")}) -> LocalizedStringResource { ${key}(${rightArguments.join(", ")}) }`
    }

    function iterateElements(element, prefix, rootLevel) {
        for (let [id, moduleString] of element.strings.entries()) {
            codeStrings.push(prefix + moduleStringToSwiftCode(id, moduleString, rootLevel))
        }

        for (let [id, nextElement] of element.children.entries()) {
            codeStrings.push(`${prefix}${rootLevel ? '' : 'public '}enum ${id} {`)
            iterateElements(nextElement, `${prefix}    `, false)
            codeStrings.push(`${prefix}}`)
        }
    }

    iterateElements(rootElement, '    ', true)

    const templateCode = fs.readFileSync('LocalizedStringResourceExtensionTemplate.swift', 'utf-8')

    const code = templateCode.replace('__CODE__', codeStrings.join("\n"))

    console.log(outputPath)
    console.log('-------------------------------------')
    console.log(code)
    console.log('\n\n')

    fs.writeFileSync(outputPath, code, {encoding: 'utf-8'})
}
