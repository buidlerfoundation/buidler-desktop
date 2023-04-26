import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import api from 'renderer/api';
import useUserAddress from 'renderer/hooks/useUserAddress';
import IconReload from 'renderer/shared/SVG/IconReload';
import IconSecure from 'renderer/shared/SVG/IconSecure';
import './index.scss';

type BrowserViewProps = {
  url: string;
};

const BrowserView = ({ url }: BrowserViewProps) => {
  const [randomId, setRandomId] = useState(0);
  const address = useUserAddress();
  const webviewRef = useRef<any>();
  const onReload = useCallback(() => {
    setRandomId(Math.random());
  }, []);
  const [urlWithParams, setUrlWithParams] = useState('');
  const initial = useCallback(async () => {
    if (url) {
      let newUrl = url;
      if (url === 'https://buidler.link/airdrop_hunter') {
        newUrl += '?embedded=true';
        const res = await api.requestOTT();
        if (res.data) {
          newUrl += `&ott=${res.data}`;
        }
      }
      setUrlWithParams(newUrl);
    }
  }, [url]);
  useEffect(() => {
    initial();
  }, [initial]);
  const handleMessage = useCallback(
    (json) => {
      console.log(address, json);
      // const { id, name, object, network } = json;
      // if (name === 'requestAccounts') {
      //   const setAddress = `window.${network}.setAddress("${address}")`;
      //   const callbackRequestAccount = `window.${network}.sendResponse(${id}, ["${address}"])`;
      //   webviewRef.current.executeJavaScript(setAddress);
      //   webviewRef.current.executeJavaScript(callbackRequestAccount);
      // }
    },
    [address]
  );
  useEffect(() => {
    if (urlWithParams && webviewRef.current) {
      webviewRef.current.addEventListener('ipc-message', (data) => {
        const json = JSON.parse(data.channel);
        handleMessage(json);
      });
      webviewRef.current.addEventListener('load-commit', () => {
        webviewRef.current.executeJavaScript(`
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
      });
      webviewRef.current.addEventListener('dom-ready', () => {
        if (!webviewRef.current.isDevToolsOpened())
          webviewRef.current.openDevTools();
      });
    }
  }, [handleMessage, urlWithParams]);
  return (
    <div className="browser-view__container">
      <div className="browser-header-bar">
        <IconSecure />
        <span className="browser-url text-ellipsis">{url}</span>
        <div className="btn-reload" onClick={onReload}>
          <IconReload />
        </div>
      </div>
      {!!urlWithParams && (
        <webview
          key={randomId}
          ref={webviewRef}
          src={urlWithParams}
          style={{ flex: 1 }}
          preload={`file://${window.electron.webviewPreloadPath}`}
          nodeintegration="true"
        />
      )}
    </div>
  );
};

export default memo(BrowserView);
