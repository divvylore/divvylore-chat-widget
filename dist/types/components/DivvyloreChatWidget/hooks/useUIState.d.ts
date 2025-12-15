interface UseUIStateOptions {
    startCollapsed?: boolean;
}
/**
 * Custom hook to manage UI state for the chat widget
 */
export declare const useUIState: (options?: UseUIStateOptions) => {
    isCollapsed: boolean;
    isExpanded: boolean;
    setIsCollapsed: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    toggleExpanded: () => void;
};
export default useUIState;
