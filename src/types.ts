/**
 * Core types for TypedCSS PostCSS plugin
 */

export type DisplayValue =
  | 'block'
  | 'inline'
  | 'inline-block'
  | 'flex'
  | 'inline-flex'
  | 'grid'
  | 'inline-grid'
  | 'none'
  | 'contents'
  | 'table'
  | 'table-row'
  | 'table-cell'
  | string;

export type PositionValue =
  | 'static'
  | 'relative'
  | 'absolute'
  | 'fixed'
  | 'sticky';

export type FloatValue = 'none' | 'left' | 'right';

export interface ElementContext {
  display: DisplayValue;
  position: PositionValue;
  float: FloatValue;
  isBlockified: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  suggestion?: string;
}

export interface ValidationError {
  property: string;
  value: string;
  reason: string;
  selector: string;
  line?: number;
  column?: number;
}

export type ValidationMode = 'warning' | 'prune';

export interface DeadleaferOptions {
  mode?: ValidationMode;
  strict?: boolean;
  logErrors?: boolean;
  outputFile?: string;
}