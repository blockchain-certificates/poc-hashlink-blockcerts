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
  const testValue = 'hl:zQmWvQxTqbG2Z9HPJgG57jjwR154cKhbtJenbyYTWkjgF3e:zuh8iaLobXC8g9tfma1CSTtYBakXeSTkHrYA5hmD4F7dCLw8XYwZ1GWyJ3zwF';
  const hl: typeof Hashlink = configureHashlink();

  const url = 'https://www.blockcerts.org/assets/img/pictures/blockcerts.svg';
  let imageData;
  await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/svg' }
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

  console.log(hashlink);

  const hlData = await hl.decode({ hashlink });
  console.log(JSON.stringify(hlData, null, 2));

  const verified = await hl.verify({
    data: imageData,
    hashlink
  });
  console.log(verified);
})();
