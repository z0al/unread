// Packages
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import typescript from 'rollup-plugin-typescript2';

import tmp from 'temp-dir';

export default {
	input: './src/index.ts',
	output: {
		file: './dist/index.js',
		format: 'cjs'
	},
	plugins: [
		globals(),
		builtins(),
		resolve({ preferBuiltins: false }),
		commonjs(),
		typescript({
			cacheRoot: `${tmp}/.rpt2_cache`,
			tsconfigOverride: {
				// Force ESNext.
				compilerOptions: {
					module: 'ESNext'
				}
			}
		})
	]
};
