import Logger from "./logger";
import { exec } from "./util";

export default class Nginx {
  static async reload() {
    try {
      await exec(`systemctl restart nginx`);
      return true;
    } catch (e) {
      Logger.error(`Restarting Nginx:\n`, e);
      return false;
    }
  }
}
