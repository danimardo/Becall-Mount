import { writable } from 'svelte/store';

export type ModalType = 'alert' | 'confirm' | 'prompt';
export type ModalVariant = 'info' | 'warning' | 'error' | 'success';

export interface ModalOptions {
    title: string;
    message: string;
    variant?: ModalVariant;
    confirmText?: string;
    cancelText?: string;
    inputType?: string;
    placeholder?: string;
}

interface ModalState {
    isOpen: boolean;
    type: ModalType;
    options: ModalOptions;
    resolve: (value: any) => void;
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
                resolve(!!val);
            }
        });
    });
}

export function showPrompt(title: string, message: string, inputType = 'text', placeholder = ''): Promise<string | null> {
    return new Promise((resolve) => {
        modalStore.set({
            isOpen: true,
            type: 'prompt',
            options: { title, message, inputType, placeholder },
            resolve: (val) => {
                modalStore.set(initialState);
                resolve(val);
            }
        });
    });
}
