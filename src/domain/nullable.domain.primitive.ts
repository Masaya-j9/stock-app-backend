import { DomainPrimitive } from './domain.primitive';

/**
 * NullableDomainPrimitiveインターフェースはDomainPrimitiveを拡張して、
 * 値がnullを許容するとして表す
 *
 * @template V プリミティブな値の型
 * @template P プリミティブな値のパラメータの型
 * @extends DomainPrimitive<V>
 */
export interface NullableDomainPrimitive<
  V,
  P extends NullableDomainPrimitive<V, P>,
> extends DomainPrimitive<V, P> {}
