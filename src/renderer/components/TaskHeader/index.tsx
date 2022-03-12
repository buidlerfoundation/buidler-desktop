import React from 'react';
import images from '../../common/images';
import './index.global.scss';

type TaskHeaderProps = {
  title: string;
  count?: number | null;
  toggle: () => void;
  onCreate?: () => void;
};

const TaskHeader = ({
  title,
  count = null,
  toggle,
  onCreate,
}: TaskHeaderProps) => {
  return (
    <div className="task-header-container">
      <div className="task-header-label__wrapper">
        <div
          className={`task-header__label normal-button ${title.toLowerCase()}`}
          onClick={toggle}
        >
          <span>{title}</span>
        </div>
        {!!onCreate && (
          <div className="create-task-button" onClick={onCreate}>
            <img src={images.icPlus} alt="" />
          </div>
        )}
      </div>
      {count !== null && (
        <div className="task-count normal-button" onClick={toggle}>
          <span>{count}</span>
        </div>
      )}
    </div>
  );
};

export default TaskHeader;
