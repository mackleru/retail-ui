import CalendarIcon from '@skbkontur/react-icons/Calendar';
import SearchIcon from '@skbkontur/react-icons/Search';
import * as React from 'react';
import { ConditionalHandlerCaller } from '../../lib/ConditionalHandlerCaller';
import { InternalDate } from '../../lib/date/InternalDate';
import InternalDateTransformer from '../../lib/date/InternalDateTransformer';
import { InternalDateComponentType } from '../../lib/date/types';
import MouseDrag from '../../lib/events/MouseDrag';
import { cx } from '../../lib/theming/Emotion';
import { ITheme } from '../../lib/theming/Theme';
import { isEdge, isFirefox, isIE } from '../../lib/utils';
import { Nullable } from '../../typings/utility-types';
import { DatePickerLocale, DatePickerLocaleHelper } from '../DatePicker/locale';
import InputLikeText from '../internal/InputLikeText';
import { locale } from '../LocaleProvider/decorators';
import ThemeConsumer from '../ThemeConsumer';
import { DateFragmentsView } from './DateFragmentsView';
import styles from './DateInput.less';
import jsStyles from './DateInput.styles';
import DateInputFallbackIE from './DateInputFallbackIE';
import DateInputFallbackEdge from './DateInputFallbackEdge';
import { Actions, extractAction } from './helpers/DateInputKeyboardActions';
import { inputNumber } from './helpers/inputNumber';
import InternalDateMediator from './helpers/InternalDateMediator';
import { removeAllSelections, selectNodeContents } from './helpers/SelectionHelpers';

export interface DateInputState {
  selected: InternalDateComponentType | null;
  internalDate: InternalDate;
  value: string;
  typesOrder: InternalDateComponentType[];
  inputMode: boolean;
  focused: boolean;
  notify: boolean;
  dragged: boolean;
  autoMoved: boolean;
}

export interface DateInputProps {
  value?: string;
  error?: boolean;
  warning?: boolean;
  disabled?: boolean;
  minDate?: Nullable<string>;
  maxDate?: Nullable<string>;
  width?: string | number;
  withIcon?: boolean;
  size?: 'small' | 'large' | 'medium';
  onBlur?: (x0: React.FocusEvent<HTMLElement>) => void;
  onFocus?: (x0: React.FocusEvent<HTMLElement>) => void;
  /**
   * @param e - объект, частично имитирующий объект `Event`.
   * @param value - строка в формате `dd.mm.yyyy`.
   */
  onChange?: (e: { target: { value: string } }, value: string) => void;
  onKeyDown?: (x0: React.KeyboardEvent<HTMLElement>) => void;
}

@locale('DatePicker', DatePickerLocaleHelper)
export class DateInput extends React.Component<DateInputProps, DateInputState> {
  public static defaultProps = {
    size: 'small',
    width: 125,
  };

  protected iDateMediator: InternalDateMediator = new InternalDateMediator(
    (state: Partial<DateInputState>) => this.setState,
  );
  protected inputLikeText: InputLikeText | null = null;
  protected isMouseDown: boolean = false;
  protected isFirstFocus: boolean = false;
  protected dragging: boolean = false;
  protected locale!: DatePickerLocale;
  protected divInnerNode: HTMLDivElement | null = null;
  private theme!: ITheme;

