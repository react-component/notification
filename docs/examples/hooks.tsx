/* eslint-disable no-console */
import React from 'react';
import type { CSSMotionProps } from '@rc-component/motion';
import '../../assets/index.less';
import { useNotification } from '../../src';

const motion: CSSMotionProps = {
  motionName: 'rc-notification-fade',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
};

const App = () => {
  const [notice, contextHolder] = useNotification({
    motion,
    closable: true,
  });

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {/* Default */}
          <button
            type="button"
            onClick={() => {
              notice.open({
                description: `${new Date().toISOString()}`,
              });
            }}
          >
            Basic
          </button>

          {/* Not Close */}
          <button
            type="button"
            onClick={() => {
              notice.open({
                description: `${Array(Math.round(Math.random() * 5) + 1)
                  .fill(1)
                  .map(() => new Date().toISOString())
                  .join('\n')}`,
                duration: null,
              });
            }}
          >
            Not Auto Close (Random)
          </button>

          {/* Not Close */}
          <button
            type="button"
            onClick={() => {
              notice.open({
                description: `${Array(5)
                  .fill(1)
                  .map(() => new Date().toISOString())
                  .join('\n')}`,
                duration: null,
              });
            }}
          >
            Not Auto Close (5 Items)
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {/* No Closable */}
          <button
            type="button"
            onClick={() => {
              notice.open({
                description: `No Close! ${new Date().toISOString()}`,
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
            type="button"
            onClick={() => {
              notice.close('No Close');
            }}
          >
            Force Close No Closable
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {/* Destroy All */}
          <button
            type="button"
            onClick={() => {
              notice.destroy();
            }}
          >
            Destroy All
          </button>
        </div>
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
