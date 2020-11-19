import React, { useState, useRef, useContext, useEffect } from 'react';
import { FormInstance, FormItemProps } from 'antd/lib/form';
import { isFunction, has, debounce } from 'lodash';

import {
  Input,
  Form,
} from 'antd';

import { EditableRowContext, EditableContext } from './context';
import FieldWrap from './FieldWrap';

interface RFIOptionType<R = any,> {
  value: Partial<R>[];
  onChange: (val: Partial<R>[]) => void;
  rowIndex: number;
}
export interface renderFormInput<R = any,> {
  (record: R, opt: RFIOptionType, form: FormInstance): React.ReactElement;
}

export interface EditableCellProps<Record = any,> {
  title?: React.ReactNode;
  editable?: boolean;
  children?: React.ReactChild;
  dataIndex: number;
  rowIndex: number;
  record: Record;
  handleSave: (values: any) => void;
  renderFormInput?: renderFormInput;
  formItemProps?: FormItemProps;
  setRowsData: (rowData: any, rowIndex: number) => void;
  trigger?: 'onChange' | 'onBlur'; // 数据保存的时机；
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  renderFormInput,
  formItemProps,
  rowIndex,
  setRowsData,
  trigger,
  ...restProps
}) => {
  const inputRef = useRef<Input>(null);
  const {form} = useContext(EditableRowContext);
  const {
    multiple,
    settingId,
  } = useContext(EditableContext);
  const name = formItemProps?.name || dataIndex;
  const triggerStr = typeof trigger === 'string' ? trigger : 'onChange';

  const save = debounce(async (v?: any) => {
    const val = v || form.getFieldValue(name);
    setRowsData({
      [name as string]: val
    }, rowIndex);
  }, 300);

  let childNode = children;
  let fieldNode = <Input autoComplete="off" ref={inputRef} />;

  if (renderFormInput) {
    fieldNode = <FieldWrap
      renderFormInput={
        (val, onChangeB) => {
          return renderFormInput(record, {
            value: val,
            onChange: onChangeB,
            rowIndex,
          }, form);
        }
      } />
  }

  if (editable && (multiple || settingId === record.editable_id)) {
    childNode = <Form.Item
      {...formItemProps}
      style={{
        margin: 0,
        ...formItemProps?.style,
      }}
      name={name}
    >
      {React.cloneElement(fieldNode, {
        ...fieldNode.props,
        [triggerStr]: (val: any) => {
          if (isFunction(fieldNode.props[triggerStr])) fieldNode.props[triggerStr](val);
          if (triggerStr !== 'onChange') {
            save();
          } else if (has(val, 'target.value')) {
            save(val.target.value);
          } else {
            save(val);
          }
        }
      })}
    </Form.Item>;
  } else {
    childNode = children;
  }

  return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
