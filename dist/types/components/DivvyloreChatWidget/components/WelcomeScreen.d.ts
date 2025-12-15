import React from 'react';
interface WelcomeScreenProps {
    welcomeMessage: string;
    popularQuestions: string[];
    onQuestionClick: (question: string) => void;
    botName: string;
    botAvatarIcon?: React.ReactNode;
    showBotAvatar: boolean;
    theme: any;
}
export declare const WelcomeScreen: React.FC<WelcomeScreenProps>;
export default WelcomeScreen;
