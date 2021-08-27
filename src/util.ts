import { promisify } from "util";
import child_process from "child_process";

const exec = promisify(child_process.exec);

export { exec };
