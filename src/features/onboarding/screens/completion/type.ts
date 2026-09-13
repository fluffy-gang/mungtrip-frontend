import type { Dog } from '../../types';

export interface DogSummaryCardProps {
  dog: Dog;
  onEdit: () => void;
}
