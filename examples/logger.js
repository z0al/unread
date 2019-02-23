const fs = require('fs');
const path = require('path');
const { RSSParser } = require('..');

const feed = path.resolve(__dirname, 'data', 'sample.atom');

fs.createReadStream(feed)
	.on('error', function(error) {
		console.error(error);
	})
	.pipe(new RSSParser())
	.on('error', function(error) {
		console.error(error);
	})
	.on('feed', function(feed) {
		console.log({ feed });
	})
	.on('readable', function() {
		let item;
		while ((item = this.read())) {
			console.log({ item });
		}
	})
	.on('end', () => {
		console.log('Finished!');
	});
