import React from 'react';
import TextField from '../../components/TextField';
import './index.scss';

type CreateTeamStateProps = {
  display: boolean;
};

const CreateTeamState = ({ display }: CreateTeamStateProps) => {
  return (
    <div
      className="create-team-state__container"
      style={{ display: display ? 'flex' : 'none' }}
    >
      <TextField placeholder="Team name" />
      <TextField placeholder="Team domain" />
      <div className="create-button create-team-button">
        <span>Create</span>
      </div>
    </div>
  );
};

export default CreateTeamState;
