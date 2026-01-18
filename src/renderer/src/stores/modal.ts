import { writable } from 'svelte/store';

export type ModalType = 'alert' | 'confirm';
export type ModalVariant = 'info' | 'warning' | 'error' | 'success';

export interface ModalOptions {
    title: string;
    message: string;
    variant?: ModalVariant;
    confirmText?: string;
    cancelText?: string;
}

interface ModalState {
    isOpen: boolean;
    type: ModalType;
    options: ModalOptions;
    resolve: (value: boolean) => void;
}

const initialState: ModalState = {
    isOpen: false,
    type: 'alert',
    options: { title: '', message: '' },
    resolve: () => {}
};

export const modalStore = writable<ModalState>(initialState);

export function showAlert(title: string, message: string, variant: ModalVariant = 'error'): Promise<void> {
    return new Promise((resolve) => {
        modalStore.set({
            isOpen: true,
            type: 'alert',
            options: { title, message, variant },
            resolve: () => {
                modalStore.set(initialState);
                resolve();
            }
        });
    });
}

export function showConfirm(title: string, message: string, variant: ModalVariant = 'warning', confirmText = 'Confirmar'): Promise<boolean> {
    return new Promise((resolve) => {
        modalStore.set({
            isOpen: true,
            type: 'confirm',
            options: { title, message, variant, confirmText },
            resolve: (val) => {
                modalStore.set(initialState);
                resolve(val);
            }
        });
    });
}
