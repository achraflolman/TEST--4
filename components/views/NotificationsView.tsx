import React, { useEffect } from 'react';
import { writeBatch, doc, collection } from '@firebase/firestore';
import { db, appId } from '../../services/firebase';
import type { AppUser, Notification } from '../../types';
import { Bell, Flame, UserCog, CheckCheck, MessageSquare, ArrowLeft } from 'lucide-react';

interface NotificationsViewProps {
    user: AppUser;
    notifications: Notification[];
    t: (key: string) => string;
    getThemeClasses: (variant: string) => string;
    setCurrentView: (view: string) => void;
    onProfileUpdate: (updatedData: Partial<AppUser>) => Promise<void>;
}

const NotificationIcon = ({ type, getThemeClasses }: { type: Notification['type'], getThemeClasses: (v: string) => string }) => {
    switch (type) {
        case 'admin':
            return <div className="p-3 bg-purple-100 rounded-full"><UserCog className="w-5 h-5 text-purple-600" /></div>;
        case 'streak':
            return <div className="p-3 bg-orange-100 rounded-full"><Flame className="w-5 h-5 text-orange-500" /></div>;
        case 'system':
        default:
            return <div className="p-3 bg-blue-100 rounded-full"><Bell className="w-5 h-5 text-blue-600" /></div>;
    }
};

const NotificationsView: React.FC<NotificationsViewProps> = ({ user, notifications, t, getThemeClasses, setCurrentView, onProfileUpdate }) => {

    useEffect(() => {
        // Mark notifications as read when the component is mounted
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length > 0) {
            const batch = writeBatch(db);
            unreadIds.forEach(id => {
                const notifRef = doc(db, `artifacts/${appId}/users/${user.uid}/notifications`, id);
                batch.update(notifRef, { read: true });
            });
            batch.commit().catch(err => console.error("Failed to mark notifications as read:", err));
        }
    }, [notifications, user.uid]);

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                 <button onClick={() => setCurrentView('home')} className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors active:scale-95">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t('back_button')}
                </button>
                <h2 className={`text-3xl font-bold ${getThemeClasses('text-strong')}`}>{t('notifications_title')}</h2>
                <div></div>
            </div>

            <div className={`p-4 sm:p-6 rounded-xl shadow-lg ${getThemeClasses('bg-light')} min-h-[60vh]`}>
                {notifications.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <MessageSquare className="mx-auto h-20 w-20 text-gray-300" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-700">{t('no_notifications')}</h3>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {notifications.map(notif => (
                            <li key={notif.id} className={`bg-white p-4 rounded-lg shadow-sm flex items-start gap-4 transition-opacity duration-300 ${!notif.read ? 'border-l-4 ' + getThemeClasses('border') : 'opacity-70'}`}>
                                <NotificationIcon type={notif.type} getThemeClasses={getThemeClasses} />
                                <div className="flex-1">
                                    <p className="text-gray-800">{notif.text}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {notif.createdAt.toDate().toLocaleString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NotificationsView;