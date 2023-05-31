import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import api from 'renderer/api';
import useUserAddress from 'renderer/hooks/useUserAddress';
import IconReload from 'renderer/shared/SVG/IconReload';
import IconSecure from 'renderer/shared/SVG/IconSecure';
import './index.scss';
import toast from 'react-hot-toast';
import { Wallet, ethers, providers, utils } from 'ethers';
import useAppSelector from 'renderer/hooks/useAppSelector';
import ModalConfirm from '../ModalConfirm';
import {
  normalizeErrorMessage,
  normalizeSendMessageObject,
} from 'renderer/helpers/DAppHelper';
import IconFullScreen from 'renderer/shared/SVG/IconFullScreen';
import IconClose from 'renderer/shared/SVG/IconClose';
import WalletConnectUtils from 'renderer/services/connectors/WalletConnectUtils';
import actionTypes from 'renderer/actions/ActionTypes';
import { useDispatch } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import UnlockPrivateKey from 'renderer/pages/UnlockPrivateKey';
import { useTonClient } from 'renderer/components/TonClientProvider';

type BrowserViewProps = {
  url: string;
  fullScreen: boolean;
  toggleFullScreen: () => void;
};

const BrowserView = ({
  url,
  fullScreen,
  toggleFullScreen,
}: BrowserViewProps) => {
  const dispatch = useDispatch();
  const [randomId, setRandomId] = useState(1);
  const [gasPrice, setGasPrice] = useState(0);
  const venomPublicKey = useAppSelector(
    (state) => state.configs.venomKey?.publicKey
  );
  const venomAddress = useAppSelector(
    (state) => state.configs.venomKey?.address
  );
  const [openLockPage, setOpenLockPage] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const privateKey = useAppSelector((state) => state.configs.privateKey);
  const supportedChains = useAppSelector((state) => state.user.dAppChains);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [webviewLoaded, setWebviewLoaded] = useState(false);
  const [currentChain, setCurrentChain] = useState<DAppChain | null>(null);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    message?: string;
    data: any;
  } | null>(null);
  const [dappMetadata, setDAppMetadata] = useState<{
    title?: string;
    url?: string;
    imageURL?: string;
    description?: string;
  } | null>(null);
  const tonClient = useTonClient();
  const address = useUserAddress();
  const webviewRef = useRef<any>();
  const timeoutToggleModal = useRef<any>();
  const isBuidlerAirdrop = useMemo(
    () => url === 'https://buidler.link/airdrop_hunter',
    [url]
  );
  const toggleModalConfirm = useCallback(
    () => setOpenModalConfirm((current) => !current),
    []
  );
  const gasPriceHex = useMemo(
    () => ethers.BigNumber.from(`${gasPrice || 0}`).toHexString(),
    [gasPrice]
  );
  const updateGasPrice = useCallback(async () => {
    let provider: providers.InfuraProvider | providers.JsonRpcProvider = null;
    if (currentChain) {
      provider = new providers.JsonRpcProvider(
        currentChain.rpc_url,
        currentChain.chain_id
      );
    } else {
      provider = new providers.InfuraProvider(
        'mainnet',
        process.env.REACT_APP_INFURA_API_KEY
      );
    }
    const res = await provider.getGasPrice();
    setGasPrice(res.toNumber());
  }, [currentChain]);
  useEffect(() => {
    if (openModalConfirm) {
      updateGasPrice();
    }
  }, [openModalConfirm, updateGasPrice]);
  const onReload = useCallback(() => {
    setRandomId(Math.random());
  }, []);
  useEffect(() => {
    if (url) {
      api
        .getURLMetadata(url)
        .then((res) => {
          if (res.success) {
            setDAppMetadata({
              description: res.data?.meta?.description,
              imageURL: res.data?.og?.image,
              title: res.data?.meta?.title,
              url: new URL(url).origin,
            });
          }
        })
        .catch(() => {});
    }
  }, [url]);
  const [urlWithParams, setUrlWithParams] = useState('');
  const initial = useCallback(async () => {
    if (url && randomId) {
      setWebviewLoaded(false);
      let newUrl = url;
      if (url === 'https://buidler.link/airdrop_hunter') {
        newUrl += '?embedded=true';
        const res = await api.requestOTT();
        if (res.data) {
          newUrl += `&ott=${res.data}`;
        }
      }
      setUrlWithParams(newUrl);
      setCurrentChain(null);
    }
  }, [randomId, url]);
  useEffect(() => {
    initial();
  }, [initial]);
  const getChain = useCallback(
    (chainId: number | string) => {
      return supportedChains.find(
        // eslint-disable-next-line eqeqeq
        (el) => el.chain_id == chainId.substring(2) || el.chain_id == chainId
      );
    },
    [supportedChains]
  );
  const handleMessage = useCallback(
    async (json) => {
      const { id, name, object, network } = json || {};
      if (name !== 'getFullContractState') {
        console.log('XXX: ', json);
      }
      if (!id) {
        toast.error('Missing data');
        return;
      }
      switch (name) {
        case 'disconnect': {
          const clearInterval = `window.clearInterval(window.venomNetworkIntervalId)`;
          const callback = `window.${network}.sendResponse(${id})`;
          webviewRef.current.executeJavaScript(clearInterval);
          webviewRef.current.executeJavaScript(callback);
          return;
        }
        case 'findTransaction': {
          const res = await tonClient.findTransaction?.(object);
          const callback = `window.${network}.sendResponse(${id}, ${JSON.stringify(
            res
          )})`;
          webviewRef.current.executeJavaScript(callback);
          return;
        }
        case 'signData': {
          const res = await tonClient.signData?.(object);
          const callback = `window.${network}.sendResponse(${id}, ${JSON.stringify(
            res
          )})`;
          webviewRef.current.executeJavaScript(callback);
          return;
        }
        case 'verifySignature': {
          const res = await tonClient.verifySignature?.(object);
          const callback = `window.${network}.sendResponse(${id}, ${JSON.stringify(
            res
          )})`;
          webviewRef.current.executeJavaScript(callback);
          return;
        }
        case 'subscribe': {
          const res = await tonClient.subscribeTransaction?.(object);
          const callback = `window.${network}.sendResponse(${id}, ${JSON.stringify(
            res
          )})`;
          webviewRef.current.executeJavaScript(callback);
          return;
        }
        case 'getTransaction': {
          const res = await tonClient.getTransaction?.(object.hash);
          const callback = `window.${network}.sendResponse(${id}, ${JSON.stringify(
            res
          )})`;
          webviewRef.current.executeJavaScript(callback);
          return;
        }
        case 'runLocal': {
          const res = await tonClient.runLocal?.(object);
          const callback = `window.${network}.sendResponse(${id}, ${JSON.stringify(
            res
          )})`;
          webviewRef.current.executeJavaScript(callback);
          return;
        }
        case 'sendMessage': {
          const res = await tonClient.sendMessage?.(
            normalizeSendMessageObject(object)
          );
          const callback = `window.${network}.sendResponse(${id}, ${JSON.stringify(
            res
          )})`;
          webviewRef.current.executeJavaScript(callback);
          return;
        }
        case 'getProviderState': {
          if (!venomAddress || !venomPublicKey) return;
          const setAddress = `window.${network}.setAddress('${venomAddress}')`;
          const setPublicKey = `window.${network}.setPublicKey('${venomPublicKey}')`;
          const providerState = {
            networkId: 1000,
            permissions: {
              accountInteraction: {
                publicKey: venomPublicKey,
                address: venomAddress,
              },
            },
          };
          const callback = `window.${network}.sendResponse(${id}, ${JSON.stringify(
            providerState
          )})`;
          webviewRef.current.executeJavaScript(setAddress);
          webviewRef.current.executeJavaScript(setPublicKey);
          webviewRef.current.executeJavaScript(callback);
          return;
        }
        case 'getFullContractState': {
          const res = await tonClient.query(`
          query {
            blockchain {
              account(
                address: "${venomAddress}"
              ) {
                 info {
                  balance
                  boc
                }
              }
            }
          }
          `);
          const fullContractState = {
            state: res.result.data.blockchain.account.info,
          };
          const callback = `window.${network}.sendResponse(${id}, ${JSON.stringify(
            fullContractState
          )}, true)`;
          webviewRef.current.executeJavaScript(callback);
          return;
        }
        case 'requestPermissions': {
          setConfirmData({
            title: 'Connect Wallet',
            data: json,
          });
          break;
        }
        case 'requestAccounts':
          setConfirmData({
            title: 'Connect Wallet',
            data: json,
          });
          break;
        case 'signTransaction':
          // await updateGasPrice();
          // gasInterval.current = setInterval(updateGasPrice, 10000);
          setConfirmData({
            title: 'Sign Transaction',
            message: `from: ${object.from}\nto: ${object.to}\nvalue: ${object.value}`,
            data: json,
          });
          break;
        case 'signPersonalMessage':
          setConfirmData({
            title: 'Sign Ethereum Message',
            message: utils.toUtf8String(object.data),
            data: json,
          });
          break;
        case 'signTypedMessage':
          setConfirmData({
            title: 'Sign Typed Message',
            message: object.raw,
            data: json,
          });
          break;
        case 'switchEthereumChain': {
          const chain = getChain(object.chainId);
          if (!chain) {
            toast.error('Unsupported chain');
            return;
          }
          setCurrentChain(chain);
          setConfirmData({
            title: 'Switch Chain',
            message: `ChainId: ${object.chainId}`,
            data: json,
          });
          break;
        }
        default:
          break;
      }
      if (timeoutToggleModal.current) {
        clearTimeout(timeoutToggleModal.current);
        timeoutToggleModal.current = null;
      } else {
        toggleModalConfirm();
      }
    },
    [getChain, toggleModalConfirm, tonClient, venomAddress, venomPublicKey]
  );
  useEffect(() => {
    const web = webviewRef.current;
    if (urlWithParams && web && randomId) {
      const handleIPCMessage = (data) => {
        const json = JSON.parse(data.channel);
        handleMessage(json);
      };
      const handleInjectJavascript = () => {
        if (
          !webviewRef.current.isDevToolsOpened() &&
          process.env.NODE_ENV !== 'production'
        ) {
          webviewRef.current.openDevTools();
        }
      };
      const handleWebviewLoaded = () => {
        setWebviewLoaded(true);
      };
      const handleNavigateURL = (e) => {
        console.log('will-navigate: ', e.url);
        // const nextUrl = new URL(e.url);
        // console.log('XXX: ', nextUrl);
        // if (!url.includes(nextUrl.origin)) {
        //   window.open(e.url, '_blank');
        // }
        e.preventDefault();
      };
      web.addEventListener('ipc-message', handleIPCMessage);
      web.addEventListener('dom-ready', handleInjectJavascript);
      web.addEventListener('did-finish-load', handleWebviewLoaded);
      web.addEventListener('will-navigate', handleNavigateURL);
      return () => {
        web?.removeEventListener('ipc-message', handleIPCMessage);
        web?.removeEventListener('dom-ready', handleInjectJavascript);
        web?.removeEventListener('did-finish-load', handleWebviewLoaded);
        web?.removeEventListener('will-navigate', handleNavigateURL);
      };
    }
    return () => {};
  }, [
    address,
    handleMessage,
    randomId,
    urlWithParams,
    venomAddress,
    venomPublicKey,
  ]);
  const onCancel = useCallback(() => {
    const { network, id } = confirmData?.data;
    const callback = `window.${network}.sendError(${id}, "User cancel action")`;
    webviewRef.current.executeJavaScript(callback);
    toggleModalConfirm();
  }, [confirmData?.data, toggleModalConfirm]);
  const onConfirm = useCallback(async () => {
    const { network, id, object } = confirmData?.data;
    switch (confirmData?.data.name) {
      case 'requestPermissions': {
        const setAddress = `window.${network}.setAddress("${venomAddress}")`;
        const setPublicKey = `window.${network}.setPublicKey("${venomPublicKey}")`;
        const permissions = {
          accountInteraction: {
            address: venomAddress,
          },
        };
        const callbackRequestAccount = `window.${network}.sendResponse(${id}, ${JSON.stringify(
          permissions
        )})`;
        webviewRef.current.executeJavaScript(setAddress);
        webviewRef.current.executeJavaScript(setPublicKey);
        webviewRef.current.executeJavaScript(callbackRequestAccount);
        break;
      }
      case 'requestAccounts': {
        const setAddress = `window.${network}.setAddress("${address}")`;
        const callbackRequestAccount = `window.${network}.sendResponse(${id}, ["${address}"])`;
        webviewRef.current.executeJavaScript(setAddress);
        webviewRef.current.executeJavaScript(callbackRequestAccount);
        break;
      }
      case 'switchEthereumChain': {
        const chain = getChain(object.chainId);
        const config = {
          ethereum: {
            address,
            chainId: chain.chain_id,
            rpcUrl: chain.rpc_url,
          },
        };
        const configStr = JSON.stringify(config);
        const setConfig = `window.${network}.setConfig(${configStr})`;
        const emitChange = `window.${network}.emitChainChanged('0x${chain.chain_id.toString(
          16
        )}')`;
        const callback = `window.${network}.sendResponse(${id})`;
        webviewRef.current.executeJavaScript(setConfig);
        webviewRef.current.executeJavaScript(emitChange);
        webviewRef.current.executeJavaScript(callback);
        break;
      }
      case 'signTransaction': {
        setActionLoading(true);
        const transactionParameters: any = {
          gasLimit: object.gas,
          to: object.to,
          from: object.from,
          value: object.value,
          data: object.data,
          gasPrice: object.gasPrice || gasPriceHex,
        };
        if (WalletConnectUtils.connector?.connected) {
          dispatch({
            type: actionTypes.TOGGLE_MODAL_CONFIRM_SIGN_MESSAGE,
            payload: true,
          });
          try {
            transactionParameters.gas = object.gas;
            const res = await WalletConnectUtils.connector.sendTransaction(
              transactionParameters
            );
            const callback = `window.${network}.sendResponse(${id}, "${res}")`;
            webviewRef.current.executeJavaScript(callback);
          } catch (e) {
            const callback = `window.${network}.sendError(${id}, "Network error")`;
            webviewRef.current.executeJavaScript(callback);
            toast.error(normalizeErrorMessage(e.message));
          }
          dispatch({
            type: actionTypes.TOGGLE_MODAL_CONFIRM_SIGN_MESSAGE,
            payload: false,
          });
        } else if (privateKey) {
          let provider: providers.InfuraProvider | providers.JsonRpcProvider =
            null;
          if (currentChain) {
            provider = new providers.JsonRpcProvider(
              currentChain.rpc_url,
              currentChain.chain_id
            );
          } else {
            provider = new providers.InfuraProvider(
              'mainnet',
              process.env.REACT_APP_INFURA_API_KEY
            );
          }
          const signer = new Wallet(privateKey, provider);
          try {
            const res = await signer.sendTransaction(transactionParameters);
            const callback = `window.${network}.sendResponse(${id}, "${res.hash}")`;
            webviewRef.current.executeJavaScript(callback);
          } catch (e) {
            const callback = `window.${network}.sendError(${id}, "Network error")`;
            webviewRef.current.executeJavaScript(callback);
            toast.error(normalizeErrorMessage(e.message));
          }
        }
        setActionLoading(false);
        break;
      }
      case 'signPersonalMessage': {
        const message = utils.toUtf8String(object.data);
        if (WalletConnectUtils.connector?.connected) {
          dispatch({
            type: actionTypes.TOGGLE_MODAL_CONFIRM_SIGN_MESSAGE,
            payload: true,
          });
          const params = [
            utils.hexlify(ethers.utils.toUtf8Bytes(message)),
            address,
          ];
          const signature =
            await WalletConnectUtils.connector.signPersonalMessage(params);
          const callback = `window.${network}.sendResponse(${id}, "${signature}")`;
          webviewRef.current.executeJavaScript(callback);
          dispatch({
            type: actionTypes.TOGGLE_MODAL_CONFIRM_SIGN_MESSAGE,
            payload: false,
          });
        } else if (privateKey) {
          const msgHash = utils.hashMessage(message);
          const msgHashBytes = utils.arrayify(msgHash);
          const signingKey = new utils.SigningKey(privateKey);
          const signature = signingKey.signDigest(msgHashBytes);
          const callback = `window.${network}.sendResponse(${id}, "${signature.compact}")`;
          webviewRef.current.executeJavaScript(callback);
        }
        break;
      }
      case 'signTypedMessage': {
        try {
          const raw = JSON.parse(object.raw);
          if (WalletConnectUtils.connector?.connected) {
            dispatch({
              type: actionTypes.TOGGLE_MODAL_CONFIRM_SIGN_MESSAGE,
              payload: true,
            });
            const params = [object.address, raw];
            const signature = await WalletConnectUtils.connector.signTypedData(
              params
            );
            const callback = `window.${network}.sendResponse(${id}, "${signature}")`;
            webviewRef.current.executeJavaScript(callback);
            dispatch({
              type: actionTypes.TOGGLE_MODAL_CONFIRM_SIGN_MESSAGE,
              payload: false,
            });
          } else if (privateKey) {
            const signer = new Wallet(privateKey);
            delete raw.types.EIP712Domain;
            const signature = await signer._signTypedData(
              raw.domain,
              raw.types,
              raw.message
            );
            const callback = `window.${network}.sendResponse(${id}, "${signature}")`;
            webviewRef.current.executeJavaScript(callback);
          }
        } catch (error) {
          toast.error(error);
        }
        break;
      }
      default:
        break;
    }
    timeoutToggleModal.current = setTimeout(() => {
      toggleModalConfirm();
      timeoutToggleModal.current = null;
    }, 250);
  }, [
    address,
    confirmData?.data,
    currentChain,
    dispatch,
    gasPriceHex,
    getChain,
    privateKey,
    toggleModalConfirm,
    venomAddress,
    venomPublicKey,
  ]);
  const onCloseLockPage = useCallback(() => setOpenLockPage(false), []);
  const onUnlock = useCallback(
    async (key: string) => {
      const { name } = confirmData?.data || {};
      // Handle action need venom secret key
      switch (name) {
        default:
          break;
      }
      onCloseLockPage();
    },
    [confirmData?.data, onCloseLockPage]
  );
  return (
    <div
      className={`browser-view__container ${
        fullScreen ? 'browser-full-screen' : ''
      }`}
    >
      {fullScreen && (
        <div className="browser-back-drop" onClick={toggleFullScreen} />
      )}
      <div className="browser-header-bar">
        <div className="btn-full-screen" onClick={toggleFullScreen}>
          {!fullScreen ? <IconFullScreen /> : <IconClose />}
        </div>
        <IconSecure />
        <span className="browser-url text-ellipsis">{url}</span>
        <div className="btn-reload" onClick={onReload}>
          <IconReload />
        </div>
      </div>
      {!!urlWithParams && (
        <div
          className={`iframe__wrapper ${
            isBuidlerAirdrop && fullScreen
              ? 'iframe-buidler-airdrop__wrapper'
              : ''
          }`}
        >
          <webview
            key={randomId}
            ref={webviewRef}
            src={urlWithParams}
            preload={`file://${window.electron.webviewPreloadPath}`}
            nodeintegration="true"
            className="webview-full"
            style={{ opacity: webviewLoaded ? 1 : 0 }}
            useragent="VenomWalletBrowser Buidler"
          />
          {!webviewLoaded && (
            <div className="loading">
              <CircularProgress size={30} color="inherit" />
            </div>
          )}
        </div>
      )}
      <ModalConfirm
        confirmData={confirmData}
        open={openModalConfirm}
        handleClose={toggleModalConfirm}
        onCancel={onCancel}
        onConfirm={onConfirm}
        gasPrice={gasPrice}
        actionLoading={actionLoading}
        dappMetadata={dappMetadata}
      />
      {openLockPage && (
        <div className="unlock-view">
          <UnlockPrivateKey
            embedded
            onUnlock={onUnlock}
            onClose={onCloseLockPage}
          />
        </div>
      )}
    </div>
  );
};

export default memo(BrowserView);
