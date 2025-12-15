import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import DivvyloreChatWidget from '../components/DivvyloreChatWidget/DivvyloreChatWidget';
import type { DivvyloreChatWidgetProps } from '../components/DivvyloreChatWidget/types';

export interface DivvyloreLoaderConfig extends DivvyloreChatWidgetProps {
  target?: string | HTMLElement;
  onMount?: (container: HTMLElement) => void;
  onError?: (error: Error) => void;
}

interface DivvyloreLoaderHandle {
  destroy: () => void;
  container: HTMLElement;
}

interface DivvyloreWindow extends Window {
  loadDivvyloreChatWidget?: (config: DivvyloreLoaderConfig) => DivvyloreLoaderHandle | null;
}

const roots = new Map<HTMLElement, Root>();
const DEFAULT_SELECTOR = '#divvylore-chat-widget';

const resolveTarget = (
  target?: string | HTMLElement
): { element: HTMLElement; autoCreated: boolean } => {
  if (target instanceof HTMLElement) {
    return { element: target, autoCreated: false };
  }

  const selector = target || DEFAULT_SELECTOR;
  const existing = typeof selector === 'string' ? document.querySelector<HTMLElement>(selector) : null;
  if (existing) {
    return { element: existing, autoCreated: false };
  }

  const container = document.createElement('div');
  const id = selector.startsWith('#') ? selector.slice(1) : selector;
  if (id) {
    container.id = id;
  }
  document.body.appendChild(container);
  return { element: container, autoCreated: true };
};

const dispatchLifecycleEvent = (name: string, detail?: Record<string, unknown>) => {
  window.dispatchEvent(new CustomEvent(name, { detail }));
};

const mountWidget = (config: DivvyloreLoaderConfig): DivvyloreLoaderHandle | null => {
  const { target, onMount, onError, ...widgetProps } = config;
  const { element, autoCreated } = resolveTarget(target);
  const existingRoot = roots.get(element);

  try {
    const root = existingRoot ?? createRoot(element);
    roots.set(element, root);

    root.render(
      <React.StrictMode>
        <DivvyloreChatWidget {...widgetProps} />
      </React.StrictMode>
    );

    onMount?.(element);
    dispatchLifecycleEvent('divvylore:widget-mounted', { container: element });

    return {
      container: element,
      destroy: () => {
        const storedRoot = roots.get(element);
        if (storedRoot) {
          storedRoot.unmount();
          roots.delete(element);
        }
        if (autoCreated && element.parentElement) {
          element.parentElement.removeChild(element);
        }
        dispatchLifecycleEvent('divvylore:widget-destroyed', { container: element });
      },
    };
  } catch (error) {
    const typedError = error instanceof Error ? error : new Error('Unknown error mounting DivvyloreChatWidget');
    console.error('[DivvyloreChatLoader] Failed to mount widget', typedError);
    onError?.(typedError);
    dispatchLifecycleEvent('divvylore:widget-error', { error: typedError });
    return null;
  }
};

const initializeLoader = () => {
  const loader = (config: DivvyloreLoaderConfig) => {
    if (!config || !config.agentId || !config.agentKey) {
      const error = new Error('agentId and agentKey are required to mount DivvyloreChatWidget');
      console.error('[DivvyloreChatLoader] Missing required authentication props');
      config?.onError?.(error);
      dispatchLifecycleEvent('divvylore:widget-error', { error });
      return null;
    }

    return mountWidget(config);
  };

  (window as DivvyloreWindow).loadDivvyloreChatWidget = loader;
  dispatchLifecycleEvent('divvylore:ready');
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLoader, { once: true });
  } else {
    initializeLoader();
  }
}
