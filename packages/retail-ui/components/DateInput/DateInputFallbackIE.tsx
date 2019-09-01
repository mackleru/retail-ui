import * as React from 'react';
import { InternalDateComponentType } from '../../lib/date/types';
import { DateInput } from './DateInput';
import debounce from 'lodash.debounce';

export default function DateInputFallbackIE<T extends DateInput>(Base: typeof DateInput): typeof DateInput {
  return class extends Base {
    // Костыль для возможности выделить компоненты даты
    // В IE и Edge, при вызове range.selectNodeContents(node)
    // снимается фокус у текущего элемента, т.е. вызывается handleBlur
    // в handleBlur вызывается window.getSelection().removeAllRanges() и выделение пропадает.
    // Этот флаг "замораживаниет" колбэки onBlur и onFocus, для возможности вернуть выделение сегмента.
    public frozen: boolean = false;

    public selection = debounce(() => {
      const node = this.inputLikeText && this.inputLikeText.getNode();
      if (this.inputLikeText && node && node.contains(document.activeElement)) {
        this.frozen = true;
        this.changeSelectedDateComponent(this.state.selected);
        if (this.inputLikeText) {
          this.inputLikeText.focus();
        }
      }
    }, 10);

    public handleFocus = (event: React.FocusEvent<HTMLElement>): void => {
      if (this.frozen) {
        this.frozen = false;
        event.preventDefault();
        return;
      }
      super.handleFocus(event);
    };

    public handleBlur = (event: React.FocusEvent<HTMLElement>): void => {
      if (this.frozen) {
        event.preventDefault();
        return;
      }
      super.handleBlur(event);
    };

    public selectDateComponent = (selected: InternalDateComponentType | null): void => {
      if (this.frozen) {
        return;
      }
      this.setState({ selected });
    };

    public handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
      this.isMouseDown = true;
      if (this.state.focused && !this.frozen) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
  }
};
