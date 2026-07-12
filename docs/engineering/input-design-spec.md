# Input 디자인 명세

이 문서는 Figma 기반 Input / Field 공통 컴포넌트 구현 전에 디자인 값을 기존 token과 매핑하기 위한 기준이다.

- Figma file: `F41ujeugNQiny8VYx8nIa9`
- Button reference: `244:4022`
- Segment, Text, Number, Toggle: `187:2018`
- TagSelect: `187:1688`
- DatePicker: `310:5210`
- Radio: `310:3994`
- CheckBox unselected: `244:3830`
- CheckBox selected: `244:3927`

## Token 기준

Figma의 `colors.gray0`부터 `colors.gray900`까지는 코드에서 `primitive.gray.0`부터 `primitive.gray.900`으로 매핑한다. `coolgray` 색상군은 사용하지 않는다.

Figma에서 관측됐지만 gray scale에 없는 `#E5E5E5`, `#999999`, `#1A1A1A`는 별도 primitive family를 만들지 않고 가장 인접한 token으로 대체한다.

| Figma value | 적용 token |
| --- | --- |
| `#E5E5E5` | `semantic.inputBorder` / `primitive.gray.200` |
| `#999999` | `semantic.inputPlaceholder` / `primitive.gray.500` |
| `#1A1A1A` | `semantic.textPrimary` / `primitive.gray.900` |

## 공통 Field

Field는 label, control, 보조 문구 영역을 세로로 조합한다. 현재 Figma에서 확인된 기본 간격은 label과 control 사이 `8px` 또는 `12px`이며, 폼 화면의 Field 묶음 간격은 `20px`이다.

| 요소 | Figma 값 | 기존 token |
| --- | --- | --- |
| Field label | Pretendard Bold 16 / 24 / -0.32 | `fontFamily.sansSerif`, `fontSize.16`, `fontWeight.bold`, `lineHeight 24` |
| Compact label | Pretendard SemiBold 14 / 20 / -0.28 | `fontFamily.sansSerif`, `fontSize.14`, `fontWeight.semibold`, `lineHeight 20` |
| Label color | `#333D4B` | `semantic.textSecondary` / `primitive.gray.800` |
| Field gap | `8px`, `12px` | `spacing.8`, `spacing.12` |
| Form section gap | `20px` | `spacing.20` |

Helper, error, success 문구는 Figma 노드에서 아직 명시 상태가 관측되지 않았다. 구현 시 `helperText`, `errorText`, `successText`는 동일한 위치를 공유하고, 색상은 별도 Figma 상태 확인 전까지 기존 semantic token만 사용한다.

## Input Variants

### Text

| 요소 | Figma 값 | 기존 token |
| --- | --- | --- |
| Height | `56px`, compact bottom sheet `48px` | `spacing.56`, `spacing.48` |
| Horizontal padding | `16px` | `spacing.16` |
| Radius | `12px` | `radius.12` |
| Border | `1px #E5E5E5` | `semantic.inputBorder` / `primitive.gray.200`로 대체 |
| Placeholder | Pretendard Medium 16 / 24 / -0.32, `#999999` | `semantic.inputPlaceholder` / `primitive.gray.500`로 대체 |
| Compact placeholder | Pretendard Medium 14 / 20 / -0.28, `#B0B8C1` | `fontSize.14`, `fontWeight.medium`, `semantic.textDisabled` |

Text input은 Field와 함께 쓰는 기본 형태이며, standalone 사용 시 label 없이 control만 렌더링한다.

### Number

Number는 Text와 동일한 shell을 사용하고 suffix unit text를 우측에 붙인다.

| 요소 | Figma 값 | 기존 token |
| --- | --- | --- |
| Gap between value and unit | `8px` | `spacing.8` |
| Unit text | Pretendard Bold 16 / 24 / -0.32 | `fontSize.16`, `fontWeight.bold`, `lineHeight 24` |
| Unit color | `#333D4B` | `semantic.textSecondary` / `primitive.gray.800` |

구현 API는 `unitText`를 suffix로 받고, keyboard는 숫자 입력에 맞춘다.

### Segment

Segment는 container 내부에 option을 균등 배치하고 selected option만 흰 배경과 약한 shadow를 가진다.

