# poc-hashlink-blockcerts
evaluate using hashlinks into blockcerts

TODO:
- [x] try with binary image (png, jpg...)
- [ ] check load time (use bandwidth throttling too)
- [ ] try other option
  `https://[host]/[path]/[to]/[assets]/[encoding]/[hashing]/[hashed-file-name].[extension]`
  The idea of that second option is to test if user experience is improved by rendering the image first and verifying its integrity second.
- [ ] side by side comparison of the 2 solutions performance
  - [ ] rendering time
  - [ ] verification time
  - [ ] tampered images  
- [ ] issue a blockcerts referencing hashlinks
- [ ] parse `display` property to find hashlinks
- [ ] update images in DOM


NOTE:
The code from Digital Bazaar is not entirely maintained so we would need our own implementation which can be derived from the source repo:
https://github.com/digitalbazaar/hashlink

# Encode image
`npm run encode:hashlink -- --url=[image url] --type=[mime type]`

Example URLs:
https://www.blockcerts.org/assets/img/pictures/blockcerts.svg
https://www.blockcerts.org/assets/img/pictures/credential.png
