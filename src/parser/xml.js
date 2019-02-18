// @ts-check

// Packages
import { SaxesParser } from 'saxes';
import { Transform } from 'readable-stream';
import { StringDecoder } from 'string_decoder';

/**
 * RSS/ATOM Parser
 */
class Parser extends Transform {
	/**
	 *
	 * @param {string} [encoding]
	 */
	constructor(encoding) {
		encoding = encoding || 'utf8';

		// Object mode: In short, allows readable streams to push any type of chunk
		// other than Buffer and Uint8Array.
		//
		// https://nodejs.org/api/stream.html#stream_object_mode
		super({ objectMode: true, encoding });

		// XML Parser
		this._parser = new SaxesParser({ xmlns: true });
		this._parser.onopentag = this.onopentag.bind(this);
		this._parser.onclosetag = this.onclosetag.bind(this);
		this._parser.ontext = this.ontext.bind(this);
		this._parser.oncdata = this.ontext.bind(this);
		this._parser.onerror = this.onerror.bind(this);

		// Decodes Buffer to string
		// TODO: support other encoding options
		this._decoder = new StringDecoder(encoding);
	}

	/**
	 * @param {*} chunk
	 * @param {string} encoding
	 * @param {Function} cb
	 *
	 * @override
	 */
	_transform(chunk, encoding, cb) {
		try {
			const str = this._decoder.write(chunk);
			this._parser.write(str);

			cb();
		} catch (err) {
			// Manually trigger an end, no more parsing!
			cb(err, null);
		}
	}

	/**
	 * This will be called when there is no more written data to be consumed,
	 * but before the 'end' event is emitted signaling the end of the Readable
	 * stream.
	 *
	 * @param {Function} cb
	 *
	 * @override
	 */
	_flush(cb) {
		try {
			this._parser.close();
			cb();
		} catch (err) {
			cb(err);
		}
	}

	/**
	 * @param {import('saxes').SaxesTag} tag
	 */
	onopentag(tag) {
		console.log(tag);
	}

	/**
	 * @param {import('saxes').SaxesTag} tag
	 */
	onclosetag(tag) {
		console.log(tag);
	}

	/**
	 * @param {string} text
	 */
	ontext(text) {
		console.log(text);
	}

	/**
	 * @param {Error} err
	 */
	onerror(err) {
		this.emit('error', err);
	}
}

export default Parser;
