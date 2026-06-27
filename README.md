<div align="center">
  <h1>@rc-component/notification</h1>
  <p><sub><img alt="Ant Design" height="14" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" style="vertical-align: -0.125em;" /> Part of the Ant Design ecosystem.</sub></p>
  <p>🔔 Hook-based React notification primitives for stacked, animated, and accessible notices.</p>
</div>

<p align="center">English | <a href="./README.zh-CN.md">简体中文</a></p>


<div align="center">

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![build status][github-actions-image]][github-actions-url]
[![Codecov][codecov-image]][codecov-url]
[![bundle size][bundlephobia-image]][bundlephobia-url]
[![dumi][dumi-image]][dumi-url]

</div>


## Highlights

- `useNotification` hook returning an API and React holder element.
- Top, bottom, left, and right placements with max-count limiting.
- Closable notices, duration timers, progress display, hover pause, and stacked layout.
- Custom motion, semantic `classNames` / `styles`, progress component override, and provider-level classes.
- TypeScript definitions for notification config, API, list config, and progress props.
- Used by Ant Design as the shared notification foundation.

## Install

```bash
npm install @rc-component/notification
```

## Usage

```tsx | pure
import { useNotification } from '@rc-component/notification';

export default () => {
  const [api, holder] = useNotification();

  return (
    <>
      {holder}
      <button
        type="button"
        onClick={() => {
          api.open({
            key: 'welcome',
            title: 'Notification',
            description: 'This notice is rendered by @rc-component/notification.',
            closable: true,
          });
        }}
      >
        Open
      </button>
    </>
  );
};
```

```tsx | pure
import { NotificationProvider, useNotification } from '@rc-component/notification';

const Demo = () => {
  const [api, holder] = useNotification({
    placement: 'topRight',
    maxCount: 3,
    showProgress: true,
    pauseOnHover: true,
    stack: true,
  });

  return (
    <>
      {holder}
      <button type="button" onClick={() => api.open({ title: 'Queued' })}>
        Add
      </button>
    </>
  );
};

export default () => (
  <NotificationProvider classNames={{ notice: 'custom-notice' }}>
    <Demo />
  </NotificationProvider>
);
```

## Examples

Run the local dumi site:

```bash
npm install
npm start
```

Then open `http://localhost:8000`.

## API

### useNotification

```ts
const [api, holder] = useNotification(config);
```

| Property            | Type                                                         | Default               | Description                                                 |
| ------------------- | ------------------------------------------------------------ | --------------------- | ----------------------------------------------------------- |
| className           | `(placement: Placement) => string`                           | -                     | Class name for each placement container.                    |
| classNames          | `NotificationClassNames`                                     | -                     | Semantic class names for notice and list slots.             |
| closable            | `boolean \| { closeIcon?: ReactNode; onClose?: () => void }` | -                     | Shared closable config for opened notices.                  |
| components          | `{ progress?: ComponentType<NotificationProgressProps> }`    | -                     | Component overrides.                                        |
| duration            | `number \| false \| null`                                    | `4.5`                 | Auto-close delay in seconds. Use `false` or `0` to disable. |
| getContainer        | `() => HTMLElement \| ShadowRoot`                            | `() => document.body` | Notification portal container.                              |
| maxCount            | `number`                                                     | -                     | Maximum notices to keep. Oldest notices are dropped.        |
| motion              | `CSSMotionProps \| (placement) => CSSMotionProps`            | -                     | Motion config for notice transitions.                       |
| pauseOnHover        | `boolean`                                                    | `true`                | Pause auto-close timer while hovering.                      |
| placement           | `Placement`                                                  | `topRight`            | Default placement for opened notices.                       |
| prefixCls           | `string`                                                     | `rc-notification`     | Class name prefix.                                          |
| renderNotifications | `(node, info) => ReactElement`                               | -                     | Customize the rendered notification tree.                   |
| showProgress        | `boolean`                                                    | `false`               | Show auto-close progress for opened notices.                |
| stack               | `boolean \| StackConfig`                                     | `false`               | Enable stacked notification layout.                         |
| style               | `(placement: Placement) => CSSProperties`                    | -                     | Inline style for each placement container.                  |
| styles              | `NotificationStyles`                                         | -                     | Semantic styles for notice and list slots.                  |
| onAllRemoved        | `() => void`                                                 | -                     | Triggered after all notices are removed.                    |

