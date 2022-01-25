import fs from "fs";
import path from "path";

export default class Templates {
  static templates: Map<string, string> = new Map();

  static async load() {
    const files = await fs.promises.readdir(
      path.join(__dirname, "../templates")
    );
    for (const file of files) {
      const content = await fs.promises.readFile(
        path.join(__dirname, "../templates", file),
        "utf-8"
      );
      this.templates.set(file, content);
    }
  }

  static get(name: string) {
    return this.templates.get(name);
  }

  static build<T>(template: string, data: T) {
    return (
      `# ${JSON.stringify(data)}\n` +
      this.templates
        .get(template)!
        .replace(/<([a-zA-Z_\.]+)>/g, (match, key: keyof T) => {
          return String(data[key]);
        })
    );
  }

  static async getMetadata<T>(path: string): Promise<T | null> {
    const content = await fs.promises.readFile(path, "utf-8").catch(() => {});
    if (!content) return null;
    const firstLine = content.split("\n")[0];
    if (!firstLine.startsWith("# ")) return null;
    const metadata = JSON.parse(firstLine.slice(1));
    return metadata as T;
  }
}

export interface ProxyMetadata {
  version: string;
  domain: string;
  target: string;
  ssl: boolean;
  letsencryptDir?: string;
}

export interface StreamMetadata {
  version: string;
  name: string;
  listen: string;
  target: string;
}
