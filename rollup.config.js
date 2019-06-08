// Packages
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

// Ours
import pkg from './package.json';

export default {
	input: pkg.source,
	output: [
		{
			file: pkg.module,
			format: 'es'
		},
		{
			file: pkg.main,
			format: 'cjs'
		}
	],
	external: ['string_decoder', 'stream'],
	plugins: [
		resolve(),
		babel({ exclude: 'node_modules/**' }),
		commonjs(),
		terser()
	]
};
