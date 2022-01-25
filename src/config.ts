import "dotenv/config";

const config = {
  address: process.env.ADDRESS || "0.0.0.0",
  port: parseInt(process.env.PORT as string) || 8080,
  nginxSitesEnabled: process.env.NGINX_SITES_ENABLED as string,
  nginxStreams: process.env.NGINX_STREAMS as string,
  letsencryptDir: process.env.LETSENCRYPT_DIR as string,
  letsencryptEmail: process.env.LETSENCRYPT_EMAIL as string,
  authorization: process.env.AUTHORIZATION as string,
} as const;

for (const key of Object.keys(config)) {
  if (!config[key as keyof typeof config]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export default config;
