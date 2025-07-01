import typescript from 'rollup-plugin-typescript2';
import vue from 'rollup-plugin-vue';
import images from '@rollup/plugin-image';
import copy from 'rollup-plugin-copy';
import styles from 'rollup-plugin-styler';

const config = {
    plugins: [
        typescript({
            tsconfig: 'tsconfig.json',
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {
                declaration: false,
            }
        }),
        vue({preprocessStyles: true}),
        styles(),
        images({dom: false}),
        copy({
            targets: [
                {src: 'src/assets', dest: 'dist/assets'}
            ]
        })
    ],
    external: [
        /^(?!.*inject-css.js).*node_modules\/(.+)$/,
        'vue',
        'eventemitter3',
        'vuetify/components',
    ],
};

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