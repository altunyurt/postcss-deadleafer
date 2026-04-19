/**
 * Deadleafer PostCSS Plugin
 * Main entry point for the PostCSS plugin
 */
import { Plugin } from 'postcss';
import { ContextMap } from './ContextMap';
import { PropertyValidator } from './PropertyValidator';
import { DeadleaferOptions, ValidationError, ValidationMode } from './types';
declare function deadleafer(options?: DeadleaferOptions): Plugin;
declare namespace deadleafer {
    var postcss: boolean;
}
export default deadleafer;
export { DeadleaferOptions, ValidationError, ValidationMode };
export { ContextMap, PropertyValidator };
//# sourceMappingURL=index.d.ts.map