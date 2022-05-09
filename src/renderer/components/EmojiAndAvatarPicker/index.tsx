import React, { useState } from 'react';
import AvatarUpload from '../AvatarUpload';
import EmojiPicker from '../EmojiPicker';
import './index.scss';

type EmojiAndAvatarPickerProps = {
  onAddFiles: (fs) => void;
  onAddEmoji: (emoji) => void;
};

const EmojiAndAvatarPicker = ({
  onAddFiles,
  onAddEmoji,
}: EmojiAndAvatarPickerProps) => {
  const labels = ['Emoji', 'Upload'];
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <div className="emoji-avatar-picker__container">
      <div className="picker-title__wrapper">
        {labels.map((el, index) => (
          <div
            className={`picker-title normal-button ${
              selectedIndex === index ? 'selected' : ''
            }`}
            key={el}
            onClick={() => setSelectedIndex(index)}
          >
            <span>{el}</span>
          </div>
        ))}
      </div>
      {selectedIndex === 0 && (
        <EmojiPicker
          onClick={(emoji) => {
            onAddEmoji(emoji);
          }}
        />
      )}
      {selectedIndex === 1 && <AvatarUpload onAddFiles={onAddFiles} />}
    </div>
  );
};

export default EmojiAndAvatarPicker;
