import React from 'react';

export interface FieldWrapProps<V = any> {
  value?: V;
  onChange?: (val: V) => void;
  renderFormInput: (val: V, onChange: (val: V) => void) => React.ReactElement;
}
// 在使用FielWrap 的renderFormInput参数时，请确保传入value和onChange参数
const FieldWrap = React.forwardRef<any, FieldWrapProps>((props, ref) => {
  const {
    children,
    value,
    onChange,
    renderFormInput,
    ...propsRest
  } = props;
  let ele: React.ReactNode = typeof renderFormInput === 'function' ? renderFormInput(value, onChange!) : children;

  if (React.isValidElement<any>(ele)) {
    ele = React.cloneElement(ele, {
      value,
      onChange,
      ref,
      ...propsRest,
      ...ele.props,
    })
  } else {
    ele = <span ref={ref}>{ele}</span>;
  }

  return ele as React.ReactElement;
})

export default FieldWrap;
