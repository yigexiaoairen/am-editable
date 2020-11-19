import React, { useContext } from 'react';
import { omit } from 'lodash';
import { ButtonProps } from 'antd/lib/button';

import { Button, Popconfirm } from 'antd';

import { OptionComponentProps } from './index';
import { EditableContext, EditableRowContext } from '../context';

const OptionDelete: React.FC<OptionComponentProps> = (props) => {
  const {
    id,
    buttonProps,
    buttonText,
  } = props;

  const { handleEdit, multiple ,isSetting, settingId, setRowsData } = useContext(EditableContext);
  const { form } = useContext(EditableRowContext);

  const save = async (id: any) => {
    try {
      const data = await form.validateFields();
      setRowsData(data, id);
      handleEdit(-1);
    } catch (e) {
      console.log(e);
    }
  }

  return !multiple && isSetting && settingId === id ? <Button
    size="small"
    {...omit(buttonProps, [
      'onClick',
      'disabled',
    ])}
    onClick={() => {
      save(id);
    }}
  >{buttonText || '保存'}</Button> : null;
}

export default OptionDelete;
