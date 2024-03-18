const axios = require("axios");
// const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const yaml = require("yaml");

const getExtensionsList = async (list) => {
  var data = JSON.stringify({
    filters: [
      {
        criteria: list.map((ext) => ({
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
            `* [${ext.publisher.displayName}](${publisherUrl}${ext.publisher.publisherName}) [${ext.displayName}](${extUrl}${ext.publisher.publisherName}.${ext.extensionName}) :: ${ext.shortDescription}`
        )
        .join("\n");
    })
    // .then((result) => console.log(result))
    .catch(function (error) {
      console.log(error);
    });

  return result;
};

const main = async () => {
  const yamlBuffer = await fs.promises.readFile(
    path.join(__dirname, "extensions.yml")
  );
  const { extensions } = yaml.parse(yamlBuffer.toString("utf-8"));

  const dirs = await fs.promises.readdir(__dirname);
  for (dir of dirs) {
    let stats = await fs.promises.stat(path.join(__dirname, dir));
    if (stats.isDirectory()) {
      const packageFile = path.join(__dirname, dir, "package.json");
      const readmeFile = path.join(__dirname, dir, "README.md");
      try {
        let stat = await fs.promises.stat(packageFile);

        let package = await fs.promises.readFile(packageFile);
        package = JSON.parse(package.toString("utf-8"));

        package.extensionPack = Array.isArray(extensions[dir])
          ? extensions[dir]
          : Array.isArray(extensions[dir].pack)
          ? extensions[dir].pack
          : [];
        package.extensionPack = [...new Set(package.extensionPack)];

        package.extensionDependencies = [
          "itmcdev.generic-extension-pack",
          ...(!Array.isArray(extensions[dir])
            ? Array.isArray(extensions[dir].dependencies)
              ? extensions[dir].dependencies
              : [""]
            : [""]),
        ];
        package.extensionDependencies = [
          ...new Set(package.extensionDependencies),
        ];

        let extensionList = await getExtensionsList([
          ...(package.extensionPack || []),
          ...(package.extensionDependencies || []),
        ]);

        let readme = await fs.promises.readFile(readmeFile);
        readme = readme.toString("utf-8");

        readme = readme.replace(
          /\<!-- \+Extensions -->.+\<!-- -Extensions -->/gms,
          `<!-- +Extensions -->\n${extensionList}\n<!-- -Extensions -->`
        );

        await fs.promises.writeFile(readmeFile, readme);
        await fs.promises.writeFile(
          packageFile,
          JSON.stringify(package, null, 2)
        );

        console.log(`${readmeFile} written.`);
      } catch (e) {
        console.error(`Could not access ${packageFile}: ${e.message} ...`);
        // console.log(e);
      }
    }
  }
};

main();
