// Packages
import { Transform } from 'readable-stream';
import { SaxesParser, SaxesTag } from 'saxes';
import { StringDecoder, NodeStringDecoder } from 'string_decoder';

/**
 * RSS/ATOM Parser
 */
export default class Parser extends Transform {
	private _parser: SaxesParser;
	private _decoder: NodeStringDecoder;

	constructor() {
		super();

		// Decodes Buffer to string
		// TODO: support other encoding options
		this._decoder = new StringDecoder('utf8');

		// XML Parser
		this._parser = new SaxesParser({ xmlns: true });
		this._parser.onopentag = this.onopentag.bind(this);
		this._parser.onclosetag = this.onclosetag.bind(this);
		this._parser.ontext = this.ontext.bind(this);
		this._parser.oncdata = this.ontext.bind(this);
		this._parser.onerror = this.onerror.bind(this);
	}

	/**
	 * @override
	 */
	_transform(chunk: any, encoding: string, cb: Function) {
		const str = this._decoder.write(chunk);
		this._parser.write(str);

		cb();
	}

	/**
	 * @override
	 */
	_flush(cb: Function) {
		this._parser.close();
		this._parser = null;

		this._decoder = null;

		cb();
	}

	/**
	 * Hanlders
	 */

	onopentag(tag: SaxesTag) {
		console.log(tag);
	}

	onclosetag(tag: SaxesTag) {
		console.log(tag);
	}

	ontext(text: string) {
		console.log(text);
	}

	onerror(err: Error) {
		console.log(err);
	}
}
