import { Observable } from 'rxjs';
import { InputDto } from '../dto/input/input.dto';
import { OutputDto } from '../dto/output/output.dto';

/**
 * アプリケーションサービスでの更新系のロジックで利用するインターフェースを定義します。
 * @template I - サービスの入力モデルを表す型
 * @template O - サービスの出力モデルを表す型
 */

export interface UpdateService<I extends InputDto, O extends OutputDto> {
  /**
   * サービスメソッド
   * @param {I} input - サービスの入力モデル
   * @param {number} id - 更新対象のID
   * @returns {Observable<O>} - サービスの出力モデルを含むObservable
   */
  service(input: I, id: number): Observable<O>;
}
