import { exec } from "./util";

export default class Nginx {
  static async reload() {
    try {
      await exec(`systemctl restart nginx`);
      return true;
    } catch (e) {
      console.log(`Error while restarting nginx:\n`, e);
      return false;
    }
  }
}
