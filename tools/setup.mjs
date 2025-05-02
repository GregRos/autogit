// require-shim.js
import { createRequire } from 'module';
export const require = createRequire(import.meta.url);
globalThis.require = require;
globalThis.__VERSION__ = "0.1.0";