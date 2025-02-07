import { OutputDto } from './output.dto';

/**
 * サービス出力ビルダーインターフェース
 *
 * このインターフェースは`OutputDto`を継承した任意のモデルを構築するためにビルダーパターンを提供します
 *
 * @template T ビルダーが構築するモデルの型
 */

export interface OutputBuilder<T extends OutputDto> {
  /**
   * ビルダーが構築するモデルの型を返す
   *
   * @returns ビルダーが構築するモデルの型
   */
  build(): T;
}
