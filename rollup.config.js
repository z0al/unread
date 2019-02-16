// Packages
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import tmp from 'temp-dir';

export default {
	input: './src/index.ts',
	output: {
		file: './dist/index.js',
		format: 'esm'
	},
	plugins: [
		resolve(),
		typescript({
			cacheRoot: `${tmp}/.rpt2_cache`,
			tsconfigOverride: {
				// Force ESNext. We use 'commonjs' in tsconfig.json so that
				// Autocomplete will work, especially for 'saxes'.
				compilerOptions: {
					module: 'ESNext'
				}
			}
		})
	]
};
