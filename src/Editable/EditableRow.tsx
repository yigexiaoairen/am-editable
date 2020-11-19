
import React, { useContext, useEffect, useRef } from 'react';
import { isEqual, get, pick, has, isNumber } from 'lodash';

import { Form } from 'antd';

import { EditableRowContext, EditableContext } from './context';

export type onRowValuesChangeType<R = any> = (val: any, opt: {
  rowIndex: number;
  setRowsData: (rowData: R, rowIndex?: number) => void;
  record: R;
}) => void;

export interface EditableRowProps<R = any> {
  index: number;
  record?: R;
  onRowValuesChange?: onRowValuesChangeType;
}

const EditableRow: React.FC<EditableRowProps> = ({
  index,
  record,
  onRowValuesChange,
  ...props
}) => {
  const [form] = Form.useForm();
  const recordPreRef = useRef<typeof record>();
  const {
    fieldNames,
    setRowsData,
  } = useContext(EditableContext);

  useEffect(() => {
    if (!isEqual(recordPreRef.current, record)) {
      const resetFields = fieldNames.filter(name => {
        // 如果新的数据里面没有值，就重置当前字段，防止表格长度变化（删除、新增数据）的时候表单保留旧值；
        return !has(record, name);
      });
      // 当行数据变化时，更新变化的数据；
      const setFieldsName = fieldNames.filter(name => {
        return !isEqual(get(record, name), get(recordPreRef.current, name));
      });
      form.resetFields(resetFields);
      form.setFieldsValue(pick(record, setFieldsName));
    }

    // 更新保存上一个记录值；
    recordPreRef.current = record;
  }, [record]);
  return (
    <Form
      name={`editable_${index! + 1}_`}
      form={form}
      onValuesChange={(values) => {
        if (typeof onRowValuesChange === 'function') {
          onRowValuesChange(values, {
            rowIndex: index,
            record: {
              ...record,
              ...values,
            },
            setRowsData: (row, rowI = index) => {
              setRowsData(row, rowI);
            }
          })
        }
      }}
      component={false}>
      <EditableRowContext.Provider value={{form}}>
        <tr {...props} />
      </EditableRowContext.Provider>
    </Form>
  );
};

export default EditableRow;
