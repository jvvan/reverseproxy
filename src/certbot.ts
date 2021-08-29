import config from "./config";
import { exec } from "./util";

export default class Certbot {
  static async create(domain: string) {
    try {
      const { stdout } = await exec(
        `sudo certbot certonly --noninteractive --agree-tos --keep-until-expiring -m ${config.letsencryptEmail} -d ${domain} --webroot -w ${config.letsencryptDir}`
      );

      if (
        stdout.includes("Congratulations!") ||
        stdout.includes("Certificate not yet due for renewal")
      ) {
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }
  static async delete(domain: string) {
    try {
      await exec(`sudo certbot delete --cert-name ${domain}`);
      return true;
    } catch {
      return false;
    }
  }
}
