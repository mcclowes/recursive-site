import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.extends('prettier'),
  {
    ignores: [
      '.next/**/*',
      'dist/**/*',
      'build/**/*',
      'node_modules/**/*',
      '.github/scripts/**/*',
      'scripts/**/*',
      'jest.config.js',
    ],
  },
];

export default eslintConfig;
