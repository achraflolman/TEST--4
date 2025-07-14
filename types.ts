
import type { Timestamp } from '@firebase/firestore';

export interface AppUser {
    uid: string;
    email: string;
    userName: string;
    profilePictureUrl: string;
    createdAt: Timestamp | Date;
    selectedSubjects: string[];
    schoolName: string;
    className: string;
    educationLevel: string;
    languagePreference: 'nl' | 'en';
    themePreference: string;
    fontPreference?: string;
    homeLayout?: string[];
    customSubjects?: string[];
    // New fields for streak and notifications
    lastLoginDate?: Timestamp | Date;
    streakCount?: number;
    notificationsEnabled?: boolean;
    isAdmin?: boolean;
    disabled?: boolean; // For admin control
}

export interface FileData {
    id: string;
    title: string;
    description: string;
    subject: string;
    ownerId: string;
    createdAt: Timestamp;
    fileUrl: string;
    storagePath: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start: Timestamp;
    end: Timestamp;
    type: 'test' | 'presentation' | 'homework' | 'oral' | 'other';
    subject: string;
    ownerId: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    subject: string;
    ownerId: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

export interface ToDoTask {
    id: string;
    text: string;
    completed: boolean;
    ownerId: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    ownerId: string;
    createdAt: Timestamp;
    // --- SRS Fields ---
    dueDate?: Timestamp;
    interval?: number;
    easeFactor?: number;
}

export interface FlashcardSet {
    id:string;
    name: string;
    subject: string;
    ownerId: string;
    createdAt: Timestamp;
    cardCount: number;
}


export interface ModalContent {
    text: string;
    confirmAction?: () => void;
    cancelAction?: () => void;
}

export interface Notification {
    id: string;
    text: string;
    type: 'system' | 'admin' | 'streak';
    read: boolean;
    createdAt: Timestamp;
    broadcastId?: string; // To link to a broadcast message
}