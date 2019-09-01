import { InternalDate } from './InternalDate';
import {
  InternalDateChangeSettings,
  InternalDateComponentRaw,
  InternalDateComponentsRaw,
  InternalDateComponentType,
  InternalDateOrder,
  InternalDateSeparator,
} from './types';

export default class InternalDateImmutable extends InternalDate {
  public setOrder(order: InternalDateOrder): InternalDateImmutable {
    return this.choose(super.clone().setOrder(order));
  }

  public setSeparator(separator: InternalDateSeparator): InternalDateImmutable {
    return this.choose(super.clone().setSeparator(separator));
  }

  public setComponents(components: InternalDateComponentsRaw | null, isNativeMonth: boolean): InternalDateImmutable {
    return this.choose(super.clone().setComponents(components, isNativeMonth));
  }

  public setYear(year: InternalDateComponentRaw): InternalDateImmutable {
    return this.choose(super.clone().setYear(year));
  }

  public setMonth(month: InternalDateComponentRaw): InternalDateImmutable {
    return this.choose(super.clone().setMonth(month));
  }

  public setDate(date: InternalDateComponentRaw): InternalDateImmutable {
    return this.choose(super.clone().setDate(date));
  }

  public set(type: InternalDateComponentType | null, value: InternalDateComponentRaw): InternalDateImmutable {
    return this.choose(super.clone().set(type, value));
  }

  public shiftYear(step: number, settings: InternalDateChangeSettings = {}): InternalDateImmutable {
    return this.choose(super.clone().shiftYear(step, settings));
  }

  public shiftMonth(step: number, settings: InternalDateChangeSettings = {}): InternalDateImmutable {
    return this.choose(super.clone().shiftMonth(step, settings));
  }

  public shiftDate(step: number, settings: InternalDateChangeSettings = {}): InternalDateImmutable {
    return this.choose(super.clone().shiftDate(step, settings));
  }

  public shift(
    type: InternalDateComponentType | null,
    step: number,
    settings?: InternalDateChangeSettings,
  ): InternalDateImmutable {
    return this.choose(super.clone().shift(type, step, settings));
  }

  public setRangeStart(internalDate: InternalDate | InternalDateImmutable | null): InternalDateImmutable {
    return this.choose(super.clone().setRangeStart(internalDate));
  }

  public setRangeEnd(internalDate: InternalDate | InternalDateImmutable | null): InternalDateImmutable {
    return this.choose(super.clone().setRangeEnd(internalDate));
  }

  public parseValue(value: string | null = ''): InternalDateImmutable {
    return this.choose(super.clone().parseValue(value));
  }

  public parseInternalValue(value: string | null = ''): InternalDateImmutable {
    return this.choose(super.clone().parseInternalValue(value));
  }

  public restore(type: InternalDateComponentType | null = null): InternalDateImmutable {
    return this.choose(super.clone().restore(type));
  }

  public cutOffExcess(
    type: InternalDateComponentType | null = null,
    settings: InternalDateChangeSettings = {},
  ): InternalDateImmutable {
    return this.choose(super.clone().cutOffExcess(type, settings));
  }

  private choose(changed: InternalDate): InternalDateImmutable {
    return this.isEqual(changed) ? this : changed as InternalDateImmutable;
  }
}
