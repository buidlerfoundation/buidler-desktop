import React, { useCallback, useEffect, useState } from 'react';
import api from 'renderer/api';
import AvatarUpload from '../AvatarUpload';
import EmojiPicker from '../EmojiPicker';
import './index.scss';

type EmojiAndAvatarPickerProps = {
  onAddFiles: (fs) => void;
  onAddEmoji: (emoji) => void;
  onSelectRecentFile: (file) => void;
  spaceId?: string;
  channelId?: string;
};

const EmojiAndAvatarPicker = ({
  onAddFiles,
  onAddEmoji,
  spaceId,
  channelId,
  onSelectRecentFile,
}: EmojiAndAvatarPickerProps) => {
  const [recentFiles, setRecentFiles] = useState([]);
  const labels = ['Emoji', 'Upload'];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const fetchRecentFiles = useCallback(async () => {
    let res = null;
    if (spaceId) {
      res = await api.getSpaceFile(spaceId);
    } else if (channelId) {
      res = await api.getChannelFile(channelId);
    }
    if (res?.statusCode === 200) {
      setRecentFiles(res.data);
    }
  }, [spaceId, channelId]);
  useEffect(() => {
    fetchRecentFiles();
  }, [fetchRecentFiles]);
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
          style={{ border: 'none' }}
        />
      )}
      {selectedIndex === 1 && (
        <AvatarUpload
          recentFiles={recentFiles}
          onAddFiles={onAddFiles}
          onSelectRecentFile={onSelectRecentFile}
        />
      )}
    </div>
  );
};

export default EmojiAndAvatarPicker;
