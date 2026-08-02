import type {
  FontFamilyToken,
  FontSizeToken,
  FontWeightToken,
  SemanticColorName,
} from '@/constants/tokens';

export interface TextProps {
  color?: SemanticColorName;
  fontFamily?: FontFamilyToken;
  fontSize?: FontSizeToken;
  fontWeight?: FontWeightToken;
  lineHeight?: number;
}
