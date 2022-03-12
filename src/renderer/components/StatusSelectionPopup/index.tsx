import React, { useState } from 'react';
import { ProgressStatus } from '../../common/AppConfig';
import AppInput from '../AppInput';
import './index.scss';

type StatusSelectionPopupProps = {
  onSelectedStatus: (status: any) => void;
};

const StatusSelectionPopup = ({
  onSelectedStatus,
}: StatusSelectionPopupProps) => {
  const [filter, setFilter] = useState('');
  return (
    <div className="status-selection-popup__container">
      <div className="status-selection__header">
        <AppInput
          placeholder="Set status..."
          onChange={(e) => setFilter(e.target.value)}
          className="status-search"
        />
      </div>
      <div style={{ height: 10 }} />
      {ProgressStatus.filter((st) =>
        st.title.toLowerCase().includes(filter.toLowerCase())
      ).map((st) => (
        <div
          className="status-selection__item normal-button"
          key={st.title}
          onClick={() => onSelectedStatus(st)}
        >
          <img alt="" src={st.icon} />
          <span
            style={{ marginLeft: 15 }}
            className={`status__name ${st.type}`}
          >
            {st.title}
          </span>
        </div>
      ))}
      <div style={{ height: 10 }} />
    </div>
  );
};

export default StatusSelectionPopup;
