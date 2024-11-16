import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../prefer-jest-globals';
import { DescribeAlias, HookName, TestCaseName } from '../utils';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
});

const examples: Array<{ method: string; code: string }> = [
  ...Object.keys({ ...DescribeAlias, ...TestCaseName }).map(method => ({
    method,
    code: `${method}('foo', () => {})`,
  })),
  ...Object.keys(HookName).map(method => ({
    method,
    code: `${method}(() => {})`,
  })),
  { method: 'describe', code: 'describe.only("foo", () => {})' },
  { method: 'it', code: 'it.only("foo", () => {})' },
  { method: 'it', code: 'it.todo("foo", () => {})' },
  { method: 'expect', code: 'expect("foo").toBe("foo")' },
  { method: 'jest', code: 'jest.fn()' },
];

ruleTester.run('prefer-jest-globals', rule, {
  valid: [
    ...examples.map(
      ({ method, code }) => dedent`
      import { ${method} } from '@jest/globals';
      ${code};
    `,
    ),
    dedent`
      const describe = (param, func) => {};
      describe("foo", () => {});
    `,
    dedent`
      const it = (param, func) => {};
      it("foo", () => {});
    `,
    dedent`
      const afterAll = (func) => {};
      afterAll(() => {});
    `,
    dedent`
      const expect = (str) => ({ toBe: (val) => {} });
      expect('foo').toBe('foo');
    `,
    dedent`
      const jest = { fn: () => {} };
      jest.fn();
    `,
  ],
  invalid: [
    ...examples.map(({ method, code }) => ({
      code,
      output: null,
      errors: [
        {
          messageId: 'preferImport' as const,
          data: { method },
        },
      ],
    })),
  ],
});
