const fs = require('node:fs');
const path = require('node:path');

fs.writeFileSync(path.join(process.cwd(), 'a.txt'), 'fdfsf', {
  encoding: 'utf-8',
  flag: 'w+',
});