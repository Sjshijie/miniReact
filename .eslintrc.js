export default {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "jsx-quotes": [
            "error",
            "prefer-single"
          ],
          "react/jsx-uses-react": "error",
          "react/jsx-uses-vars": "error",
          "react/jsx-no-undef": "error",
          "react/jsx-fragments": [
            "error",
            "syntax"
          ],
          "react-hooks/rules-of-hooks": "error",
          "react-hooks/exhaustive-deps": ["warn", {
            "additionalHooks": "(useComponentDidUpdate)"
          }]
    }
}
