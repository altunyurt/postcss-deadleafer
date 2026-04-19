/**
 * Basic usage example for TypedCSS PostCSS plugin
 */

const postcss = require('postcss');
const deadleafer = require('../dist/index').default;

// Example CSS with various validation issues
const css = `
/* Example 1: Inline element with invalid properties */
span {
  display: inline;
  width: 100px; /* Error: Inline elements ignore width */
  margin-top: 10px; /* Error: Inline elements ignore vertical margins */
  justify-content: center; /* Error: Requires flex/grid context */
  color: red; /* Valid */
}

/* Example 2: Blockified inline element */
.absolute-span {
  display: inline;
  position: absolute;
  width: 200px; /* Valid due to blockification */
  height: 100px; /* Valid due to blockification */
  top: 0;
  left: 0;
  background: blue;
}

/* Example 3: Flex container with valid properties */
.flex-container {
  display: flex;
  justify-content: center; /* Valid */
  align-items: stretch; /* Valid */
  width: 100%; /* Valid */
  padding: 20px;
}

/* Example 4: Invalid flex property in block context */
.wrong-flex {
  display: block;
  justify-content: center; /* Error: Requires flex/grid context */
  margin: 10px;
}

/* Example 5: Positioning with z-index */
.positioned {
  position: relative;
  z-index: 10; /* Valid */
  background: yellow;
}

.static-z {
  position: static;
  z-index: 20; /* Error: z-index requires non-static position */
}
`;

async function runExamples() {
  console.log('=== TypedCSS PostCSS Plugin Examples ===\n');
  
  // Example 1: Warning Mode
  console.log('1. Warning Mode (default):');
  console.log('   Logs errors but keeps all properties in output\n');
  
  const warningResult = await postcss([
    deadleafer({ mode: 'warning', logErrors: true })
  ]).process(css, { from: undefined });
  
  console.log('Warnings found:', warningResult.warnings().length);
  warningResult.warnings().forEach((warning, i) => {
    console.log(`   ${i + 1}. ${warning.text}`);
  });
  console.log('\nOutput CSS length:', warningResult.css.length, 'characters\n');
  
  // Example 2: Prune Mode
  console.log('2. Prune Mode:');
  console.log('   Removes invalid properties from output\n');
  
  const pruneResult = await postcss([
    deadleafer({ mode: 'prune', logErrors: true })
  ]).process(css, { from: undefined });
  
  console.log('Pruned CSS preview:');
  console.log(pruneResult.css.substring(0, 500) + '...\n');
  
  // Example 3: Strict Mode
  console.log('3. Strict Mode (with try-catch):');
  console.log('   Throws error on first validation issue\n');
  
  try {
    const strictResult = await postcss([
      deadleafer({ mode: 'warning', strict: true, logErrors: true })
    ]).process(css, { from: undefined });
    console.log('   No errors thrown (unexpected)');
  } catch (error) {
    console.log('   Error caught:', error.message.substring(0, 100) + '...');
  }
  
  // Example 4: Analyzing specific selectors
  console.log('\n4. Analysis of specific rules:');
  
  const rules = css.split('}').map(rule => rule.trim()).filter(rule => rule);
  rules.forEach((rule, i) => {
    const selectorMatch = rule.match(/^([^{]+){/);
    if (selectorMatch) {
      const selector = selectorMatch[1].trim();
      console.log(`   ${i + 1}. ${selector}`);
    }
  });
  
  console.log('\n=== Summary ===');
  console.log('The plugin successfully:');
  console.log('• Detects invalid properties based on CSS formatting contexts');
  console.log('• Handles blockification logic (position/float changes display type)');
  console.log('• Supports warning mode (logs errors) and prune mode (removes invalid properties)');
  console.log('• Validates flex/grid properties only in appropriate contexts');
  console.log('• Checks positioning properties require non-static position');
}

// Run the examples
runExamples().catch(console.error);