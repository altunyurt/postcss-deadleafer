/**
 * ContextMap: State machine that tracks allowed properties based on display, position, and float
 */
import { ElementContext } from './types';
export declare class ContextMap {
    private context;
    private readonly blockifyingProperties;
    private readonly displayPropertyGroups;
    updateContext(property: string, value: string): void;
    private checkBlockification;
    isPropertyAllowed(property: string): {
        allowed: boolean;
        reason?: string;
    };
    private getDisplayGroup;
    private generateDisallowedReason;
    getCurrentContext(): ElementContext;
    reset(): void;
}
//# sourceMappingURL=ContextMap.d.ts.map