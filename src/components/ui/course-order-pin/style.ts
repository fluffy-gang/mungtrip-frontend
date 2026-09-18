import { Image } from 'expo-image';
import { styled } from 'styled-components/native';

import { Text } from '@/components/ui/text';

export const PinRoot = styled.View<{ $variant: 'list' | 'map' }>`
  height: ${({ $variant }) => ($variant === 'map' ? 41 : 32)}px;
  position: relative;
  width: ${({ $variant }) => ($variant === 'map' ? 44 : 32)}px;
`;

export const PinImage = styled(Image)`
  height: 100%;
  width: 100%;
`;

export const PinLabel = styled(Text).attrs({
  color: 'onPrimary',
  fontSize: 12,
  fontWeight: 'bold',
  lineHeight: 16,
})<{ $variant: 'list' | 'map' }>`
  left: ${({ $variant }) => ($variant === 'list' ? -1 : 0)}px;
  position: absolute;
  text-align: center;
  top: ${({ $variant }) => ($variant === 'map' ? 17 : 12)}px;
  width: 100%;
`;
