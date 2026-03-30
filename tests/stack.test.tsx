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
                duration: false,
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

    fireEvent.mouseEnter(document.querySelector('.rc-notification-list'));
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
                duration: false,
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

    fireEvent.mouseEnter(document.querySelector('.rc-notification-list'));
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeTruthy();

    fireEvent.click(document.querySelector('.rc-notification-notice-close'));
    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(4);
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeTruthy();

    fireEvent.mouseLeave(document.querySelector('.rc-notification-list'));
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeFalsy();
  });

  it('passes stack offset to list position when collapsed', () => {
    const Demo = () => {
      const countRef = React.useRef(0);
      const [api, holder] = useNotification({
        stack: { threshold: 1, offset: 12 },
      });

      return (
        <>
          <button
            type="button"
            onClick={() => {
              const index = countRef.current;
              countRef.current += 1;

              api.open({
                content: <div className={`context-content-${index}`}>Test {index}</div>,
                duration: false,
              });
            }}
          />
          {holder}
        </>
      );
    };

    const { container } = render(<Demo />);

    for (let i = 0; i < 2; i++) {
      fireEvent.click(container.querySelector('button'));
    }

    const notices = Array.from(document.querySelectorAll<HTMLElement>('.rc-notification-notice'));
    const offsetList = notices.map((notice) => notice.style.getPropertyValue('--notification-y'));

    expect(notices[0].querySelector('.context-content-0')).toBeTruthy();
    expect(notices[1].querySelector('.context-content-1')).toBeTruthy();
    expect(offsetList).toEqual(['12px', '0px']);

    fireEvent.mouseEnter(document.querySelector('.rc-notification-list'));

    expect(
      notices.every((notice) => notice.style.getPropertyValue('--notification-y') === '0px'),
    ).toBeTruthy();
  });
});
