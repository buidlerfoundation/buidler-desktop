import { Modal } from '@material-ui/core';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import api from 'renderer/api';
import images from 'renderer/common/images';
import { CreateSpaceData, UserNFTCollection } from 'renderer/models';
import SpaceConfig from '../ModalCreateSpace/SpaceConfig';
import SpaceInformation from '../ModalCreateSpace/SpaceInformation';
import NormalButton from '../NormalButton';
import './index.scss';

type ModalSpaceSettingProps = {
  open: boolean;
  handleClose: () => void;
  onDeleteClick: () => void;
};

const ModalSpaceSetting = ({
  open,
  handleClose,
  onDeleteClick,
}: ModalSpaceSettingProps) => {
  const [loading, setLoading] = useState(false);
  const [spaceData, setSpaceData] = useState<CreateSpaceData>({
    name: '',
    description: '',
    attachment: null,
    emoji: null,
    spaceType: 'Exclusive',
    condition: null,
  });
  const [nftCollections, setNFTCollections] = useState<
    Array<UserNFTCollection>
  >([]);
  const [currentPageId, setCurrentPageId] = useState('space_display');
  const fetchNFTCollections = useCallback(async () => {
    const res = await api.getNFTCollection();
    setNFTCollections(res?.data || []);
  }, []);
  const settings = useRef([
    {
      id: '1',
      groupLabel: 'Space',
      items: [
        {
          label: 'Space display',
          icon: images.icSettingSpaceDisplay,
          id: 'space_display',
        },
        {
          label: 'Space access',
          icon: images.icSettingSpaceAccess,
          id: 'space_access',
        },
      ],
    },
  ]);
  const handleDeleteClick = useCallback(() => {
    onDeleteClick();
  }, [onDeleteClick]);
  useEffect(() => {
    if (open) {
      setSpaceData({
        name: '',
        description: '',
        attachment: null,
        emoji: null,
        spaceType: 'Exclusive',
        condition: null,
      });
      fetchNFTCollections();
      setCurrentPageId('space_display');
    }
  }, [open, fetchNFTCollections]);
  const onSave = useCallback(async () => {}, []);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="setting-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div className="setting-modal__container">
        <div className="left-side">
          {settings.current.map((group) => {
            return (
              <div key={group.id}>
                <div className="group-setting-title" style={{ marginTop: 10 }}>
                  <span>{group.groupLabel}</span>
                </div>
                {group.items.map((el) => {
                  const isActive = currentPageId === el.id;
                  return (
                    <div
                      className={`setting-item ${isActive && 'active'}`}
                      key={el.label}
                      onClick={() => setCurrentPageId(el.id)}
                    >
                      <img alt="" src={el.icon} />
                      <span className="setting-label">{el.label}</span>
                      {el.badge && <div className="badge-backup mr10" />}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div className="delete-space__wrapper" onClick={handleDeleteClick}>
            <img alt="" src={images.icSettingChannelDelete} />
            <span className="delete-space-text">Delete space</span>
          </div>
        </div>
        <div className="body">
          <span className="modal-label">{currentPageId.replace('_', ' ')}</span>
          {currentPageId === 'space_display' && (
            <SpaceInformation
              spaceData={spaceData}
              setSpaceData={setSpaceData}
            />
          )}
          {currentPageId === 'space_access' && (
            <SpaceConfig
              spaceData={spaceData}
              setSpaceData={setSpaceData}
              nftCollections={nftCollections}
            />
          )}
          <div className="bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton
              title="Save"
              onPress={onSave}
              type="main"
              loading={loading}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalSpaceSetting;
