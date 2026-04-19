"use strict";
/**
 * Deadleafer PostCSS Plugin
 * Main entry point for the PostCSS plugin
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyValidator = exports.ContextMap = void 0;
exports.default = deadleafer;
const ContextMap_1 = require("./ContextMap");
Object.defineProperty(exports, "ContextMap", { enumerable: true, get: function () { return ContextMap_1.ContextMap; } });
const PropertyValidator_1 = require("./PropertyValidator");
Object.defineProperty(exports, "PropertyValidator", { enumerable: true, get: function () { return PropertyValidator_1.PropertyValidator; } });
function deadleafer(options = {}) {
    const { mode = 'warning', strict = false, logErrors = true, outputFile } = options;
    return {
        postcssPlugin: 'deadleafer',
        Once(root, { result }) {
            const errors = [];
            const contextMap = new ContextMap_1.ContextMap();
            const validator = new PropertyValidator_1.PropertyValidator(contextMap);
            // Walk through all rules
            root.walkRules((rule) => {
                // Reset context for each rule
                contextMap.reset();
                validator.reset();
                const selector = rule.selector;
                // First pass: collect display, position, float declarations
                // to establish initial context
                rule.walkDecls((decl) => {
                    const prop = decl.prop;
                    const value = decl.value;
                    if (prop === 'display' || prop === 'position' || prop === 'float') {
                        contextMap.updateContext(prop, value);
                    }
                });
                // Reset and walk again for validation
                contextMap.reset();
                // Second pass: validate all declarations
                rule.walkDecls((decl) => {
                    const prop = decl.prop;
                    const value = decl.value;
                    const validation = validator.validate(prop, value, selector);
                    if (!validation.isValid) {
                        const error = {
                            property: prop,
                            value: value,
                            reason: validation.reason || 'Unknown validation error',
                            selector: selector,
                            line: decl.source?.start?.line,
                            column: decl.source?.start?.column
                        };
                        errors.push(error);
                        // Log error if enabled
                        if (logErrors) {
                            const message = `Deadleafer: ${error.reason} in ${selector} at line ${error.line}`;
                            if (mode === 'warning') {
                                decl.warn(result, message);
                            }
                            else if (mode === 'prune') {
                                // Mark for removal in prune mode
                                decl._deadleafer_remove = true;
                            }
                        }
                        // In strict mode, throw error
                        if (strict && mode === 'warning') {
                            throw decl.error(validation.reason || 'Invalid CSS property in context');
                        }
                    }
                });
                // Remove invalid declarations in prune mode
                if (mode === 'prune') {
                    rule.walkDecls((decl) => {
                        if (decl._deadleafer_remove) {
                            decl.remove();
                        }
                    });
                }
            });
            // Store errors in result messages
            if (errors.length > 0) {
                result.messages = result.messages || [];
                result.messages.push({
                    type: 'deadleafer-errors',
                    plugin: 'deadleafer',
                    errors: errors
                });
            }
            // Output errors to file if specified
            if (outputFile && errors.length > 0) {
                // This would be implemented based on the build system
                // For now, we'll just add a message
                result.messages.push({
                    type: 'dependency',
                    plugin: 'deadleafer',
                    file: outputFile
                });
            }
        }
    };
}
deadleafer.postcss = true;
//# sourceMappingURL=index.js.map