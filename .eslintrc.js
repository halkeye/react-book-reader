module.exports = {
    "parser": "babel-eslint",
    "extends": [
      "plugin:react/recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
      "standard"
    ],
    "plugins": [
        "standard",
        "promise",
        "import",
      // "jsx-a11y",
        "react"
    ],
    "rules": {
      "semi": [2, "always"],
      "no-var": "error"
    },
    "env": {
      "browser": true,
      "es6": true
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        }
    }
};