  constructor(props: DateInputProps) {
    super(props);

    this.state = {
      value: props.value || '',
      notify: false,
      selected: null,
      internalDate: new InternalDate(),
      typesOrder: [],
      inputMode: false,
      focused: false,
      dragged: false,
      autoMoved: false,
    };

    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  public componentDidUpdate(prevProps: DateInputProps, prevState: DateInputState) {
    if (
      prevProps.value !== this.props.value ||
      prevProps.minDate !== this.props.minDate ||
      prevProps.maxDate !== this.props.maxDate ||
      prevState.internalDate.getOrder() !== this.locale.order ||
      prevState.internalDate.getSeparator() !== this.locale.separator
    ) {
      this.updateFromProps();
    }

    if (this.state.focused && prevState.selected !== this.state.selected) {
      this.selection();
    }

    if (this.state.notify && !prevState.notify) {
      this.notify();
    }
  }

  public componentDidMount(): void {
    this.updateFromProps();
    if (this.inputLikeText) {
      const node = isFirefox ? this.inputLikeText.getNode() : this.divInnerNode;
      if (node) {
        MouseDrag.listen(node);
        node.addEventListener('mousedragstart', this.handleMouseDragStart);
        node.addEventListener('mousedragend', this.handleMouseDragEnd);
      }
    }
    // if (this.divInnerNode) {
    //   MouseDrag.listen(this.divInnerNode);
    //   this.divInnerNode.addEventListener('mousedragstart', this.handleMouseDragStart);
    //   this.divInnerNode.addEventListener('mousedragend', this.handleMouseDragEnd);
    // }
  }

  public render() {
    return (
      <ThemeConsumer>
        {theme => {
          this.theme = theme;
          return this.renderMain();
        }}
      </ThemeConsumer>
    );
  }

  public blur() {
    if (this.inputLikeText) {
      this.inputLikeText.blur();
    }
    this.setState({ focused: false });
  }

  public focus() {
    if (!this.props.disabled) {
      if (this.inputLikeText) {
        this.inputLikeText.focus();
      }
      this.setState({ focused: true });
    }
  }

  public blink() {
    if (!this.props.disabled) {
      if (this.inputLikeText) {
        this.inputLikeText.blink();
      }
    }
  }

  protected changeSelectedDateComponent = (type?: InternalDateComponentType | null): void => {
    return;
    if (isEdge) {
      return;
    }
    type = type || this.state.selected;
    if (type === null) {
      return;
    }
    if (type === InternalDateComponentType.All) {
      this.selectNodeContents(this.divInnerNode);
      return;
    }
    const index = this.state.typesOrder.indexOf(type);
    if (index > -1) {
      this.selectNodeContents(this.divInnerNode, index * 2, index * 2 + 1);
    }
  };

  protected handleMouseDown = (event: React.MouseEvent<HTMLElement>): void => {
    this.isMouseDown = true;
  };

  protected updateInternalDate = (state: Partial<DateInputState> = {}): void => {
    const internalDate = this.iDateMediator.getInternalDate();

    this.setState({ ...state, internalDate } as DateInputState, this.emitChange);
  };

  protected updateFromProps = (): void => {
    // 1
    const internalDate = this.iDateMediator.updateFromProps(this.props, this.locale).getInternalDate();
    // 2
    const typesOrder = this.iDateMediator.getTypesOrder();

    this.setState({ typesOrder, internalDate });
  };

  protected handleBlur (event: React.FocusEvent<HTMLElement>): void {
    event.persist();

    this.setState({ focused: false, selected: null, inputMode: false }, () => {
      removeAllSelections();
      this.iDateMediator.blur().getInternalDate();
      this.updateInternalDate();
      if (this.props.onBlur) {
        this.props.onBlur(event);
      }
    });
  };

  protected handleFocus (event: React.FocusEvent<HTMLElement>): void {
    console.log('focus');
    if (this.props.disabled) {
      return;
    }
    this.setState(prevState => {
      this.isFirstFocus = !prevState.focused;
      return {
        focused: true,
        selected:
          !prevState.dragged && prevState.selected === null ? this.iDateMediator.getLeftmostType() : prevState.selected,
      };
    });

    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  }

  protected selection = () => {
    this.changeSelectedDateComponent(this.state.selected);
  };

  protected handleCopyFixIE = () => {
    // empty block
  };

  protected notify(): void {
    this.blink();
    this.setState({ notify: false });
  }

  protected selectDateComponent = (selected: InternalDateComponentType | null): void => {
    this.setState({ selected, inputMode: false });
  };

  private renderMain() {
    const { internalDate, focused, selected, inputMode } = this.state;
    const fragments =
      internalDate && (focused || !internalDate.isEmpty())
        ? internalDate.toFragments({
            withSeparator: true,
            withPad: true,
          })
        : [];

    return (
      <InputLikeText
        width={this.props.width}
        ref={el => {
          this.inputLikeText = el;
        }}
        size={this.props.size}
        disabled={this.props.disabled}
        error={this.props.error}
        warning={this.props.warning}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onKeyDown={this.handleKeyDown}
        onMouseUpCapture={this.handleMouseUp}
        onMouseDown={this.handleMouseDown}
        onPaste={this.handlePaste}
        rightIcon={this.renderIcon}
        onDoubleClickCapture={this.handleDoubleClick}
      >
        <DateFragmentsView
          nodeRef={this.divInnerNodeRef}
          fragments={fragments}
          onSelectDateComponent={this.handleSelectDateComponent}
          selected={selected}
          inputMode={inputMode}
        />
      </InputLikeText>
    );
  }

  private divInnerNodeRef = (el: HTMLDivElement | null) => {
    this.divInnerNode = el;
  };

  private handleMouseUp = (): void => {
    console.log('this.dragging cover', this.dragging);
    // setTimeout(() => {
      this.isMouseDown = false;
    // }, 500);
    if (!this.state.dragged) {
      // this.setState({ selected: this.iDateMediator.getLeftmostType() });
    }
  };

  private handleSelectDateComponent = (type: InternalDateComponentType, event: React.MouseEvent<HTMLElement>): void => {
    // this.isMouseDown = false;
    console.log('this.dragging component', this.dragging, this.isMouseDown);
    if (this.isMouseDown) {
      return;
    }

    if (this.isFirstFocus && this.state.internalDate && this.state.internalDate.isEmpty()) {
      this.isFirstFocus = false;
      return;
    }
    this.selectDateComponent(type);
    event.preventDefault();
    event.stopPropagation();
    this.isFirstFocus = false;
  };

  private handleMouseDragStart = () => {
    console.log('handleMouseDragStart');
    this.dragging = true;
    // this.setState({ dragged: true, selected: null });
    // removeAllSelections();
  };

  private handleMouseDragEnd = () => {
    console.log('handleMouseDragEnd');
    this.dragging = false;
    // this.setState({ dragged: false });
  };

  private handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const { selected } = this.state;

    if (this.props.disabled) {
      return;
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(event);
      if (event.defaultPrevented) {
        return;
      }
    }

    new ConditionalHandlerCaller<Actions>(extractAction(event))
      .add(Actions.MoveSelectionLeft, () => this.moveSelection(-1))
      .add(Actions.MoveSelectionRight, () => this.moveSelection(1))
      .add(Actions.Separator, this.pressDelimiter)
      .add(Actions.MoveSelectionFirst, () => this.selectDateComponent(this.iDateMediator.getLeftmostType()))
      .add(Actions.MoveSelectionLast, () => this.selectDateComponent(this.iDateMediator.getRightmostType()))
      .add(Actions.Increment, () => this.shiftDateComponent(1))
      .add(Actions.Decrement, () => this.shiftDateComponent(-1))
      .add(Actions.Digit, () => this.inputValue(event))
      .add(Actions.ClearSelection, this.clearSelected)
      .add(a => a === Actions.ClearOneChar && selected === InternalDateComponentType.All, this.clearSelected)
      .add(a => a === Actions.ClearOneChar && selected !== InternalDateComponentType.All, this.clearOneChar)
      .add(Actions.FullSelection, () => this.fullSelection(event))
      .add(Actions.WrongInput, () => this.blink())
      .add(a => a === Actions.CopyValue/* && isEdge*/, this.handleCopyFixIE)
      .add(a => a === Actions.PasteValue && (isIE || isEdge), this.handlePasteFixIE)
      .add(a => this.state.focused && a !== Actions.Ignore, this.selection)
      .add(
        a => a !== Actions.Ignore && a !== Actions.PasteValue && a !== Actions.CopyValue,
        () => event.preventDefault(),
      )
      .check();
  };

