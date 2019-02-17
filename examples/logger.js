// Native
const fs = require('fs');
const path = require('path');

// Packages
const Parser = require('..');

const xml = fs.readFileSync(path.join(__dirname, 'data', 'overreacted.xml'));
const start = Date.now();

const parser = new Parser();

parser.write(xml);

console.log(`Parsing time: ${Date.now() - start}`);
