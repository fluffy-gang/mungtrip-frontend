import { Image, type ImageProps } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { getImageSourceIdentity } from '../image-source-identity';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  source: ImageProps['source'];
  fallback: ReactNode;
  unavailableLabel?: string;
}

export function SafeImage({ fallback, source, unavailableLabel = '이미지를 불러올 수 없어요.', ...props }: SafeImageProps) {
  const identity = getImageSourceIdentity(source);
  return <SafeImageContent key={identity} fallback={fallback} source={source} unavailableLabel={unavailableLabel} {...props} />;
}

function SafeImageContent({ fallback, source, unavailableLabel, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed || !source) {
    return (
      <View accessibilityLabel={unavailableLabel} accessibilityRole="image" style={props.style}>
        {fallback}
      </View>
    );
  }
  return <Image {...props} source={source} onError={() => setFailed(true)} />;
}
