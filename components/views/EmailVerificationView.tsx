
import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../services/firebase';
import type { AppUser } from '../../types';
import { MailCheck } from 'lucide-react';

interface EmailVerificationViewProps {
    user: AppUser;
    t: (key: string, replacements?: any) => string;
    getThemeClasses: (variant: string) => string;
    handleLogout: () => void;
}

const EmailVerificationView: React.FC<EmailVerificationViewProps> = ({ user, t, getThemeClasses, handleLogout }) => {
    const [isSending, setIsSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResend = async () => {
        if (!auth.currentUser) return;
        setIsSending(true);
        try {
            await sendEmailVerification(auth.currentUser);
            setEmailSent(true);
            setTimeout(() => setEmailSent(false), 5000); // Reset message after 5s
        } catch (error) {
            console.error("Error resending verification email", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleContinue = () => {
        window.location.reload();
    };

    return (
        <div className={`min-h-screen w-full flex items-center justify-center p-4 animate-fade-in-slow ${getThemeClasses('bg')}`}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center">
                <MailCheck className={`w-16 h-16 mx-auto mb-4 ${getThemeClasses('text')}`} />
                <h2 className={`text-2xl font-bold mb-3 ${getThemeClasses('text-strong')}`}>{t('verify_email_title')}</h2>
                <p className="text-gray-600 mb-4">
                    {t('verify_email_instructions', { email: user.email })}
                </p>
                <p className="text-sm text-gray-500 mb-6">{t('verify_email_spam_check')}</p>

                <button
                    onClick={handleContinue}
                    className={`w-full font-bold py-3 px-4 rounded-lg text-white mb-3 shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-[.98] ${getThemeClasses('bg')} ${getThemeClasses('hover-bg')}`}
                >
                    {t('verify_email_continue_button')}
                </button>
                
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={handleResend}
                        disabled={isSending || emailSent}
                        className="text-sm font-semibold text-gray-500 hover:underline disabled:text-gray-400 disabled:no-underline"
                    >
                        {isSending ? t('sending') : (emailSent ? t('email_sent') : t('verify_email_resend_button'))}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-sm font-semibold text-red-500 hover:underline"
                    >
                        {t('logout_button')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationView;
