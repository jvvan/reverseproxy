export default class Logger {
  static info(...args: any) {
    console.log("[INFO]", ...arguments);
  }
  static error(...args: any) {
    console.log("[ERROR]", ...arguments);
  }
}
