import { styled } from 'styled-components/native';

export const StyledScreen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.semantic.light.background};
`;
