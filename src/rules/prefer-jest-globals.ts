import { TSESTree } from '@typescript-eslint/utils';
import {
  collectReferences,
  createRule,
  getNodeName,
  isDescribeCall,
  isExpectCall,
  isHookCall,
  isJestMemberCall,
  isTestCaseCall,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce importing from @jest/globals',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      preferImport: '`{{ method }}` should be imported from `@jest/globals`',
    },
    schema: [],
  } as const,
  defaultOptions: [{}],
  create(context, []) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        // Note: this MUST be done locally, or it will be wrong
        // (can't share between all nodes)
        const scope = context.getScope();
        const references = collectReferences(scope);

        if (
          !(
            isTestCaseCall(node, scope, references) ||
            isDescribeCall(node, scope, references) ||
            isHookCall(node, scope, references) ||
            isExpectCall(node, scope, references) ||
            isJestMemberCall(node, scope, references)
          )
        ) {
          return;
        }

        const name = getNodeName(node)?.split('.')[0];

        if (name && references.imports.get(name)?.source !== '@jest/globals') {
          context.report({
            messageId: 'preferImport',
            node,
            data: { method: name },
          });
        }
      },
    };
  },
});
