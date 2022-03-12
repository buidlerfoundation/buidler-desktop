import React from 'react';
import TextField from '../../components/TextField';

type JoinTeamStateProps = {
  display: boolean;
};

const JoinTeamState = ({ display }: JoinTeamStateProps) => {
  return (
    <div
      className="join-team-state__container"
      style={{ display: display ? 'flex' : 'none' }}
    >
      <TextField
        placeholder="Invite URL"
        rightButton={{
          text: 'Paste',
          onPress: () => {},
        }}
      />
      <div className="create-button join-team-button">
        <span>Join</span>
      </div>
    </div>
  );
};

export default JoinTeamState;
