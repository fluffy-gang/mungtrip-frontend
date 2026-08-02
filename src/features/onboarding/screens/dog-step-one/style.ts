import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

export const styles = StyleSheet.create({
  breedCard: {
    alignItems: 'center',
    borderColor: tokens.colors.semantic.light.border,
    borderRadius: tokens.radius[16],
    borderWidth: 1,
    height: 80,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 80,
  },
  breedCardSelected: {
    borderColor: tokens.colors.semantic.light.primary,
    borderWidth: 2,
  },
  breedCarousel: {
    width: '100%',
  },
  breedItem: {
    alignItems: 'center',
    gap: tokens.spacing[8],
    width: 96,
  },
  breedList: {
    gap: tokens.spacing[4],
  },
  breedPreview: {
    alignItems: 'center',
    height: 232,
    justifyContent: 'center',
  },
  breedPreviewImage: {
    borderRadius: 0,
    height: 200,
    marginVertical: tokens.spacing[16],
    width: 288,
  },
  breedSection: {
    width: '100%',
  },
  breedThumbnail: {
    borderRadius: tokens.radius[16],
    height: 80,
    width: 80,
  },
  centerText: {
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
  horizontalButtons: {
    flexDirection: 'row',
    gap: tokens.spacing[8],
  },
  secondaryButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  stepTitle: {
    paddingHorizontal: tokens.spacing[20],
    paddingTop: tokens.spacing[32],
  },
});
