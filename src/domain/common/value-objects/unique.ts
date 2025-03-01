import { DomainPrimitive } from '../../domain.primitive';
import { ConflictException } from '@nestjs/common';

/**
 * ユニークな値かどうかを判別する値オブジェクト
 */

export class Unique implements DomainPrimitive<string, Unique> {
  private readonly _text: string;

  private constructor(text: string, existingText?: string) {
    this._text =
      existingText && existingText === text
        ? (() => {
            throw new ConflictException('This value is not unique');
          })()
        : text;
  }

  value(): string {
    return this._text;
  }

  isDuplicate(otherText: string | undefined): boolean {
    return this._text === otherText;
  }

  static of(text: string, existingText?: string): Unique {
    return new Unique(text, existingText);
  }
}
