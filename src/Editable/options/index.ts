import React from 'react';
import { ButtonProps } from 'antd/lib/button';

export { default as OptionDelete } from './Delete';
export { default as OptionEdit } from './Edit';
export { default as OptionSave } from './Save';

export interface OptionComponentProps {
  id: React.Key;
  buttonProps?: ButtonProps;
  buttonText?: React.ReactNode;
}

// export OptionDelete;