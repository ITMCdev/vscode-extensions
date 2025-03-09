# VSCode/VSCodium Extension Packs Generator

This project generates extension packs for both Visual Studio Code and VSCodium based on the configuration in YAML files.

## Project Structure

- `vscode-extensions.yml` - Configuration for VSCode extensions
- `vscodium-extensions.yml` - Configuration for VSCodium extensions
- `generator/` - Generator code
  - `templates/` - Handlebars templates for generating extension files
  - `index.ts` - Main generator script
- `vscode-extensions/` - Generated VSCode extension packs
- `vscodium-extensions/` - Generated VSCodium extension packs

## Requirements

- Node.js 14+
- npm

## Usage

1. Edit the YAML configuration files to add or modify extension packs.
2. Run the generator:

```bash
# Install dependencies
cd generator
npm install

# Generate extensions
npm run generate
```

3. The extension packs will be generated in the respective folders.

## Extension Pack Structure

Each extension pack includes:
- `package.json` - Extension metadata and dependencies
- `README.md` - Documentation
- `LICENSE` - MIT license

## Publishing Extensions

To publish an extension to the Visual Studio Code Marketplace:

1. Install the VSCE tool:
```
npm install -g vsce
```

2. Navigate to an extension folder:
```
cd vscode-extensions/itmcdev-<extension-name>-extension-pack
```

3. Publish:
```
vsce publish
```

Note: You'll need a Personal Access Token from Azure DevOps.