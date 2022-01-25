import fs from "fs";
import path from "path";
import config from "./config";
import Templates, { StreamMetadata } from "./templates";

export default class Stream {
  static async get() {
    const files = await fs.promises
      .readdir(config.nginxStreams)
      .then((files) => files.filter((file) => file.startsWith("stream-")));
    const streams = await Promise.all(
      files.map(async (file) => {
        return await Templates.getMetadata(
          path.resolve(config.nginxStreams, file)
        );
      })
    );
    return streams.filter(Boolean) as StreamMetadata[];
  }
  static async create({
    name,
    listen,
    target,
  }: {
    name: string;
    listen: string;
    target: string;
  }) {
    const streamFilePath = Stream.resolveStreamPath(name);
    const templateName = "stream.conf";
    const template = Templates.build(templateName, {
      version: "v1.0",
      name,
      listen,
      target,
    })!;

    await fs.promises.writeFile(streamFilePath, template);
  }

  static async delete(name: string) {
    const streamFilePath = Stream.resolveStreamPath(name);

    await fs.promises.unlink(streamFilePath).catch(() => {});
    return true;
  }

  static resolveStreamPath(name: string) {
    const streamFile = `stream-${name}`;
    const streamFilePath = path.join(config.nginxStreams, streamFile);
    return streamFilePath;
  }

  static checkListen(listen: string) {
    const listenRegex =
      /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:)?(\d{1,5})( udp)?$/;
    return listenRegex.test(listen);
  }

  static checkName(name: string) {
    const nameRegex = /^[a-zA-Z0-9-_]{1,64}$/;
    return nameRegex.test(name);
  }

  static checkTarget(target: string) {
    const targetRegex = /^([\w\d\.]+):(\d{1,5})$/;
    return targetRegex.test(target);
  }
}
