import React, {
  useContext,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  pick,
  has,
  isArray,
  isFunction,
  assign,
  isObject,
  concat,
} from 'lodash';
import {
  ColumnsType,
  ColumnType,
  ColumnGroupType,
  TableProps,
} from 'antd/lib/table';
import { FormItemProps } from 'antd/lib/form';
import { ButtonProps } from 'antd/lib/button';
import { SpaceProps } from 'antd/lib/space';

import { Table, Button, Space } from 'antd';

import { EditableContext } from './context';
import { useEditableState } from './hooks';
import EditableRow, { onRowValuesChangeType } from './EditableRow';
import EditableCell, {
  EditableCellProps,
  renderFormInputType,
} from './EditableCell';
import {
  OptionDelete,
  OptionEdit,
  OptionCancel,
  OptionSave,
  OptionSequence,
} from './options';

export interface actionRefType<R = any> {
  setRowsData: (rowData: R, rowIndex: number) => void;
  handleAdd: (v?: R) => void;
  handleDelete: (key: React.Key) => void;
  handleEdit: (key: React.Key) => void;
}

export type optionExtraElementType = React.ReactElement | React.ReactElement[];
export type optionExtraType<R = any> =
  | optionExtraElementType
  | ((r: R) => optionExtraElementType);

export interface FieldType<RecordType = any, k extends keyof RecordType = any>
  extends Pick<EditableCellProps<RecordType>, 'trigger'> {
  title: string;
  id: k | React.Key; // 当前列对应字段名
  formItemProps?: FormItemProps<RecordType>;
  formFieldProps?: object;
  column?: ColumnType<RecordType>;
  children?: FieldType<RecordType, k>[];
  renderFormInput?: renderFormInputType<RecordType>;
  editable?: boolean;
}

export interface EditableTableProps<R = any> {
  sortMode?: 'drag' | 'popover' | false; // 拖动排序方式，拖拽手柄排序，序列号气泡输入排序；默认关闭
  fields: FieldType<R>[];
  value?: R[];
  defaultValue?: R[]; // 表格默认数据
  onChange?: (value: R[]) => void;
  defaultData?: R;
  getActionRef?: (p: React.MutableRefObject<actionRefType>) => void;
  deleteBtnProps?: ButtonProps; // 删除按钮配置选项
  deleteBtnText?: string; // 删除按钮文案；
  editBtnProps?: ButtonProps; // 编辑按钮配置选项
  editBtnText?: string; // 编辑按钮文案；
  saveBtnProps?: ButtonProps; // 保存按钮配置选项
  saveBtnText?: string; // 保存按钮文案；
  cancelBtnProps?: ButtonProps; // 取消按钮配置选项
  cancelBtnText?: string; // 取消按钮文案；
  hideAddBtn?: boolean;
  addBtnProps?: ButtonProps; // 新增按钮配置选项；
  addBtnText?: React.ReactNode; // 新增按钮配置文案；
  tableProps?: TableProps<R>;
  max?: number; // 最多数据条数
  onRowValuesChange?: onRowValuesChangeType<R>; // 行数据变化的回调函数，可用于数据联动；
  optionExtraBefore?: optionExtraType<R>;
  optionExtraAfter?: optionExtraType<R>;
  // 当操作选项有多个元素时，会使用Space包裹，optionSpaceProps 为Space组件的配置，或者配置成false，不使用组件包裹
  optionSpaceProps?: SpaceProps | Boolean;
  // 自定义操作选项的内容
  optionRender?: (
    r: R,
    opt: {
      delete: React.ReactElement; // 删除选项的元素；
      edit: React.ReactElement; // 编辑选项的元素；
      cancel: React.ReactElement; // 取消选项的元素；
      save: React.ReactElement; // 保存选项的元素；
    },
  ) => React.ReactChild;
  multiple?: boolean; // 是否开启多行编辑功能
}

export interface getColumnByFieldType {
  (col: FieldType): ColumnGroupType<any> | ColumnType<any>;
}

