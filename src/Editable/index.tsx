import React, { useContext, useMemo, useRef, useCallback, useEffect } from 'react';
import { ColumnsType, ColumnType, ColumnGroupType, TableProps } from 'antd/lib/table';
import { FormItemProps } from 'antd/lib/form';
import { pick, has, isArray, isFunction, assign, isObject, concat } from 'lodash';
import { ButtonProps } from 'antd/lib/button';
import { SpaceProps } from 'antd/lib/space';

import { Table, Input, Button, Popconfirm, Form, Space } from 'antd';

import { EditableContext } from './context';
import { useEditableState } from './hooks';
import EditableRow, { onRowValuesChangeType } from './EditableRow';
import EditableCell, { EditableCellProps } from './EditableCell';
import { OptionDelete, OptionEdit, OptionSave } from './options';

export interface actionRefType<R = any> {
  setRowsData: (rowData: R, rowIndex: number) => void;
  handleAdd: (v?: R) => void;
}

export type optionExtraElementType = React.ReactElement | React.ReactElement[];
export type optionExtraType<R = any> = optionExtraElementType | ((r: R) => optionExtraElementType);

export interface FieldType<RecordType = any, k extends keyof RecordType = any> extends Pick<EditableCellProps<RecordType>, 'trigger'> {
  title: string;
  id: k | React.Key; // 当前列对应字段名
  formItemProps: FormItemProps<Partial<RecordType>>;
  column: ColumnType<RecordType>;
  children?: FieldType<RecordType, k>[];
  renderFormInput: () => React.ReactNode;
  editable?: boolean;
}

export interface EditableTableProps<R = any> {
  fields: FieldType[];
  value?: R[];
  onChange?: (value: R[]) => void;
  defaultData?: Partial<R>;
  getActionRef?: (p: React.MutableRefObject<actionRefType>) => void;
  deleteBtnProps?: ButtonProps; // 删除按钮配置选项
  deleteBtnText?: string; // 删除按钮文案；
  editBtnProps?: ButtonProps; // 编辑按钮配置选项
  editBtnText?: string; // 编辑按钮文案；
  saveBtnProps?: ButtonProps; // 保存按钮配置选项
  saveBtnText?: string; // 保存按钮文案；
  hideAddBtn?: boolean;
  addBtnProps?: ButtonProps; // 新增按钮配置选项；
  addBtnText?: React.ReactNode; // 新增按钮配置文案；
  tableProps?: TableProps<R>;
  max?: number; // 最多数据条数
  onRowValuesChange?: onRowValuesChangeType; // 行数据变化的回调函数，可用于数据联动；
  optionExtraBefore?: optionExtraType<R>;
  optionExtraAfter?: optionExtraType<R>;
  // 当操作选项有多个元素时，会使用Space包裹，optionSpaceProps 为Space组件的配置，或者配置成false，不使用组件包裹
  optionSpaceProps?: SpaceProps | Boolean;
  // 自定义操作选项的内容
  optionRender?: (r: R, opt: {
    delete: React.ReactElement; // 删除选项的元素；
  }) => React.ReactChild;
  multiple?: boolean; // 是否开启多行编辑功能
}

export interface getColumnByFieldType {
  (col: FieldType) : ColumnGroupType<any> | ColumnType<any>;
}

const EditableTable: React.FC<EditableTableProps> = (props) => {
  const {
    tableProps,
    fields,
    value,
    onChange,
    defaultData,
    getActionRef,
    deleteBtnProps,
    deleteBtnText,
    editBtnProps,
    editBtnText,
    saveBtnProps,
    saveBtnText,
    hideAddBtn = false,
    addBtnProps,
    addBtnText,
    max,
    onRowValuesChange,
    optionExtraBefore,
    optionExtraAfter,
    optionSpaceProps,
    optionRender,
    multiple = true,
  } = props;

  const fieldNamesRef = useRef<string[]>([]);
  const actionRef = useRef<actionRefType>({
    setRowsData: () => {},
    handleAdd: () => {},
  });

   // 区分设置value为undefined和未设置值的情况
  const {
      state,
      handleAdd,
      setRowsData,
      handleDelete,
      handleEdit,
      settingId,
      isSetting,
    } = useEditableState({
    value: has(props, 'value') && !value ? [] : value,
    defaultData,
    onChange,
    max,
  });
  const showAddBtn = !hideAddBtn && (!max || (max > state.length));

  useEffect(() => {
    assign(actionRef.current, {
      handleAdd,
      setRowsData,
    })
  }, [handleAdd, setRowsData]);
  useEffect(() => {
    if (isFunction(getActionRef)) getActionRef(actionRef);
  }, []);

  const getColumnByField: getColumnByFieldType = useCallback((col) => {
    const tableColumn: (ColumnGroupType<any> | ColumnType<any>) = {
      title: col.title,
      dataIndex: col.id,
      ...col?.column,
      children: isArray(col?.children) ? col.children.map(getColumnByField) : undefined,
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
          <OptionDelete
            key="option_delete"
            id={row.editable_id}
            buttonProps={deleteBtnProps}
            buttonText={deleteBtnText}
          />
        ];
        if (!multiple && settingId === row.editable_id) {
          optionsNode.unshift(<OptionSave
            key="option_edit"
            id={row.editable_id}
            buttonProps={saveBtnProps}
            buttonText={saveBtnText}
          />);
        } else if (!multiple) {
          optionsNode.unshift(<OptionEdit
            key="option_edit"
            id={row.editable_id}
            editBtnProps={editBtnProps}
            editBtnText={editBtnText}
            saveBtnProps={saveBtnProps}
            saveBtnText={saveBtnText}
          />)
        }
        if (isFunction(optionRender)) {
          return optionRender(row, {
            delete: optionsNode[0],
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
          return <Space
            direction="horizontal"
            {
              ...(isObject(optionSpaceProps) ? optionSpaceProps : {})
            }
          >{ optionsNode }</Space>
        }
        return optionsNode;
      }
    });
    return list;
  }, []);

  return (
    <EditableContext.Provider value={{
      fieldNames: fieldNamesRef.current,
      setRowsData,
      handleDelete,
      handleEdit,
      settingId,
      multiple,
      isSetting,
    }}>
      <div>
        <Table
          bordered
          {
            ...tableProps
          }
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
            }
          }}
        />
        {
          showAddBtn && <Button
            block
            type="dashed"
            style={{
              marginBottom: 16,
              marginTop: 16,
            }}
            {
              ...addBtnProps
            }
            onClick={(e) => {
              if (isFunction(addBtnProps?.onClick)) {
                addBtnProps!.onClick(e);
              }
              handleAdd()
            }}
          >
            {addBtnText || '添加一行'}
          </Button>
        }
      </div>
    </EditableContext.Provider>
  );
}

export default EditableTable;