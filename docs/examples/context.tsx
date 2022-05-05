/* eslint-disable no-console */
import React from 'react';
import '../../assets/index.less';
import { useNotification } from '../../src';
import motion from './motion';

const Context = React.createContext({ name: 'light' });

const NOTICE = {
  content: <span>simple show</span>,
  onClose() {
    console.log('simple close');
  },
  // duration: null,
};

const Demo = () => {
  const [{ open }, holder] = useNotification({ motion });

  return (
    <Context.Provider value={{ name: 'bamboo' }}>
      <button
        type="button"
        onClick={() => {
          open({
            ...NOTICE,
            content: <Context.Consumer>{({ name }) => `Hi ${name}!`}</Context.Consumer>,
            props: {
              'data-testid': 'my-data-testid',
            },
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
