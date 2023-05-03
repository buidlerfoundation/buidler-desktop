import './index.scss';
import { Modal } from '@material-ui/core';
import React, { memo, useCallback, useMemo } from 'react';
import ImageHelper from 'renderer/common/ImageHelper';
import { normalizeUserName } from 'renderer/helpers/MessageHelper';
import { formatTokenFormHex } from 'renderer/helpers/TokenHelper';
import useUserAddress from 'renderer/hooks/useUserAddress';
import useUserData from 'renderer/hooks/useUserData';
import { DAppChain } from 'renderer/models';
import AvatarView from 'renderer/shared/AvatarView';
import NormalButton from 'renderer/shared/NormalButton';

type ModalConfirmProps = {
  open: boolean;
  handleClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  confirmData: any;
  currentChain: DAppChain | null;
  gasPrice: number;
  actionLoading: boolean;
};

const ModalConfirm = ({
  open,
  handleClose,
  onCancel,
  onConfirm,
  confirmData,
  currentChain,
  gasPrice,
  actionLoading,
}: ModalConfirmProps) => {
  const user = useUserData();
  const address = useUserAddress();
  const nwFee = useMemo(() => {
    const price = confirmData?.data?.object?.gasPrice
      ? parseInt(confirmData?.data?.object?.gasPrice)
      : gasPrice;
    return parseInt(confirmData?.data?.object?.gas || 0) * price;
  }, [
    confirmData?.data?.object?.gas,
    confirmData?.data?.object?.gasPrice,
    gasPrice,
  ]);
  const total = useMemo(() => {
    return nwFee + parseInt(confirmData?.data?.object?.value || 0);
  }, [confirmData?.data?.object?.value, nwFee]);
  const renderHead = useCallback(() => {
    if (confirmData?.data?.name === 'signTransaction') {
      return null;
    }
    return (
      <div className="wallet-account__container">
        <img
          alt=""
          src="https://assets.coingecko.com/coins/images/279/large/ethereum.png"
          className="logo-eth"
        />
        <div className="wallet-account__info">
          <span className="wallet-account-name">{user.user_name}</span>
          <span className="wallet-account-address">{address}</span>
        </div>
      </div>
    );
  }, [address, confirmData?.data?.name, user.user_name]);
  const renderBody = useCallback(() => {
    if (confirmData?.data?.name === 'signTransaction') {
      return (
        <>
          <span className="confirm-label" style={{ marginTop: 30 }}>
            Value
          </span>
          <div className="confirm-value__wrap">
            <img
              alt=""
              src={
                currentChain?.logo ||
                'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
              }
              className="logo-eth"
            />
            <span className="confirm-value">
              {formatTokenFormHex({
                value: confirmData?.data?.object?.value,
                decimal: currentChain?.decimal || 18,
                symbol: currentChain?.symbol || 'ETH',
              })}
            </span>
          </div>
          <span className="confirm-label" style={{ marginTop: 20 }}>
            From
          </span>
          <div className="confirm-row-data">
            <AvatarView user={user} size={25} />
            <span className="confirm-main-text" style={{ marginLeft: 10 }}>
              {user.user_name}
            </span>
            <span className="confirm-sub-text">
              ({normalizeUserName(confirmData?.data?.object?.from || address)})
            </span>
          </div>
          <span className="confirm-label" style={{ marginTop: 20 }}>
            To
          </span>
          <div className="confirm-row-data">
            <img
              alt=""
              src={ImageHelper.normalizeEthImage(
                confirmData?.data?.object?.to || ''
              )}
              style={{ width: 25, height: 25, borderRadius: '50%' }}
            />
            <span className="confirm-main-text" style={{ marginLeft: 10 }}>
              {normalizeUserName(confirmData?.data?.object?.to || '', 8)}
            </span>
          </div>
          <span className="confirm-label" style={{ marginTop: 20 }}>
            Network fee
          </span>
          <div className="confirm-row-data">
            <span className="confirm-main-text">
              {formatTokenFormHex({
                value: nwFee,
                decimal: currentChain?.decimal || 18,
                symbol: currentChain?.symbol || 'ETH',
              })}
            </span>
          </div>
          <span className="confirm-label" style={{ marginTop: 20 }}>
            Total
          </span>
          <div className="confirm-row-data">
            <span className="confirm-main-text">
              {formatTokenFormHex({
                value: total,
                decimal: currentChain?.decimal || 18,
                symbol: currentChain?.symbol || 'ETH',
              })}
            </span>
          </div>
        </>
      );
    }
    if (confirmData?.message) {
      return (
        <>
          <span className="confirm-label">Message</span>
          <div className="confirm-message__wrap">
            <span className="confirm-message">{confirmData?.message}</span>
          </div>
        </>
      );
    }
    return null;
  }, [
    address,
    confirmData?.data?.name,
    confirmData?.data?.object?.from,
    confirmData?.data?.object?.to,
    confirmData?.data?.object?.value,
    confirmData?.message,
    currentChain?.decimal,
    currentChain?.logo,
    currentChain?.symbol,
    nwFee,
    total,
    user,
  ]);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="normal-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div style={{ display: 'table' }}>
        <div className="dapp-confirm__container">
          <span className="dapp-confirm__title">{confirmData?.title}</span>
          {renderHead()}
          {renderBody()}
          <div className="dapp-confirm__bottom">
            <NormalButton title="Cancel" onPress={onCancel} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton
              title="Confirm"
              onPress={onConfirm}
              type="main"
              loading={actionLoading}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default memo(ModalConfirm);
