import * as React from 'react';
import { InternalDate } from '../../../lib/date/InternalDate';
import InternalDateGetter from '../../../lib/date/InternalDateGetter';
import { InternalDateComponent, InternalDateComponentType, InternalDateValidateCheck } from '../../../lib/date/types';
import { DatePickerLocale } from '../../DatePicker/locale';
import { DateInputProps, DateInputState } from '../DateInput';
import { inputNumber } from './inputNumber';

export default class InternalDateMediator {
  public iDate: InternalDate = new InternalDate();
  private readonly updateState: (state: Partial<DateInputState>) => void;

  public constructor(updateState: (state: Partial<DateInputState>) => void) {
    // this.updateState = updateState;
    this.updateState = console.log;
  }

  // public updateState = (): void =>
  //   this.updateState({
  //     value: this.iDate.toInternalString(),
  //     internalDate: this.iDate.clone(),
  //   });

  // ok
  public updateFromProps = (props: DateInputProps, locale: DatePickerLocale): InternalDateMediator => {
    const start = this.iDate.getRangeStart();
    const min = start && start.toInternalString();
    const end = this.iDate.getRangeEnd();
    const max = end && end.toInternalString();
    const { order, separator } = locale;
    this.iDate.setOrder(order).setSeparator(separator);
    if (props.minDate !== min) {
      this.iDate.setRangeStart(props.minDate ? new InternalDate({ order, separator, value: props.minDate }) : null);
    }
    if (props.maxDate !== max) {
      this.iDate.setRangeEnd(props.maxDate ? new InternalDate({ order, separator, value: props.maxDate }) : null);
    }
    if (!props.value || props.value !== this.iDate.toInternalString()) {
      this.iDate.parseInternalValue(props.value);
    }
    return this;
  };

  // ok
  public clearSelected = (type: InternalDateComponentType | null): void => {
    this.iDate.set(type, null);
  };

  // ???
  public preInputValue(
    event: React.KeyboardEvent<HTMLElement>,
    type: InternalDateComponentType | null,
    inputMode: boolean,
  ): any {
    event.persist();
    let prev = this.iDate.get(type);
    if (type === null) {
      type = this.getLeftmostType();
      this.iDate.set(type, null);
    }
    if (type === InternalDateComponentType.All) {
      type = this.getLeftmostType();
      prev = this.iDate.get(type);
      this.iDate.set(InternalDateComponentType.All, null);
    }
    this.inputNumberCallBack(inputNumber(type, prev, event.key, inputMode));
    return {
      selected: type,
      inputMode: this.inputNumberCallBack(inputNumber(type, prev, event.key, inputMode))
    };
  }

  // ???
  public inputNumberCallBack = ({
    type,
    value,
    inputMode,
  }: {
    type: InternalDateComponentType | null;
    value: InternalDateComponent;
    inputMode: boolean;
  }): any => {
    this.iDate.set(type, value);
    if (!inputMode) {
      if (type !== InternalDateComponentType.Year) {
        this.iDate.cutOffExcess(type);
      } else {
        this.iDate.restore(type);
      }
      this.getShiftedType(1, true);
    }
    return inputMode;
  };

  // ok
  public shiftDateComponent(type: InternalDateComponentType | null, step: number): boolean {
    type = type === null ? this.getLeftmostType() : type;
    const iDate = this.iDate.clone();
    const isValidRange = iDate.validate({ checks: [InternalDateValidateCheck.Range] });
    const start = iDate.getRangeStart();
    const end = iDate.getRangeEnd();
    if (!isValidRange) {
      // Удерживаем дату в заданном диапазоне
      if (start && InternalDateGetter.max([iDate, start]) === start) {
        iDate.duplicateOf(start);
      } else if (end && InternalDateGetter.min([iDate, end]) === end) {
        iDate.duplicateOf(end);
      }
    } else {
      const clone = iDate.clone().shift(type, step, { isRange: false, isLoop: true });
      if (clone.validate({ checks: [InternalDateValidateCheck.Range] })) {
        iDate.duplicateOf(clone);
      }
      // return this.iDate;
    }
    const changed: boolean = this.iDate.isEqualComponentDate(type, iDate);
    this.iDate = iDate;
    return changed;
  }

  // ok
  public paste = (pasted: string): InternalDateMediator => {
    this.iDate
      .parseValue(pasted)
      .restore()
      .cutOffExcess();
    return this;
  };

  // ok
  public blur = (): InternalDateMediator => {
    if (this.iDate.isIncomplete()) {
      const restored = this.iDate.clone().restore();
      if (!this.iDate.isEqual(restored)) {
        this.iDate.duplicateOf(restored);
      }
    }
    return this;
  };

  // ok
  public getShiftedType(type: InternalDateComponentType | null, step: number): InternalDateComponentType | null {
    const typesOrder = this.getTypesOrder();
    const index = type === null ? 0 : typesOrder.indexOf(type);
    const nextIndex = index + step;

    // Если выделено всё поле, то в завимости от направления перемещения, выделям крайний компонент
    if (type === InternalDateComponentType.All) {
      return step < 0 ? this.getLeftmostType() : this.getRightmostType();
    }

    // Если текущий компонент "год", и он не пуст, то при перемещении выделения "восстанавливаем" значение года
    if (type === InternalDateComponentType.Year && this.iDate.getYear() !== null) {
      this.iDate.restore(type);
      console.log(this.iDate.getComponentsRaw());
    }

    const shiftedType = typesOrder[nextIndex];
    return typeof shiftedType === 'number' ? shiftedType : type;
  }

  public toString = (): string => this.iDate.toInternalString();

  public getInternalDate = (): InternalDate => this.iDate.clone();

  public getTypesOrder = (): InternalDateComponentType[] => this.iDate.toFragments().map(({ type }) => type);

  public getLeftmostType = (): InternalDateComponentType => this.getTypesOrder()[0];

  public getRightmostType = (): InternalDateComponentType => this.getTypesOrder().pop()!;
}
