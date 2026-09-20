import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TagSelectInput, TextInputField } from '@/components/ui/input';

import { reviewStyles } from '../review-styles';
import { styles } from '../styles';
import { StarRating } from './star-rating';
import { ReviewVectorIcon } from './review-vector-icon';

import type { ProfileDog } from '@/features/dogs/types';

export interface ReviewPhoto {
  mimeType: string;
  uri: string;
}

export interface ReviewFormValues {
  content: string;
  dogId: number;
  photos: ReviewPhoto[];
  rating: number;
}

interface ReviewFormProps {
  dogs: ProfileDog[];
  onSubmit: (values: ReviewFormValues) => void;
  placeName: string;
  submitLabel: string;
  submitting?: boolean;
}

/**
 * 리뷰 작성 전용 폼. 수정 API(`PATCH /reviews/{reviewId}`)는 rating/content만 받고
 * 반려견·사진은 바꿀 수 없어, 수정 화면은 이 컴포넌트를 쓰지 않고 별도 UI를 쓴다.
 *
 * 선택한 사진의 로컬 URI와 MIME 타입을 넘기고, 작성 화면에서 presigned 업로드를 수행한다.
 */
export function ReviewForm({ dogs, onSubmit, placeName, submitLabel, submitting }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [dogId, setDogId] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const resolvedDogId = dogId || (dogs[0] ? String(dogs[0].dogId) : '');

  const dogOptions = dogs.map(dog => ({ label: dog.name, value: String(dog.dogId) }));
  const contentError = content.trim() ? undefined : '리뷰 내용을 입력해주세요.';
  const dogError = resolvedDogId ? undefined : '반려견을 선택해주세요.';

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ['images'],
      orderedSelection: true,
      quality: 0.8,
      selectionLimit: 3 - photos.length,
    });

    if (result.canceled) return;

    const selected = result.assets.map(asset => ({
      mimeType: asset.mimeType ?? 'image/jpeg',
      uri: asset.uri,
    }));
    setPhotos(current => [...current, ...selected].slice(0, 3));
  };

  const removePhoto = (uri: string) => {
    setPhotos(current => current.filter(photo => photo.uri !== uri));
  };

  const submit = () => {
    if (contentError || dogError || submitting) return;
    onSubmit({ content: content.trim(), dogId: Number(resolvedDogId), photos, rating });
  };

  return (
    <View style={styles.form}>
      <Text style={reviewStyles.reviewPlaceName}>{placeName}</Text>

      <View style={reviewStyles.ratingField}>
        <Text style={styles.fieldLabel}>별점</Text>
        <StarRating onChange={setRating} rating={rating} />
      </View>

      <View>
        <Text style={styles.fieldLabel}>함께한 반려견</Text>
        <TagSelectInput
          mode="single"
          onChange={value => setDogId(value as string)}
          options={dogOptions}
          value={resolvedDogId}
          variant="outlined"
        />
        {dogError ? <Text style={styles.dangerText}>{dogError}</Text> : null}
      </View>

      <TextInputField
        errorText={contentError}
        label="리뷰 내용"
        multiline
        numberOfLines={5}
        onChange={setContent}
        placeholder="반려견과 함께한 경험을 남겨주세요"
        required
        value={content}
      />

      <View>
        <Text style={styles.fieldLabel}>사진</Text>
        <View style={reviewStyles.photoPickerRow}>
          {photos.map(photo => (
            <View key={photo.uri} style={reviewStyles.photoThumbWrap}>
              <Image source={{ uri: photo.uri }} style={reviewStyles.photoThumb} />
              <Pressable
                accessibilityLabel="사진 삭제"
                accessibilityRole="button"
                onPress={() => removePhoto(photo.uri)}
                style={reviewStyles.photoRemoveBadge}
              >
                <ReviewVectorIcon name="close" size={12} />
              </Pressable>
            </View>
          ))}
          {photos.length < 3 ? (
            <Pressable
              accessibilityLabel="사진 추가"
              accessibilityRole="button"
              onPress={() => void pickPhoto()}
              style={reviewStyles.addPhotoButton}
            >
              <ReviewVectorIcon name="addPhoto" size={22} />
              <Text style={reviewStyles.addPhotoLabel}>{photos.length}/3</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Button disabled={Boolean(contentError || dogError || submitting)} onPress={submit}>
        {submitting ? '저장 중...' : submitLabel}
      </Button>
    </View>
  );
}
