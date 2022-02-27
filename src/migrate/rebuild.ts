import config from "../config";
import fs from "fs";
import path from "path";
import Templates from "../templates";

async function proxies() {
  await Templates.load();

  const files = await fs.promises
    .readdir(config.nginxSitesEnabled)
    .then((files) => files.filter((file) => file.startsWith("proxy-")));

  for (const file of files) {
    const filePath = path.resolve(config.nginxSitesEnabled, file);
    const content = await fs.promises.readFile(filePath, "utf-8");

    const existingMetadata = await Templates.getMetadata(filePath);
    if (!existingMetadata) {
      console.log(`${file} has no metadata`);
      continue;
    }

    const templateName = content.includes("listen 443")
      ? "proxy-ssl.conf"
      : "proxy.conf";

    const template = Templates.build(templateName, existingMetadata);

    await fs.promises.writeFile(filePath, template);
    console.log(`${file} updated`);
  }
}

async function streams() {
  await Templates.load();

  const files = await fs.promises
    .readdir(config.nginxStreams)
    .then((files) => files.filter((file) => file.startsWith("stream-")));

  for (const file of files) {
    const filePath = path.resolve(config.nginxStreams, file);

    const existingMetadata = await Templates.getMetadata(filePath);
    if (!existingMetadata) {
      console.log(`${file} has no metadata`);
      continue;
    }

    const template = Templates.build("stream.conf", existingMetadata);

    await fs.promises.writeFile(filePath, template);
    console.log(`${file} updated`);
  }
}

proxies();
streams();
