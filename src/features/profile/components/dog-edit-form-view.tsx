import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import {
  NumberInputField,
  SegmentInput,
  TagSelectInput,
  TextInputField,
  ToggleInput,
} from '@/components/ui/input';
import { ScreenHeader } from '@/components/ui/screen-header';

import { tokens } from '@/constants/tokens';
import { DogAvatar } from './dog-avatar';
import { DogEditSheet } from './dog-edit-sheet';
import { dogSizeOptions } from './dog-edit-form-types';
import { NeuteredStatusSelector } from './neutered-status-selector';
import { dogEditStyles } from '../dog-edit-styles';
import { styles } from '../styles';

import type { DogSize, ProfileDog } from '@/features/dogs/types';
import type { DogEditableField, DogEditableFieldAction } from './dog-edit-form-types';
import type { NeuteredStatus } from './neutered-status-selector';

interface DogEditFormViewProps {
  activeField: DogEditableField;
  breed: string;
  deleting: boolean;
  dog: ProfileDog;
  draftPersonalityIds: string[];
  draftSize: DogSize;
  draftText: string;
  draftWeight: string;
  isDangerousDog: boolean;
  neuteredStatus: NeuteredStatus;
  onBack: () => void;
  onCloseSheet: () => void;
  onOpenField: (field: DogEditableFieldAction) => void;
  onPickImage: () => void;
  onSaveSheet: () => void;
  onSelectPersonality: (ids: string[]) => void;
  onSelectSize: (size: DogSize) => void;
  onSetDraftText: (text: string) => void;
  onSetDraftWeight: (weight: string) => void;
  onToggleDangerousDog: (value: boolean) => void;
  onUpdateNeuteredStatus: (status: NeuteredStatus) => void;
  pendingImageUri?: string;
  personalityLabel: string;
  personalityOptions: { label: string; value: string }[];
  requestDeletion: () => void;
  saving: boolean;
  sheetDisabled: boolean;
  sheetTitle: string;
  sizeLabel: string;
  uploadingImage: boolean;
  weight: string;
}

/** Presentational composition for dog edits; persistence stays in DogEditForm. */
export function DogEditFormView({
  activeField,
  breed,
  deleting,
  dog,
  draftPersonalityIds,
  draftSize,
  draftText,
  draftWeight,
  isDangerousDog,
  neuteredStatus,
  onBack,
  onCloseSheet,
  onOpenField,
  onPickImage,
  onSaveSheet,
  onSelectPersonality,
  onSelectSize,
  onSetDraftText,
  onSetDraftWeight,
  onToggleDangerousDog,
  onUpdateNeuteredStatus,
  pendingImageUri,
  personalityLabel,
  personalityOptions,
  requestDeletion,
  saving,
  sheetDisabled,
  sheetTitle,
  sizeLabel,
  uploadingImage,
  weight,
}: DogEditFormViewProps) {
  return (
    <>
      <ScrollView contentContainerStyle={dogEditStyles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          onBack={onBack}
          rightAction={
            <Pressable
              accessibilityRole="button"
              disabled={saving || deleting}
              onPress={requestDeletion}
              style={styles.headerDeleteButton}
            >
              <Text style={styles.headerDeleteText}>지우기</Text>
            </Pressable>
          }
          title="반려견 정보 수정"
        />
        <View style={dogEditStyles.avatarWrap}>
          <Pressable
            accessibilityLabel="반려견 사진 변경"
            accessibilityRole="button"
            disabled={uploadingImage || saving}
            onPress={onPickImage}
            style={styles.avatarEditWrap}
          >
            <DogAvatar imageUrl={pendingImageUri ?? dog.imageUrl} large />
            {uploadingImage ? (
              <View style={styles.avatarUploadOverlay}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            ) : (
              <View style={dogEditStyles.avatarBadge}>
                <SymbolView
                  name={{ android: 'edit', ios: 'pencil', web: 'edit' }}
                  size={18}
                  tintColor={tokens.colors.semantic.light.textSecondary}
                />
              </View>
            )}
          </Pressable>
        </View>
        <View style={dogEditStyles.rows}>
          <EditRow label="견종" onPress={() => onOpenField('breed')} value={breed} />
          <EditRow label="이름" onPress={() => onOpenField('name')} value={dog.name} />
          <EditRow label="사이즈" onPress={() => onOpenField('size')} value={sizeLabel} />
          <EditRow
            label="몸무게"
            onPress={() => onOpenField('size')}
            value={weight ? `${weight}kg` : '없음'}
          />
          <EditRow label="성향" onPress={() => onOpenField('personality')} value={personalityLabel} />
          <View style={dogEditStyles.inlineSelectionRow}>
            <Text style={dogEditStyles.label}>중성화</Text>
            <NeuteredStatusSelector
              disabled={saving}
              onChange={onUpdateNeuteredStatus}
              value={neuteredStatus}
            />
          </View>
          <View style={dogEditStyles.toggleRow}>
            <ToggleInput
              label="맹견 여부"
              onChange={onToggleDangerousDog}
              value={isDangerousDog}
            />
          </View>
        </View>
      </ScrollView>
      <DogEditSheet
        disabled={sheetDisabled}
        onClose={onCloseSheet}
        onSave={onSaveSheet}
        title={sheetTitle}
        visible={activeField !== null}
      >
        {activeField === 'name' ? (
          <TextInputField autoFocus onChange={onSetDraftText} placeholder="이름" value={draftText} />
        ) : null}
        {activeField === 'size' ? (
          <>
            <SegmentInput onChange={onSelectSize} options={dogSizeOptions} value={draftSize} />
            <NumberInputField
              onChange={onSetDraftWeight}
              placeholder="몸무게를 입력해주세요(선택)"
              unitText="kg"
              value={draftWeight}
            />
          </>
        ) : null}
        {activeField === 'personality' ? (
          <TagSelectInput
            mode="multiple"
            onChange={value => onSelectPersonality(value as string[])}
            options={personalityOptions}
            value={draftPersonalityIds}
          />
        ) : null}
      </DogEditSheet>
    </>
  );
}

function EditRow({ label, onPress, value }: { label: string; onPress: () => void; value: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={dogEditStyles.row}>
      <Text style={dogEditStyles.label}>{label}</Text>
      <Text numberOfLines={1} style={dogEditStyles.value}>
        {value}
      </Text>
      <SymbolView
        name={{ android: 'chevron_right', ios: 'chevron.right', web: 'chevron_right' }}
        size={14}
        tintColor={tokens.colors.semantic.light.textDisabled}
      />
    </Pressable>
  );
}
