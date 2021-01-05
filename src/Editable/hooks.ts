import { useState, useCallback, useMemo, useRef } from 'react';
import { omit, isArray, isFunction, isNumber, get, set } from 'lodash';
import { FormInstance } from 'antd/lib/form';
import { getEditableIdByIndex, getIndexByEditableId } from './utils';
import { EditableContextType } from './context';

interface useEditableState<
  recordType extends { editable_id: number; _key_id: number } = any,
  R = Partial<recordType>
> {
  (val: { value: R[]; defaultData: R }): {
    state: R[];
    handleAdd: (v: R) => void;
  };
}

interface useEditableStateReturnType<R>
  extends Pick<
    EditableContextType,
    'errorMap' | 'addErrorMapItem' | 'removeErrorMapItem'
  > {
  state: R[];
  handleAdd: (v?: R) => void;
  setRowsData: (rowData: R, rowIndex: number) => void;
  handleDelete: (key: React.Key) => void;
  handleEdit: (key: React.Key) => void;
  settingId?: React.Key;
  isSetting?: boolean; // 单行编辑的时候是否，有选项正在编辑
  move: (id: React.Key, toIndex: number) => void;
  sequenceId?: React.Key; // 当前正在设置排序的key；
  setSequenceId: (key?: React.Key) => void;
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
  const keyIdRef = useRef(1);
  const errorMapRef = useRef<{ [name: string]: any }>({});
  const [_state, setState] = useState<R[]>(
    Array.isArray(defaultValue) ? defaultValue : [],
  );
  const [settingId, setSettingId] = useState<React.Key>();
  const [sequenceId, setSequenceId] = useState<React.Key>();
  const stateRef = useRef<R[]>([]);

  stateRef.current = useMemo(() => {
    const list = isArray(value) ? value : _state;
    const end = max || list.length;
    return list.slice(0, end).map((item, index: number) => ({
      ...item,
      editable_id: getEditableIdByIndex(index),
      _key_id: get(item, '_key_id') || keyIdRef.current++,
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

  const move = (id: React.Key, toIndex: number) => {
    const rowIndex = getIndexByEditableId(id);
    if (toIndex === rowIndex || !isNumber(rowIndex) || !isNumber(toIndex))
      return;
    const list = [...stateRef.current];
    const item = list.splice(rowIndex, 1)[0];
    if (item) {
      list.splice(toIndex, 0, item);
      handleChange(list);
    }
  };

  const addErrorMapItem = useCallback((id: string, errors: any) => {
    set(errorMapRef.current, id, errors);
  }, []);
  const removeErrorMapItem = useCallback((id: string) => {
    delete errorMapRef.current[id];
  }, []);

  return {
    state: stateRef.current,
    handleAdd,
    setRowsData,
    handleDelete,
    handleEdit,
    move,
    settingId,
    sequenceId,
    setSequenceId,
    isSetting:
      stateRef.current.findIndex(
        (record: any) => record.editable_id === settingId,
      ) >= 0,
    errorMap: errorMapRef.current,
    addErrorMapItem,
    removeErrorMapItem,
  };
};

export const useValidateObservers = () => {
  const validatesRef = useRef<FormInstance['validateFields'][]>([]);

  const addValidateFun = useCallback((fun: FormInstance['validateFields']) => {
    if (validatesRef.current.findIndex(f => f === fun) === -1) {
      validatesRef.current.push(fun);
    }
  }, []);
  const removeValidateFun = useCallback(
    (fun: FormInstance['validateFields']) => {
      const index = validatesRef.current.findIndex(f => f === fun);
      if (index >= 0) {
        validatesRef.current.splice(index, 1);
      }
    },
    [],
  );

  const notifyObservers = useCallback(async () => {
    const errors = (
      await Promise.all(
        validatesRef.current.map(async fun => {
          const res = fun()
            .then(() => null)
            .catch(err => err);
          return res;
        }),
      )
    ).filter(item => item);
    if (errors?.length) {
      return Promise.reject(errors.flat());
    }
    return Promise.resolve(null);
  }, []);

  return {
    addValidateFun,
    removeValidateFun,
    notifyObservers,
  };
};
