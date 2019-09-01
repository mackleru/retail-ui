import React from 'react';

type ActionCheck = (event: React.KeyboardEvent<HTMLElement>) => boolean;

interface KeyboardActionMatcher<Actions> {
  type: Actions;
  check: (x0: React.KeyboardEvent<HTMLElement>) => boolean;
}

export class KeyboardActionExctracterBuilder<T> {
  private _actionMatchers: Array<KeyboardActionMatcher<any>>;

  constructor(actionMatchers: Array<KeyboardActionMatcher<T>> = []) {
    this._actionMatchers = actionMatchers;
  }

  public add(type: T, check: ActionCheck): KeyboardActionExctracterBuilder<T> {
    return new KeyboardActionExctracterBuilder(this._actionMatchers.concat({ type, check }));
  }

  public build<P = T>(defaultAction: P): (x0: React.KeyboardEvent<HTMLElement>) => T {
    return event => {
      const action = this._actionMatchers.find(x => x.check(event));
      return (action && action.type) || defaultAction;
    };
  }
}

export const isModified: ActionCheck = e => e.shiftKey || e.metaKey || e.ctrlKey || e.altKey;
export const isFKeys: ActionCheck = e => e.keyCode >= 112 && e.keyCode <= 123;
