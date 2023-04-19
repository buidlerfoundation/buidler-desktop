import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import api from 'renderer/api';
import IconReload from 'renderer/shared/SVG/IconReload';
import IconSecure from 'renderer/shared/SVG/IconSecure';
import './index.scss';

type BrowserViewProps = {
  url: string;
};

const BrowserView = ({ url }: BrowserViewProps) => {
  const [randomId, setRandomId] = useState(0);
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
        />
      )}
    </div>
  );
};

export default memo(BrowserView);
