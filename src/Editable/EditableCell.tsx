import React, { useCallback, useRef, useContext, useEffect } from 'react';
import { FormInstance, FormItemProps } from 'antd/lib/form';
import { isFunction, has, debounce, assign, set } from 'lodash';

import { Input, Form } from 'antd';

import { EditableRowContext, EditableContext } from './context';
import FieldWrap from './FieldWrap';
import { NamePath } from 'antd/lib/form/interface';

interface RFIOptionType<R = any> {
  value: R[];
  onChange: (val: R[]) => void;
  rowIndex: number;
}
export interface renderFormInputType<R = any> {
  (record: R, opt: RFIOptionType, form: FormInstance): React.ReactElement;
}

export interface EditableCellProps<Record = any> {
  title?: React.ReactNode;
  editable?: boolean;
  children?: React.ReactChild;
  dataIndex: number;
  rowIndex: number;
  record: Record;
  handleSave: (values: Partial<Record>) => void;
  renderFormInput?: renderFormInputType<Record>;
  formItemProps?: FormItemProps<Record>;
  formFieldProps?: object;
  setRowsData: (rowData: Partial<Record>, rowIndex: number) => void;
  trigger?: 'onChange' | 'onBlur'; // 数据保存的时机；
}

const EditableCell = <RecordType extends { editable_id: React.Key } = any>({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  renderFormInput,
  formItemProps,
  formFieldProps,
  rowIndex,
  setRowsData,
  trigger,
  ...restProps
}: EditableCellProps<RecordType>) => {
  const inputRef = useRef<Input>(null);
  const { form, addWaitSaveName, removeWaitSaveName } = useContext(
    EditableRowContext,
  );
  const formRef = useRef<FormInstance>({ ...form });
  const { multiple, settingId } = useContext(EditableContext);
  const name = formItemProps?.name || dataIndex;
  const triggerStr = typeof trigger === 'string' ? trigger : 'onChange';

  const saveFun = useCallback(
    debounce(async (v?: any) => {
      const val = v || form.getFieldValue(name);
      removeWaitSaveName(name as React.Key);
      setRowsData(set({}, name, val), rowIndex);
    }, 300),
    [],
  );
  const save = (v?: any) => {
    addWaitSaveName(name as React.Key);
    saveFun(v);
  };

  useEffect(() => {
    assign(formRef.current, {
      ...form,
      setFieldsValue: (values: any) => {
        form.setFieldsValue(values);
        // 多行编辑自动更新数据；单行编辑需要手动保存数据；
        if (multiple) {
          setRowsData(
            {
              ...values,
            },
            rowIndex,
          );
        }
      },
      resetFields: (fields?: NamePath[]) => {
        form.resetFields(fields);
        // 多行编辑自动更新数据；单行编辑需要手动保存数据；
        if (multiple) {
          setRowsData(
            {
              ...form.getFieldsValue(),
            },
            rowIndex,
          );
        }
      },
    });
  }, [rowIndex, setRowsData]);

  let childNode = children;
  let fieldNode = (
    <Input autoComplete="off" ref={inputRef} {...formFieldProps} />
  );

  if (renderFormInput) {
    fieldNode = (
      <FieldWrap
        renderFormInput={(val, onChangeB) => {
          return renderFormInput(
            record,
            {
              value: val,
              onChange: onChangeB,
              rowIndex,
            },
            formRef.current,
          );
        }}
      />
    );
  }

  if (editable && (multiple || settingId === record.editable_id)) {
    childNode = (
      <Form.Item
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
            if (isFunction(fieldNode.props[triggerStr]))
              fieldNode.props[triggerStr](val);
            // 单行编辑模式通过保存按钮保存内容；
            if (!multiple) return;
            if (triggerStr !== 'onChange') {
              save();
            } else if (has(val, 'target.value')) {
              save(val.target.value);
            } else {
              save(val);
            }
          },
        })}
      </Form.Item>
    );
  } else {
    childNode = children;
  }

  return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
