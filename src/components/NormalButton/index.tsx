import React from 'react';
import './index.global.scss';

type ButtonType = 'success' | 'primary' | 'normal' | 'main' | 'danger';

type NormalButtonProps = {
  title: string;
  type: ButtonType;
  onPress: () => void;
};

const NormalButton = ({ title, type, onPress }: NormalButtonProps) => {
  return (
    <div
      className={`normal-button__container button-${type}`}
      onClick={onPress}
    >
      <span>{title}</span>
    </div>
  );
};

export default NormalButton;
