import { Observable } from 'rxjs';
import { InputDto } from '../dto/input/input.dto';
import { OutputDto } from '../dto/output/output.dto';

/**
 * アプリケーションサービスのインターフェースを定義します。
 * @template I - サービスの入力モデルを表す型
 *@template O - サービスの出力モデルを表す型
 */

export interface ApplicationService<I extends InputDto, O extends OutputDto> {
  /**
   * サービスメソッド
   * @param {I} input - サービスの入力モデル
   * @returns {Observable<O>} - サービスの出力モデルを含むObservable
   */
  service(input: I): Observable<O>;
}
