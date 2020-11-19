# 可编辑表格API

## EditableProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
|value | tabe列表的值 | `FieldType` | - |
| fields | 表格列的配置描述，具体项见下表 | `FieldType[]` | - |
| onChange | 表格数据改变的回调 | `(value: object[]) => void;` | - |
| defaultData | 表格新增单元格默认数据 | `object` | - |
| getActionRef | 获取组件操作函数组的回调 | `(ref: React.MutableRefObject<actionRefType>) => void;` | - |
| deleteBtnText | 删除按钮文案 | `React.ReactNode` | 删除 |
| hideAddBtn | 是否隐藏底部的新增按钮 | `Boolean` | `false` |
| addBtnProps | 新增按钮配置项, 配置同antd的Button | `ButtonProps` | - |
| addBtnText | 新增按钮文案 | `React.ReactNode` | 添加一行 |
| tableProps | 表格的配置项，同antd里的Table组件配置，但是组件拦截了配置项中的：`pagination、rowKey、components、dataSource、columns、onRow` | `TableProps` | - |
| max | 列表最大长度 | `number` | - |
| onRowValuesChange | 行数据变化的回调函数，可用于数据联动； | `onRowValuesChangeType` | - |


## fields

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 表格标题 | `string` | |
| id | 当前列对应字段名 | 表格的dataIndex，formItem的name配置项的默认值 | - |
| formItemProps | FormItem 组件配置项 |  |
| column | 同Table表格的column数据，但拦截了children属性，如需要相关配置请使用fields的children属性 |  |
| children | 子配置项，配置同field选项 |  |
| renderFormInput | 可编辑单元格输入框生成函数, 细节如下 | `renderFormInput` |
| editable | 当前行是否可编辑 |  |


## 待添加功能

* 表单校验
* 单行编辑
