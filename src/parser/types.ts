export interface Item {
	// Feed?
	type?: string;
	version?: string;

	// Others
	attrs: Map<string, string>;
	meta: Map<string, Item | Item[]>;
	ns: string;
	value: string;
}
