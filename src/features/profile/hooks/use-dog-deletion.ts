import { useState } from 'react';

import { showDialog } from '@/components/ui/dialog';

import { deleteDog } from '@/features/dogs/api';

interface UseDogDeletionResult {
  closeDeleteDialog: () => void;
  confirmDeletion: () => Promise<void>;
  deleting: boolean;
  deleteDialogVisible: boolean;
  requestDeletion: () => void;
}

/** Provides one consistent dog-deletion confirmation flow for detail and edit screens. */
export function useDogDeletion(dogId: number, onDeleted: () => void): UseDogDeletionResult {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const requestDeletion = () => setDeleteDialogVisible(true);
  const closeDeleteDialog = () => {
    if (!deleting) setDeleteDialogVisible(false);
  };

  const confirmDeletion = async () => {
    if (deleting) return;

    setDeleting(true);
    try {
      await deleteDog(dogId);
      setDeleteDialogVisible(false);
      onDeleted();
    } catch {
      showDialog('반려견 정보를 지우지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setDeleting(false);
    }
  };

  return {
    closeDeleteDialog,
    confirmDeletion,
    deleting,
    deleteDialogVisible,
    requestDeletion,
  };
}
