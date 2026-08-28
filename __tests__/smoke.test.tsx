import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { tokens } from '@/constants/tokens';

it('renders with the project alias', async () => {
  await render(<Text>{tokens.colors.semantic.light.primary}</Text>);

  expect(screen.getByText('#FE6A20')).toBeTruthy();
});
