import { FormInstance } from 'antd/lib/form';
import React from 'react';

import { Form } from 'antd';


export interface EditableContextType<R = any> {
  fieldNames: string[];
  setRowsData: (rowData: R, rowIndex: number) => void;
  handleDelete: (key: React.Key) => void;
  handleEdit: (key: React.Key) => void;
  settingId?: React.Key;
  multiple?: boolean;
  isSetting?: boolean; // 单行编辑的时候是否，有选项正在编辑
}
export interface EditableRowContextType {
  form: FormInstance;
}

// 默认函数，在正常使用时，默认值会被覆盖，所以在注册值之前使用可给出统一的警告；
const defaultFun = () => {}

export const EditableContext = React.createContext<EditableContextType>({
  fieldNames: [], // 可编辑表单单元格form表单的name列表
  setRowsData: defaultFun,
  handleDelete: defaultFun,
  handleEdit: defaultFun,
});

export const EditableRowContext = React.createContext<EditableRowContextType>({
  form: Form.useForm()[0],
});
