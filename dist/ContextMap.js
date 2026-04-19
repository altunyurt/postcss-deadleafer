"use strict";
/**
 * ContextMap: State machine that tracks allowed properties based on display, position, and float
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMap = void 0;
class ContextMap {
    constructor() {
        this.context = {
            display: 'inline',
            position: 'static',
            float: 'none',
            isBlockified: false
        };
        this.blockifyingProperties = new Set([
            'position: absolute',
            'position: fixed',
            'float: left',
            'float: right'
        ]);
        this.displayPropertyGroups = {
            // Block-level properties
            block: new Set([
                'width', 'height', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
                'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
                'border-top-width', 'border-bottom-width', 'border-left-width', 'border-right-width'
            ]),
            // Inline-level properties (limited)
            inline: new Set([
                'margin-left', 'margin-right',
                'padding-left', 'padding-right',
                'border-left-width', 'border-right-width'
            ]),
            // Flex properties (includes block properties since flex items can use them)
            flex: new Set([
                'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content', 'align-items',
                'align-content', 'gap', 'row-gap', 'column-gap', 'order', 'flex-grow',
                'flex-shrink', 'flex-basis', 'align-self',
                // Block properties that are also valid in flex context
                'width', 'height', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
                'padding-top', 'padding-bottom', 'padding-left', 'padding-right'
            ]),
            // Grid properties (includes block properties since grid items can use them)
            grid: new Set([
                'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
                'grid-auto-columns', 'grid-auto-rows', 'grid-auto-flow', 'grid-column-gap',
                'grid-row-gap', 'gap', 'row-gap', 'column-gap', 'grid-column-start',
                'grid-column-end', 'grid-row-start', 'grid-row-end', 'grid-column',
                'grid-row', 'grid-area', 'justify-items', 'align-items', 'place-items',
                'justify-content', 'align-content', 'place-content', 'justify-self',
                'align-self', 'place-self',
                // Block properties that are also valid in grid context
                'width', 'height', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
                'padding-top', 'padding-bottom', 'padding-left', 'padding-right'
            ]),
            // Common properties (allowed in all contexts)
            common: new Set([
                'color', 'background-color', 'background-image', 'background-position',
                'background-size', 'background-repeat', 'font-family', 'font-size',
                'font-weight', 'line-height', 'text-align', 'text-decoration',
                'border-color', 'border-style', 'border-radius', 'opacity',
                'visibility', 'cursor', 'z-index'
            ])
        };
    }
    updateContext(property, value) {
        switch (property) {
            case 'display':
                this.context.display = value;
                this.context.isBlockified = this.checkBlockification();
                break;
            case 'position':
                this.context.position = value;
                this.context.isBlockified = this.checkBlockification();
                break;
            case 'float':
                this.context.float = value;
                this.context.isBlockified = this.checkBlockification();
                break;
        }
    }
    checkBlockification() {
        // Blockification occurs when:
        // 1. position is absolute or fixed
        // 2. float is left or right
        return (this.context.position === 'absolute' ||
            this.context.position === 'fixed' ||
            this.context.float === 'left' ||
            this.context.float === 'right');
    }
    isPropertyAllowed(property) {
        // Always allow context-setting properties (display, position, float)
        if (property === 'display' || property === 'position' || property === 'float') {
            return { allowed: true };
        }
        // Always allow common properties
        if (this.displayPropertyGroups.common.has(property)) {
            return { allowed: true };
        }
        // Check if property is allowed in current display context
        const displayGroup = this.getDisplayGroup();
        if (displayGroup.has(property)) {
            return { allowed: true };
        }
        // Special handling for blockified elements
        if (this.context.isBlockified && this.displayPropertyGroups.block.has(property)) {
            return { allowed: true };
        }
        // Generate reason for disallowed property
        const reason = this.generateDisallowedReason(property);
        return { allowed: false, reason };
    }
    getDisplayGroup() {
        const display = this.context.display;
        // Handle blockified inline elements
        if (this.context.isBlockified && display === 'inline') {
            return this.displayPropertyGroups.block;
        }
        // Map display values to property groups
        if (display.includes('flex')) {
            return this.displayPropertyGroups.flex;
        }
        if (display.includes('grid')) {
            return this.displayPropertyGroups.grid;
        }
        if (display === 'block' || display === 'inline-block') {
            return this.displayPropertyGroups.block;
        }
        if (display === 'inline') {
            return this.displayPropertyGroups.inline;
        }
        // Default to block for other display values
        return this.displayPropertyGroups.block;
    }
    generateDisallowedReason(property) {
        const display = this.context.display;
        const position = this.context.position;
        const float = this.context.float;
        if (this.displayPropertyGroups.flex.has(property) && !display.includes('flex')) {
            return `Flex property "${property}" used in non-flex context (display: ${display})`;
        }
        if (this.displayPropertyGroups.grid.has(property) && !display.includes('grid')) {
            return `Grid property "${property}" used in non-grid context (display: ${display})`;
        }
        if (this.displayPropertyGroups.block.has(property) && display === 'inline' && !this.context.isBlockified) {
            return `Block property "${property}" used on inline element (display: ${display})`;
        }
        if (property === 'z-index' && position === 'static') {
            return `z-index used with position: static (requires non-static position)`;
        }
        if ((property === 'top' || property === 'left' || property === 'bottom' || property === 'right') && position === 'static') {
            return `Positioning property "${property}" used with position: static`;
        }
        if (property === 'vertical-align' && (display === 'block' || display === 'inline-block')) {
            return `vertical-align used on block-level element (display: ${display})`;
        }
        if (property === 'float' && display.includes('flex')) {
            return `float used on flex item (display: ${display})`;
        }
        return `Property "${property}" not allowed in current context (display: ${display}, position: ${position}, float: ${float})`;
    }
    getCurrentContext() {
        return { ...this.context };
    }
    reset() {
        this.context = {
            display: 'inline',
            position: 'static',
            float: 'none',
            isBlockified: false
        };
    }
}
exports.ContextMap = ContextMap;
//# sourceMappingURL=ContextMap.js.map