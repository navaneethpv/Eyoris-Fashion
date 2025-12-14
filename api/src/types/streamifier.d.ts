declare module 'streamifier' {
  import { Readable } from 'stream';

  /**
   * Create a readable stream from a Buffer.
   * Mirrors the common usage of streamifier in Node projects.
   */
  export function createReadStream(buffer: Buffer): Readable;

  /**
   * Some versions expose a default export-like object.
   * Provide a compatible shape for `import streamifier = require('streamifier')` usage.
   */
  const streamifier: {
    createReadStream(buffer: Buffer): Readable;
  };

  export default streamifier;
}
