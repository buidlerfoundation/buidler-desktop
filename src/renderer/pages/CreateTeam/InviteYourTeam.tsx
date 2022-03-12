import React from 'react';
import TextField from '../../components/TextField';
import './index.global.scss';

const InviteYourTeam = () => {
  return (
    <div className="invite-your-team__container">
      <span className="create-team-title">Invite your team</span>
      <div style={{ height: 50 }} />
      <TextField placeholder="Add member email" />
      <TextField
        placeholder="https://invite.remotetoday.app/skylab"
        rightButton={{ text: 'Copy', onPress: () => {}, disabled: true }}
      />
      <div className="create-button invite-team-button">
        <span>Done</span>
      </div>
    </div>
  );
};

export default InviteYourTeam;