  private fullSelection = (event: React.KeyboardEvent<HTMLElement>) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    this.selectDateComponent(InternalDateComponentType.All);
  };

  private handlePaste = (e?: React.ClipboardEvent<HTMLElement>, pasted?: string): void => {
    pasted = pasted || (e && e.clipboardData.getData('text').trim());
    if (pasted) {
      this.iDateMediator.paste(pasted).getInternalDate();
      this.updateInternalDate();
    }
  };

  private handlePasteFixIE = () => {
    // @ts-ignore
    if (window.clipboardData) {
      // @ts-ignore
      this.handlePaste(undefined, window.clipboardData.getData('text'));
    }
  };

  private pressDelimiter = () => {
    const value = this.state.internalDate.get(this.state.selected);
    if (value !== null && value !== '') {
      if (this.state.autoMoved) {
        this.setState({ autoMoved: false });
      } else {
        this.moveSelection(1);
      }
    }
  };

  private emitChange = (): void => {
    const value = this.state.internalDate.isEmpty() ? '' : this.state.internalDate.toInternalString();
    if (this.props.value === value) {
      return;
    }
    if (this.props.onChange) {
      this.props.onChange({ target: { value } }, value);
    }
  };

  private clearSelected = (): void => {
    const selected = this.state.selected === null ? this.iDateMediator.getLeftmostType() : this.state.selected;
    this.iDateMediator.clearSelected(selected);
    this.updateInternalDate({ inputMode: false, selected });
    if (selected === InternalDateComponentType.All) {
      this.selectDateComponent(this.iDateMediator.getLeftmostType());
    }
  };

  private clearOneChar = (): void => {
    const { selected, inputMode } = this.state;
    const nextType = selected === null ? this.iDateMediator.getRightmostType() : selected;
    let prev = this.iDateMediator.iDate.get(nextType);
    if (prev === null) {
      this.moveSelection(-1);
      return;
    }
    prev = String(inputMode ? prev : InternalDateTransformer.padDateComponent(nextType, prev));
    const next = prev.replace(/.$/, '') || null;
    this.iDateMediator.iDate.set(nextType, next);
    this.updateInternalDate({
      inputMode: next !== null,
      selected: nextType,
    });
  };

  private shiftDateComponent(step: number): void {
    const { selected } = this.state;
    const notice = this.iDateMediator.shiftDateComponent(selected, step);
    this.updateInternalDate({
      inputMode: false,
      selected: selected === InternalDateComponentType.All ? this.iDateMediator.getLeftmostType() : selected,
      notify: notice,
    });
  }

  private moveSelection(step: number, isAutoMoved: boolean = false): void {
    const selected = this.iDateMediator.getShiftedType(this.state.selected, step);
    if (selected !== this.state.selected) {
      removeAllSelections();
      this.updateInternalDate({
        selected,
        inputMode: false,
        autoMoved: isAutoMoved,
      });
    }
  }

  // ???
  private inputValue(event: React.KeyboardEvent<HTMLElement>): void {
    event.persist();
    let { selected: type } = this.state;
    const internalDate = this.iDateMediator.iDate;
    let prev = internalDate.get(type);
    if (type === null) {
      type = this.iDateMediator.getLeftmostType();
      internalDate.set(type, null);
    }
    if (type === InternalDateComponentType.All) {
      type = this.iDateMediator.getLeftmostType();
      prev = internalDate.get(type);
      internalDate.set(InternalDateComponentType.All, null);
    }
    // this.setState({ selected: type, internalDate }, () => {
    //   console.log('prev', prev);
    // });
    // inputNumber(type, prev, event.key, this.state.inputMode, this.inputNumberCallBack);
    const { value: nextValue, inputMode } = inputNumber(type, prev, event.key, this.state.inputMode);
    // }
    //
    // // ???
    // private inputNumberCallBack = (type: InternalDateComponentType | null, next: InternalDateComponent, inputMode: boolean): void => {
    if (type !== InternalDateComponentType.Year) {
      internalDate.cutOffExcess(type);
      console.log('2');
    } else {
      internalDate.restore(type);
    }
    this.moveSelection(1, true);
    if (!inputMode) {
    } else {
      this.selectDateComponent(type);
    }
    // internalDate.cutOffExcess(type);
    // internalDate.restore(type);
    //   const internalDate = this.iDateMediator.iDate;
    internalDate.set(type, nextValue);
    this.updateInternalDate({ inputMode });
  }

  private selectNodeContents = (node: HTMLElement | null, start?: number, end?: number): void => {
    if (this.state.focused && node) {
      if (isFirefox) {
        selectNodeContents(node, start, end);
        setTimeout(() => this.state.focused && selectNodeContents(node, start, end), 0);
      } else {
        selectNodeContents(node, start, end);
      }
    }
  };

  private handleDoubleClick = (): void => {
    this.selectDateComponent(InternalDateComponentType.All);
  };

  private renderIcon = () => {
    const { withIcon, size, disabled = false } = this.props;

    if (withIcon) {
      const theme = this.theme;
      const iconStyles = cx({
        [styles.icon]: true,
        [jsStyles.icon(theme)]: true,
        [jsStyles.iconSmall(theme)]: size === 'small',
        [jsStyles.iconMedium(theme)]: size === 'medium',
        [jsStyles.iconLarge(theme)]: size === 'large',
        [styles.iconDisabled]: disabled,
        [jsStyles.iconDisabled(theme)]: disabled,
      });
      return (
        <span className={iconStyles}>
          <CalendarIcon />
        </span>
      );
    }
    return null;
  };
}

export default (isIE ? DateInputFallbackIE(DateInput) : isEdge ? DateInputFallbackEdge(DateInput) : DateInputFallbackEdge(DateInput));
// export default DateInput;
