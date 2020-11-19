
## Editable

Demo:

```tsx
import React from 'react';
import { Editable } from 'dumi';
import { Input, Button } from 'antd';

const fields = [
  {
    title: '姓名',
    id: 'name',
    width: '30%',
    editable: true,
  },
  {
    title: '年龄',
    id: 'age',
    children: [
      {
        title: '年龄1',
        id: 'age1',
        editable: true,
      },
      {
        title: '年龄2',
        id: 'age'
      }
    ]
  },
  {
    title: '地址',
    id: 'address',
    editable: true,
    renderFormInput: () => {
      return <Input />
    },
    trigger: 'onBlur',
  }
]

export default () => {
  return <div>
    <Editable
      defaultData={{age: 90}}
      fields={fields}
      multiple={false}
      max={3}
      // optionExtraBefore = {<Button size="small">预览</Button>}
      onChange={val => {
        console.log(val);
      }} />
  </div>;
};
```

More skills for writing demo: https://d.umijs.org/guide/demo-principle
