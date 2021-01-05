---
order: 3
title: 示例
nav:
  title: 使用示例
---

## 单行编辑

```tsx
import React, { useState, useReducer } from 'react';
import { Editable } from 'am-editable';
import { Input, Button, InputNumber, Space } from 'antd';

const fields = [
  {
    title: '姓名',
    id: 'name',
    width: '30%',
    editable: true,
    formItemProps: {
      rules: [{ required: true, message: '请输入姓名' }],
    },
  },
  {
    title: '简介',
    id: 'info',
    children: [
      {
        title: '年龄',
        id: 'age',
        editable: true,
        renderFormInput: () => {
          return <InputNumber />;
        },
      },
      {
        title: '身高',
        id: 'height',
        editable: true,
      },
    ],
  },
  {
    title: '地址',
    id: 'address',
    editable: true,
    renderFormInput: () => {
      return <Input />;
    },
    trigger: 'onBlur',
  },
];

export default () => {
  const [canSort, setCanSort] = useState(true);
  const [hideAddBtn, toogleHideAddBtn] = useReducer(state => {
    return !state;
  }, false);
  return (
    <Space direction="vertical" style={{ display: 'flex' }}>
      <Space>
        <Button onClick={() => setCanSort(!canSort)}>
          {canSort ? '关闭排序' : '开启排序'}
        </Button>
        <Button onClick={toogleHideAddBtn}>
          {hideAddBtn ? '显示新增按钮' : '隐藏新增按钮'}
        </Button>
      </Space>
      <Editable
        sortMode={canSort && 'popover'}
        defaultData={{ age: 90 }}
        fields={fields}
        multiple={false}
        hideAddBtn={hideAddBtn}
        max={10}
        defaultValue={[{ name: '小明', age: 18, height: 175, address: '杭州' }]}
        onChange={val => {
          console.log(val);
        }}
      />
    </Space>
  );
};
```

## 全表可编辑编辑

```tsx
import React, { useRef } from 'react';
import { Editable } from 'am-editable';
import { Input, Button, InputNumber } from 'antd';

const fields = [
  {
    title: '姓名',
    id: 'name',
    width: '30%',
    editable: true,
    formItemProps: {
      rules: [{ required: true, message: '请输入姓名' }],
    },
  },
  {
    title: '简介',
    id: 'info',
    children: [
      {
        title: '年龄',
        id: 'age',
        editable: true,
        renderFormInput: () => {
          return <InputNumber />;
        },
      },
      {
        title: '身高',
        id: 'height',
      },
    ],
  },
  {
    title: '地址',
    id: 'address',
    editable: true,
    renderFormInput: () => {
      return <Input />;
    },
    trigger: 'onBlur',
  },
];

export default () => {
  const actionRef = useRef();
  return (
    <div>
      <Button
        onClick={() => {
          actionRef.current.handleValidate().catch(console.log);
        }}
      >
        验证
      </Button>
      <Editable
        defaultData={{ age: 90 }}
        getActionRef={ref => (actionRef.current = ref.current)}
        fields={fields}
        onChange={val => {
          console.log(val);
        }}
      />
    </div>
  );
};
```

## 选项联动

```tsx
import React from 'react';
import { Editable } from 'am-editable';
import { Input, Button, InputNumber } from 'antd';

const fields = [
  {
    title: '姓名',
    width: '30%',
    id: 'name',
    editable: true,
    children: [
      {
        title: '姓氏',
        id: 'firstName',
        editable: true,
        renderFormInput: (record, { value, onChange }, form) => {
          return (
            <Input
              value={value}
              maxLength={3}
              onChange={val => {
                if (onChange) onChange(val);
                form.setFieldsValue({
                  allName: `${val?.target?.value}-${record?.lastName || ''}`,
                });
              }}
            />
          );
        },
      },
      {
        title: '名字',
        id: 'lastName',
        editable: true,
        renderFormInput: (record, { value, onChange }, form) => {
          return (
            <Input
              value={value}
              onChange={val => {
                if (onChange) onChange(val);
                form.setFieldsValue({
                  allName: `${record?.firstName || ''}-${val?.target?.value}`,
                });
              }}
            />
          );
        },
      },
      {
        title: '全名',
        id: 'allName',
        column: {
          render: text => {
            return <div style={{ width: 120 }}>{text}</div>;
          },
        },
      },
    ],
  },
  {
    title: '地址',
    id: 'address',
    editable: true,
    renderFormInput: () => {
      return <Input />;
    },
    trigger: 'onBlur',
  },
];

export default () => {
  return (
    <div>
      <Editable
        defaultData={{ age: 90 }}
        fields={fields}
        onChange={val => {
          console.log(val);
        }}
      />
    </div>
  );
};
```

## 编辑选项添加按钮

```tsx
import React from 'react';
import { Editable } from 'am-editable';
import { Input, Button, InputNumber, message } from 'antd';

const fields = [
  {
    title: '姓名',
    id: 'name',
    width: '30%',
    editable: true,
  },
  {
    title: '简介',
    id: 'info',
    children: [
      {
        title: '年龄',
        id: 'age',
        editable: true,
        renderFormInput: () => {
          return <InputNumber />;
        },
      },
      {
        title: '身高',
        id: 'height',
        editable: true,
      },
    ],
  },
  {
    title: '地址',
    id: 'address',
    editable: true,
  },
];

export default () => {
  return (
    <div>
      <Editable
        defaultData={{ age: 90 }}
        fields={fields}
        multiple={false}
        max={3}
        optionExtraBefore={
          <Button
            size="small"
            onClick={() => {
              message.info('点击了预览');
            }}
          >
            预览
          </Button>
        }
        optionExtraAfter={
          <Button
            type="primary"
            size="small"
            onClick={() => {
              message.info('点击了修改');
            }}
          >
            修改
          </Button>
        }
        onChange={val => {
          console.log(val);
        }}
      />
    </div>
  );
};
```
