import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, orderBy, query, addDoc, Timestamp, doc, setDoc } from '@firebase/firestore';
import { db, appId } from '../../services/firebase';
import type { AppUser, ModalContent } from '../../types';
import { LogOut, Send, Users, Activity, RefreshCw, UserCheck, UserX, Search } from 'lucide-react';

interface AdminViewProps {
    user: AppUser;
    t: (key: string, replacements?: any) => string;
    tSubject: (key: string) => string;
    getThemeClasses: (variant: string) => string;
    handleLogout: () => void;
    showAppModal: (content: ModalContent) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ user, t, tSubject, getThemeClasses, handleLogout, showAppModal }) => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const usersCollection = collection(db, `artifacts/${appId}/public/data/users`);
            const q = query(usersCollection, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const usersList = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as AppUser));
            setUsers(usersList.filter(u => u.email !== 'admin1069@gmail.com'));
        } catch (error) {
            console.error("Error fetching users:", error);
            showAppModal({ text: 'Failed to fetch users.' });
        } finally {
            setIsLoading(false);
        }
    }, [showAppModal]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            u.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const handleSendBroadcast = async () => {
        if (!broadcastMessage.trim()) {
            showAppModal({ text: 'Broadcast message cannot be empty.' });
            return;
        }
        setIsSending(true);
        try {
            const broadcastsCollection = collection(db, `artifacts/${appId}/public/data/broadcasts`);
            await addDoc(broadcastsCollection, {
                message: broadcastMessage,
                sender: user.userName,
                createdAt: Timestamp.now(),
            });
            showAppModal({ text: t('broadcast_success') });
            setBroadcastMessage('');
        } catch (error) {
            console.error("Error sending broadcast:", error);
            showAppModal({ text: t('error_broadcast_failed') });
        } finally {
            setIsSending(false);
        }
    };
    
    const handleToggleUserStatus = async (targetUser: AppUser) => {
        const isDisabling = !targetUser.disabled;
        const confirmText = isDisabling
            ? t('confirm_disable_user', { name: targetUser.userName })
            : t('confirm_enable_user', { name: targetUser.userName });

        showAppModal({
            text: confirmText,
            confirmAction: async () => {
                try {
                    const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, targetUser.uid);
                    await setDoc(userDocRef, { disabled: isDisabling }, { merge: true });
                    showAppModal({ text: t('user_status_updated') });
                    fetchUsers(); // Refresh the list
                } catch (error) {
                    console.error("Error updating user status:", error);
                    showAppModal({ text: t('error_user_status_update') });
                }
            },
            cancelAction: () => {}
        });
    };
    
    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-md p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-purple-600">{t('admin_dashboard')}</h1>
                <div className="flex items-center gap-4">
                    <span className="font-semibold">Welcome, {user.userName}</span>
                    <button onClick={handleLogout} title={t('logout_button')} className="p-2 rounded-lg text-red-500 bg-red-100 hover:bg-red-200 transition-colors duration-200 active:scale-90">
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </header>
            <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Users /> {t('users')} ({filteredUsers.length})</h2>
                         <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t('admin_search_placeholder')}
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-8 pr-2 py-2 border rounded-lg w-full sm:w-64 bg-white"
                                />
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                            <button onClick={fetchUsers} disabled={isLoading} className="flex items-center gap-2 font-semibold bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg transition-colors active:scale-95 disabled:opacity-50">
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                {t('refresh_data')}
                            </button>
                        </div>
                    </div>
                    
                    {isLoading ? (
                        <p>Loading users...</p>
                    ) : (
                        <div className="overflow-x-auto max-h-[65vh]">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Name</th>
                                        <th scope="col" className="px-4 py-3">Email</th>
                                        <th scope="col" className="px-4 py-3">{t('education_level')}</th>
                                        <th scope="col" className="px-4 py-3">{t('last_login')}</th>
                                        <th scope="col" className="px-4 py-3">{t('status')}</th>
                                        <th scope="col" className="px-4 py-3">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u.uid} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">{u.userName}</td>
                                            <td className="px-4 py-4">{u.email}</td>
                                            <td className="px-4 py-4">{tSubject(u.educationLevel)}</td>
                                            <td className="px-4 py-4">{(u.lastLoginDate as Timestamp)?.toDate().toLocaleDateString() || 'N/A'}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {u.disabled ? t('disabled') : t('active')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button onClick={() => handleToggleUserStatus(u)} title={u.disabled ? t('enable_user') : t('disable_user')}
                                                    className={`p-2 rounded-lg transition-colors active:scale-90 ${u.disabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                                    {u.disabled ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="space-y-6">
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity /> App Statistics</h2>
                        <div className="space-y-2">
                             <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                 <span className="font-semibold text-blue-800">Total Users</span>
                                 <span className="font-bold text-xl text-blue-900">{filteredUsers.length}</span>
                             </div>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Send /> {t('send_broadcast')}</h2>
                        <div className="space-y-3">
                            <textarea
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                placeholder={t('broadcast_message_placeholder')}
                                rows={4}
                                className="w-full p-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                disabled={isSending}
                            />
                            <button onClick={handleSendBroadcast} disabled={isSending} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95 disabled:opacity-60">
                                {isSending ? 'Sending...' : t('send_message_button')}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminView;