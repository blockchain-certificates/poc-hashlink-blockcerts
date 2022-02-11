import { Hashlink } from 'hashlink';
import * as codecs from '../../node_modules/hashlink/codecs';

interface HashlinkModel {
  hashName: string;
  hashValue: Uint8Array;
  meta?: {
    url?: string[];
    'content-type'?: string;
  }
}

function configureHashlink (): typeof Hashlink {
  const hl = new Hashlink();
  hl.use(new codecs.MultihashSha2256());
  hl.use(new codecs.MultihashBlake2b64());
  hl.use(new codecs.MultibaseBase58btc());
  return hl;
}

const hashlinkElement: HTMLImageElement = document.querySelector('.js-hashlink');

async function init () {
  console.log('init');
  const hl: typeof Hashlink = configureHashlink();
  const hashlink = hashlinkElement.src;

  const decodedHashlink = await hl.decode({ hashlink });
  if (!decodedHashlink.meta && !decodedHashlink.meta.url?.length) {
    throw new Error('unparseable image, no url provided as meta data');
  }
  const sourceUrl = decodedHashlink.meta.url[0];
  let imageData;
  await fetch(sourceUrl)
    .then(response => response.text())
    .then(data => imageData = data);

  const textEncoder = new TextEncoder();

  const verified = await hl.verify({
    data: textEncoder.encode(imageData), // needs an ArrayBuffer
    hashlink
  });

  if (!verified) {
    throw new Error(`Hashlink ${hashlink} does not match data from url ${sourceUrl}`);
  }

  console.log('hashlink was successfully verified');

  if (!decodedHashlink.meta['content-type']) {
    throw new Error('content-type meta property was not specified, unable to rebuild the image');
  }

  const base64Data = btoa(imageData);
  hashlinkElement.src = `data:${decodedHashlink.meta['content-type']};base64,${base64Data}`;
}

init();
