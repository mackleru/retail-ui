import { isFunction } from './utils';

type IHandler = (...args: any[]) => void;
type ICondition<T> = T | ((reference: T) => boolean);

export class ConditionalHandlerCaller<T> {
  private readonly reference: T;
  private readonly actions: Array<{
    condition: ICondition<T>;
    handler: IHandler;
  }> = [];

  constructor(reference: T) {
    this.reference = reference;
  }

  public add(condition: ICondition<T>, handler: IHandler): ConditionalHandlerCaller<T> {
    this.actions.push({ condition, handler });
    return this;
  }

  /**
   * @param defaultHandler
   * @returns {Boolean} isDone - если был вызван хоть один обработчик
   */
  public check(defaultHandler?: IHandler): boolean {
    let isFound: boolean = false;
    this.actions.forEach(({ condition, handler }) => {
      if (isFunction(condition) ? condition(this.reference) : condition === this.reference) {
        handler();
        isFound = true;
      }
    });

    if (!isFound && defaultHandler) {
      defaultHandler();
    }
    return isFound || !!defaultHandler;
  }
}
