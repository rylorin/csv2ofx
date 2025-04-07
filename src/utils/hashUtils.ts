import crypto from "node:crypto";

/**
 * Creates a SHA-256 hash of an object
 * @param object The object to hash
 * @returns The hexadecimal hash string
 * @throws TypeError if the input is not an object
 */
export function hashObject(object: Record<string, any>): string {
  if (typeof object !== "object") {
    throw new TypeError("Object expected");
  }

  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(object), "utf8")
    .digest("hex" as crypto.BinaryToTextEncoding);

  return hash;
}
