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

function toSecond (value: number): string {
  return value / 1000 + 's';
}

const startTime = Date.now();
console.log('DOM loaded at', startTime);

function logTimeNow (label: string, index: number) {
  const time = Date.now();
  console.log(label, index, 'at', time, 'delta', toSecond(time - startTime));
}

function fullyRenderedImage (index: number) {
  function rendered() {
    //Render complete
    logTimeNow('fully rendered', index);
  }

  function startRender() {
    //Rendering start
    requestAnimationFrame(rendered);
  }

  function loaded()  {
    requestAnimationFrame(startRender);
  }
  loaded();
}

function init () {
  const hl: typeof Hashlink = configureHashlink();
  const hashlinkElements: NodeListOf<HTMLImageElement> = document.querySelectorAll('.js-hashlink');

  console.log('found hashlink elements', hashlinkElements);

  async function verifyAndDisplay(hashlinkElement: HTMLImageElement, index: number) {
    hashlinkElement.onload = fullyRenderedImage.bind(null, index);
    const hashlink = hashlinkElement.src;
    logTimeNow('start processing image', index);

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
    logTimeNow('verified image', index);

    console.log(`hashlink ${hashlink} was successfully verified`, decodedHashlink);

    hashlinkElement.src = sourceUrl;
    logTimeNow('updated image url', index);
  }

  hashlinkElements.forEach((hashlinkElement, i) => verifyAndDisplay(hashlinkElement, i));
}

init();
