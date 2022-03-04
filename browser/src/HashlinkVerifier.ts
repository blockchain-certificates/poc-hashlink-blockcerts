import { Hashlink } from 'hashlink';
import * as codecs from '../../node_modules/hashlink/codecs';

export interface HashlinkModel {
  hashName: string;
  hashValue: Uint8Array;
  meta?: {
    url?: string[];
    'content-type'?: string;
  }
}

export class HashlinkVerifier {
  private hl: typeof Hashlink;
  private hashlinkTable: {[ hashlink: string ]: HashlinkModel } = {}; // keep decoded hashlinks in memory

  constructor() {
    this.hl = new Hashlink();
    this.hl.use(new codecs.MultihashSha2256());
    this.hl.use(new codecs.MultihashBlake2b64());
    this.hl.use(new codecs.MultibaseBase58btc());
  }

  /**
   * decode method, abstract wrapper over Hashlink class from digital bazaar hashlink package
   *
   * @param {string} hashlink: the hashlink to be decoded. In this instance it expects a url to be specified.
   * @param {function} onHashlinkUrlDecoded: a callback function called when the source url has been discovered to enable
   * early manipulation (ie: update image in DOM).
   */

  async decode (hashlink: string, onHashlinkUrlDecoded?: (url: string) => void): Promise<HashlinkModel> {
    const decodedHashlink: HashlinkModel = await this.hl.decode({ hashlink });
    console.log('hashlink decoded', decodedHashlink);
    if (!decodedHashlink.meta && !decodedHashlink.meta.url?.length) {
      throw new Error('unparseable document, no url provided as meta data');
    }
    this.hashlinkTable[hashlink] = decodedHashlink;
    const sourceUrl = decodedHashlink.meta.url[0];
    onHashlinkUrlDecoded && onHashlinkUrlDecoded(sourceUrl);
    return decodedHashlink;
  }

  /**
   * verify method, abstract wrapper over Hashlink class from digital bazaar hashlink package
   *
   * @param {string} hashlink: the hashlink to be decoded. It will lookup in the previously decoded hashlinks table.
   * if not found it will decode the hashlink before verification.
   */

  async verify (hashlink: string): Promise<boolean> {
    const sourceUrl = await this.getSourceUrlFromHashlink(hashlink);
    let imageData;
    await fetch(sourceUrl)
      .then(response => response.text())
      .then(data => imageData = data);

    const textEncoder = new TextEncoder();

    const verified = await this.hl.verify({
      data: textEncoder.encode(imageData), // needs an ArrayBuffer
      hashlink
    });
    if (verified) {
      console.log(`hashlink ${hashlink} bound to ${sourceUrl} was successfully verified`);
    } else {
      throw new Error(`Hashlink ${hashlink} does not match data from url ${sourceUrl}`);
    }
    return verified;
  }

  private async getSourceUrlFromHashlink (hashlink: string): Promise<string> {
    let decodedHashlink: HashlinkModel;
    if (this.hashlinkTable[hashlink]) {
      console.log('found hashlink in table');
      decodedHashlink = this.hashlinkTable[hashlink];
    } else {
      decodedHashlink = await this.decode(hashlink);
    }
    return this.getMetaUrl(decodedHashlink);
  }

  private getMetaUrl (decodedHashlink: HashlinkModel): string {
    return decodedHashlink.meta.url[0];
  }
}
