import { useCallback, useState } from 'react';

export function useConfirmSheet() {
  const [visible, setVisible] = useState(false);
  const [payload, setPayload] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }>({ title: '', message: '' });

  const show = useCallback((options: typeof payload & { onConfirm: () => void }) => {
    setPayload(options);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  const handleConfirm = useCallback(() => {
    setVisible(false);
    payload.onConfirm?.();
  }, [payload]);

  return {
    visible,
    payload,
    show,
    hide,
    handleConfirm,
  };
}
