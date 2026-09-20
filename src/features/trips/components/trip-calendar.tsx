import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import { dateCount, localToday } from '../date-utils';
import { tripColors } from './ui';

/** A tap starts a range; a second tap completes it (same date supports a day trip). */
export function TripCalendar({ startDate, endDate, onCancel, onSelect }: {
  startDate?: string;
  endDate?: string;
  onCancel: () => void;
  onSelect: (start: string, end: string) => void;
}) {
  const [start, setStart] = useState(startDate ?? '');
  const [end, setEnd] = useState(endDate ?? '');
  const [anchor] = useState(() => (startDate || localToday()).slice(0, 7));
  const [months, setMonths] = useState(() => Array.from({ length: 37 }, (_, i) => i - 12));
  const { width } = useWindowDimensions();
  const diameter = Math.min(44, (width - 40 - 72) / 7);
  const cellWidth = (width - 40) / 7;
  const today = localToday();
  const monthInfo = (offset: number) => {
    const first = new Date(`${anchor}-01T00:00:00Z`);
    first.setUTCMonth(first.getUTCMonth() + offset);
    const year = first.getUTCFullYear(), number = first.getUTCMonth();
    const length = new Date(Date.UTC(year, number + 1, 0)).getUTCDate();
    const rows = Math.ceil((first.getUTCDay() + length) / 7);
    return { first, year, number, length, rows, height: 104 + rows * (diameter + 16) };
  };
  const choose = (date: string) => {
    if (!start || end || date < start) { setStart(date); setEnd(''); }
    else setEnd(date);
  };
  const shortDate = (date: string, year = false) => {
    const parts = date.split('-').map(Number);
    return `${year ? `${parts[0]}.` : ''}${parts[1]}.${parts[2]}`;
  };
  return <View style={s.page}>
    <StatusBar style="dark" />
    <View style={s.navigation}>
      <Pressable accessibilityRole="button" accessibilityLabel="뒤로" onPress={onCancel} style={s.back}>
        <Image source={require('../assets/back.svg')} style={{ width: 24, height: 24 }} contentFit="contain" />
      </Pressable>
    </View>
    <View style={s.title}><Text fontSize={20} lineHeight={32} fontWeight="bold">언제 여행을 계획중이신가요?</Text></View>
    <FlatList data={months} initialScrollIndex={12} initialNumToRender={3} windowSize={5}
      keyExtractor={offset => String(offset)} showsVerticalScrollIndicator={false}
      getItemLayout={(_, index) => ({ index, length: monthInfo(months[index]).height, offset: months.slice(0, index).reduce((sum, value) => sum + monthInfo(value).height, 0) })}
      onEndReached={() => setMonths(current => [...current, ...Array.from({ length: 12 }, (_, i) => current[current.length - 1] + i + 1)])}
      onEndReachedThreshold={1}
      renderItem={({ item }) => {
        const { first, year, number, length, rows } = monthInfo(item);
        return <View style={s.month}>
          <View style={s.monthTitle}><Text fontSize={14} lineHeight={20} fontWeight="semibold" color="textSecondary">{year}년 {number + 1}월</Text></View>
          <View style={s.weekdays}>{['일', '월', '화', '수', '목', '금', '토'].map(day => <Text key={day} fontSize={12} lineHeight={16} color="textPlaceholder" style={{ width: cellWidth, textAlign: 'center' }}>{day}</Text>)}</View>
          <View style={s.grid}>
            {Array.from({ length: rows * 7 }, (_, index) => {
              const day = index - first.getUTCDay() + 1;
              if (day < 1 || day > length) return <View key={index} style={{ width: cellWidth, height: diameter + 16 }} />;
              const date = `${year}-${String(number + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const endpoint = date === start || date === end;
              const inside = !!start && !!end && date >= start && date <= end;
              const isToday = date === today;
              return <Pressable key={index} accessibilityRole="button" accessibilityLabel={date} accessibilityState={{ selected: endpoint }} onPress={() => choose(date)} style={{ width: cellWidth, height: diameter + 16, alignItems: 'center' }}>
                {inside && start !== end && <View style={{ position: 'absolute', top: 0, height: diameter, left: date === start ? cellWidth / 2 : 0, right: date === end ? cellWidth / 2 : 0, backgroundColor: tripColors.accentOrangeSubtle }} />}
                <View style={{ width: diameter, height: diameter, borderRadius: diameter / 2, borderTopLeftRadius: diameter / 2, borderTopRightRadius: diameter / 2, borderBottomLeftRadius: diameter / 2, borderBottomRightRadius: diameter / 2, overflow: 'hidden', backgroundColor: endpoint ? tripColors.primary : undefined, justifyContent: 'center', alignItems: 'center' }}>
                  <Text fontSize={12} lineHeight={16} style={{ color: endpoint ? tripColors.onPrimary : isToday ? tripColors.accentBlue : index % 7 === 0 || index % 7 === 6 ? tripColors.danger : tripColors.textSecondary }}>{day}</Text>
                </View>
                {isToday && <Text fontSize={11} lineHeight={16} color="accentBlue">오늘</Text>}
              </Pressable>;
            })}
          </View>
        </View>;
      }} />
    <View style={s.footer}><Button disabled={!dateCount(start, end || start)} onPress={() => onSelect(start, end || start)}>
      {start ? `${shortDate(start, true)}${end && end !== start ? ` ~ ${shortDate(end, start.slice(0, 4) !== end.slice(0, 4))}` : ''} | 일정 등록` : '날짜를 선택해 주세요'}
    </Button></View>
  </View>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: tripColors.calendarBackground },
  navigation: { height: 48, paddingHorizontal: 8 },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: tripColors.surfaceSubtle },
  month: { paddingVertical: 16, paddingHorizontal: 20 },
  monthTitle: { height: 40, justifyContent: 'center' },
  weekdays: { height: 32, flexDirection: 'row', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: { backgroundColor: tripColors.surface, paddingHorizontal: 20, paddingVertical: 12 },
});
