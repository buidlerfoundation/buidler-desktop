import React from 'react';
import { Picker } from 'emoji-mart';

type EmojiPickerProps = {
  onClick: (emoji: any, event: any) => void;
};

const EmojiPicker = ({ onClick }: EmojiPickerProps) => {
  return <Picker set="apple" theme="dark" onClick={onClick} />;
};

export default EmojiPicker;
