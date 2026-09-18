import { Image } from 'expo-image';

const SOURCES = {
  addPhoto: require('../assets/review-add-photo.svg'),
  close: require('../assets/review-close.svg'),
  empty: require('../assets/review-empty.svg'),
  more: require('../assets/review-more.svg'),
  paw: require('../assets/review-paw.svg'),
  placePlaceholder: require('../assets/review-place-placeholder.svg'),
} as const;

export type ReviewVectorIconName = keyof typeof SOURCES;

interface ReviewVectorIconProps {
  name: ReviewVectorIconName;
  size: number;
}

/** Review surfaces share fixed-color SVG assets instead of platform-specific symbols. */
export function ReviewVectorIcon({ name, size }: ReviewVectorIconProps) {
  return <Image contentFit="contain" source={SOURCES[name]} style={{ height: size, width: size }} />;
}
