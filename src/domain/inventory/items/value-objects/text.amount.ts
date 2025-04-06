import { BadRequestException } from '@nestjs/common';
import { DomainPrimitive } from '../../../domain.primitive';

/**
 * テキスト量に関する値オブジェクト
 */
export class TextAmount implements DomainPrimitive<string, TextAmount> {
  private readonly _text: string;
  private readonly MIN_TEXT_LENGTH: number = 1;
  private readonly MAX_TEXT_LENGTH: number = 1000;

  private constructor(text: string) {
    if (typeof text !== 'string') {
      throw new BadRequestException('説明文は数値型で登録することはできません');
    }
    if (
      text.length < this.MIN_TEXT_LENGTH ||
      text.length > this.MAX_TEXT_LENGTH
    ) {
      throw new BadRequestException(
        `説明文は ${this.MIN_TEXT_LENGTH} 文字以上 ${this.MAX_TEXT_LENGTH} 文字以下で登録する必要があります`
      );
    }
    this._text = text;
  }

  value(): string {
    return this._text;
  }

  /**
   * 最小許容量を満たしているかどうか
   * @returns true: 最小許容量を満たしている, false: 最小許容量を満たしていない
   */
  isBelowMinimum(): boolean {
    return this._text.length >= this.MIN_TEXT_LENGTH;
  }

  /**
   * 最大許容量を満たしているかどうか
   * @returns true: 最大許容量を満たしている, false: 最大許容量を満たしていない
   */
  maxQuantity(): boolean {
    return this._text.length <= this.MAX_TEXT_LENGTH;
  }

  static of(text: string): TextAmount {
    return new TextAmount(text);
  }
}
