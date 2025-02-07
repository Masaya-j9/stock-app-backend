/**
 * DomainObjectインターフェースはすべてのdomainObjectが実装するべき共通のインターフェース
 * @template D ドメインオブジェクトの型
 */

export interface DomainObject<D extends DomainObject<D>> {}