| 요소 | Figma 값 | 기존 token |
| --- | --- | --- |
| Container height | `48px` | `spacing.48` |
| Container padding | `4px` | `spacing.4` |
| Container background | `#F2F4F6` | `semantic.surfaceSubtle` / `primitive.gray.100` |
| Container radius | `12px` | `radius.12` |
| Option radius | `8px` | `radius.8` |
| Selected background | `#FFFFFF` | `semantic.surface` |
| Selected shadow | `0 2 2 rgba(0,0,0,0.05)` | `shadow.segmentSelected` |
| Selected text | Pretendard Bold 14 / 20 / -0.28, `#333D4B` | `fontSize.14`, `fontWeight.bold`, `semantic.textSecondary` |
| Unselected text | Pretendard SemiBold 14 / 20 / -0.28, `#6B7684` | `fontSize.14`, `fontWeight.semibold`, `semantic.textTertiary` |

### Toggle

Toggle는 label row의 우측에 배치된다. 확인된 off 상태는 `48x28`, track은 gray 계열, knob는 흰 원이다.

| 요소 | Figma 값 | 기존 token |
| --- | --- | --- |
| Toggle size | `48px x 28px` | no size token |
| Row text | Pretendard Medium 14 / 20 / -0.28, `#1A1A1A` | `fontSize.14`, `fontWeight.medium`, `semantic.textPrimary`로 대체 |
| Row layout | text left, switch right | `justify-content: space-between` |

On, disabled 상태는 Figma에서 별도 상태 노드를 확인한 뒤 확정한다.

### TagSelect

TagSelect는 wrap 가능한 pill list이며, `single`과 `multiple` 모두 같은 visual primitive를 공유한다.

| 요소 | Selected | Unselected filled | Unselected outlined |
| --- | --- | --- | --- |
| Height | `40px` | `40px` | `40px` |
| Padding | `16px` horizontal, `8px` vertical | same | same |
| Gap | wrap gap `6px` | same | same |
| Radius | full | full | full |
| Background | `#191F28` | `#F2F4F6` | `#FFFFFF` |
| Border | none | none | `1px #E5E8EB` |
| Text | SemiBold 14 / 20, white | SemiBold 14 / 20, `#333D4B` | SemiBold 14 / 20, `#333D4B` |
| Token | `semantic.inverse`, `semantic.onInverse` | `surfaceSubtle`, `textSecondary` | `surface`, `border`, `textSecondary` |

다중 선택 예시는 성향 필드, 단일 선택 예시는 중성화 여부 필드에서 확인됐다.

### DatePicker

DatePicker는 compact Text shell을 두 개 나란히 배치하는 range 형태가 확인됐다.

| 요소 | Figma 값 | 기존 token |
| --- | --- | --- |
| Field height | `48px` | `spacing.48` |
| Field radius | `12px` | `radius.12` |
| Field border | `1px #E5E5E5` | `semantic.inputBorder` / `primitive.gray.200`로 대체 |
| Inner gap | `8px` | `spacing.8` |
| Icon size | `20px` | no size token |
| Placeholder | Pretendard Medium 14 / 20 / -0.28, `#B0B8C1` | `fontSize.14`, `fontWeight.medium`, `semantic.textDisabled` |
| Pair gap | `8px` | `spacing.8` |

구현은 `date` 단일 모드와 `range` 조합이 가능해야 한다. DatePicker의 실제 선택 UI는 Expo SDK 57 호환 `@react-native-community/datetimepicker`를 사용한다.

### Radio

Radio는 하단 시트 schedule item에서 card/list 형태가 확인됐다. 일반 text label형은 같은 radio circle primitive와 label만 조합한다.

| 요소 | Figma 값 | 기존 token |
| --- | --- | --- |
| Item vertical padding | `12px` | `spacing.12` |
| Item gap | `12px` | `spacing.12` |
| Optional icon block | `40px`, radius `8px`, `#FFF1EB` | `radius.8`, `semantic.accentOrangeMuted` |
| Title | Pretendard SemiBold 16 / 24 / -0.32, `#333D4B` | `fontSize.16`, `fontWeight.semibold`, `semantic.textSecondary` |
| Description | Pretendard Medium 12 / 16 / -0.36, `#B0B8C1` | `fontSize.12`, `fontWeight.medium`, `semantic.textDisabled`, `lineHeight 16` |
| Radio control | `30px` circle asset in Figma | implement as styled primitive, not remote asset |
| Selected color | `#FE6A20` | `semantic.primary` |
| Unselected border | gray border | `semantic.border` |

Radio list는 value가 하나만 선택되는 controlled component로 구현한다.

### CheckBox

CheckBox는 circle type, M size가 확인됐다.

