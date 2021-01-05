import { FormInstance } from 'antd/lib/form';
import React from 'react';

export interface EditableContextType<R = any> {
  fieldNames: string[];
  setRowsData: (rowData: R, rowIndex: number) => void;
  handleDelete: (key: React.Key) => void;
  handleEdit: (key: React.Key) => void;
  move: (key: React.Key, index: number) => void;
  settingId?: React.Key;
  multiple?: boolean;
  isSetting?: boolean; // 单行编辑的时候是否有选项正在编辑
  sequenceId?: React.Key; // 当前正在设置排序的key；
  setSequenceId: (key?: React.Key) => void;
  state: R[];
  errorMap: { [name: string]: any };
  addErrorMapItem: (id: string, errors: any) => void;
  removeErrorMapItem: (id: string) => void;
}
export interface EditableRowContextType {
  form: FormInstance;
  addWaitSaveName: (name: React.Key) => void; // 添加防抖函数等待保存字段；
  removeWaitSaveName: (name: React.Key) => void;
  // 防抖函数等待保存字段名列表,全表编辑的时候，数据变化话，保存数据会有一个等待时间，waitSaveName为等待保存的字段名列表
  waitSaveNames: React.Key[];
  rowId: string; // 当前行唯一标示，等于record._key_id
}

// 默认函数，在正常使用时，默认值会被覆盖，所以在注册值之前使用可给出统一的警告；
const defaultFun = () => {};

export const EditableContext = React.createContext<EditableContextType>({
  fieldNames: [], // 可编辑表单单元格form表单的name列表
  setRowsData: defaultFun,
  handleDelete: defaultFun,
  handleEdit: defaultFun,
  move: defaultFun,
  setSequenceId: defaultFun,
  state: [],
  errorMap: {},
  addErrorMapItem: defaultFun,
  removeErrorMapItem: defaultFun,
});

export const EditableRowContext = React.createContext<EditableRowContextType>({
  form: {} as any, // 设置form默认值，正确使用，此值将会被覆盖
  waitSaveNames: [],
  addWaitSaveName: () => {},
  removeWaitSaveName: () => {},
  rowId: '',
});
