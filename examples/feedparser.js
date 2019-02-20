const fs = require('fs');
const path = require('path');
const FeedParser = require('feedparser');

const feed = path.resolve(__dirname, 'data', 'atom.xml');

fs.createReadStream(feed)
	.on('error', function(error) {
		console.error(error);
	})
	.pipe(new FeedParser())
	.on('error', function(error) {
		console.error(error);
	})
	.on('meta', function(meta) {
		// console.log({ meta });
	})
	.on('readable', function() {
		var stream = this,
			item;
		while ((item = stream.read())) {
			console.log({ item });
		}
	});