| 요소 | Figma 값 | 기존 token |
| --- | --- | --- |
| Row gap | `10px` | `spacing.10` |
| Control size | `24px` | no size token |
| Label | Pretendard Bold 16 / 24 / -0.32 | `fontSize.16`, `fontWeight.bold`, `lineHeight 24` |
| Label color | `#333D4B` | `semantic.textSecondary` |
| Selected fill | `#FE6A20` | `semantic.primary` |
| Unselected stroke | light gray | `semantic.border` |

Circle checkbox는 Figma asset 대신 React Native primitive로 그린다. 선택 상태는 orange fill 안에 white check, 미선택 상태는 white fill과 gray stroke를 사용한다.

## Button Reference

Button은 Input 내부 pressable, 하단 CTA, 선택 chip의 상태 기준으로 참고한다.

| Variant | Size | State | Figma 값 | 기존 token |
| --- | --- | --- | --- | --- |
| primary | L | default | height `56`, bg `#FE6A20`, radius `16` | `spacing.56`, `semantic.primary`, `radius.16` |
| primary | L | pressed | bg `#CE4F0F` | `semantic.primaryPressed` |
| primary | L | disabled | bg `#E5E8EB` | `semantic.primaryDisabled` |
| primary | M | default | height `48`, bg `#FE6A20` | `spacing.48`, `semantic.primary` |
| sub | L/M | default | white bg, `1px #E5E8EB` | `semantic.surface`, `semantic.border` |
| sub | L/M | pressed | bg `#F2F4F6`, border `#E5E8EB` | `semantic.surfaceSubtle`, `semantic.border` |
| sub | L/M | disabled | bg `#F9FAFB`, border `#E5E8EB` | `primitive.gray.50`, `semantic.border` |

## Token Mapping

### Existing token으로 매핑

| Figma value | Token |
| --- | --- |
| `#FFFFFF` | `semantic.surface`, `primitive.gray.0` |
| `#FE6A20` | `semantic.primary`, `primitive.orange.500` |
| `#CE4F0F` | `semantic.primaryPressed`, `primitive.orange.700` |
| `#F9FAFB` | `primitive.gray.50` |
| `#F2F4F6` | `semantic.surfaceSubtle`, `primitive.gray.100` |
| `#E5E8EB` | `semantic.border`, `semantic.inputBorder`, `primitive.gray.200` |
| `#D1D6DB` | `primitive.gray.300` |
| `#B0B8C1` | `semantic.textDisabled`, `primitive.gray.400` |
| `#8B95A1` | `semantic.textPlaceholder`, `semantic.inputPlaceholder`, `primitive.gray.500` |
| `#6B7684` | `semantic.textTertiary`, `primitive.gray.600` |
| `#4E5968` | `primitive.gray.700` |
| `#333D4B` | `semantic.textSecondary`, `primitive.gray.800` |
| `#191F28` | `semantic.textPrimary`, `primitive.gray.900` |
| `#000000` | `semantic.inverse`, `primitive.black.0` |
| `#FFF4EC` | `semantic.accentOrangeSubtle`, `primitive.orange.50` |
| `#FFF1EB` | `semantic.accentOrangeMuted`, `primitive.orange.100` |
| `rgba(0,0,0,0.55)` | `semantic.overlayScrim` |
| `0 2 2 rgba(0,0,0,0.05)` | `shadow.segmentSelected` |
| `#1C7CFE` | `semantic.accentBlue`, `primitive.blue.500` |
| `4, 6, 8, 10, 12, 16, 20, 24, 48, 56` | existing `spacing` |
| `4, 8, 12, 16, 24, full` | existing `radius` |

### 대체 확정값

이 값들은 Figma에서 관측됐지만 별도 신규 primitive family로 추가하지 않는다. 가장 인접한 color token 또는 semantic token으로 대체한다.

| Figma value | Usage | Recommendation |
| --- | --- | --- |
| `#E5E5E5` | Text/Date input border | `semantic.inputBorder` / `primitive.gray.200` |
| `#999999` | 16px input placeholder | `semantic.inputPlaceholder` / `primitive.gray.500` |
| `#1A1A1A` | Toggle row text, 일부 title | `semantic.textPrimary` |

## 구현 전 결정 사항

- `#E5E5E5`와 `#999999`는 별도 color family를 만들지 않고 가장 인접한 `gray.200`, `gray.500`으로 대체한다.
- DatePicker와 CheckBox는 Expo SDK 57 호환 네이티브 패키지를 사용하되, visual shell은 이 명세의 token mapping을 따른다.
- Figma asset으로 제공된 checkbox/radio icon은 만료 가능한 원격 asset이므로 공통 컴포넌트에서는 styled primitive로 재구성한다.
