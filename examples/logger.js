// Native
const fs = require('fs');
const path = require('path');

// Packages
const Parser = require('../src');

const xml = fs.readFileSync(path.join(__dirname, 'data', 'overreacted.xml'));
const start = Date.now();
// const parser = new sax.SaxesParser({ xmlns: true });
const parser = new Parser();

// for (const ev of sax.EVENTS) {
// 	parser[`on${ev}`] = console.log.bind(undefined, ev);
// }

// parser.onerror = err => {
// 	console.error(err);
// };

parser.write(xml);

console.log(`Parsing time: ${Date.now() - start}`);