### NotificationAPI

| Method    | Type                                                | Description              |
| --------- | --------------------------------------------------- | ------------------------ |
| `open`    | `(config: Partial<NotificationListConfig>) => void` | Open or update a notice. |
| `close`   | `(key: React.Key) => void`                          | Close a notice by key.   |
| `destroy` | `() => void`                                        | Remove all notices.      |

### NotificationListConfig

| Property     | Type                                                         | Default    | Description                                                  |
| ------------ | ------------------------------------------------------------ | ---------- | ------------------------------------------------------------ |
| actions      | `ReactNode`                                                  | -          | Extra action content.                                        |
| className    | `string`                                                     | -          | Class name for the notice.                                   |
| classNames   | `NotificationClassNames`                                     | -          | Semantic class names for notice slots.                       |
| closable     | `boolean \| { closeIcon?: ReactNode; onClose?: () => void }` | -          | Whether the notice can be closed.                            |
| components   | `{ progress?: ComponentType<NotificationProgressProps> }`    | -          | Component overrides for this notice.                         |
| description  | `ReactNode`                                                  | -          | Notice description content.                                  |
| duration     | `number \| false \| null`                                    | `4.5`      | Auto-close delay in seconds.                                 |
| icon         | `ReactNode`                                                  | -          | Notice icon.                                                 |
| key          | `React.Key`                                                  | -          | Unique notice key. Opening with the same key updates it.     |
| offset       | `number`                                                     | -          | Offset used by stacked positioning.                          |
| pauseOnHover | `boolean`                                                    | `true`     | Pause this notice while hovering.                            |
| placement    | `Placement`                                                  | `topRight` | Notice placement.                                            |
| props        | `HTMLAttributes<HTMLDivElement> & Record<string, any>`       | -          | Extra props passed to the notice root.                       |
| role         | `string`                                                     | -          | ARIA role for the notice.                                    |
| showProgress | `boolean`                                                    | `false`    | Show auto-close progress.                                    |
| style        | `CSSProperties`                                              | -          | Inline style for the notice.                                 |
| styles       | `NotificationStyles`                                         | -          | Semantic styles for notice slots.                            |
| title        | `ReactNode`                                                  | -          | Notice title content.                                        |
| onClick      | `MouseEventHandler<HTMLDivElement>`                          | -          | Triggered when the notice is clicked.                        |
| onClose      | `() => void`                                                 | -          | Triggered when the notice closes. Prefer `closable.onClose`. |
| onMouseEnter | `MouseEventHandler<HTMLDivElement>`                          | -          | Triggered when mouse enters the notice.                      |
| onMouseLeave | `MouseEventHandler<HTMLDivElement>`                          | -          | Triggered when mouse leaves the notice.                      |

### Types

```ts
type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

interface StackConfig {
  threshold?: number;
  offset?: number;
}
```

## Development

```bash
npm install
npm start
npm test
npm run tsc
npm run coverage
npm run compile
npm run build
```

## Release

```bash
npm run prepublishOnly
```

The release flow is handled by `@rc-component/np` through the `rc-np` command after the package build.

## License

@rc-component/notification is released under the [MIT](./LICENSE.md) license.

[npm-image]: https://img.shields.io/npm/v/@rc-component/notification.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@rc-component/notification
[github-actions-image]: https://github.com/react-component/notification/actions/workflows/react-component-ci.yml/badge.svg
[github-actions-url]: https://github.com/react-component/notification/actions/workflows/react-component-ci.yml
[codecov-image]: https://img.shields.io/codecov/c/github/react-component/notification/master.svg?style=flat-square
[codecov-url]: https://app.codecov.io/gh/react-component/notification
[download-image]: https://img.shields.io/npm/dm/@rc-component/notification.svg?style=flat-square
[download-url]: https://npmjs.org/package/@rc-component/notification
[bundlephobia-url]: https://bundlephobia.com/package/@rc-component/notification
[bundlephobia-image]: https://img.shields.io/bundlephobia/minzip/@rc-component/notification?style=flat-square
[dumi-url]: https://github.com/umijs/dumi
[dumi-image]: https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square
