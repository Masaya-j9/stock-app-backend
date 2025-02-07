import { DomainObject } from './domain.object';

/**
 * DomainPrimitiveインターフェースは基本的な値オブジェクトを表す
 * このインターフェースはNullは許容しない
 *
 * @template V プリミティブな値の型
 * @template P プリミティブな値のパラメータの型
 * @extends DomainObject<P>
 */

export interface DomainPrimitive<V, P extends DomainPrimitive<V, P>>
  extends DomainObject<P> {
  /**
   * 値を取得する
   */

  value(): V;
}
