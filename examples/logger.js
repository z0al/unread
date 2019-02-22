const fs = require('fs');
const path = require('path');
const Parser = require('..');

const feed = path.resolve(__dirname, 'data', 'atom.xml');

fs.createReadStream(feed)
	.on('error', function(error) {
		console.error(error);
	})
	.pipe(new Parser())
	.on('error', function(error) {
		console.error(error);
	})
	.on('feed', function(feed) {
		console.log({ feed });
	})
	.on('item', function(item) {
		console.log({ item });
	});
