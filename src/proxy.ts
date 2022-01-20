import fs from "fs";
import path from "path";
import config from "./config";
import Templates, { IMetadata } from "./templates";

export default class Proxy {
  static async get() {
    const files = await fs.promises
      .readdir(config.nginxSitesEnabled)
      .then((files) => files.filter((file) => file.startsWith("proxy-")));
    const proxies = await Promise.all(
      files.map(async (file) => {
        return await Templates.getMetadata(
          path.resolve(config.nginxSitesEnabled, file)
        );
      })
    );
    return proxies.filter(Boolean) as IMetadata[];
  }
  static async create({
    domain,
    target,
    ssl,
  }: {
    domain: string;
    target: string;
    ssl: boolean;
  }) {
    const proxyFilePath = Proxy.resolveProxyPath(domain);
    const templateName = ssl ? "proxy-ssl.conf" : "proxy.conf";
    const template = Templates.build(templateName, {
      version: "v1.0",
      domain,
      target,
      ssl,
      letsencryptDir: ssl ? config.letsencryptDir : undefined,
    })!;

    await fs.promises.writeFile(proxyFilePath, template);
  }

  static async delete(domain: string) {
    const proxyFilePath = Proxy.resolveProxyPath(domain);

    await fs.promises.unlink(proxyFilePath).catch(() => {});
    return true;
  }

  static resolveProxyPath(domain: string) {
    const proxyFile = `proxy-${domain}`;
    const proxyFilePath = path.join(config.nginxSitesEnabled, proxyFile);
    return proxyFilePath;
  }

  static resolveURL(url: string, ssl: boolean) {
    return `http${ssl ? "s" : ""}://${url}`;
  }

  static checkTarget(target: string) {
    try {
      const url = new URL(target);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }
}
