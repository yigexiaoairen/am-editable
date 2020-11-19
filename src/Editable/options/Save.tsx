import React, { useContext } from 'react';

import { Button, Popconfirm } from 'antd';

import { OptionComponentProps } from './index';
import { EditableContext } from '../context';

const OptionDelete: React.FC<OptionComponentProps> = (props) => {
  const {
    id,
    buttonProps,
    buttonText
  } = props;

  const { handleDelete } = useContext(EditableContext);

  return <Button size="small" {...buttonProps}>{buttonText || '保存'}</Button>
}

export default OptionDelete;
