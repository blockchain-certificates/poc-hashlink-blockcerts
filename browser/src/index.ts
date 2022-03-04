import {Hashlink} from 'hashlink';
import * as codecs from '../../node_modules/hashlink/codecs';
import {logTimeNow, registerStartTime} from './time';
import {LogEvents} from '../../bindingContext/events';
import refreshPage from "./refreshPage";
import decodeAndVerifyHashlink from "./decodeAndVerifyHashlink";

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

    await decodeAndVerifyHashlink(hashlink, (sourceUrl) => {
      hashlinkElement.src = sourceUrl;
    })
    logTimeNow({
      event: LogEvents.VERIFIED,
      imageIndex: index,
      imageHashlink: hashlink
    });

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
