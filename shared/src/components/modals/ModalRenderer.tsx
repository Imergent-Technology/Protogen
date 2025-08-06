
import { useModal } from './ModalProvider';
import {
  Dialog,
  DialogContent,
} from '../ui/dialog';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full h-full',
};

export function ModalRenderer() {
  const { modals, closeModal } = useModal();

  return (
    <>
      {modals.map((modal) => {
        const Component = modal.component;
        const sizeClass = sizeClasses[modal.options?.size || 'md'];
        
        return (
          <Dialog
            key={modal.id}
            open={true}
            onOpenChange={(open) => {
              if (!open && modal.options?.closable !== false) {
                closeModal(modal.id);
              }
            }}
          >
            <DialogContent className={`${sizeClass} max-h-[90vh] overflow-auto`}>
              <Component
                {...modal.props}
                onClose={() => closeModal(modal.id)}
                modalId={modal.id}
              />
            </DialogContent>
          </Dialog>
        );
      })}
    </>
  );
}