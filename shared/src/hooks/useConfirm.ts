import { useModal } from '../components/modals/ModalProvider';
import { ConfirmModal } from '../components/modals/ConfirmModal';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirm() {
  const { openModal } = useModal();

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      openModal({
        component: ConfirmModal,
        props: {
          ...options,
          onConfirm: () => resolve(true),
          onClose: () => resolve(false),
        },
        options: {
          size: 'sm',
        },
      });
    });
  };

  return { confirm };
}