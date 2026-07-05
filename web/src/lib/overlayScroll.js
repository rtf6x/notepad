import { OverlayScrollbars } from 'overlayscrollbars';

/** @type {import('svelte/action').Action<HTMLElement>} */
export function overlayScroll(node) {
  const instance = OverlayScrollbars(node, {
    scrollbars: {
      theme: 'os-theme-notepad',
      autoHide: 'never',
    },
    overflow: {
      x: 'hidden',
    },
  });

  return {
    destroy() {
      instance.destroy();
    },
  };
}
