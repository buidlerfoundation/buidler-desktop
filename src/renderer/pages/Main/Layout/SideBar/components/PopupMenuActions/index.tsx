import React from 'react';
import { clearData } from '../../../../../../common/Cookie';
import ActionItem from './ActionItem';
import './index.scss';
import { useHistory } from 'react-router-dom';

type PopupMenuActionProps = {
  onCreateChannel: () => void;
  onLogout: () => void;
};

const PopupMenuActions = ({
  onCreateChannel,
  onLogout,
}: PopupMenuActionProps) => {
  const history = useHistory();
  return (
    <div className="action-popup__container">
      {/* <ActionItem actionName="Create New Channel" onPress={onCreateChannel} /> */}
      <ActionItem
        actionName="Logout"
        onPress={() => {
          clearData();
          onLogout();
          history.replace('/started');
        }}
      />
      <div className="app-version">
        <span>1.1.71</span>
      </div>
    </div>
  );
};

export default PopupMenuActions;
