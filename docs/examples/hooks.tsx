/* eslint-disable no-console */
import React from 'react';
import '../../assets/index.less';
import { useNotification } from '../../src';
import motion from './motion';

const getConfig = () => ({
  content: `${Array(Math.round(Math.random() * 5) + 1)
    .fill(1)
    .map(() => new Date().toISOString())
    .join('\n')}`,
  duration: null,
});

const App = () => {
  const [notice, contextHolder] = useNotification({ motion, closable: true });

  return (
    <>
      <div>
        <div>
          {/* Default */}
          <button
            onClick={() => {
              notice.open({
                content: `${new Date().toISOString()}`,
              });
            }}
          >
            Basic
          </button>

          {/* Not Close */}
          <button
            onClick={() => {
              notice.open(getConfig());
            }}
          >
            Not Auto Close
          </button>

          {/* Show Progress */}
          <button
            onClick={() => {
              notice.open({
                ...getConfig(),
                duration: 30,
                showProgress: true,
              });
            }}
          >
            Show Progress
          </button>
        </div>

        <div>
          {/* No Closable */}
          <button
            onClick={() => {
              notice.open({
                content: `No Close! ${new Date().toISOString()}`,
                duration: null,
                closable: false,
                key: 'No Close',
                onClose: () => {
                  console.log('Close!!!');
                },
              });
            }}
          >
            No Closable
          </button>

          {/* Force Close */}
          <button
            onClick={() => {
              notice.close('No Close');
            }}
          >
            Force Close No Closable
          </button>
        </div>
      </div>

      <div>
        {/* Destroy All */}
        <button
          onClick={() => {
            notice.destroy();
          }}
        >
          Destroy All
        </button>
      </div>

      {contextHolder}
    </>
  );
};

export default () => (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
