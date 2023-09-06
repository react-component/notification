import { useNotification } from '../src';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';

require('../assets/index.less');

describe('stack', () => {
  it('support stack', () => {
    const Demo = () => {
      const [api, holder] = useNotification({
        stack: { threshold: 3 },
      });
      return (
        <>
          <button
            type="button"
            onClick={() => {
              api.open({
                content: <div className="context-content">Test</div>,
                duration: null,
              });
            }}
          />
          {holder}
        </>
      );
    };

    const { container } = render(<Demo />);
    for (let i = 0; i < 3; i++) {
      fireEvent.click(container.querySelector('button'));
    }
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(3);
    expect(document.querySelector('.rc-notification-stack')).toBeTruthy();
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeTruthy();

    for (let i = 0; i < 2; i++) {
      fireEvent.click(container.querySelector('button'));
    }
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(5);
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeFalsy();

    fireEvent.mouseEnter(document.querySelector('.rc-notification-notice'));
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeTruthy();
  });

  it('should collapse when amount is less than threshold', () => {
    const Demo = () => {
      const [api, holder] = useNotification({
        stack: { threshold: 3 },
      });
      return (
        <>
          <button
            type="button"
            onClick={() => {
              api.open({
                content: <div className="context-content">Test</div>,
                duration: null,
                closable: true,
              });
            }}
          />
          {holder}
        </>
      );
    };

    const { container } = render(<Demo />);
    for (let i = 0; i < 5; i++) {
      fireEvent.click(container.querySelector('button'));
    }
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(5);
    expect(document.querySelector('.rc-notification-stack')).toBeTruthy();
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeFalsy();

    fireEvent.mouseEnter(document.querySelector('.rc-notification-notice'));
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeTruthy();

    fireEvent.click(document.querySelector('.rc-notification-notice-close'));
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(4);
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeTruthy();
    fireEvent.mouseEnter(document.querySelector('.rc-notification-notice-wrapper'));
    fireEvent.mouseLeave(document.querySelector('.rc-notification-notice-wrapper'));
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeFalsy();
  });
});
