// babel.config.js
module.exports = {
    assumptions: {
        setPublicClassFields: true
    },
    presets: [
        "@babel/preset-typescript",
        [
            "@babel/preset-env",
            {
                // targets: {
                //     chrome: "latest"
                // },
                // useBuiltIns: "usage",
                // corejs: 3,
                // modules: false
                modules: false,
                // Targeting the latest versions of major browsers
                targets:
                    "last 2 Chrome versions, last 2 Firefox versions, last 2 Safari versions, last 2 Edge versions",
                // Disabling polyfill transformation
                useBuiltIns: false
            }
        ]
    ],
    plugins: [
        "./lib/index.js",
        [
            "@babel/plugin-proposal-decorators",
            { loose: true, version: "2023-05" }
        ],
        ["@babel/plugin-proposal-class-properties", { loose: true }],
        ["@babel/plugin-transform-class-static-block", { loose: true }]
    ]
};
