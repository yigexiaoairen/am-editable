import { useState, useCallback, useMemo, useRef } from 'react';
import { omit, isArray, isFunction } from 'lodash';

interface useEditableState<recordType extends {editable_id: number; } = any, R = Partial<recordType>> {
  (val: {
    value: R[];
    defaultData: R;
  }): {state: R[], handleAdd: (v: R) => void;}
}

interface useEditableStateReturnType<R> {
  state: R[];
  handleAdd: (v?: R) => void;
  setRowsData: (rowData: R, rowIndex: number) => void;
  handleDelete: (key: React.Key) => void;
  handleEdit: (key: React.Key) => void;
  settingId?: React.Key;
  isSetting?: boolean; // 单行编辑的时候是否，有选项正在编辑
}

export const useEditableState = <RT = any, R = Partial<RT>>({
  value,
  defaultData,
  onChange,
  max,
}: {
  value?: R[];
  defaultData?: R;
  onChange?: (val: R[]) => void;
  max?: number;
}) : useEditableStateReturnType<R> => {
  const [_state, setState] = useState<R[]>([]);
  const [settingId, handleEdit] = useState<React.Key>(); 
  const stateRef = useRef<R[]>([]);

  stateRef.current = useMemo(() => {
    const list = (isArray(value) ? value : _state);
    const end = max || list.length;
    return list.slice(0, end).map((item, index: number) => ({
      ...item,
      editable_id: index,
    }))
  }, [value, _state]);

  const handleChange = (val: any[]) => {
    const end = max || val.length;
    if (isFunction(onChange)) onChange(val.slice(0, end).map(item => omit(item, ['editable_id'])));

    setState(val.slice(0, end));
  }

  const handleAdd = useCallback((data?: R) => {
    const newData: any = data || defaultData || {};
    handleChange([
      ...stateRef.current,
      newData,
    ])
  }, []);

  const handleDelete = useCallback((key: React.Key) => {
    handleChange(stateRef.current.filter((item: any) => item.editable_id !== key));
  }, []);

  const setRowsData = useCallback((rowData: any, rowIndex: number) => {
    const newRowData = { ...stateRef.current[rowIndex], ...omit(rowData, ['editable_id']) };
    const list = [...stateRef.current];
    list[rowIndex] = newRowData;
    handleChange(list);
  }, []);

  return {
    state: stateRef.current,
    handleAdd,
    setRowsData,
    handleDelete,
    handleEdit,
    settingId,
    isSetting: stateRef.current.findIndex((record: any) => record.editable_id === settingId) >= 0,
  }
}