"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
const Handlebars = __importStar(require("handlebars"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const pino_1 = __importDefault(require("pino"));
const semver_1 = __importDefault(require("semver"));
// Initialize pino logger
const logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});
// Read the YAML files
function readYamlFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return yaml.load(content);
    }
    catch (error) {
        logger.error({ error, path: filePath }, 'Error reading YAML file');
        process.exit(1);
    }
}
// Load templates
function loadTemplate(templateName) {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
    try {
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        return Handlebars.compile(templateContent);
    }
    catch (error) {
        logger.error({ error, template: templateName }, 'Error loading template');
        process.exit(1);
    }
}
// Get existing package version if available and determine if an update is needed
function getExistingVersion(extensionDir, extension) {
    const packagePath = path.join(extensionDir, 'package.json');
    try {
        if (fs.existsSync(packagePath)) {
            const packageContent = fs.readFileSync(packagePath, 'utf8');
            const packageJson = JSON.parse(packageContent);
            if (packageJson.version) {
                // Get existing extensions from package.json
                const existingExtensions = (packageJson.extensionPack || []);
                const newExtensions = extension.extensions || [];
                // Calculate differences between extension lists
                const addedExtensions = newExtensions.filter(ext => !existingExtensions.includes(ext));
                const removedExtensions = existingExtensions.filter(ext => !newExtensions.includes(ext));
                const totalChanges = addedExtensions.length + removedExtensions.length;
                // Calculate percentage of changes
                const totalExtensions = Math.max(existingExtensions.length, newExtensions.length);
                if (totalExtensions === 0)
                    return packageJson.version; // No extensions, no changes
                const changePercentage = (totalChanges / totalExtensions) * 100;
                logger.info({
                    path: packagePath,
                    version: packageJson.version,
                    changePercentage,
                    added: addedExtensions.length,
                    removed: removedExtensions.length
                }, 'Analyzing extension changes');
                // Apply semver rules
                let newVersion = packageJson.version;
                if (changePercentage > 50) {
                    // Major update
                    newVersion = semver_1.default.inc(packageJson.version, 'major');
                    logger.info({ oldVersion: packageJson.version, newVersion }, 'Applying MAJOR version update');
                }
                else if (changePercentage > 30) {
                    // Minor update
                    newVersion = semver_1.default.inc(packageJson.version, 'minor');
                    logger.info({ oldVersion: packageJson.version, newVersion }, 'Applying MINOR version update');
                }
                else if (changePercentage > 1) {
                    // Patch update
                    newVersion = semver_1.default.inc(packageJson.version, 'patch');
                    logger.info({ oldVersion: packageJson.version, newVersion }, 'Applying PATCH version update');
                }
                else {
                    logger.info({ version: newVersion }, 'No significant changes, keeping existing version');
                }
                return newVersion;
            }
        }
    }
    catch (error) {
        logger.warn({ error, path: packagePath }, 'Error reading existing package.json');
    }
    return '0.1.0'; // Default version if not found
}
// Generate extension files
function generateExtensionFiles(extensionKey, extension, outputDir, packageTemplate, readmeTemplate, licenseContent) {
    const extensionDir = path.join(outputDir, `itmcdev-${extensionKey}-extension-pack`);
    // Create directory if it doesn't exist
    mkdirp_1.default.sync(extensionDir);
    // Get existing version if package.json exists, determine if update needed
    const version = getExistingVersion(extensionDir, extension);
    fs.writeFileSync(path.join(extensionDir, 'package.json'), packageTemplate({
        name: `${extensionKey}-extension-pack`,
        displayName: extension.title,
        description: extension.description.trim(),
        version: version,
        publisher: 'itmcdev',
        license: 'MIT',
        repository: {
            type: 'git',
            url: 'https://github.com/itmcdev/vscode-extensions'
        },
        engines: {
            vscode: '^1.60.0'
        },
        categories: ['Extension Packs'],
        extensionPack: extension.extensions,
        extensionDependencies: extension.dependencies || []
    }), 'utf8');
    // Generate README.md
    fs.writeFileSync(path.join(extensionDir, 'README.md'), readmeTemplate({
        name: extensionKey,
        title: extension.title,
        description: extension.description.trim(),
        extensions: extension.extensions.map(ext => {
            const [publisher, extName] = ext.split('.');
            return {
                publisher,
                name: extName,
                marketplaceUrl: `https://marketplace.visualstudio.com/items?itemName=${ext}`
            };
        }),
        dependencies: (extension.dependencies || []).map(dep => {
            const [publisher, depName] = dep.split('.');
            return {
                publisher,
                name: depName,
                marketplaceUrl: `https://marketplace.visualstudio.com/items?itemName=${dep}`
            };
        })
    }), 'utf8');
    // Copy LICENSE file
    fs.writeFileSync(path.join(extensionDir, 'LICENSE'), licenseContent, 'utf8');
    logger.info({ extension: extensionKey, dir: extensionDir }, 'Generated extension');
}
// Main function
async function main() {
    logger.info('Starting extension generation process');
    // Load templates
    const packageTemplate = loadTemplate('package');
    const readmeTemplate = loadTemplate('readme');
    const licenseContent = fs.readFileSync(path.join(__dirname, '..', 'templates', 'LICENSE'), 'utf8');
    ['vscode', 'vscodium'].forEach(ide => {
        logger.info({ ide }, `Generating extensions for ${ide}`);
        const vscodeExtensions = readYamlFile(path.join(__dirname, '..', '..', `${ide}-extensions.yml`));
        // Generate VSCode extensions
        const vscodeOutputDir = path.join(__dirname, '..', '..', `${ide}-extensions`);
        mkdirp_1.default.sync(vscodeOutputDir);
        Object.entries(vscodeExtensions.extensions).forEach(([key, extension]) => {
            if (extension.deprecated) {
                logger.info({ extension: key }, 'Skipping deprecated extension');
                return;
            }
            generateExtensionFiles(key, extension, vscodeOutputDir, packageTemplate, readmeTemplate, licenseContent);
        });
    });
    logger.info('Extension generation completed successfully');
}
main().catch(error => {
    logger.fatal({ error }, 'Fatal error during extension generation');
    process.exit(1);
});
