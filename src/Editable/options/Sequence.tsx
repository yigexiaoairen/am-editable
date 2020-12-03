import React, { useContext, useEffect, useState } from 'react';

import { Button, Popover, Space, InputNumber } from 'antd';

import { OptionComponentProps } from './index';
import { EditableContext } from '../context';

interface SequenceProps extends OptionComponentProps {
  rowIndex: number;
}

const Sequence: React.FC<SequenceProps> = props => {
  const { rowIndex, id } = props;

  const { state, move, isSetting, multiple } = useContext(EditableContext);
  const [visible, toogleVisible] = useState(false);
  const [count, setCount] = useState<number>();

  useEffect(() => {
    if (isSetting && visible) {
      toogleVisible(false);
    }
  }, [isSetting]);
  useEffect(() => {
    if (!visible) {
      setCount(undefined);
    }
  }, [visible]);

  return (
    <Popover
      visible={visible}
      trigger="click"
      content={
        <Space size="large" direction="vertical">
          <div>
            移动至：
            <InputNumber
              value={count}
              onChange={val => setCount(val as number)}
              min={1}
              max={state.length}
            />
          </div>
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={() => toogleVisible(false)}>
              取消
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                if (typeof count === 'number') move(id, count - 1);
                toogleVisible(false);
              }}
            >
              确认
            </Button>
          </Space>
        </Space>
      }
    >
      <Button
        type="text"
        size="small"
        onClick={() => toogleVisible(true)}
        disabled={!multiple && isSetting}
        style={{ width: 60 }}
      >
        {rowIndex + 1}
      </Button>
    </Popover>
  );
};

export default Sequence;
