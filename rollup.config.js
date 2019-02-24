// Packages
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';

// Ours
import pkg from './package.json';

const input = 'src/index.js';

const plugins = [
	resolve({ browser: true, preferBuiltins: false }),
	commonjs(),
	babel({ exclude: 'node_modules/**' })
];

export default [
	// Browser
	{
		input,
		output: {
			file: pkg.browser,
			format: 'umd',
			name: 'Feedify'
		},
		plugins: [globals(), builtins(), ...plugins]
	},
	// Node.js
	{
		input,
		output: {
			file: pkg.main,
			format: 'cjs'
		},
		plugins,
		external: ['readable-stream']
	}
];
