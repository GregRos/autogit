// require-shim.js
import { createRequire } from 'module';
export const require = createRequire(import.meta.url);
globalThis.require = require;
const packageJson = require("../package.json");
globalThis.__VERSION__ = packageJson.version;