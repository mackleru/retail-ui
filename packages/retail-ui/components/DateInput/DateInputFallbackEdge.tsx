import * as React from 'react';
import InternalDateTransformer from '../../lib/date/InternalDateTransformer';
import { InternalDateComponentType } from '../../lib/date/types';
import { DateInput } from './DateInput';

export default function DateInputFallbackEdge<T extends DateInput>(Base: typeof DateInput): typeof DateInput {
  return class extends Base {
    private frozen: boolean = false;

    // public constructor(props: DateInputProps) {
    //   super(props);
    //   Object.setPrototypeOf(this, new.target.prototype);
    // }

    protected handleBlur = (event: React.FocusEvent<HTMLElement>): void => {
      if (this.frozen) {
        return;
      }
      super.handleBlur(event);
    };

    protected handleCopyFixIE = () => {
      const activeElement = document.activeElement;

      const text: string = String(
        this.state.selected === InternalDateComponentType.All
          ? this.state.internalDate.toString({ withPad: true })
          : InternalDateTransformer.padDateComponent(
              this.state.selected,
              this.state.internalDate.get(this.state.selected),
            ),
      );

      if (!this.isMouseDown) {
        this.frozen = true;
        copyTextToClipboard(text);
        if (activeElement instanceof HTMLElement) {
          activeElement.focus();
        }
        this.frozen = false;
      }

      function copyTextToClipboard(value: string) {
        const textArea: HTMLTextAreaElement = document.createElement('textarea');

        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        // textArea.style.width = '0';
        // textArea.style.height = '0';
        // textArea.style.padding = '0';
        // textArea.style.border = 'none';
        // textArea.style.outline = 'none';
        // textArea.style.boxShadow = 'none';
        // textArea.style.background = 'transparent';
        textArea.value = value;

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          const msg = successful ? 'successful' : 'unsuccessful';
          console.log('Copying text command was ' + msg);
        } catch (err) {
          console.log('Oops, unable to copy');
        }

        document.body.removeChild(textArea);
      }
    };
  };
}
