import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

function secret() {
  const value = process.env.CSV_REVIEW_SECRET;
  if (!value || value.length < 32) throw new Error("CSV review signing is not configured.");
  return value;
}
export const csvDigest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
export function createReviewToken(owner: string, digest: string) {
  const payload = Buffer.from(JSON.stringify({ owner, digest, key: randomUUID() })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("hex")}`;
}
export function verifyReviewToken(token: string, owner: string, digest: string): string {
  if (token.length > 1024) throw new Error("Invalid review.");
  const [payload, signature] = token.split(".");
  const expected = createHmac("sha256", secret()).update(payload ?? "").digest();
  const supplied = Buffer.from(signature ?? "", "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new Error("Invalid review.");
  const review = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (review.owner !== owner || review.digest !== digest || typeof review.key !== "string") throw new Error("Changed review.");
  return review.key;
}
