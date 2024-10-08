import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from '@stylistic/eslint-plugin';

export default [
	pluginJs.configs.recommended,
	stylistic.configs.customize({ quotes: "double", semi: true, jsx: false, braceStyle: "allman", allowSingleLine: true }),
	...tseslint.configs.recommended,
	...tseslint.configs.stylisticTypeChecked,
	{
		files: [
			"src/**/*.{js,ts}"
		],
		ignores: [
			"node_modules/**/*.*"
		],
		languageOptions: { 
			globals: globals.browser,
			parser: tseslint.parser,
			parserOptions: { project: "./tsconfig.json", tsconfigRootDir: import.meta.dirname },
		},
		rules: {
			"@stylistic/indent": ['error', 4],
			"@stylistic/quotes": ["error", "double"],
			"@stylistic/linebreak-style": ["error", "windows"],
			"@stylistic/max-statements-per-line": ["error", {"max": 2}],
			"@stylistic/operator-linebreak": ["error", "after"],
			"@stylistic/comma-dangle": ["error", "never"],
			"@stylistic/operator-linebreak": ["error", "before", {"overrides": {"=": "after", "?": "after", ":": "after"}}],
			"@stylistic/arrow-parens": ["error", "always"],
			"@typescript-eslint/prefer-nullish-coalescing": "off",
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/prefer-find": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": ["error", {
				"argsIgnorePattern": "^_",
				"caughtErrorsIgnorePattern": "^_",
				"destructuredArrayIgnorePattern": "^_",
				"varsIgnorePattern": "^_",
			}],
			"@typescript-eslint/non-nullable-type-assertion-style": "off",
			"@typescript-eslint/class-literal-property-style": ["error", "getters"],
			"no-unused-vars": "off",
            "no-undef": "off",
			"dot-notation" : "off"
		}
	},
	{
		files: ["src/types/**/*.*"], 
		ignores: ["**/*"] // Ensures all files within /src/types are ignored
	}
];
