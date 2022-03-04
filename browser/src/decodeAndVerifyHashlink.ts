import { HashlinkVerifier } from "./HashlinkVerifier";

export default async function decodeAndVerifyHashlink (hashlink: string, onHashlinkUrlDecoded: (url: string) => void) {
  const hl = new HashlinkVerifier();
  const decodedHashlink = await hl.decode(hashlink, onHashlinkUrlDecoded);
  const verified = await hl.verify(hashlink);
}
