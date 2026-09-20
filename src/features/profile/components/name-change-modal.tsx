import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { showDialog } from '@/components/ui/dialog';
import { TextInputField } from '@/components/ui/input';

import { updateMyProfile } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/authStore';
import { getApiErrorMessage } from '@/shared/api/error';
import { styles } from '../styles';

interface NameChangeModalProps {
  currentName: string;
  onClose: () => void;
  visible: boolean;
}

const nicknamePattern = /^[0-9A-Za-z가-힣]+$/;

export function NameChangeModal({ currentName, onClose, visible }: NameChangeModalProps) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const updateUser = useAuthStore(state => state.updateUser);
  const nickname = name.trim();
  const errorText = !nickname
    ? '닉네임을 입력해주세요.'
    : nickname.length > 10
      ? '닉네임은 최대 10자까지 입력할 수 있어요.'
      : !nicknamePattern.test(nickname)
        ? '닉네임은 공백·특수문자 없이 입력해주세요.'
        : undefined;

  const handleSave = async () => {
    if (errorText || saving) return;

    setSaving(true);
    try {
      await updateMyProfile({ nickname });
      updateUser({ nickname });
      onClose();
    } catch (error) {
      showDialog('이름을 변경하지 못했어요', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.modalOverlay}>
        <Pressable onPress={event => event.stopPropagation()} style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>이름 변경</Text>
            <Pressable accessibilityLabel="닫기" accessibilityRole="button" onPress={onClose}>
              <SymbolView
                name={{ android: 'close', ios: 'xmark', web: 'close' }}
                size={20}
                tintColor="#191F28"
              />
            </Pressable>
          </View>
          <TextInputField errorText={errorText} onChange={setName} value={name} />
          <Button disabled={Boolean(errorText || saving)} onPress={() => void handleSave()}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
