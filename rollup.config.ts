import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';

const config = {
    plugins: [
        json(),
        typescript({
            tsconfig: 'tsconfig.json',
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {
                declaration: false,
            }
        }),
        resolve(),
        nodeResolve({ preferBuiltins: true, }),
        commonjs({ extensions: ['.js', '.ts'] }),
        
    ],
    external: [
        '@ash.ts/ash',
        '@sinkapoy/home-core',
        'websocket',
        'fs',
        'fs/promises',
        'http',
        /node_modules/,
    ],
}

export default [
    {
        input: 'src/node.ts',
        output: [
            {
                file: 'dist/node.js',
                format: 'es',
                sourcemap: true,
            }
        ],
        ...config
    },
    {
        input: 'src/browser.ts',
        output: [
            {
                file: 'dist/browser.js',
                format: 'es',
                sourcemap: true,
            }
        ],
        ...config
    },
];