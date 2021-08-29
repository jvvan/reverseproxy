import fs from "fs";
import path from "path";
import config from "./config";
import Templates from "./templates";

export default class Proxy {
  static async get() {
    return (await fs.promises.readdir(config.nginxSitesEnabled))
      .filter((r) => r.startsWith("proxy-"))
      .map((r) => r.slice("proxy-".length));
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
    const template = Templates.get(ssl ? "proxy-ssl.conf" : "proxy.conf")!
      .replace(/<DOMAIN>/gi, domain)
      .replace(/<TARGET>/gi, target);

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
