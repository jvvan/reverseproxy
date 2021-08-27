import fs from "fs/promises";
import path from "path";

export default class Templates {
  static templates: Map<string, string> = new Map();

  static async load() {
    const files = await fs.readdir(path.join(__dirname, "../templates"));
    for (const file of files) {
      const content = await fs.readFile(
        path.join(__dirname, "../templates", file),
        "utf-8"
      );
      this.templates.set(file, content);
    }
  }

  static get(name: string) {
    return this.templates.get(name);
  }
}
