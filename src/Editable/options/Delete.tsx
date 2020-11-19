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

  return <Popconfirm
    title="确认要删除当前行吗？"
    okText="确定"
    cancelText="取消"
    onConfirm={() => {
      handleDelete(id);
    }}>
    <Button size="small" {...buttonProps}>{buttonText || '删除'}</Button>
  </Popconfirm>
}

export default OptionDelete;
