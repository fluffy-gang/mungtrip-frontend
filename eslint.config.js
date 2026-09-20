// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          disallowTypeAnnotations: false,
          fixStyle: "separate-type-imports",
          prefer: "type-imports",
        },
      ],
    },
  },
  {
    ignores: ["dist/*"],
    rules: {
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            ["internal", "parent", "sibling", "index"],
            "type",
          ],
          "newlines-between": "always",
          pathGroups: [
            {
              group: "internal",
              pattern: "@/{components/**,features/*/components}",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin", "type"],
        },
      ],
      "max-lines": [
        "error",
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  }
]);
