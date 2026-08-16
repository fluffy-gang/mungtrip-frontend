import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { styles } from '../styles';

interface DogAvatarProps {
  imageUrl?: string;
  large?: boolean;
}

export function DogAvatar({ imageUrl, large = false }: DogAvatarProps) {
  const imageStyle = large ? styles.detailImage : styles.dogImage;
  const placeholderStyle = large
    ? [styles.detailImage, styles.dogImagePlaceholder]
    : styles.dogImagePlaceholder;

  if (imageUrl) {
    return <Image contentFit="cover" source={{ uri: imageUrl }} style={imageStyle} />;
  }

  return (
    <View style={placeholderStyle}>
      <SymbolView
        name={{ android: 'pets', ios: 'pawprint.fill', web: 'pets' }}
        size={large ? 42 : 24}
        tintColor="#8B95A1"
      />
    </View>
  );
}
