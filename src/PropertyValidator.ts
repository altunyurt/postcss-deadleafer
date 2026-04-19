/**
 * Property Validator: Implements the conflict matrix and validation rules
 */

import { ContextMap } from './ContextMap';
import { ValidationResult, ValidationError } from './types';

export class PropertyValidator {
  private contextMap: ContextMap;
  
  // Conflict matrix: property -> [invalid contexts]
  private readonly conflictMatrix = {
    // Flex/Grid properties invalid in block/inline contexts
    'justify-content': ['block', 'inline', 'inline-block'],
    'align-items': ['block', 'inline', 'inline-block'],
    'align-content': ['block', 'inline', 'inline-block'],
    'gap': ['block', 'inline', 'inline-block'],
    'row-gap': ['block', 'inline', 'inline-block'],
    'column-gap': ['block', 'inline', 'inline-block'],
    
    // Box model properties invalid on inline elements
    'width': ['inline'],
    'height': ['inline'],
    'margin-top': ['inline'],
    'margin-bottom': ['inline'],
    'padding-top': ['inline'],
    'padding-bottom': ['inline'],
    'border-top-width': ['inline'],
    'border-bottom-width': ['inline'],
    
    // Layout ignored properties
    'float': ['flex', 'inline-flex', 'grid', 'inline-grid'],
    'vertical-align': ['block', 'inline-block'],
    
    // Positioning properties require non-static position
    'top': ['static'],
    'left': ['static'],
    'bottom': ['static'],
    'right': ['static'],
    'z-index': ['static']
  };

  constructor(contextMap: ContextMap) {
    this.contextMap = contextMap;
  }

  validate(property: string, value: string, selector: string): ValidationResult {
    // Update context first (important for blockification)
    this.contextMap.updateContext(property, value);
    
    // Check if property is allowed in current context
    const { allowed, reason } = this.contextMap.isPropertyAllowed(property);
    
    if (!allowed) {
      return {
        isValid: false,
        reason,
        suggestion: this.getSuggestion(property, value)
      };
    }
    
    // Additional specific validations
    const specificValidation = this.validateSpecificRules(property, value);
    if (!specificValidation.isValid) {
      return specificValidation;
    }
    
    return { isValid: true };
  }

  private validateSpecificRules(property: string, value: string): ValidationResult {
    const context = this.contextMap.getCurrentContext();
    const display = context.display;
    
    // Check conflict matrix
    if (this.conflictMatrix[property as keyof typeof this.conflictMatrix]) {
      const invalidContexts = this.conflictMatrix[property as keyof typeof this.conflictMatrix];
      
      if (invalidContexts.includes('static') && context.position === 'static') {
        return {
          isValid: false,
          reason: `${property} requires non-static position (current: ${context.position})`,
          suggestion: `Add position: relative, absolute, fixed, or sticky`
        };
      }
      
      if (invalidContexts.includes('inline') && display === 'inline' && !context.isBlockified) {
        return {
          isValid: false,
          reason: `${property} is ignored on inline elements (display: ${display})`,
          suggestion: `Change display to block, inline-block, or use blockifying property (position/float)`
        };
      }
      
      if (invalidContexts.includes('block') && (display === 'block' || display === 'inline-block')) {
        return {
          isValid: false,
          reason: `${property} requires flex/grid context (display: ${display})`,
          suggestion: `Change display to flex, inline-flex, grid, or inline-grid`
        };
      }
      
      if (invalidContexts.includes('flex') && display.includes('flex')) {
        return {
          isValid: false,
          reason: `${property} is ignored in flex context (display: ${display})`,
          suggestion: `Remove ${property} or change display context`
        };
      }
    }
    
    // Special case: vertical-align on block-level elements
    if (property === 'vertical-align' && (display === 'block' || display === 'inline-block')) {
      return {
        isValid: false,
        reason: 'vertical-align is ignored on block-level elements',
        suggestion: 'Use margin, padding, or flex/grid alignment instead'
      };
    }
    
    // Special case: float on flex items
    if (property === 'float' && display.includes('flex')) {
      return {
        isValid: false,
        reason: 'float is ignored on flex items',
        suggestion: 'Use flexbox alignment properties instead'
      };
    }
    
    return { isValid: true };
  }

  private getSuggestion(property: string, value: string): string | undefined {
    const context = this.contextMap.getCurrentContext();
    
    if (property === 'width' || property === 'height') {
      if (context.display === 'inline' && !context.isBlockified) {
        return 'Add position: absolute/fixed or float: left/right to blockify the element';
      }
    }
    
    if (property === 'justify-content' || property === 'align-items') {
      if (!context.display.includes('flex') && !context.display.includes('grid')) {
        return 'Change display to flex, inline-flex, grid, or inline-grid';
      }
    }
    
    if (property === 'z-index' && context.position === 'static') {
      return 'Add position: relative, absolute, fixed, or sticky';
    }
    
    return undefined;
  }

  createError(
    property: string,
    value: string,
    reason: string,
    selector: string,
    line?: number,
    column?: number
  ): ValidationError {
    return {
      property,
      value,
      reason,
      selector,
      line,
      column
    };
  }

  reset(): void {
    this.contextMap.reset();
  }
}