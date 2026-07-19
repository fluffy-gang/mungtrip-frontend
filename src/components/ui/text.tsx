import { styled } from 'styled-components/native';

import type {
  FontFamilyToken,
  FontSizeToken,
  FontWeightToken,
  SemanticColorName,
} from '@/constants/tokens';

interface TextProps {
  color?: SemanticColorName;
  fontFamily?: FontFamilyToken;
  fontSize?: FontSizeToken;
  fontWeight?: FontWeightToken;
  lineHeight?: number;
}

export const Text = styled.Text<TextProps>`
  /* fontSize 하나가 대응하는 letterSpacing까지 함께 결정한다. */
  color: ${({ color = 'textPrimary', theme }) => theme.colors.semantic.light[color]};
  font-family: ${({ fontFamily = 'sansSerif', theme }) => theme.fonts[fontFamily]};
  font-size: ${({ fontSize = 16, theme }) => theme.typography.fontSize[fontSize].fontSize}px;
  font-weight: ${({ fontWeight = 'medium', theme }) => theme.typography.fontWeight[fontWeight]};
  line-height: ${({ fontSize = 16, lineHeight, theme }) =>
    lineHeight ?? theme.typography.fontSize[fontSize].fontSize}px;
  letter-spacing: ${({ fontSize = 16, theme }) => theme.typography.fontSize[fontSize].letterSpacing}px;
`;
