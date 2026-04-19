/**
 * Property Validator: Implements the conflict matrix and validation rules
 */
import { ContextMap } from './ContextMap';
import { ValidationResult, ValidationError } from './types';
export declare class PropertyValidator {
    private contextMap;
    private readonly conflictMatrix;
    constructor(contextMap: ContextMap);
    validate(property: string, value: string, selector: string): ValidationResult;
    private validateSpecificRules;
    private getSuggestion;
    createError(property: string, value: string, reason: string, selector: string, line?: number, column?: number): ValidationError;
    reset(): void;
}
//# sourceMappingURL=PropertyValidator.d.ts.map