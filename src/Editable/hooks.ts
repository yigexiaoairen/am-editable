import { useState, useCallback, useMemo, useRef } from 'react';
import { omit, isArray, isFunction, isNumber } from 'lodash';
import { getEditableIdByIndex, getIndexByEditableId } from './utils';

interface useEditableState<
  recordType extends { editable_id: number } = any,
  R = Partial<recordType>
> {
  (val: { value: R[]; defaultData: R }): {
    state: R[];
    handleAdd: (v: R) => void;
  };
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

export const useEditableState = <R = any>({
  value,
  defaultData,
  defaultValue = [],
  onChange,
  max,
}: {
  defaultValue?: R[];
  value?: R[];
  defaultData?: R;
  onChange?: (val: R[]) => void;
  max?: number;
}): useEditableStateReturnType<R> => {
  const [_state, setState] = useState<R[]>(
    Array.isArray(defaultValue) ? defaultValue : [],
  );
  const [settingId, setSettingId] = useState<React.Key>();
  const stateRef = useRef<R[]>([]);

  stateRef.current = useMemo(() => {
    const list = isArray(value) ? value : _state;
    const end = max || list.length;
    return list.slice(0, end).map((item, index: number) => ({
      ...item,
      editable_id: getEditableIdByIndex(index),
    }));
  }, [value, _state]);

  const handleChange = (val: any[]) => {
    const end = max || val.length;
    if (isFunction(onChange))
      onChange(val.slice(0, end).map(item => omit(item, ['editable_id'])));

    setState(val.slice(0, end));
  };

  const handleAdd = useCallback((data?: R) => {
    const newData: any = data || defaultData || {};
    handleChange([...stateRef.current, newData]);
  }, []);

  const handleDelete = useCallback((key: React.Key) => {
    const k = getEditableIdByIndex(key);
    handleChange(
      stateRef.current.filter((item: any) => item.editable_id !== k),
    );
  }, []);

  const handleEdit = useCallback((key: React.Key) => {
    const k = getEditableIdByIndex(key);
    setSettingId(k);
  }, []);

  const setRowsData = useCallback((rowData: any, id: React.Key) => {
    const index = getIndexByEditableId(id);
    const newRowData = {
      ...stateRef.current[index as number],
      ...omit(rowData, ['editable_id']),
    };
    const list = [...stateRef.current];
    list[index as number] = newRowData;
    handleChange(list);
  }, []);

  return {
    state: stateRef.current,
    handleAdd,
    setRowsData,
    handleDelete,
    handleEdit,
    settingId,
    isSetting:
      stateRef.current.findIndex(
        (record: any) => record.editable_id === settingId,
      ) >= 0,
  };
};
