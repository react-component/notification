<div align="center">
  <h1>@rc-component/notification</h1>
  <p><sub><img alt="Ant Design" height="14" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" style="vertical-align: -0.125em;" /> Ant Design 生态的一部分。</sub></p>
  <p>🔔 React 通知组件，支持堆叠、位置、动画和全局调用。</p>
</div>

<p align="center"><a href="./README.md">English</a> | 简体中文</p>

<div align="center">

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![build status][github-actions-image]][github-actions-url]
[![Codecov][codecov-image]][codecov-url]
[![bundle size][bundlephobia-image]][bundlephobia-url]
[![dumi][dumi-image]][dumi-url]

</div>

## 特性

- `useNotification` 钩子返回 API 和 React 持有者元素。
- 具有最大数量限制的顶部、底部、左侧和右侧展示位置。
- 可关闭通知、持续计时器、进度显示、悬停暂停和堆叠布局。
- 支持动画自定义、语义化 `classNames` / `styles` 、细节组件覆盖和 Provider 级类。
- 通知配置、API、列表配置和进度属性的 TypeScript 定义。
- 被 Ant Design 用作共享的 notification 基础能力。

## 安装

```bash
npm install @rc-component/notification
```

## 使用

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

## 示例

运行本地 dumi 站点：

```bash
npm install
npm start
```

然后打开 `http://localhost:8000`。

## API

### useNotification

```ts
const [api, holder] = useNotification(config);
```

| 参数                | 类型                                                         | 默认值                | 说明                                               |
| ------------------- | ------------------------------------------------------------ | --------------------- | -------------------------------------------------- |
| className           | `(placement: Placement) => string`                           | -                     | 每个放置容器的类名。                               |
| classNames          | `NotificationClassNames`                                     | -                     | 通知和列表槽的语义类名。                           |
| closable            | `boolean \| { closeIcon?: ReactNode; onClose?: () => void }` | -                     | 打开通知的共享可关闭配置。                         |
| components          | `{ progress?: ComponentType<NotificationProgressProps> }`    | -                     | 组件覆盖。                                         |
| duration            | `number \| false \| null`                                    | `4.5`                 | 自动关闭延迟以秒为单位。使用 `false` 或 `0` 禁用。 |
| getContainer        | `() => HTMLElement \| ShadowRoot`                            | `() => document.body` | 通知门户容器。                                     |
| maxCount            | `number`                                                     | -                     | 保留的最大通知数。最旧的通知被删除。               |
| motion              | `CSSMotionProps \| (placement) => CSSMotionProps`            | -                     | 通知过渡动画配置。                                 |
| pauseOnHover        | `boolean`                                                    | `true`                | 悬停时暂停自动关闭计时器。                         |
| placement           | `Placement`                                                  | `topRight`            | 打开通知的默认位置。                               |
| prefixCls           | `string`                                                     | `rc-notification`     | 类名前缀。                                         |
| renderNotifications | `(node, info) => ReactElement`                               | -                     | 自定义呈现的通知树。                               |
| showProgress        | `boolean`                                                    | `false`               | 显示打开通知的自动关闭进度。                       |
| stack               | `boolean \| StackConfig`                                     | `false`               | 启用堆叠通知布局。                                 |
| style               | `(placement: Placement) => CSSProperties`                    | -                     | 每个放置容器的内联样式。                           |
| styles              | `NotificationStyles`                                         | -                     | 通知和列表槽的语义样式。                           |
| onAllRemoved        | `() => void`                                                 | -                     | 删除所有通知后触发。                               |

### NotificationAPI

| Method    | 类型                                                | 说明               |
| --------- | --------------------------------------------------- | ------------------ |
| `open`    | `(config: Partial<NotificationListConfig>) => void` | 打开或更新通知。   |
| `close`   | `(key: React.Key) => void`                          | 通过按键关闭通知。 |
| `destroy` | `() => void`                                        | 删除所有通知。     |

### NotificationListConfig

| 参数         | 类型                                                         | 默认值     | 说明                                        |
| ------------ | ------------------------------------------------------------ | ---------- | ------------------------------------------- |
| actions      | `ReactNode`                                                  | -          | 额外的动作内容。                            |
| className    | `string`                                                     | -          | 通知的类名。                                |
| classNames   | `NotificationClassNames`                                     | -          | 通知槽的语义类名。                          |
| closable     | `boolean \| { closeIcon?: ReactNode; onClose?: () => void }` | -          | 是否可以关闭通知。                          |
| components   | `{ progress?: ComponentType<NotificationProgressProps> }`    | -          | 组件覆盖此通知。                            |
| description  | `ReactNode`                                                  | -          | 注意说明内容。                              |
| duration     | `number \| false \| null`                                    | `4.5`      | 自动关闭延迟以秒为单位。                    |
| icon         | `ReactNode`                                                  | -          | 通知图标。                                  |
| key          | `React.Key`                                                  | -          | 独特的通知键。使用相同的密钥打开会更新它。  |
| offset       | `number`                                                     | -          | 堆叠定位使用的偏移量。                      |
| pauseOnHover | `boolean`                                                    | `true`     | 悬停时暂停此通知。                          |
| placement    | `Placement`                                                  | `topRight` | 通知位置。                                  |
| props        | `HTMLAttributes<HTMLDivElement> & Record<string, any>`       | -          | 额外的 props 传递到通知根。                 |
| role         | `string`                                                     | -          | ARIA 的作用为通知。                         |
| showProgress | `boolean`                                                    | `false`    | 显示自动关闭进度。                          |
| style        | `CSSProperties`                                              | -          | 通知的内联样式。                            |
| styles       | `NotificationStyles`                                         | -          | 通知槽的语义样式。                          |
| title        | `ReactNode`                                                  | -          | 注意标题内容。                              |
| onClick      | `MouseEventHandler<HTMLDivElement>`                          | -          | 单击通知时触发。                            |
| onClose      | `() => void`                                                 | -          | 通知关闭时触发。更喜欢 `closable.onClose`。 |
| onMouseEnter | `MouseEventHandler<HTMLDivElement>`                          | -          | 当鼠标进入通知时触发。                      |
| onMouseLeave | `MouseEventHandler<HTMLDivElement>`                          | -          | 当鼠标离开通知时触发。                      |

### Types

```ts
type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

interface StackConfig {
  threshold?: number;
  offset?: number;
}
```

## 本地开发

```bash
npm install
npm start
npm test
npm run tsc
npm run coverage
npm run compile
npm run build
```

dumi 站点默认运行在 `http://localhost:8000`。

## 发布

```bash
npm run prepublishOnly
```

包构建完成后，发布流程由 `@rc-component/np` 通过 `rc-np` 命令处理。

## 许可证

@rc-component/notification 基于 [MIT](./LICENSE) 许可证发布。

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
