/**
 * Basic tests for TypedCSS PostCSS plugin
 */

import postcss from 'postcss';
import deadleafer from '../src/index';

describe('TypedCSS PostCSS Plugin', () => {
  test('should detect invalid properties on inline element (warning mode)', async () => {
    const css = `
      span {
        display: inline;
        width: 100px; /* Error: Inline elements ignore width */
        margin-top: 10px; /* Error: Inline elements ignore vertical margins */
        justify-content: center; /* Error: Requires flex/grid context */
        color: red; /* Valid */
      }
    `;

    const result = await postcss([
      deadleafer({ mode: 'warning', logErrors: true })
    ]).process(css, { from: undefined });

    // Should have warnings
    expect(result.warnings()).toHaveLength(3);
    
    // Check specific warnings
    const warnings = result.warnings();
    expect(warnings[0].text).toContain('width');
    expect(warnings[1].text).toContain('margin-top');
    expect(warnings[2].text).toContain('justify-content');
    
    // Color should remain in output
    expect(result.css).toContain('color: red');
  });

  test('should prune invalid properties (prune mode)', async () => {
    const css = `
      span {
        display: inline;
        width: 100px;
        margin-top: 10px;
        justify-content: center;
        color: red;
      }
    `;

    const result = await postcss([
      deadleafer({ mode: 'prune', logErrors: true })
    ]).process(css, { from: undefined });

    // Invalid properties should be removed
    expect(result.css).not.toContain('width: 100px');
    expect(result.css).not.toContain('margin-top: 10px');
    expect(result.css).not.toContain('justify-content: center');
    
    // Valid properties should remain
    expect(result.css).toContain('color: red');
    expect(result.css).toContain('display: inline');
  });

  test('should handle blockification correctly', async () => {
    const css = `
      span {
        display: inline;
        position: absolute;
        width: 100px; /* Should be valid due to blockification */
        height: 50px; /* Should be valid due to blockification */
        color: blue;
      }
    `;

    const result = await postcss([
      deadleafer({ mode: 'warning', logErrors: true })
    ]).process(css, { from: undefined });

    // Should have no warnings (width/height are valid due to blockification)
    expect(result.warnings()).toHaveLength(0);
    
    // All properties should remain
    expect(result.css).toContain('width: 100px');
    expect(result.css).toContain('height: 50px');
    expect(result.css).toContain('color: blue');
  });

  test('should validate flex properties in flex context', async () => {
    const css = `
      .container {
        display: flex;
        justify-content: center; /* Valid */
        align-items: stretch; /* Valid */
        width: 100%; /* Valid in flex context */
      }
      
      .wrong-context {
        display: block;
        justify-content: center; /* Invalid */
      }
    `;

    const result = await postcss([
      deadleafer({ mode: 'warning', logErrors: true })
    ]).process(css, { from: undefined });

    // Should have 1 warning for wrong-context
    expect(result.warnings()).toHaveLength(1);
    expect(result.warnings()[0].text).toContain('justify-content');
    expect(result.warnings()[0].text).toContain('wrong-context');
  });

  test('should handle z-index with positioning', async () => {
    const css = `
      .static {
        position: static;
        z-index: 10; /* Invalid */
      }
      
      .relative {
        position: relative;
        z-index: 20; /* Valid */
      }
    `;

    const result = await postcss([
      deadleafer({ mode: 'warning', logErrors: true })
    ]).process(css, { from: undefined });

    // Should have 1 warning for static element
    expect(result.warnings()).toHaveLength(1);
    expect(result.warnings()[0].text).toContain('z-index');
    expect(result.warnings()[0].text).toContain('static');
  });

  test('should handle float in flex context', async () => {
    const css = `
      .flex-item {
        display: flex;
        float: left; /* Invalid in flex context */
      }
      
      .block-item {
        display: block;
        float: right; /* Valid in block context */
      }
    `;

    const result = await postcss([
      deadleafer({ mode: 'warning', logErrors: true })
    ]).process(css, { from: undefined });

    // Should have 1 warning for flex item
    expect(result.warnings()).toHaveLength(1);
    expect(result.warnings()[0].text).toContain('float');
    expect(result.warnings()[0].text).toContain('flex');
  });
});