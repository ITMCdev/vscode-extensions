const axios = require("axios");
const { readFile, stat, writeFile } = require("fs").promises;
const { join: joinPath } = require("path");
const yaml = require("yaml");
const semver = require("semver");
const { spawn } = require("child_process");
const { platform } = require("os");

const vsceBinary = joinPath(__dirname, "node_modules", ".bin", `vsce${platform() !== "win32" ? "" : ".cmd"}`);
console.log(vsceBinary);

const publish = (cwd) =>
  new Promise((resolve, reject) => {
    const proc = spawn(
      vsceBinary,
      ["publish", "--skip-duplicate", ...(process.env.VSCE_TOKEN ? ["-p", process.env.VSCE_TOKEN] : [])],
      {
        stdio: "inherit",
        cwd,
      },
    );

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`vsce exited with code ${code}`));
      }
    });
  });

async function getLastPublishedVersion(extensionId) {
  try {
    const response = await axios.post(
      "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery",
      {
        filters: [
          {
            criteria: [
              {
                filterType: 7,
                value: extensionId,
              },
            ],
            direction: 2,
          },
        ],
        flags: 103,
      },
      {
        headers: {
          accept: "application/json;api-version=6.1-preview.1;excludeUrls=true",
          "Content-Type": "application/json",
        },
      },
    );

    return response.data.results[0].extensions[0].versions[0].version;
  } catch (error) {
    console.error("Error fetching version:", error.message);
    return null;
  }
}

const main = async () => {
  const yamlBuffer = await readFile(joinPath(__dirname, "extensions.yml"));
  const { extensions } = yaml.parse(yamlBuffer.toString("utf-8"));

  for (const item of Object.keys(extensions)) {
    const extensionFolder = joinPath(__dirname, "packages", item);
    try {
      await stat(extensionFolder);

      const packageJsonFile = joinPath(extensionFolder, "package.json");
      const packageJson = JSON.parse(await readFile(packageJsonFile));
      const newVersion = packageJson.version;

      const oldVersion = await getLastPublishedVersion(packageJson.publisher + "." + packageJson.name);

      console.log(`${packageJson.publisher}.${packageJson.name} v${newVersion} => v${oldVersion}`);
      if (semver.gt(newVersion, oldVersion)) {
        console.log(`Publishing ${packageJson.publisher}.${packageJson.name} v${newVersion}`);
        await publish(extensionFolder)
          .then(() => {
            console.log(`Published ${packageJson.publisher}.${packageJson.name} v${newVersion}`);
          })
          .catch(() => {
            console.log(`Failed publishing ${packageJson.publisher}.${packageJson.name} v${newVersion}`);
            process.exit(0);
          });
      }
    } catch (e) {
      console.error(`Extension folder does not exist yet: ${extensionFolder}`);
    }
  }
};

main();
