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
import { normalizeErrorMessage } from 'renderer/helpers/DAppHelper';
import IconFullScreen from 'renderer/shared/SVG/IconFullScreen';
import IconClose from 'renderer/shared/SVG/IconClose';
import WalletConnectUtils from 'renderer/services/connectors/WalletConnectUtils';
import actionTypes from 'renderer/actions/ActionTypes';
import { useDispatch } from 'react-redux';
import { CircularProgress } from '@material-ui/core';

type BrowserViewProps = {
  url: string;
};

const BrowserView = ({ url }: BrowserViewProps) => {
  const dispatch = useDispatch();
  const [randomId, setRandomId] = useState(1);
  const [gasPrice, setGasPrice] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
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
  const address = useUserAddress();
  const webviewRef = useRef<any>();
  const timeoutToggleModal = useRef<any>();
  const isBuidlerAirdrop = useMemo(
    () => url === 'https://buidler.link/airdrop_hunter',
    [url]
  );
  const toggleFullScreen = useCallback(
    () => setFullScreen((current) => !current),
    []
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
    (json) => {
      const { id, name, object } = json || {};
      if (!id) {
        toast.error('Missing data');
        return;
      }
      switch (name) {
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
        case 'switchEthereumChain': {
          const chain = getChain(object.chainId);
          if (!chain) {
            toast.error('Unsupported chain');
            break;
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
    [getChain, toggleModalConfirm]
  );
  useEffect(() => {
    const web = webviewRef.current;
    if (urlWithParams && web) {
      const handleIPCMessage = (data) => {
        const json = JSON.parse(data.channel);
        handleMessage(json);
      };
      const handleInjectJavascript = () => {
        web.executeJavaScript(`
          ${window.electron.contentProvider}
          var config = {
            ethereum: {
              chainId: 1,
              rpcUrl: 'https://cloudflare-eth.com',
            },
            solana: {
              cluster: 'mainnet-beta',
            },
            isDebug: true,
          };
          trustwallet.ethereum = new trustwallet.Provider(config);
          trustwallet.ethereum.isMetaMask = true;
          trustwallet.ethereum.isTrust = false;
          trustwallet.postMessage = (json) => {
            window.electron.ipcRenderer.postMessage(JSON.stringify(json));
          };
          window.ethereum = trustwallet.ethereum;
        `);
      };
      const handleWebviewLoaded = () => {
        setWebviewLoaded(true);
      };
      web.addEventListener('ipc-message', handleIPCMessage);
      web.addEventListener('load-commit', handleInjectJavascript);
      web.addEventListener('did-finish-load', handleWebviewLoaded);
      // webviewRef.current.addEventListener('dom-ready', () => {
      //   if (!webviewRef.current.isDevToolsOpened())
      //     webviewRef.current.openDevTools();
      // });
      return () => {
        web?.removeEventListener('ipc-message', handleIPCMessage);
        web?.removeEventListener('load-commit', handleInjectJavascript);
        web?.removeEventListener('did-finish-load', handleWebviewLoaded);
      };
    }
    return () => {};
  }, [handleMessage, urlWithParams]);
  const onCancel = useCallback(() => {
    const { network, id } = confirmData?.data;
    const callback = `window.${network}.sendError(${id}, "User cancel action")`;
    webviewRef.current.executeJavaScript(callback);
    toggleModalConfirm();
  }, [confirmData?.data, toggleModalConfirm]);
  const onConfirm = useCallback(async () => {
    const { network, id, object } = confirmData?.data;
    switch (confirmData?.data.name) {
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
  ]);
  return (
    <div
      className={`browser-view__container ${
        fullScreen ? 'browser-full-screen' : ''
      }`}
    >
      {fullScreen && <div className="browser-back-drop" />}
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
      />
    </div>
  );
};

export default memo(BrowserView);