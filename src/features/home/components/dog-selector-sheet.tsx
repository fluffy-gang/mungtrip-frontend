import { useState } from 'react';
import { Modal, Pressable, Switch, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, styles } from '../styles';

import type { HomeDogProfile } from '../types';

interface DogSelectorSheetProps {
  dogs: HomeDogProfile[];
  onClose: () => void;
  onSave: (dogIds: number[]) => void;
  selectedDogIds: number[];
}

export function DogSelectorSheet({
  dogs,
  onClose,
  onSave,
  selectedDogIds,
}: DogSelectorSheetProps) {
  const insets = useSafeAreaInsets();
  const [draftDogIds, setDraftDogIds] = useState(selectedDogIds);

  const toggleDraftDog = (dogId: number) => {
    setDraftDogIds(currentDogIds => {
      const isSelected = currentDogIds.includes(dogId);

      return isSelected
        ? currentDogIds.filter(currentDogId => currentDogId !== dogId)
        : [...currentDogIds, dogId];
    });
  };

  const saveDraft = () => {
    onSave(draftDogIds);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={styles.modalDismissArea}
        />
        <View style={[styles.dogSheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.dogSheetHeader}>
            <Text style={styles.dogSheetTitle}>반려견 동행 설정</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.dogSheetCloseButton}
            >
              <SymbolView name={{ android: 'close', ios: 'xmark', web: 'close' }} size={20} tintColor="#4E5968" />
            </Pressable>
          </View>

          {dogs.map(dog => {
            const isSelected = draftDogIds.includes(dog.id);

            return (
              <View key={dog.id} style={styles.dogOptionRow}>
                <Image
                  contentFit="cover"
                  source={{ uri: dog.imageUrl }}
                  style={styles.dogOptionImage}
                />
                <View style={styles.dogOptionBody}>
                  <View style={styles.dogInfoLine}>
                    <Text style={styles.dogInfoLabel}>이름</Text>
                    <Text style={styles.dogInfoValue}>{dog.name}</Text>
                  </View>
                  <View style={styles.dogInfoLine}>
                    <Text style={styles.dogInfoLabel}>종</Text>
                    <Text style={styles.dogInfoValue}>{dog.breed}</Text>
                  </View>
                  <View style={styles.dogInfoLine}>
                    <Text style={styles.dogInfoLabel}>맹견</Text>
                    <Text style={styles.dogInfoValue}>
                      {dog.isDangerousDog ? '해당' : '해당없음'}
                    </Text>
                  </View>
                </View>
                <Switch
                  ios_backgroundColor={colors.surfaceMuted}
                  onValueChange={() => toggleDraftDog(dog.id)}
                  thumbColor={colors.surface}
                  trackColor={{
                    false: colors.surfaceMuted,
                    true: colors.primary,
                  }}
                  value={isSelected}
                />
              </View>
            );
          })}

          <View style={styles.dogSheetActions}>
            <Pressable accessibilityRole="button" style={styles.dogEditButton}>
              <Text style={styles.dogEditButtonText}>정보 수정</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={saveDraft}
              style={styles.dogSaveButton}
            >
              <Text style={styles.dogSaveButtonText}>저장</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
