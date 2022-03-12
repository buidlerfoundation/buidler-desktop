import React from 'react';
import './index.global.scss';

type ActionItemProps = {
  actionName: string;
  onPress: () => void;
};

const ActionItem = ({ actionName, onPress }: ActionItemProps) => {
  return (
    <div className="action__item normal-button" onClick={onPress}>
      <span className="action-name">{actionName}</span>
    </div>
  );
};

export default ActionItem;
