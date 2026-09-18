/** Codes and labels verified against the place category API; unknown codes remain visible. */
export const TRIP_CATEGORIES = [
  ['', '전체'], ['RESTAURANT', '식당'], ['CAFE', '카페'], ['ATTRACTION', '관광지'],
  ['ACCOMMODATION', '동반숙소'], ['HOSPITAL', '동물병원'], ['ACTIVITY', '놀거리/액티비티'],
  ['GROOMING', '미용실'], ['CARE', '돌봄'], ['SHOPPING', '쇼핑'], ['TRAINING', '훈련소'], ['FACILITY', '편의시설'],
] as const;
export const categoryLabel = (code: string): string => TRIP_CATEGORIES.find(item => item[0] === code)?.[1] ?? code;

// Labels verified with the same current-day catalog as category codes.
const tagLabels: Readonly<Record<string, string>> = {
  "SMALL_DOG": "소형견",
  "MEDIUM_DOG": "중형견",
  "LARGE_DOG": "대형견",
  "INDOOR": "실내",
  "OUTDOOR": "실외",
  "PRIVATE_SPACE": "전용 공간",
  "PET_MENU": "반려견 메뉴",
  "WATER_PROVIDED": "물 제공",
  "POOP_BAG_PROVIDED": "배변봉투 제공",
  "POOP_BAG_REQUIRED": "배변봉투 필수",
  "OFF_LEASH": "오프리쉬 가능",
  "LEASH_REQUIRED": "목줄 필수",
  "CARRIER_REQUIRED": "이동장 필수",
  "NO_DANGEROUS_DOG": "맹견 제한",
  "VACCINATION_RECOMMENDED": "예방접종 권장",
  "PARKING_AVAILABLE": "주차 가능",
  "RESERVATION_AVAILABLE": "예약 가능"
};
export const tagLabel = (code: string): string => tagLabels[code] ?? code;
