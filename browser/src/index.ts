import {Hashlink} from 'hashlink';
import * as codecs from '../../node_modules/hashlink/codecs';
import {logTimeNow, registerStartTime} from './time';
import {LogEvents} from '../../bindingContext/events';
import refreshPage from "./refreshPage";

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

function fullyRenderedImage (index: number, hashlink: string) {
  function rendered() {
    //Render complete
    logTimeNow({
      event: LogEvents.RENDERED,
      imageIndex: index,
      imageHashlink: hashlink
    });
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
    const hashlink = hashlinkElement.src;
    hashlinkElement.onload = fullyRenderedImage.bind(null, index, hashlink);
    logTimeNow({
      event: LogEvents.START,
      imageIndex: index,
      imageHashlink: hashlink
    });

    const decodedHashlink = await hl.decode({ hashlink });
    if (!decodedHashlink.meta && !decodedHashlink.meta.url?.length) {
      throw new Error('unparseable image, no url provided as meta data');
    }
    const sourceUrl = decodedHashlink.meta.url[0];
    hashlinkElement.src = sourceUrl;
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
    logTimeNow({
      event: LogEvents.VERIFIED,
      imageIndex: index,
      imageHashlink: hashlink
    });

    console.log(`hashlink ${hashlink} was successfully verified`, decodedHashlink);

    logTimeNow({
      event: LogEvents.UPDATED,
      imageIndex: index,
      imageHashlink: hashlink
    });
  }

  hashlinkElements.forEach((hashlinkElement, i) => verifyAndDisplay(hashlinkElement, i));
  // refreshPage();
}

registerStartTime();
init();
