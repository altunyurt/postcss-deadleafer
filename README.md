**Important** 

This project is AI slop. It passes the tests, but still use at your own risk. 

# PostCSS Deadleafer

A PostCSS plugin that enforces layout-logic constraints similar to TypeScript's type safety. It identifies and prunes "dead" or "invalid" CSS properties based on CSS Level 3 Formatting Contexts.

## Features

- **Context-aware validation**: Properties are validated based on the current `display`, `position`, and `float` context
- **Conflict detection**: Flags properties used in the wrong formatting context
- **Blockification logic**: Automatically handles properties that change display type
- **Dual output modes**: Warning mode (logs errors) and Prune mode (removes invalid properties)
- **TypeScript support**: Full TypeScript definitions included

## Installation

```bash
npm install postcss-deadleafer --save-dev
```

## Usage

### Basic Usage with PostCSS

```javascript
const postcss = require('postcss');
const deadleafer = require('postcss-deadleafer');

const css = `
  span {
    display: inline;
    width: 100px; /* Will be flagged as invalid */
    color: red; /* Valid */
  }
`;

postcss([
  deadleafer({ mode: 'warning' })
])
.process(css, { from: undefined })
.then(result => {
  console.log(result.css);
  console.log(result.warnings()); // Shows validation warnings
});
```

### With PostCSS Config

Create a `postcss.config.js` file:

```javascript
module.exports = {
  plugins: [
    require('postcss-deadleafer')({
      mode: 'warning', // or 'prune'
      strict: false,
      logErrors: true
    })
  ]
};
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | `'warning' \| 'prune'` | `'warning'` | Warning mode logs errors, prune mode removes invalid properties |
| `strict` | `boolean` | `false` | In warning mode, throws errors instead of warnings |
| `logErrors` | `boolean` | `true` | Whether to log validation errors |
| `outputFile` | `string` | `undefined` | Optional file to output validation results |

## Validation Rules

### Context-Based Property Validation

The plugin maintains a `ContextMap` that tracks allowed properties based on:

1. **Display value** (`block`, `inline`, `flex`, `grid`, etc.)
2. **Position value** (`static`, `relative`, `absolute`, etc.)
3. **Float value** (`none`, `left`, `right`)

### Common Validation Scenarios

#### 1. Inline Elements Ignore Box Model Properties
```css
span {
  display: inline;
  width: 100px; /* ERROR: Inline elements ignore width */
  margin-top: 10px; /* ERROR: Inline elements ignore vertical margins */
}
```

#### 2. Flex/Grid Properties Require Proper Context
```css
div {
  display: block;
  justify-content: center; /* ERROR: Requires flex/grid context */
  align-items: stretch; /* ERROR: Requires flex/grid context */
}
```

#### 3. Blockification Logic
```css
span {
  display: inline;
  position: absolute; /* Blockifies the element */
  width: 100px; /* VALID: Element is now blockified */
  height: 50px; /* VALID: Element is now blockified */
}
```

#### 4. Positioning Properties Require Non-Static Position
```css
.static {
  position: static;
  z-index: 10; /* ERROR: z-index requires non-static position */
  top: 0; /* ERROR: Positioning properties require non-static position */
}

.relative {
  position: relative;
  z-index: 20; /* VALID */
  top: 0; /* VALID */
}
```

#### 5. Layout Ignored Properties
```css
.flex-item {
  display: flex;
  float: left; /* ERROR: float is ignored on flex items */
}

.block-element {
  display: block;
  vertical-align: middle; /* ERROR: vertical-align ignored on block-level elements */
}
```

## Examples

### Example 1: Warning Mode
```javascript
const result = await postcss([
  deadleafer({ mode: 'warning' })
]).process(css);

// Output contains warnings but keeps all properties
console.log(result.warnings());
// [
//   { text: 'Deadleafer: width is ignored on inline elements...', ... },
//   { text: 'Deadleafer: justify-content requires flex/grid context...', ... }
// ]
```

### Example 2: Prune Mode
```javascript
const result = await postcss([
  deadleafer({ mode: 'prune' })
]).process(css);

// Invalid properties are removed from output
console.log(result.css);
// span {
//   display: inline;
//   color: red;
// }
```

### Example 3: Strict Mode
```javascript
try {
  const result = await postcss([
    deadleafer({ mode: 'warning', strict: true })
  ]).process(css);
} catch (error) {
  console.error('Validation failed:', error.message);
  // Process stops on first validation error
}
```

## API Reference

### `deadleafer(options?: DeadleaferOptions): Plugin`

Creates a PostCSS plugin instance.

#### Types
```typescript
interface DeadleaferOptions {
  mode?: 'warning' | 'prune';
  strict?: boolean;
  logErrors?: boolean;
  outputFile?: string;
}

interface ValidationError {
  property: string;
  value: string;
  reason: string;
  selector: string;
  line?: number;
  column?: number;
}
```

## How It Works

### 1. Context Map State Machine
The plugin builds a state machine that tracks:
- Current display context (`block`, `inline`, `flex`, `grid`)
- Positioning context (`static`, `relative`, `absolute`, etc.)
- Float context (`none`, `left`, `right`)
- Blockification state (whether element has been blockified)

### 2. Property Grouping
Properties are grouped by context:
- **Block properties**: `width`, `height`, vertical margins/padding
- **Inline properties**: Only horizontal margins/padding
- **Flex properties**: `justify-content`, `align-items`, `gap`, etc.
- **Grid properties**: `grid-template-columns`, `grid-area`, etc.
- **Common properties**: `color`, `background`, `font`, etc. (allowed everywhere)

### 3. Blockification Rules
Elements are automatically blockified when:
- `position: absolute` or `position: fixed` is set
- `float: left` or `float: right` is set

Blockified inline elements gain access to block-level properties.

### 4. Conflict Matrix
The plugin uses a conflict matrix to detect:
- Flex/Grid properties used in block/inline contexts
- Box model properties used on inline elements
- Positioning properties used with `position: static`
- Layout-ignored properties (`float` on flex items, `vertical-align` on blocks)

## Development

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## License

MIT
