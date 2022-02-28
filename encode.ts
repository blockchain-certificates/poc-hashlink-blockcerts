import getArg from "./utils/getArg";

const { Hashlink } = require('hashlink');
import * as codecs from './node_modules/hashlink/codecs';
import fetch from 'node-fetch';

function configureHashlink (): typeof Hashlink {
  const hl = new Hashlink();
  hl.use(new codecs.MultihashSha2256());
  hl.use(new codecs.MultihashBlake2b64());
  hl.use(new codecs.MultibaseBase58btc());
  return hl;
}

(async function () {
  const hl: typeof Hashlink = configureHashlink();

  const url = getArg('url');
  const type = getArg('type');
  if (!url || !type) {
    throw new Error('arguments url and type must be specified');
  }
  console.log('Creating a hashlink from data located at', url);
  let imageData;
  await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': `application/${type}` }
  })
    .then(response => response.text())
    .then(data => imageData = data);

  const hashlink = await hl.encode({
    data: imageData,
    urls: [url],
    meta: {
      url,
      'content-type': 'image/svg+xml'
    }
  });

  console.log('---------- HASHLINK VALUE ----------');
  console.log(hashlink);

  const hlData = await hl.decode({ hashlink });
  console.log('---------- DECODED VALUE ----------');
  console.log(JSON.stringify(hlData, null, 2));

  const verified = await hl.verify({
    data: imageData,
    hashlink
  });
  console.log('---------- VERIFIED ----------');
  console.log(verified);
})();
