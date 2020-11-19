import React, { useContext } from 'react';
import { omit } from 'lodash';

import { Button } from 'antd';

import { OptionComponentProps } from './index';
import { EditableContext } from '../context';

const OptionDelete: React.FC<OptionComponentProps> = (props) => {
  const {
    id,
    buttonProps,
    buttonText,
  } = props;

  const { handleEdit, multiple ,isSetting, settingId } = useContext(EditableContext);

  return !multiple && (!isSetting || settingId !== id) ? <Button
    size="small"
    {...omit(buttonProps, [
      'onClick',
      'disabled',
    ])}
    onClick={() => {
      handleEdit(id);
    }}
    disabled={isSetting && settingId !== id}
  >{buttonText || '编辑'}</Button> : null;
}

export default OptionDelete;
