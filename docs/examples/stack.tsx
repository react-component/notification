/* eslint-disable no-console */
import React from 'react';
import '../../assets/index.less';
import { useNotification } from '../../src';
import motion from './motion';

const Context = React.createContext({ name: 'light' });

const Demo = () => {
  const [{ open }, holder] = useNotification({ motion, stack: true });

  return (
    <Context.Provider value={{ name: 'bamboo' }}>
      <button
        type="button"
        onClick={() => {
          open({
            content: `${Array(Math.round(Math.random() * 5) + 1)
              .fill(1)
              .map(() => new Date().toISOString())
              .join('\n')}`,
            duration: null,
          });
        }}
      >
        simple show
      </button>
      {holder}
    </Context.Provider>
  );
};

export default Demo;
