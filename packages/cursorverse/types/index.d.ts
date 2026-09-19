export type EffectId =
  | 'fire' | 'glow' | 'cat' | 'rainbow' | 'star' | 'heart'
  | 'blob' | 'confetti' | 'ripple' | 'magnetic' | 'snow' | 'spark'

export interface EffectDefaults {
  color: string
  size: number
  speed: number
}

export interface EffectMeta {
  id: EffectId
  /** component name used by the React bindings, e.g. 'FireCursor' */
  name: string
  title: string
  emoji: string
  category: string
  /** what makes the effect fire */
  trigger: 'move' | 'click'
  /** one-line instruction suitable for a demo overlay */
  hint: string
  /** whether this effect wants the OS cursor hidden */
  hideCursor: boolean
  defaults: EffectDefaults
}

export interface CursorOptions extends Partial<EffectDefaults> {
  /** Confine the effect to this element. Omit for a page-wide overlay. */
  target?: Element | null
  /** Stacking order of the page-wide overlay. */
  zIndex?: number
  /** Hide the OS cursor while the effect runs. Defaults to the effect's preference. */
  hideNativeCursor?: boolean
  /** Skip mounting when the OS asks for reduced motion. Default true. */
  respectReducedMotion?: boolean
  /** Skip mounting on touch-only devices. Default true. */
  requireFinePointer?: boolean
  /** Selector for elements the 'magnetic' effect attracts. */
  magnetSelector?: string
}

export interface CursorHandle {
  readonly id: EffectId
  /** true while the effect is mounted and animating */
  readonly running: boolean
  /** why the effect did not mount, if it didn't */
  readonly blocked: 'no-dom' | 'reduced-motion' | 'coarse-pointer' | null
  readonly element: Element | null
  readonly options: CursorOptions & EffectDefaults
  /** Retune a live effect without restarting it. */
  update(patch: CursorOptions): void
  enable(): void
  disable(): void
  destroy(): void
}

export interface EffectDefinition extends EffectMeta {
  create?: (ctx: CanvasRenderingContext2D, state: unknown, opts: { current: CursorOptions }) => unknown
  mount?: (host: Element, opts: { current: CursorOptions }, config?: unknown) => { destroy(): void }
}

export declare function createCursor(
  effect?: EffectId | EffectDefinition,
  options?: CursorOptions
): CursorHandle

/** Metadata for every effect — handy for building a picker UI. */
export declare const catalogue: EffectMeta[]
export declare const effects: EffectDefinition[]
export declare const effectMap: Record<EffectId, EffectDefinition>
export declare const effectIds: EffectId[]
export declare function getEffect(id: EffectId | EffectDefinition): EffectDefinition

export declare function hexToRgb(hex: string): { r: number; g: number; b: number }
export declare function rgba(hex: string, alpha?: number): string
export declare function mix(a: string, b: string, t: number, alpha?: number): string
export declare function hueOf(hex: string): number

export default createCursor
