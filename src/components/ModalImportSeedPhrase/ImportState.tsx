import React from 'react';
import AppInput from '../AppInput';
import AppTextArea from '../AppTextArea';
import './index.global.scss';

type ImportStateProps = {
  seed: string;
  setSeed: (seed: string) => void;
};

const ImportState = ({ seed, setSeed }: ImportStateProps) => {
  return (
    <div className="modal-state__container">
      <span className="title">Add seed phrase</span>
      <AppTextArea
        className="app-input-highlight"
        placeholder="Your seed phrase"
        value={seed}
        style={{ height: 110, marginTop: 56 }}
        onChange={(e) => setSeed(e.target.value)}
      />
      <div style={{ height: 36 }} />
    </div>
  );
};

export default ImportState;
