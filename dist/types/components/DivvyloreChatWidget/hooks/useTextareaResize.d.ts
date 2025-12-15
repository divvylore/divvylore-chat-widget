interface UseTextareaResizeOptions {
    minHeight?: number;
    maxHeight?: number;
    lineHeight?: number;
    padding?: number;
    maxLines?: number;
}
/**
 * Custom hook to manage textarea auto-resizing
 */
export declare const useTextareaResize: (value: string, options?: UseTextareaResizeOptions) => {
    textareaRef: import("react").RefObject<HTMLTextAreaElement | null>;
    prevLineCountRef: import("react").RefObject<number>;
    prevInputLengthRef: import("react").RefObject<number>;
    resizeAnimationFrame: import("react").RefObject<number | null>;
    handleShiftEnter: (textarea: HTMLTextAreaElement) => void;
};
export default useTextareaResize;
