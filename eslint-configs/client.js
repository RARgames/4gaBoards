module.exports = [
  {
    rules: {
      // Specify whether double or single quotes should be used in JSX attributes
      // https://eslint.org/docs/rules/jsx-quotes
      'jsx-quotes': ['error', 'prefer-double'],

      'class-methods-use-this': [
        'error',
        {
          exceptMethods: [
            'render',
            'getInitialState',
            'getDefaultProps',
            'getChildContext',
            'componentWillMount',
            'UNSAFE_componentWillMount',
            'componentDidMount',
            'componentWillReceiveProps',
            'UNSAFE_componentWillReceiveProps',
            'shouldComponentUpdate',
            'componentWillUpdate',
            'UNSAFE_componentWillUpdate',
            'componentDidUpdate',
            'componentWillUnmount',
            'componentDidCatch',
            'getSnapshotBeforeUpdate',
          ],
        },
      ],

      // Prevent missing displayName in a React component definition
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/display-name.md
      'react/display-name': ['off', { ignoreTranspilerName: false }],

      // Forbid certain propTypes (any, array, object)
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/forbid-prop-types.md
      'react/forbid-prop-types': [
        'error',
        {
          forbid: ['any', 'array', 'object'],
          checkContextTypes: true,
          checkChildContextTypes: true,
        },
      ],

      // Forbid certain props on DOM Nodes
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/forbid-dom-props.md
      'react/forbid-dom-props': ['off', { forbid: [] }],

      // Enforce boolean attributes notation in JSX
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-boolean-value.md
      'react/jsx-boolean-value': ['error', 'never', { always: [] }],

      // Validate closing bracket location in JSX
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-closing-bracket-location.md
      'react/jsx-closing-bracket-location': ['error', 'line-aligned'],

      // Validate closing tag location in JSX
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-closing-tag-location.md
      'react/jsx-closing-tag-location': 'error',

      // Enforce or disallow spaces inside of curly braces in JSX attributes
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-curly-spacing.md
      'react/jsx-curly-spacing': ['error', 'never', { allowMultiline: true }],

      // Enforce event handler naming conventions in JSX
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-handler-names.md
      'react/jsx-handler-names': [
        'off',
        {
          eventHandlerPrefix: 'handle',
          eventHandlerPropPrefix: 'on',
        },
      ],

      // Validate props indentation in JSX
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-indent-props.md
      'react/jsx-indent-props': ['error', 2],

      // Limit maximum of props on a single line in JSX
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-max-props-per-line.md
      'react/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],

      // Prevent usage of .bind() in JSX props
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md
      'react/jsx-no-bind': [
        'error',
        {
          ignoreRefs: true,
          allowArrowFunctions: true,
          allowFunctions: false,
          allowBind: false,
          ignoreDOMComponents: true,
        },
      ],

      // Prevent duplicate props in JSX
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-duplicate-props.md
      'react/jsx-no-duplicate-props': ['error', { ignoreCase: true }],

      // Prevent usage of unwrapped JSX strings
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-literals.md
      'react/jsx-no-literals': ['off', { noStrings: true }],

      // Disallow undeclared variables in JSX
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-undef.md
      'react/jsx-no-undef': 'error',

      // Enforce PascalCase for user-defined JSX components
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-pascal-case.md
      'react/jsx-pascal-case': [
        'error',
        {
          allowAllCaps: true,
          ignore: [],
        },
      ],

      // Enforce propTypes declarations alphabetical sorting
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/sort-prop-types.md
      'react/sort-prop-types': [
        'off',
        {
          ignoreCase: true,
          callbacksLast: false,
          requiredFirst: false,
          sortShapeProp: true,
        },
      ],

      // Enforce props alphabetical sorting
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-sort-props.md
      'react/jsx-sort-props': [
        'off',
        {
          ignoreCase: true,
          callbacksLast: false,
          shorthandFirst: false,
          shorthandLast: false,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],

      // Enforce defaultProps declarations alphabetical sorting
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/jsx-sort-default-props.md
      'react/jsx-sort-default-props': [
        'off',
        {
          ignoreCase: true,
        },
      ],

      // Prevent React to be incorrectly marked as unused
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-uses-react.md
      'react/jsx-uses-react': ['error'],

      // Prevent variables used in JSX to be incorrectly marked as unused
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-uses-vars.md
      'react/jsx-uses-vars': 'error',

      // Prevent usage of dangerous JSX properties
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-danger.md
      'react/no-danger': 'warn',

      // Prevent usage of deprecated methods
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-deprecated.md
      'react/no-deprecated': ['error'],

      // Prevent usage of setState in componentDidMount
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-did-mount-set-state.md
      // this is necessary for server-rendering
      'react/no-did-mount-set-state': 'off',

      // Prevent usage of setState in componentDidUpdate
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-did-update-set-state.md
      'react/no-did-update-set-state': 'error',

      // Prevent usage of setState in componentWillUpdate
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-will-update-set-state.md
      'react/no-will-update-set-state': 'error',

      // Prevent direct mutation of this.state
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-direct-mutation-state.md
      'react/no-direct-mutation-state': 'warn',

      // Prevent usage of isMounted
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-is-mounted.md
      'react/no-is-mounted': 'error',

      // Prevent multiple component definition per file
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-multi-comp.md
      'react/no-multi-comp': 'off',

      // Prevent usage of setState
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-set-state.md
      'react/no-set-state': 'off',

      // Prevent using string references
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-string-refs.md
      'react/no-string-refs': 'error',

      // Prevent usage of unknown DOM property
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unknown-property.md
      'react/no-unknown-property': 'error',

      // Require ES6 class declarations over React.createClass
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prefer-es6-class.md
      'react/prefer-es6-class': ['error', 'always'],

      // Require stateless functions when not using lifecycle methods, setState or ref
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prefer-stateless-function.md
      'react/prefer-stateless-function': ['error', { ignorePureComponents: true }],

      // Prevent missing props validation in a React component definition
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prop-types.md
      'react/prop-types': [
        'error',
        {
          ignore: [],
          customValidators: [],
          skipUndeclared: false,
        },
      ],

      // Prevent missing React when using JSX
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md
      'react/react-in-jsx-scope': 'error',

      // Require render() methods to return something
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/require-render-return.md
      'react/require-render-return': 'error',

      // Prevent extra closing tags for components without children
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md
      'react/self-closing-comp': 'error',

      // Enforce component methods order
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/sort-comp.md
      'react/sort-comp': [
        'error',
        {
          order: [
            'static-variables',
            'static-methods',
            'instance-variables',
            'lifecycle',
            '/^handle.+$/',
            '/^on.+$/',
            'getters',
            'setters',
            '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
            'instance-methods',
            'everything-else',
            'rendering',
          ],
          groups: {
            lifecycle: [
              'displayName',
              'propTypes',
              'contextTypes',
              'childContextTypes',
              'mixins',
              'statics',
              'defaultProps',
              'constructor',
              'getDefaultProps',
              'getInitialState',
              'state',
              'getChildContext',
              'getDerivedStateFromProps',
              'componentWillMount',
              'UNSAFE_componentWillMount',
              'componentDidMount',
              'componentWillReceiveProps',
              'UNSAFE_componentWillReceiveProps',
              'shouldComponentUpdate',
              'componentWillUpdate',
              'UNSAFE_componentWillUpdate',
              'getSnapshotBeforeUpdate',
              'componentDidUpdate',
              'componentDidCatch',
              'componentWillUnmount',
            ],
            rendering: ['/^render.+$/', 'render'],
          },
        },
      ],

      // Prevent missing parentheses around multilines JSX
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/jsx-wrap-multilines.md
      'react/jsx-wrap-multilines': [
        'error',
        {
          declaration: 'parens-new-line',
          assignment: 'parens-new-line',
          return: 'parens-new-line',
          arrow: 'parens-new-line',
          condition: 'parens-new-line',
          logical: 'parens-new-line',
          prop: 'parens-new-line',
        },
      ],

      // Require that the first prop in a JSX element be on a new line when the element is multiline
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-first-prop-new-line.md
      'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],

      // Enforce spacing around jsx equals signs
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-equals-spacing.md
      'react/jsx-equals-spacing': ['error', 'never'],

      // Enforce JSX indentation
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-indent.md
      'react/jsx-indent': ['error', 2],

      // Disallow target="_blank" on links
      // https://github.com/yannickcr/eslint-plugin-react/blob/ac102885765be5ff37847a871f239c6703e1c7cc/docs/rules/jsx-no-target-blank.md
      'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],

      // only .jsx files may have JSX
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md
      'react/jsx-filename-extension': ['error', { extensions: ['.jsx'] }],

      // prevent accidental JS comments from being injected into JSX as text
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-comment-textnodes.md
      'react/jsx-no-comment-textnodes': 'error',

      // disallow using React.render/ReactDOM.render's return value
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-render-return-value.md
      'react/no-render-return-value': 'error',

      // require a shouldComponentUpdate method, or PureRenderMixin
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/require-optimization.md
      'react/require-optimization': ['off', { allowDecorators: [] }],

      // warn against using findDOMNode()
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-find-dom-node.md
      'react/no-find-dom-node': 'error',

      // Forbid certain props on Components
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/forbid-component-props.md
      'react/forbid-component-props': ['off', { forbid: [] }],

      // Forbid certain elements
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/forbid-elements.md
      'react/forbid-elements': ['off', { forbid: [] }],

      // Prevent problem with children and props.dangerouslySetInnerHTML
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-danger-with-children.md
      'react/no-danger-with-children': 'error',

      // Prevent unused propType definitions
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unused-prop-types.md
      'react/no-unused-prop-types': [
        'error',
        {
          customValidators: [],
          skipShapeProps: true,
        },
      ],

      // Require style prop value be an object or var
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/style-prop-object.md
      'react/style-prop-object': 'error',

      // Prevent invalid characters from appearing in markup
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unescaped-entities.md
      'react/no-unescaped-entities': 'error',

      // Prevent passing of children as props
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-children-prop.md
      'react/no-children-prop': 'error',

      // Validate whitespace in and around the JSX opening and closing brackets
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/jsx-tag-spacing.md
      'react/jsx-tag-spacing': [
        'error',
        {
          closingSlash: 'never',
          beforeSelfClosing: 'always',
          afterOpening: 'never',
          beforeClosing: 'never',
        },
      ],

      // Prevent usage of Array index in keys
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md
      'react/no-array-index-key': 'error',

      // Enforce a defaultProps definition for every prop that is not a required prop
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/require-default-props.md
      'react/require-default-props': [
        'error',
        {
          forbidDefaultForRequired: true,
        },
      ],

      // Forbids using non-exported propTypes
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/forbid-foreign-prop-types.md
      // this is intentionally set to "warn". it would be "error",
      // but it's only critical if you're stripping propTypes in production.
      'react/forbid-foreign-prop-types': ['warn', { allowInPropTypes: true }],

      // Prevent void DOM elements from receiving children
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/void-dom-elements-no-children.md
      'react/void-dom-elements-no-children': 'error',

      // Enforce all defaultProps have a corresponding non-required PropType
      // https://github.com/yannickcr/eslint-plugin-react/blob/9e13ae2c51e44872b45cc15bf1ac3a72105bdd0e/docs/rules/default-props-match-prop-types.md
      'react/default-props-match-prop-types': ['error', { allowRequiredDefaults: false }],

      // Prevent usage of shouldComponentUpdate when extending React.PureComponent
      // https://github.com/yannickcr/eslint-plugin-react/blob/9e13ae2c51e44872b45cc15bf1ac3a72105bdd0e/docs/rules/no-redundant-should-component-update.md
      'react/no-redundant-should-component-update': 'error',

      // Prevent unused state values
      // https://github.com/yannickcr/eslint-plugin-react/pull/1103/
      'react/no-unused-state': 'error',

      // Enforces consistent naming for boolean props
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/boolean-prop-naming.md
      'react/boolean-prop-naming': [
        'off',
        {
          propTypeNames: ['bool', 'mutuallyExclusiveTrueProps'],
          rule: '^(is|has)[A-Z]([A-Za-z0-9]?)+',
          message: '',
        },
      ],

      // Prevents common casing typos
      // https://github.com/yannickcr/eslint-plugin-react/blob/73abadb697034b5ccb514d79fb4689836fe61f91/docs/rules/no-typos.md
      'react/no-typos': 'error',

      // Enforce curly braces or disallow unnecessary curly braces in JSX props and/or children
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-curly-brace-presence.md
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],

      // Enforce consistent usage of destructuring assignment of props, state, and context
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/destructuring-assignment.md
      'react/destructuring-assignment': ['error', 'always'],

      // Prevent using this.state within a this.setState
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/no-access-state-in-setstate.md
      'react/no-access-state-in-setstate': 'error',

      // Prevent usage of button elements without an explicit type attribute
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/button-has-type.md
      'react/button-has-type': [
        'error',
        {
          button: true,
          submit: true,
          reset: false,
        },
      ],

      // Ensures inline tags are not rendered without spaces between them
      'react/jsx-child-element-spacing': 'off',

      // Prevent this from being used in stateless functional components
      // https://github.com/yannickcr/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/no-this-in-sfc.md
      'react/no-this-in-sfc': 'error',

      // Validate JSX maximum depth
      // https://github.com/yannickcr/eslint-plugin-react/blob/abe8381c0d6748047224c430ce47f02e40160ed0/docs/rules/jsx-max-depth.md
      'react/jsx-max-depth': 'off',

      // Disallow multiple spaces between inline JSX props
      // https://github.com/yannickcr/eslint-plugin-react/blob/ac102885765be5ff37847a871f239c6703e1c7cc/docs/rules/jsx-props-no-multi-spaces.md
      'react/jsx-props-no-multi-spaces': 'error',

      // Prevent usage of UNSAFE_ methods
      // https://github.com/yannickcr/eslint-plugin-react/blob/157cc932be2cfaa56b3f5b45df6f6d4322a2f660/docs/rules/no-unsafe.md
      'react/no-unsafe': 'off',

      // Enforce shorthand or standard form for React fragments
      // https://github.com/yannickcr/eslint-plugin-react/blob/bc976b837abeab1dffd90ac6168b746a83fc83cc/docs/rules/jsx-fragments.md
      'react/jsx-fragments': ['error', 'syntax'],

      // Enforce state initialization style
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/state-in-constructor.md
      'react/state-in-constructor': ['error', 'never'],

      // Enforces where React component static properties should be positioned
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/static-property-placement.md
      'react/static-property-placement': ['error', 'static public field'],

      // Disallow JSX props spreading
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-props-no-spreading.md
      'react/jsx-props-no-spreading': [
        'error',
        {
          html: 'enforce',
          custom: 'enforce',
          explicitSpread: 'ignore',
          exceptions: [],
        },
      ],

      // Enforce that props are read-only
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prefer-read-only-props.md
      'react/prefer-read-only-props': 'off',

      // Prevent usage of `javascript:` URLs
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-script-url.md
      'react/jsx-no-script-url': [
        'error',
        [
          {
            name: 'Link',
            props: ['to'],
          },
        ],
      ],

      // Disallow unnecessary fragments
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-useless-fragment.md
      'react/jsx-no-useless-fragment': 'error',

      // Prevent adjacent inline elements not separated by whitespace
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-adjacent-inline-elements.md
      'react/no-adjacent-inline-elements': 'error',

      // Enforce a specific function type for function components
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/function-component-definition.md
      'react/function-component-definition': [
        'error',
        {
          namedComponents: ['function-declaration', 'function-expression'],
          unnamedComponents: 'function-expression',
        },
      ],

      // Enforce a new line after jsx elements and expressions
      // https://github.com/yannickcr/eslint-plugin-react/blob/e2eaadae316f9506d163812a09424eb42698470a/docs/rules/jsx-newline.md
      'react/jsx-newline': 'off',

      // Prevent react contexts from taking non-stable values
      // https://github.com/yannickcr/eslint-plugin-react/blob/e2eaadae316f9506d163812a09424eb42698470a/docs/rules/jsx-no-constructed-context-values.md
      'react/jsx-no-constructed-context-values': 'error',

      // Prevent creating unstable components inside components
      // https://github.com/yannickcr/eslint-plugin-react/blob/c2a790a3472eea0f6de984bdc3ee2a62197417fb/docs/rules/no-unstable-nested-components.md
      'react/no-unstable-nested-components': 'error',

      // Enforce that namespaces are not used in React elements
      // https://github.com/yannickcr/eslint-plugin-react/blob/8785c169c25b09b33c95655bf508cf46263bc53f/docs/rules/no-namespace.md
      'react/no-namespace': 'error',

      // Prefer exact proptype definitions
      // https://github.com/yannickcr/eslint-plugin-react/blob/8785c169c25b09b33c95655bf508cf46263bc53f/docs/rules/prefer-exact-props.md
      'react/prefer-exact-props': 'error',

      // Lifecycle methods should be methods on the prototype, not class fields
      // https://github.com/yannickcr/eslint-plugin-react/blob/21e01b61af7a38fc86d94f27eb66cda8054582ed/docs/rules/no-arrow-function-lifecycle.md
      'react/no-arrow-function-lifecycle': 'error',

      // Prevent usage of invalid attributes
      // https://github.com/yannickcr/eslint-plugin-react/blob/21e01b61af7a38fc86d94f27eb66cda8054582ed/docs/rules/no-invalid-html-attribute.md
      'react/no-invalid-html-attribute': 'error',

      // Prevent declaring unused methods of component class
      // https://github.com/yannickcr/eslint-plugin-react/blob/21e01b61af7a38fc86d94f27eb66cda8054582ed/docs/rules no-unused-class-component-methods.md
      'react/no-unused-class-component-methods': 'error',

      // Enforce that all elements that require alternative text have meaningful information
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/alt-text.md
      'jsx-a11y/alt-text': [
        'error',
        {
          elements: ['img', 'object', 'area', 'input[type="image"]'],
          img: [],
          object: [],
          area: [],
          'input[type="image"]': [],
        },
      ],

      // Enforce that anchors have content
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/anchor-has-content.md
      'jsx-a11y/anchor-has-content': ['error', { components: [] }],

      // ensure <a> tags are valid
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/0745af376cdc8686d85a361ce36952b1fb1ccf6e/docs/rules/anchor-is-valid.md
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['to'],
          aspects: ['noHref', 'invalidHref', 'preferButton'],
        },
      ],

      // elements with aria-activedescendant must be tabbable
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/aria-activedescendant-has-tabindex.md
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',

      // Enforce all aria-* props are valid.
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/aria-props.md
      'jsx-a11y/aria-props': 'error',

      // Enforce ARIA state and property values are valid.
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/aria-proptypes.md
      'jsx-a11y/aria-proptypes': 'error',

      // Require ARIA roles to be valid and non-abstract
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/aria-role.md
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: false }],

      // Enforce that elements that do not support ARIA roles, states, and
      // properties do not have those attributes.
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/aria-unsupported-elements.md
      'jsx-a11y/aria-unsupported-elements': 'error',

      // Ensure the autocomplete attribute is correct and suitable for the form field it is used with
      // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/29c68596b15c4ff0a40daae6d4a2670e36e37d35/docs/rules/autocomplete-valid.md
      'jsx-a11y/autocomplete-valid': [
        'off',
        {
          inputComponents: [],
        },
      ],

      // require onClick be accompanied by onKeyUp/onKeyDown/onKeyPress
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/click-events-have-key-events.md
      'jsx-a11y/click-events-have-key-events': 'error',

      // Enforce that a control (an interactive element) has a text label.
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/control-has-associated-label.md
      'jsx-a11y/control-has-associated-label': [
        'error',
        {
          labelAttributes: ['label'],
          controlComponents: [],
          ignoreElements: ['audio', 'canvas', 'embed', 'input', 'textarea', 'tr', 'video'],
          ignoreRoles: ['grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'row', 'tablist', 'toolbar', 'tree', 'treegrid'],
          depth: 5,
        },
      ],

      // ensure <hX> tags have content and are not aria-hidden
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/heading-has-content.md
      'jsx-a11y/heading-has-content': ['error', { components: [''] }],

      // require HTML elements to have a "lang" prop
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/html-has-lang.md
      'jsx-a11y/html-has-lang': 'error',

      // ensure iframe elements have a unique title
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/iframe-has-title.md
      'jsx-a11y/iframe-has-title': 'error',

      // Prevent img alt text from containing redundant words like "image", "picture", or "photo"
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/img-redundant-alt.md
      'jsx-a11y/img-redundant-alt': 'error',

      // Elements with an interactive role and interaction handlers must be focusable
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/interactive-supports-focus.md
      'jsx-a11y/interactive-supports-focus': 'error',

      // Enforce that a label tag has a text label and an associated control.
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/b800f40a2a69ad48015ae9226fbe879f946757ed/docs/rules/label-has-associated-control.md
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          labelComponents: [],
          labelAttributes: [],
          controlComponents: [],
          assert: 'both',
          depth: 25,
        },
      ],

      // require HTML element's lang prop to be valid
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/lang.md
      'jsx-a11y/lang': 'error',

      // media elements must have captions
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/media-has-caption.md
      'jsx-a11y/media-has-caption': [
        'error',
        {
          audio: [],
          video: [],
          track: [],
        },
      ],

      // require that mouseover/out come with focus/blur, for keyboard-only users
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
      'jsx-a11y/mouse-events-have-key-events': 'error',

      // Prevent use of `accessKey`
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-access-key.md
      'jsx-a11y/no-access-key': 'error',

      // prohibit autoFocus prop
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-autofocus.md
      'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],

      // prevent distracting elements, like <marquee> and <blink>
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-distracting-elements.md
      'jsx-a11y/no-distracting-elements': [
        'error',
        {
          elements: ['marquee', 'blink'],
        },
      ],

      // WAI-ARIA roles should not be used to convert an interactive element to non-interactive
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-interactive-element-to-noninteractive-role.md
      'jsx-a11y/no-interactive-element-to-noninteractive-role': [
        'error',
        {
          tr: ['none', 'presentation'],
        },
      ],

      // A non-interactive element does not support event handlers (mouse and key handlers)
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-noninteractive-element-interactions.md
      'jsx-a11y/no-noninteractive-element-interactions': [
        'error',
        {
          handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
        },
      ],

      // WAI-ARIA roles should not be used to convert a non-interactive element to interactive
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-noninteractive-element-to-interactive-role.md
      'jsx-a11y/no-noninteractive-element-to-interactive-role': [
        'error',
        {
          ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
          ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
          li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
          table: ['grid'],
          td: ['gridcell'],
        },
      ],

      // Tab key navigation should be limited to elements on the page that can be interacted with.
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-noninteractive-tabindex.md
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        {
          tags: [],
          roles: ['tabpanel'],
        },
      ],

      // require onBlur instead of onChange
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-onchange.md
      'jsx-a11y/no-onchange': 'off',

      // ensure HTML elements do not specify redundant ARIA roles
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-redundant-roles.md
      'jsx-a11y/no-redundant-roles': 'error',

      // Enforce that DOM elements without semantic behavior not have interaction handlers
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-static-element-interactions.md
      'jsx-a11y/no-static-element-interactions': [
        'error',
        {
          handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
        },
      ],

      // Enforce that elements with ARIA roles must have all required attributes
      // for that role.
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/role-has-required-aria-props.md
      'jsx-a11y/role-has-required-aria-props': 'error',

      // Enforce that elements with explicit or implicit roles defined contain
      // only aria-* properties supported by that role.
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/role-supports-aria-props.md
      'jsx-a11y/role-supports-aria-props': 'error',

      // only allow <th> to have the "scope" attr
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/scope.md
      'jsx-a11y/scope': 'error',

      // Enforce tabIndex value is not greater than zero.
      // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/tabindex-no-positive.md
      'jsx-a11y/tabindex-no-positive': 'error',
    },
  },
];
