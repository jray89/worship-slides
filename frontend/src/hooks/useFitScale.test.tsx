import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFitScale } from './useFitScale';

let observers: { callback: ResizeObserverCallback; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];

function installResizeObserver() {
  observers = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(public callback: ResizeObserverCallback) {
        observers.push(this);
      }
    },
  );
}

function Probe({ width }: { width: number }) {
  const [ref, scale] = useFitScale<HTMLDivElement>(1920);
  return (
    <div
      ref={(node) => {
        if (node) Object.defineProperty(node, 'offsetWidth', { configurable: true, get: () => width });
        ref(node);
      }}
    >
      {scale}
    </div>
  );
}

describe('useFitScale', () => {
  it('scales the design width to the element width and tracks resizes', () => {
    installResizeObserver();
    let width = 960;
    function Resizable() {
      const [ref, scale] = useFitScale<HTMLDivElement>(1920);
      return (
        <div
          ref={(node) => {
            if (node) Object.defineProperty(node, 'offsetWidth', { configurable: true, get: () => width });
            ref(node);
          }}
        >
          {scale}
        </div>
      );
    }
    const { container } = render(<Resizable />);

    expect(container.textContent).toBe('0.5');
    expect(observers[0].observe).toHaveBeenCalled();

    width = 480;
    act(() => observers[0].callback([], {} as ResizeObserver));
    expect(container.textContent).toBe('0.25');
  });

  it('disconnects the observer when the element unmounts', () => {
    installResizeObserver();
    const { unmount } = render(<Probe width={1920} />);

    unmount();

    expect(observers[0].disconnect).toHaveBeenCalled();
  });
});
