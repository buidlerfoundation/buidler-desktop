import React, { useCallback, useMemo, useState } from 'react';
import { SpaceBadge } from 'renderer/common/AppConfig';
import images from 'renderer/common/images';
import AppInput from 'renderer/components/AppInput';
import { CreateSpaceData, UserNFTCollection } from 'renderer/models';
import '../index.scss';
import AmountInput from './AmountInput';
import SpaceBadgeItem from './SpaceBadgeItem';
import SpaceTypeItem from './SpaceTypeItem';
import TokenItem from './TokenItem';

type SpaceConfigProps = {
  setSpaceData: React.Dispatch<React.SetStateAction<CreateSpaceData>>;
  spaceData: CreateSpaceData;
  nftCollections: Array<UserNFTCollection>;
};

const spaceTypes = ['Public', 'Exclusive'];

const SpaceConfig = ({
  spaceData,
  setSpaceData,
  nftCollections,
}: SpaceConfigProps) => {
  const [searchAddress, setSearchAddress] = useState('');
  const selectedNFT = useMemo(() => {
    const address = spaceData.condition?.address;
    return nftCollections.find((el) => el.contract_address === address);
  }, [nftCollections, spaceData.condition]);
  const handleUpdateSpaceType = useCallback(
    (item) => {
      setSpaceData((current) => ({ ...current, spaceType: item }));
    },
    [setSpaceData]
  );
  const handleUpdateBadge = useCallback(
    (badge) =>
      setSpaceData((current) => ({ ...current, spaceBadgeId: badge.id })),
    [setSpaceData]
  );
  const onChangeSearchAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchAddress(e.target.value);
    },
    []
  );
  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setSearchAddress(text);
  }, []);
  const handleClearCondition = useCallback(() => {
    setSearchAddress('');
    setSpaceData((current) => ({ ...current, condition: null }));
  }, [setSpaceData]);
  const handleAmountChange = useCallback(
    (item) => {
      setSpaceData((current) => ({
        ...current,
        condition: { ...current.condition, amount: item, amountInput: '' },
      }));
    },
    [setSpaceData]
  );
  const handleAmountInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSpaceData((current) => ({
        ...current,
        condition: {
          ...current.condition,
          amount: 0,
          amountInput: e.target.value,
        },
      }));
    },
    [setSpaceData]
  );
  const handleSelectToken = useCallback(
    (address: string) => {
      const selected = nftCollections.find(
        (el) => el.contract_address === address
      );
      setSpaceData((current) => ({
        ...current,
        condition: {
          address: selected?.contract_address,
          amount: 0,
          amountInput: '',
          network: selected?.network,
        },
      }));
    },
    [nftCollections, setSpaceData]
  );
  const renderSpaceType = useCallback(
    (el) => (
      <SpaceTypeItem
        key={el}
        item={el}
        isActive={el === spaceData.spaceType}
        onClick={handleUpdateSpaceType}
      />
    ),
    [handleUpdateSpaceType, spaceData.spaceType]
  );
  const renderBadge = useCallback(
    (el) => {
      const isActive = spaceData.spaceBadgeId === el.id;
      return (
        <SpaceBadgeItem
          isActive={isActive}
          onClick={handleUpdateBadge}
          item={el}
          key={el.id}
        />
      );
    },
    [handleUpdateBadge, spaceData.spaceBadgeId]
  );
  const renderToken = useCallback(
    (token: UserNFTCollection) => (
      <TokenItem
        key={token.contract_address}
        imageUrl={token.image_url}
        name={token.name}
        address={token.contract_address}
        onClick={handleSelectToken}
      />
    ),
    [handleSelectToken]
  );
  return (
    <div className="space-config__container">
      <div className="space-type__wrap">{spaceTypes.map(renderSpaceType)}</div>
      <div className="space-type-description">
        <span>
          {spaceData.spaceType === 'Public'
            ? 'Full access to all users.'
            : 'Only members who meet the condition can have access to the space.'}
        </span>
      </div>
      {spaceData.spaceType === 'Exclusive' && (
        <>
          <div className="space-badge-color__wrap">
            <span className="space-config-label">Badge color</span>
            {SpaceBadge.map(renderBadge)}
          </div>
          <div className="space-condition__wrap">
            <span className="space-config-label">Condition</span>
            <div className="input-contract__wrap">
              <AppInput
                className="app-input-highlight input-contract"
                placeholder="contract address"
                value={selectedNFT ? selectedNFT.name : searchAddress}
                onChange={onChangeSearchAddress}
                disabled={!!selectedNFT}
              />
              <div className="logo-contract__wrap">
                {selectedNFT ? (
                  <img
                    alt=""
                    src={selectedNFT.image_url || images.icImageDefault}
                    className="logo-contract"
                  />
                ) : (
                  <div className="logo-contract" />
                )}
              </div>
              {!searchAddress && !selectedNFT && (
                <div className="button-paste" onClick={handlePaste}>
                  <span>Paste</span>
                </div>
              )}
              {(!!searchAddress || selectedNFT) && (
                <div className="button-clear" onClick={handleClearCondition}>
                  <img alt="" src={images.icClearText} />
                </div>
              )}
            </div>
            {selectedNFT && (
              <div className="amount-input__container">
                <span className="input-label">NFTs amount</span>
                <AmountInput
                  amount={spaceData.condition?.amount}
                  amountInput={spaceData.condition?.amountInput}
                  onChangeAmount={handleAmountChange}
                  onInputChange={handleAmountInputChange}
                />
              </div>
            )}
            <span className="space-condition-description">
              Or choose from your asset
            </span>
            <div className="token-list">{nftCollections.map(renderToken)}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpaceConfig;