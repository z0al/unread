// Native
import { readFileSync } from 'fs';
import * as path from 'path';

// Packages
import * as glob from 'globby';

// Ours
import { parse } from '../../src';

const cwd = path.resolve(__dirname, 'feeds');
let samples = [];

beforeAll(async () => {
	// List availalbe samples
	samples = samples.concat(await glob('*', { cwd }));
});

test('Snapshots', async () => {
	for (const file of samples) {
		const text = readFileSync(path.resolve(cwd, file)).toString();

		const output = await parse(text);

		expect(output).toMatchSnapshot(file);
	}
});
