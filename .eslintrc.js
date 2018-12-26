module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "webextensions": true,
    },
    "extends": ["eslint:recommended", "prettier"],
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module",
    },
    "plugins": ["prettier"]
};
