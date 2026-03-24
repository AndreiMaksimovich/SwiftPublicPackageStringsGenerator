#!/usr/bin/env node

import { parseArgs } from 'node:util';
import fs from 'node:fs'
import path from 'node:path';
import { die } from './misc.js';
import { parseStringCatalogFile } from './parser.js'
import { generateSwiftLocalizedStringResourceExtension } from './generator.js';

const parseArgsConfig = {
    configurationPath: {
        type: "string",
        short: "c",
        default: 'config.json'
    }
}

const {values: args} = parseArgs({ args: process.argv.slice(2), options: parseArgsConfig })

if (!fs.existsSync(args.configurationPath)) {
    die("Correct configurationPath is required", args.configurationPath)
}

/** @type Configuration */
const configuration = JSON.parse(fs.readFileSync(args.configurationPath, 'utf8'));

/** @type CatalogStringMap */
const allStrings = new Map()

for (let module of configuration.modules) {
    /** @type CatalogStringMap */
    const moduleStrings = new Map()
    
    const outputPath = path.join(configuration.path, module.path, module.outputPath ?? 'LocalizedStringResource.Extension.Generated.swift')

    for (let catalog of module.catalogs) {
        const catalogPath = path.join(configuration.path, module.path, catalog.path)
        const catalogStringIdPrefix = `${configuration.prefix ?? ""}${module.prefix ?? ""}${catalog.prefix ?? ""}`

        if (!fs.existsSync(catalogPath)) {
            die(`String catalog ${catalogPath} does not exist`)
        }

        const catalogStrings = parseStringCatalogFile(catalogStringIdPrefix, catalogPath)

        for (let [id, catalogString] of catalogStrings.entries()) {
            if (moduleStrings.has(id)) {
                die("Module string duplication", catalogString)
            }
            if (allStrings.has(id)) {
                die("String duplication", allStrings.get(id), catalogString)
            }
            allStrings.set(id, catalogString)
            moduleStrings.set(id, catalogString)
            console.log(catalogString)
        }
    }

    generateSwiftLocalizedStringResourceExtension(moduleStrings, outputPath)
}






