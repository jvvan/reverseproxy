import fs from "fs";
import express from "express";
import config from "./config";
import path from "path";
import bodyParser from "body-parser";
import Nginx from "./nginx";
import Certbot from "./certbot";
import Proxy from "./proxy";
import Templates from "./templates";
import Logger from "./logger";

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8")
);
const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
  if (req.headers.authorization !== config.authorization) {
    res.status(401).json({
      error: "Unauthorizated",
      statusCode: 401,
    });
  } else {
    next();
  }
});

app.get("/", (req, res) => {
  res.json({
    version: pkg.version,
    statusCode: 200,
  });
});

app.get("/proxies", async (req, res) => {
  const proxies = await Proxy.get();
  res.json(proxies);
});

app.post("/proxies", async (req, res) => {
  const domain = req.body.domain;
  const target = req.body.target;
  if (!domain || !target) {
    return res.status(400).json({
      error: "Invalid request",
      statusCode: 400,
    });
  }
  if (!Proxy.checkTarget(target)) {
    return res.status(400).json({
      error: "Invalid target",
      statusCode: 400,
    });
  }
  const ssl = Boolean(req.body.ssl);
  if (ssl) {
    if (!(await Certbot.create(domain)))
      return res
        .status(500)
        .json({ message: "Could not create SSL certificate", statusCode: 500 });
  }

  try {
    await Proxy.create({
      domain,
      target,
      ssl,
    });
  } catch {
    return res.status(500).json({
      error: "Could not create proxy",
      statusCode: 500,
    });
  }

  Logger.info(`Proxy created: ${Proxy.resolveURL(domain, ssl)} -> ${target}`);
  res.json({
    message: "Proxy created",
    statusCode: 200,
  });

  if (await Nginx.test()) {
    return await Nginx.reload();
  } else {
    Logger.info(
      `Could not reload nginx, deleting proxy: ${Proxy.resolveURL(domain, ssl)}`
    );
    return await Proxy.delete(domain);
  }
});

app.delete("/proxies/:domain", async (req, res) => {
  const domain = req.params.domain;

  try {
    await Proxy.delete(domain);
  } catch {
    return res.status(500).json({
      error: "Could not delete proxy",
      statusCode: 500,
    });
  }

  if (!req.query.keepCertificate) {
    await Certbot.delete(domain).catch(() => {});
  }

  Logger.info(`Proxy deleted: ${domain}`);
  res.json({
    message: "Proxy deleted",
    statusCode: 200,
  });

  if (await Nginx.test()) {
    await Nginx.reload();
  }
  return;
});

app.use((req, res) => {
  res.status(404).json({
    message: `${req.method} ${req.path} not found`,
    statusCode: 404,
  });
});

app.use((error: any, req: any, res: any, next: any) => {
  Logger.error(error);
  res.status(500).json({
    message: String(error),
    stack: String(error.stack),
    statusCode: 500,
  });
});

async function bootstrap() {
  await Templates.load();
  app.listen(config.port, config.address, () => {
    Logger.info(`Listening on ${config.address}:${config.port}`);
  });
}

bootstrap();
