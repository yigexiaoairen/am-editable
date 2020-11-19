import React, { useContext } from 'react';
import { omit } from 'lodash';
import { ButtonProps } from 'antd/lib/button';

import { Button, Popconfirm } from 'antd';

import { OptionComponentProps } from './index';
import { EditableContext } from '../context';

export interface OptionEditProps extends OptionComponentProps {
  editBtnProps?: ButtonProps;
  editBtnText?: React.ReactNode;
  saveBtnProps?: ButtonProps;
  saveBtnText?: React.ReactNode;
}

const OptionDelete: React.FC<OptionEditProps> = (props) => {
  const {
    id,
    editBtnProps,
    saveBtnProps,
    editBtnText,
    saveBtnText,
  } = props;

  const { handleEdit, isSetting, settingId } = useContext(EditableContext);

  const handleFun = settingId !== id ? handleEdit : () => {};
  const buttonProps = isSetting ? saveBtnProps : editBtnProps;
  const buttonText = isSetting ? (saveBtnText || '保存') : (editBtnText || '编辑');

  return <Button
    size="small"
    {...omit(buttonProps, [
      'onClick',
      'disabled',
    ])}
    onClick={() => {
      handleFun(id);
    }}
    disabled={isSetting && settingId !== id}
  >{buttonText}</Button>;
}

export default OptionDelete;
