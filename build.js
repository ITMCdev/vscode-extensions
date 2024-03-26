const axios = require("axios");
// const fetch = require("node-fetch");
const { readFile, stat, writeFile } = require("fs").promises;
const { join: joinPath } = require("path");
const yaml = require("yaml");

const getExtensionDetails = async (list) => {
  var data = JSON.stringify({
    filters: [
      {
        criteria: list
          .filter((ext) => ext)
          .map((ext) => ({
            filterType: 7,
            value: ext,
          })),
      },
    ],
  });

  const extUrl = "https://marketplace.visualstudio.com/items?itemName=";
  const publisherUrl = "https://marketplace.visualstudio.com/publishers/";

  var config = {
    method: "post",
    url: "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery",
    headers: {
      accept: "application/json;api-version=6.1-preview.1;excludeUrls=true",
      "Content-Type": "application/json",
    },
    data: data,
  };

  result = await axios(config)
    // .then((response) => console.log(response.data.results[0].extensions))
    .then((response) => {
      return response.data.results[0].extensions
        .map(
          (ext) =>
            `* [${ext.publisher.displayName}](${publisherUrl}${ext.publisher.publisherName}) [${ext.displayName}](${extUrl}${ext.publisher.publisherName}.${ext.extensionName}) :: ${ext.shortDescription}`,
        )
        .join("\n");
    })
    // .then((result) => console.log(result))
    .catch(function (error) {
      console.log(config);
      console.log(error.response.data);
    });

  return result;
};

const updatePackageJson = async (packageFile, extensionConfig) => {
  try {
    await stat(packageFile);

    const package = await readFile(packageFile).then((buffer) => JSON.parse(buffer.toString("utf-8")));

    package.extensionPack = Array.isArray(extensionConfig)
      ? extensionConfig
      : Array.isArray(extensionConfig.pack)
        ? extensionConfig.pack
        : [];
    package.extensionPack = [...new Set(package.extensionPack)];

    package.extensionDependencies = [
      ...(["generic-extension-pack", "workspace-extension-pack"].includes(package.name)
        ? []
        : ["itmcdev.generic-extension-pack"]),
      ...(!Array.isArray(extensionConfig)
        ? Array.isArray(extensionConfig.dependencies)
          ? extensionConfig.dependencies
          : []
        : []),
    ];
    package.extensionDependencies = [...new Set(package.extensionDependencies)];

    // await writeFile(readmeFile, readme);
    await writeFile(packageFile, JSON.stringify(package, null, 2));

    console.log(`${packageFile} written.`);
    return package;
  } catch (e) {
    console.error(`Could not access ${packageFile}`, console.log(e));
  }
};

const updateReadme = async (readmeFile, package) => {
  if (!package) {
    console.error(`Could not access package.json for ${readmeFile}`);
    return;
  }
  try {
    await stat(readmeFile);

    const extensionsDetails = await getExtensionDetails([
      ...(package.extensionPack || []),
      ...(package.extensionDependencies || []),
    ]);

    let readme = await readFile(readmeFile).then((buffer) => buffer.toString("utf-8"));

    readme = readme.replace(
      /\<!-- \+Extensions -->.+\<!-- -Extensions -->/gms,
      `<!-- +Extensions -->\n${extensionsDetails}\n<!-- -Extensions -->`,
    );

    console.log(`${readmeFile} written.`);
  } catch (e) {
    console.error(`Could not access ${readmeFile}`, console.log(e));
  }
};

const main = async () => {
  const yamlBuffer = await readFile(joinPath(__dirname, "extensions.yml"));
  const { extensions } = yaml.parse(yamlBuffer.toString("utf-8"));

  const releasePleaseConfig = {
    ["release-type"]: "node",
    packages: {
      ".": {
        // overrides release-type for node
        ["release-type"]: "node",
        ["package-name"]: "@itmcdev/vscode-extensions",
        ["changelog-path"]: "CHANGELOG.md",
      },
    },
  };

  for (const item of Object.keys(extensions)) {
    const extensionFolder = joinPath(__dirname, "packages", item);
    try {
      const extensionStats = await stat(extensionFolder);
      if (extensionStats && extensionStats.isDirectory()) {
        const packageFile = joinPath(extensionFolder, "package.json");
        const readmeFile = joinPath(extensionFolder, "README.md");
        const package = await updatePackageJson(packageFile, extensions[item]);
        updateReadme(readmeFile, package);
        releasePleaseConfig.packages = {
          ...releasePleaseConfig.packages,
          [`packages/${item}`]: {
            ["release-type"]: "node",
            ["package-name"]: `@itmcdev/${item}-extension-pack`,
            ["changelog-path"]: "CHANGELOG.md",
          },
        };
      }
    } catch (e) {
      console.error(`Extension folder does not exist yet: ${extensionFolder}`);
    }
  }

  await writeFile(joinPath(__dirname, "release-please-config.json"), JSON.stringify(releasePleaseConfig, null, 2));
};

main();
