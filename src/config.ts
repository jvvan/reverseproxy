export default {
  address: process.env.ADDRESS || "0.0.0.0",
  port: parseInt(process.env.PORT as string) || 8080,
  nginxSitesEnabled: process.env.NGINX_SITES_ENABLED as string,
  letsencryptDir: process.env.LETSENCRYPT_DIR as string,
  letsencryptEmail: process.env.LETSENCRYPT_EMAIL as string,
  authorization: process.env.AUTHORIZATION as string,
} as const;
