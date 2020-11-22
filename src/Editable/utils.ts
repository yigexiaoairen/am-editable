import React from 'react';
import { isNumber, isString } from 'lodash';

export const getEditableIdByIndex = (index: React.Key): React.Key => {
  if (isNumber(index)) return `editable_${index}`;

  return index;
};

export const getIndexByEditableId = (id: React.Key): React.Key => {
  return isString(id) && id.indexOf('editable_') === 0 ? id.slice(9) : id;
};
