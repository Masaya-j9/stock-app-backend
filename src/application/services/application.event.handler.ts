import { Observable } from 'rxjs';

/**
 * アプリケーション層のイベントハンドラ用ジェネリックインターフェース
 * @template E - イベントのペイロード型
 * @template R - ハンドラの戻り値型（デフォルト: void）
 */
export interface ApplicationEventHandler<E, R = void> {
  /**
   * イベントを処理する
   * @param event - イベントのペイロード
   * @returns Observable<R>
   */
  handle(event: E): Observable<R>;
}
