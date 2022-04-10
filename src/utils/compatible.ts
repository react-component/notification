// ReactDOM.render is no longer supported in React 18. Use createRoot instead.
// Until you switch to the new API, your app will behave as if it’s running React 17.
// Learn more: https://reactjs.org/link/switch-to-createroot

import type * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import type { Root, RootOptions } from 'react-dom/client';

type ContainerType = Element | DocumentFragment;

let createRoot: (container: ContainerType, options?: RootOptions) => Root;

try {
  createRoot = require('react-dom/client').createRoot;
} catch (e) {
  // Do nothing;
}

export function reactRender(
  node: React.ReactElement,
  container: ContainerType,
  options?: RootOptions,
) {
  // React 18
  /* istanbul ignore next */
  if (createRoot !== undefined) {
    const root = createRoot(container, options);
    root.render(node);
    return;
  }

  render(node, container);
}

export function reactUnmount(container: ContainerType, reactRoot?: Root) {
  // React 18
  /* istanbul ignore next */
  if (createRoot !== undefined) {
    reactRoot?.unmount();

    return;
  }

  unmountComponentAtNode(container);
}
