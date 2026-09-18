import { colors, text, radius, borderWidth, spacing } from './style-primitives';

export const dogsheetStyles = {
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  dogSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius[24],
    borderTopRightRadius: radius[24],
    paddingHorizontal: spacing[20],
    paddingTop: spacing[20],
    zIndex: 1,
  },
  dogSheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[16],
  },
  dogSheetTitle: text(18, 'bold', 'textPrimary'),
  dogSheetCloseButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  dogOptionRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: borderWidth.hairline,
    flexDirection: 'row',
    gap: spacing[12],
    minHeight: 104,
    paddingVertical: spacing[12],
  },
  dogOptionImage: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    height: 72,
    width: 72,
  },
  dogOptionImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dogOptionBody: {
    flex: 1,
    gap: spacing[6],
  },
  dogInfoLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[12],
  },
  dogInfoLabel: {
    ...text(12, 'medium', 'textTertiary'),
    width: 32,
  },
  dogInfoValue: {
    ...text(14, 'bold', 'textPrimary'),
    flex: 1,
  },
  dogSheetActions: {
    flexDirection: 'row',
    gap: spacing[8],
    marginTop: spacing[24],
  },
  dogEditButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius[12],
    borderWidth: borderWidth[1],
    flex: 1,
    height: 52,
    justifyContent: 'center',
  },
  dogEditButtonText: text(14, 'bold', 'textSecondary'),
  dogSaveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius[12],
    flex: 1,
    height: 52,
    justifyContent: 'center',
  },
  dogSaveButtonText: text(14, 'bold', 'onPrimary'),
} as const;
