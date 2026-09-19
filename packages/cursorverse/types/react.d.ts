import type { RefObject, FC } from 'react'
import type { CursorOptions, EffectId, EffectDefinition, EffectMeta } from './index'

export interface CursorEffectProps extends CursorOptions {
  effect?: EffectId | EffectDefinition
  /** Element to run the effect inside. Omit for a page-wide overlay. */
  containerRef?: RefObject<Element> | null
}

/** Renders nothing; mounts the effect into `containerRef` or a page overlay. */
export declare const CursorEffect: FC<CursorEffectProps>

export declare function useCursorEffect(
  effect: EffectId | EffectDefinition,
  options?: CursorOptions,
  ref?: RefObject<Element> | null
): void

export type NamedEffectProps = Omit<CursorEffectProps, 'effect'>

export declare const FireCursor: FC<NamedEffectProps>
export declare const GlowCursor: FC<NamedEffectProps>
export declare const CatCursor: FC<NamedEffectProps>
export declare const RainbowTrail: FC<NamedEffectProps>
export declare const StarTrail: FC<NamedEffectProps>
export declare const HeartTrail: FC<NamedEffectProps>
export declare const BlobCursor: FC<NamedEffectProps>
export declare const ConfettiClick: FC<NamedEffectProps>
export declare const RippleEffect: FC<NamedEffectProps>
export declare const MagneticEffect: FC<NamedEffectProps>
export declare const SnowTrail: FC<NamedEffectProps>
export declare const SparkClick: FC<NamedEffectProps>

export declare const effects: EffectDefinition[]
export declare function getEffect(id: EffectId | EffectDefinition): EffectDefinition

export default CursorEffect
