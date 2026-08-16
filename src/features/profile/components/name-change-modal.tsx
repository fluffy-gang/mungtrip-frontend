import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextInputField } from '@/components/ui/input';

import { styles } from '../styles';

interface NameChangeModalProps {
  currentName: string;
  onClose: () => void;
  visible: boolean;
}

export function NameChangeModal({ currentName, onClose, visible }: NameChangeModalProps) {
  const [name, setName] = useState(currentName);

  const handleSave = () => {
    // TODO(#11): 닉네임 변경 API가 없어 저장은 아직 지원하지 않는다.
    Alert.alert('아직 지원되지 않는 기능이에요', '이름 변경은 곧 지원될 예정이에요.');
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
          <TextInputField onChange={setName} value={name} />
          <Button onPress={handleSave}>저장</Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
