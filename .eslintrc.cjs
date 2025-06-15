module.exports = {
    "env": {
        "browser": true,
        "commonjs": false,
        "es6": true,
        "jest": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:import/recommended",
    ],
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2020
    },
    "rules": {
        "indent": [
            "error",
            4,
            { "SwitchCase": 1 },
        ],
        "linebreak-style": 0,
        "no-console": [
            "off"
        ],
        "no-constant-condition": [
            "warn"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};