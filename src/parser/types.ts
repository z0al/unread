export interface Item {
	type?: string;
	version?: string;
	attrs: Map<string, string>;
	meta: Map<string, Item | Item[]>;
	uri: string;
	value: string;
}