const EditableTable = <R extends {}>(props: EditableTableProps<R>) => {
  const {
    tableProps,
    fields,
    defaultValue,
    value,
    onChange,
    defaultData,
    getActionRef,
    hideAddBtn = false,
    addBtnProps,
    addBtnText,
    max,
    onRowValuesChange,
    optionExtraBefore,
    optionExtraAfter,
    optionSpaceProps,
    optionRender,
    multiple: mult = true,
    sortMode = false,
  } = props;

  // 多行编辑和单行编辑不支持动态切换，因为切换之后有问题，后期可能会支持动态切换；
  const [multiple] = useState(mult);
  const fieldNamesRef = useRef<string[]>([]);
  const actionRef = useRef<actionRefType>({
    setRowsData: () => {},
    handleAdd: () => {},
    handleDelete: () => {},
    handleEdit: () => {},
  });

  // 区分设置value为undefined和未设置值的情况
  const {
    state,
    handleAdd,
    setRowsData,
    handleDelete,
    handleEdit,
    move,
    settingId,
    isSetting,
    sequenceId,
    setSequenceId,
  } = useEditableState<R>({
    value: has(props, 'value') && !value ? [] : value,
    defaultValue,
    defaultData,
    onChange,
    max,
  });
  const showAddBtn = !hideAddBtn && (!max || max > state.length);

  useEffect(() => {
    assign(actionRef.current, {
      handleAdd,
      setRowsData,
      handleDelete,
      handleEdit,
    });
  }, [handleAdd, setRowsData]);
  useEffect(() => {
    if (isFunction(getActionRef)) getActionRef(actionRef);
  }, []);

  const getColumnByField: getColumnByFieldType = useCallback(col => {
    const tableColumn: ColumnGroupType<any> | ColumnType<any> = {
      title: col.title,
      dataIndex: col.id,
      ...col?.column,
      children: isArray(col?.children)
        ? col.children.map(getColumnByField)
        : undefined,
    };

    if (!col.editable) {
      tableColumn;
    } else {
      const formItemProps = {
        name: col.id,
        ...col.formItemProps,
      };
      // 可编辑单元格存储表单name字段；
      if (fieldNamesRef.current.indexOf(formItemProps.name) === -1) {
        fieldNamesRef.current.push(formItemProps.name);
      }

      tableColumn.onCell = (record: any, rowIndex?: number) => ({
        record,
        ...pick(col, [
          'editable',
          'title',
          'renderFormInput',
          'formFieldProps',
          'trigger',
        ]),
        formItemProps,
        rowIndex,
        handleSave: () => {},
        setRowsData,
      });
    }

    return tableColumn;
  }, []);

  // 只在初始化的时候生成一次columns配置，暂不支持动态更新columns配置
  // 注：如果后面需要支持动态更新columns,注意fieldNames的更新；
  const columns: ColumnsType<any> = useMemo(() => {
    const list = fields.map(getColumnByField);
    list.push({
      title: '操作',
      render: (_, row) => {
        let optionsNode = [
          <OptionSave
            key="option_save"
            id={row.editable_id}
            buttonProps={props.saveBtnProps}
            buttonText={props.saveBtnText}
          />,
          <OptionEdit
            key="option_edit"
            id={row.editable_id}
            buttonProps={props.editBtnProps}
            buttonText={props.editBtnText}
          />,
          <OptionDelete
            key="option_delete"
            id={row.editable_id}
            buttonProps={props.deleteBtnProps}
            buttonText={props.deleteBtnText}
          />,
          <OptionCancel
            key="option_cancel"
            id={row.editable_id}
            buttonProps={props.cancelBtnProps}
            buttonText={props.cancelBtnText}
          />,
        ];
        if (isFunction(optionRender)) {
          return optionRender(row, {
            delete: optionsNode[2],
            edit: optionsNode[1],
            cancel: optionsNode[3],
            save: optionsNode[0],
          });
        }
        if (isFunction(optionExtraBefore)) {
          optionsNode = concat(optionExtraBefore(row), optionsNode);
        } else if (optionExtraBefore) {
          optionsNode = concat([], optionExtraBefore, optionsNode);
        }

        if (isFunction(optionExtraAfter)) {
          optionsNode = concat(optionsNode, optionExtraAfter(row));
        } else if (optionExtraAfter) {
          optionsNode = concat(optionsNode, optionExtraAfter);
        }
        if (optionsNode.length > 1 && optionSpaceProps !== false) {
          return (
            <Space
              direction="horizontal"
              {...(isObject(optionSpaceProps) ? optionSpaceProps : {})}
            >
              {optionsNode}
            </Space>
          );
        }
        return optionsNode;
      },
    });
    // 气泡排序
    if (sortMode === 'popover') {
      list.unshift({
        dataIndex: '_index',
        title: '序号',
        width: 80,
        render: (_, record, index) => {
          return <OptionSequence id={record.editable_id} rowIndex={index} />;
        },
      });
    }
    return list;
  }, [sortMode, fields, multiple]);

  return (
    <EditableContext.Provider
      value={{
        fieldNames: fieldNamesRef.current,
        setRowsData,
        handleDelete,
        handleEdit,
        move,
        settingId,
        multiple,
        isSetting,
        state,
        setSequenceId,
        sequenceId,
      }}
    >
      <div>
        <Table
          bordered
          {...tableProps}
          pagination={false}
          rowKey="editable_id"
          components={{
            body: {
              row: EditableRow,
              cell: EditableCell,
            },
          }}
          dataSource={state}
          columns={columns}
          onRow={(record, index): any => {
            return {
              record,
              index,
              onRowValuesChange,
            };
          }}
        />
        {showAddBtn && (
          <Button
            block
            type="dashed"
            disabled={!multiple && isSetting}
            {...addBtnProps}
            style={{
              marginBottom: 16,
              marginTop: 16,
              ...addBtnProps?.style,
            }}
            onClick={e => {
              if (isFunction(addBtnProps?.onClick)) {
                addBtnProps!.onClick(e);
              }
              handleAdd();
            }}
          >
            {addBtnText || '添加一行'}
          </Button>
        )}
      </div>
    </EditableContext.Provider>
  );
};

export default EditableTable;
