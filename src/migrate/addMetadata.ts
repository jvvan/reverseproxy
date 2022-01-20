import config from "../config";
import fs from "fs";
import path from "path";
import Templates from "../templates";

async function bootstrap() {
  const files = await fs.promises
    .readdir(config.nginxSitesEnabled)
    .then((files) => files.filter((file) => file.startsWith("proxy-")));

  await Templates.load();
  for (const file of files) {
    const filePath = path.resolve(config.nginxSitesEnabled, file);
    const content = await fs.promises.readFile(filePath, "utf-8");

    const existingMetadata = await Templates.getMetadata(filePath);
    if (existingMetadata) {
      console.log(`${file} found existing metadata`);
      continue;
    }

    const template = content.includes("listen 443")
      ? Templates.build("proxy-ssl.conf", {
          version: "v1.0",
          domain: file.slice("proxy-".length),
          target: content.match(/proxy_pass (.+);/)![1],
          ssl: true,
          letsencryptDir: config.letsencryptDir,
        })
      : Templates.build("proxy.conf", {
          version: "v1.0",
          domain: file.slice("proxy-".length),
          target: content.match(/proxy_pass (.+);/)![1],
          ssl: false,
        });

    await fs.promises.writeFile(filePath, template);
    console.log(`${file} updated`);
  }
}

bootstrap();
