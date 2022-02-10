const { Hashlink } = require('hashlink');
import * as codecs from './node_modules/hashlink/codecs';

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

  const hlData = await hl.decode({ hashlink: testValue });
  console.log(JSON.stringify(hlData, null, 2));
})();
