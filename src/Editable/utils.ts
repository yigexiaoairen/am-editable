import React from 'react';
import { isNumber } from 'lodash';

export const getEditableIdByIndex = (index: React.Key): React.Key => {
  if (isNumber(index)) return `editable_${index}`;

  return index;
}