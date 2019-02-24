export interface Item {
	// Feed?
	type?: string;
	version?: string;

	// Normalized attributes
	id?: string;
	title?: string;
	summary?: string;
	content?: string;
	image?: string;
	published?: string;
	updated?: string;

	// Others
	attrs: Map<string, string>;
	meta: Map<string, Item | Item[]>;
	ns: string;
	value: string;
}
