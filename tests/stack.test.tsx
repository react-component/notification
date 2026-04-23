import { useNotification } from '../src';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import NotificationList from '../src/NotificationList';

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
                description: <div className="context-content">Test</div>,
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

    const notices = Array.from(document.querySelectorAll<HTMLElement>('.rc-notification-notice'));
    expect(notices.map((notice) => notice.getAttribute('data-notification-index'))).toEqual([
      '4',
      '3',
      '2',
      '1',
      '0',
    ]);
    expect(
      notices
        .slice(0, 2)
        .every((notice) => !notice.matches('.rc-notification-notice-stack-in-threshold')),
    ).toBeTruthy();
    expect(
      notices
        .slice(2)
        .every((notice) => notice.matches('.rc-notification-notice-stack-in-threshold')),
    ).toBeTruthy();

    fireEvent.mouseEnter(document.querySelector('.rc-notification-list'));
    expect(document.querySelector('.rc-notification-stack-expanded')).toBeTruthy();
    expect(document.querySelector('.rc-notification-list-hovered')).toBeTruthy();

    fireEvent.mouseLeave(document.querySelector('.rc-notification-list'));
    expect(document.querySelector('.rc-notification-list-hovered')).toBeFalsy();
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
                description: <div className="context-content">Test</div>,
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

  it('passes stack offset to list position by bottom edge when collapsed', () => {
    const offsetHeightSpy = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockImplementation(function mockOffsetHeight() {
        if (this.classList?.contains('rc-notification-notice')) {
          if (this.querySelector('.context-content-first')) {
            return 80;
          }

          if (this.querySelector('.context-content-second')) {
            return 40;
          }
        }

        return 0;
      });

    render(
      <NotificationList
        placement="topRight"
        stack={{ threshold: 1, offset: 12 }}
        configList={[
          {
            key: 'first',
            description: <div className="context-content-first">First</div>,
            duration: false,
          },
          {
            key: 'second',
            description: <div className="context-content-second">Second</div>,
            duration: false,
          },
        ]}
      />,
    );

    const firstNotice = document
      .querySelector('.context-content-first')
      ?.closest<HTMLElement>('.rc-notification-notice');
    const secondNotice = document
      .querySelector('.context-content-second')
      ?.closest<HTMLElement>('.rc-notification-notice');
    const contentNode = document.querySelector<HTMLElement>('.rc-notification-list-content');

    const getBottom = (notice: HTMLElement | undefined | null) =>
      (notice ? parseFloat(notice.style.getPropertyValue('--notification-y')) : 0) +
      (notice?.offsetHeight ?? 0);

    expect(contentNode?.style.height).toBe('40px');
    expect(firstNotice?.style.getPropertyValue('--notification-y')).toBe('-28px');
    expect(secondNotice?.style.getPropertyValue('--notification-y')).toBe('0px');
    expect(getBottom(firstNotice) - getBottom(secondNotice)).toBe(12);

    fireEvent.mouseEnter(document.querySelector('.rc-notification-list'));

    expect(contentNode?.style.height).toBe('120px');
    expect(firstNotice?.style.getPropertyValue('--notification-y')).toBe('40px');
    expect(secondNotice?.style.getPropertyValue('--notification-y')).toBe('0px');

    offsetHeightSpy.mockRestore();
  });

  it('passes list css gap to list position when expanded', () => {
    const offsetHeightSpy = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockImplementation(function mockOffsetHeight() {
        if (
          this.classList?.contains('rc-notification-notice-wrapper') ||
          this.classList?.contains('rc-notification-notice')
        ) {
          return 50;
        }

        return 0;
      });
    const originGetComputedStyle = window.getComputedStyle;
    const getComputedStyleSpy = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((element) => {
        const style = originGetComputedStyle(element);

        if ((element as HTMLElement).classList?.contains('rc-notification-list-content')) {
          return new Proxy(style, {
            get(target, prop, receiver) {
              if (prop === 'gap' || prop === 'rowGap') {
                return '8px';
              }

              return Reflect.get(target, prop, receiver);
            },
          }) as CSSStyleDeclaration;
        }

        return style;
      });

    render(
      <NotificationList
        configList={[
          {
            key: 'first',
            description: <div className="context-content-first">First</div>,
            duration: false,
          },
          {
            key: 'second',
            description: <div className="context-content-second">Second</div>,
            duration: false,
          },
        ]}
      />,
    );

    const firstNotice = document
      .querySelector('.context-content-first')
      ?.closest<HTMLElement>('.rc-notification-notice');
    const secondNotice = document
      .querySelector('.context-content-second')
      ?.closest<HTMLElement>('.rc-notification-notice');

    expect(firstNotice?.getAttribute('data-notification-index')).toBe('1');
    expect(secondNotice?.getAttribute('data-notification-index')).toBe('0');
    expect(firstNotice?.style.getPropertyValue('--notification-y')).toBe('58px');
    expect(secondNotice?.style.getPropertyValue('--notification-y')).toBe('0px');

    getComputedStyleSpy.mockRestore();
    offsetHeightSpy.mockRestore();
  });
});
