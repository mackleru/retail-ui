import React, { Component } from 'react';
import Gapped from '../../Gapped';
import Toggle from '../../Toggle';

export class TogglePlayground extends Component<{}, any> {
  public state = {
    checked: false,
    loadingActive: false,
    loading: false,
  };

  public render() {
    return (
      <Gapped vertical>
        <Gapped gap={10}>
          <Toggle />
          <div>Toggle</div>
        </Gapped>
        <Gapped gap={10}>
          <Toggle disabled />
          <div>Disabled toggle</div>
        </Gapped>
      </Gapped>
    );
  }
}
