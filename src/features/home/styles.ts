import { StyleSheet } from 'react-native';

import { colors } from './styles/style-primitives';
import { cardsStyles } from './styles/cards';
import { dogsheetStyles } from './styles/dog-sheet';
import { listStyles } from './styles/list';
import { mapStyles } from './styles/map';
import { tabssearchStyles } from './styles/tabs-search';
import { topcontrolsStyles } from './styles/top-controls';

export { colors };

export const styles = StyleSheet.create({
  ...topcontrolsStyles,
  ...mapStyles,
  ...listStyles,
  ...dogsheetStyles,
  ...cardsStyles,
  ...tabssearchStyles,
});
