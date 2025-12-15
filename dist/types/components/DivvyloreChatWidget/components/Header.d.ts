import React from 'react';
interface HeaderProps {
    headerTitle: string;
    showHeaderIcon: boolean;
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isExpanded: boolean;
    toggleExpanded: () => void;
    handleNewChat: () => void;
    handleEndChat: () => void;
    showChatHistory: boolean;
    toggleChatHistory: () => void;
    theme: any;
    clientIcon?: string;
    multiSessionEnabled?: boolean;
}
export declare const Header: React.FC<HeaderProps>;
export default Header;
