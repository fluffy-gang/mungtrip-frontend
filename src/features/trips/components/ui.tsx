import { Image } from 'expo-image';
import { isValidElement } from 'react';
import { Pressable, View } from 'react-native';
import { styled } from 'styled-components/native';


import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { tokens } from '@/constants/tokens';
import { tagLabel } from '../categories';

import type { TripPlaceSelection } from '../types';
import type { ReactNode } from 'react';
export const tripColors = { ...tokens.colors.semantic.light, calendarBackground: tokens.colors.primitive.gray[50], danger: '#F04452' };

export const Page = styled.View`flex: 1; background-color: ${({ theme }) => theme.colors.semantic.light.background};`;
export const Column = styled.View`gap: 12px;`;
export const Row = styled.View`flex-direction: row; align-items: center; gap: 8px;`;
export const Spread = styled(Row)`justify-content: space-between;`;
export const Content = styled.View`padding: 20px; gap: 20px;`;
export const Center = styled.View`flex: 1; align-items: center; justify-content: center; padding: 24px; gap: 16px;`;
export const Card = styled.View`background-color: ${({ theme }) => theme.colors.semantic.light.surface}; border-radius: 16px; padding: 16px; gap: 16px; border-width: 1px; border-color: ${({ theme }) => theme.colors.primitive.gray[100]};`;
export const Muted = styled(Text).attrs({ color: 'textTertiary', fontSize: 12 })``;
export const Heading = styled(Text).attrs({ fontSize: 18, fontWeight: 'bold' })``;
export const SmallTitle = styled(Text).attrs({ fontSize: 14, fontWeight: 'semibold' })``;
export const Scrim = styled.View`flex: 1; background-color: ${({ theme }) => theme.colors.semantic.light.overlayScrim}; justify-content: flex-end;`;
export const Sheet = styled.View`background-color: ${({ theme }) => theme.colors.semantic.light.surface}; border-top-left-radius: 24px; border-top-right-radius: 24px; padding: 20px; gap: 20px; max-height: 92%;`;
export const Footer = styled.View`padding: 16px 20px; background-color: ${({ theme }) => theme.colors.semantic.light.surface}; gap: 8px; border-top-width: 1px; border-top-color: ${({ theme }) => theme.colors.semantic.light.border};`;
export const ChipRoot = styled.Pressable<{
  $selected: boolean;
}> `border-width: 1px; border-color: ${({ theme, $selected }) => $selected ? theme.colors.semantic.light.primary : theme.colors.semantic.light.border}; background-color: ${({ theme, $selected }) => $selected ? theme.colors.semantic.light.accentOrangeSubtle : theme.colors.semantic.light.surface}; border-radius: 24px; padding: 10px 14px;`;
export function Chip({ selected, children, onPress, disabled }: {
  selected: boolean;
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return <ChipRoot $selected={selected} accessibilityRole="button" accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress}>
    {isValidElement(children) ? children : <Text fontSize={14} color={selected ? 'primary' : 'textSecondary'}>{children}</Text>}
  </ChipRoot>;
}
export function Header({ title, onBack, right }: {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return <Spread style={{ minHeight: 56, paddingHorizontal: 20 }}>

    {onBack ? <Pressable accessibilityRole="button" accessibilityLabel="뒤로" onPress={onBack} hitSlop={12}>
      <Icon name="chevronLeft" size={24} />
    </Pressable> : <View />}

    {title ? <Heading>{title}</Heading> : null}
    {right ?? <View style={{ width: 24 }} />}

  </Spread>;
}
export function ErrorNotice({ message, onRetry }: {
  message?: string | null;
  onRetry?: () => void;
}) {
  if (!message)
    return null;
  return <Column accessibilityLiveRegion="polite">
    <Text color="primaryPressed" fontSize={14}>{message}</Text>
    {onRetry ? <Button type="ghost" size="m" onPress={onRetry}>다시 시도</Button> : null}
  </Column>;
}
const fixtureImages: Record<string, number> = {
  'mock://fixture-1': require('../assets/fixture-1.webp'),
  'mock://fixture-2': require('../assets/fixture-2.webp'),
  'mock://fixture-3': require('../assets/fixture-3.webp'),
};
export function Thumbnail({ uri, size = 88 }: {
  uri?: string;
  size?: number;
}) {
  return uri ? <Image source={fixtureImages[uri] ?? { uri }} contentFit="cover" style={{ width: size, height: size, borderRadius: 8 }} />
    : <View accessibilityLabel="이미지 없음" style={{ width: size, height: size, borderRadius: 8, backgroundColor: tripColors.surfaceSubtle, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="paw" size={Math.min(size / 2, 24)} tintColor={tripColors.textDisabled} />
    </View>;
}


export function PlaceFacts({ place }: { place?: TripPlaceSelection }) {
  if (!place) return null;
  return <Column style={{ gap: 4 }}>
    {place.tags?.length ? <Row style={{ flexWrap: 'wrap' }}>{place.tags.map(tag => <View key={tag} style={{ borderRadius: 4, paddingHorizontal: 4, backgroundColor: tripColors.surfaceSubtle }}><Muted>{tagLabel(tag)}</Muted></View>)}</Row> : null}
    {place.isOfficial ? <Text fontSize={12} color="accentBlue">✓ 공식인증</Text> : null}
    {place.averageRating !== undefined ? <Muted>★ {place.averageRating.toFixed(1)}</Muted> : null}
    {place.visitCount !== undefined ? <Muted>방문 {place.visitCount}회</Muted> : null}
  </Column>;
}
