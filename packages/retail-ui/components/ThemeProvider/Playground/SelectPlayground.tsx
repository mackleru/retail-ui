import React from 'react';
import Select, { SelectProps } from '../../Select';

export class SelectPlayground extends React.Component<SelectProps<string, string>, { value: string | undefined }> {
  public state = {
    value: capitalize(this.props.size),
  };
  private readonly selectItems = ['Small', 'Medium', 'Large'];

  public render() {
    return <Select {...this.props} value={this.state.value} items={this.selectItems} onChange={this.handleChange} />;
  }

  private handleChange = (_: any, value: string) => {
    this.setState({
      value,
    });
  };
}

const capitalize = (input: string = ''): string => {
  return input.charAt(0).toUpperCase() + input.slice(1);
};
