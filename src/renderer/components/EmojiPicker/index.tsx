import React from 'react';
import { Picker } from 'emoji-mart';

type EmojiPickerProps = {
  onClick: (emoji: any, event: any) => void;
};

const EmojiPicker = ({ onClick }: EmojiPickerProps) => {
  return (
    <Picker
      set="apple"
      theme="dark"
      onClick={onClick}
      emojiTooltip={false}
      showPreview={false}
      showSkinTones={false}
      style={{ border: 'none' }}
    />
  );
};

export default EmojiPicker;
