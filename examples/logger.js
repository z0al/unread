const fs = require('fs');
const path = require('path');
const { RSSParser } = require('..');

const text = fs
	.readFileSync(path.resolve(__dirname, 'data', 'sample.atom'))
	.toString();

const parser = new RSSParser();

parser.write(text).close();

for (const item of parser.items()) {
	console.log(item);
}

console.log(parser.feed());
