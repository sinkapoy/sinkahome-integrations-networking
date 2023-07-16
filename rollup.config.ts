import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import nodeResolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/index.js",
                format: "cjs",
                sourcemap: true,
            }
        ],
        plugins: [
            json(),
            typescript({
                tsconfig: "tsconfig.json",
                useTsconfigDeclarationDir: true,
                tsconfigOverride: {
                    declaration: false,
                }
            }),
            nodeResolve({ preferBuiltins: true, }),
            commonjs({ extensions: [".js", ".ts"] }),
            
        ]
    }
];