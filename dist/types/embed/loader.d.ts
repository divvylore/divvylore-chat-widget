import type { DivvyloreChatWidgetProps } from '../components/DivvyloreChatWidget/types';
export interface DivvyloreLoaderConfig extends DivvyloreChatWidgetProps {
    target?: string | HTMLElement;
    onMount?: (container: HTMLElement) => void;
    onError?: (error: Error) => void;
}
