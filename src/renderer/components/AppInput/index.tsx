/* eslint-disable react/prop-types */
import React, { useCallback } from 'react';
import GlobalVariable from '../../services/GlobalVariable';

const AppInput = ({
  onFocus,
  onBlur,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const handleOnFocus = useCallback(
    (evt) => {
      GlobalVariable.isInputFocus = true;
      onFocus?.(evt);
    },
    [onFocus]
  );
  const handleOnBlur = useCallback(
    (evt) => {
      GlobalVariable.isInputFocus = false;

      onBlur?.(evt);
    },
    [onBlur]
  );
  return <input {...props} onFocus={handleOnFocus} onBlur={handleOnBlur} />;
};

export default AppInput;
