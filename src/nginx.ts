import Logger from "./logger";
import { exec } from "./util";

export default class Nginx {
  static async test() {
    try {
      await exec(`sudo nginx -t`);
      return true;
    } catch {
      return false;
    }
  }
  static async reload() {
    try {
      await exec(`sudo nginx -s reload`);
      return true;
    } catch (e) {
      Logger.error(`Reloading Nginx:\n`, e);
      return false;
    }
  }
}
