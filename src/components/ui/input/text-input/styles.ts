import { TextInput } from 'react-native';
import { styled } from 'styled-components/native';

export const StyledTextInput = styled(TextInput).attrs({
  style: {
    outlineStyle: 'none',
  } as never,
})`
  color: ${({ theme }) => theme.colors.semantic.light.textPrimary};
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size: ${({ theme }) => theme.typography.fontSize[16].fontSize}px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: ${({ theme }) => theme.typography.fontSize[16].letterSpacing}px;
  line-height: 24px;
  min-width: 0;
  padding: 0;
`;
