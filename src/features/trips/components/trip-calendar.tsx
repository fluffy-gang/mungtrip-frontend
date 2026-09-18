import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import { dateCount, formatDate, localToday } from '../date-utils';
import { tripColors, Chip, Column, Footer, Header, Heading, Row, Spread } from './ui';
export function TripCalendar({ startDate, endDate, onCancel, onSelect }: {
  startDate?: string;
  endDate?: string;
  onCancel: () => void;
  onSelect: (start: string, end: string) => void;
}) {
  const [start, setStart] = useState(startDate ?? '');
  const [end, setEnd] = useState(endDate ?? '');
  const [range, setRange] = useState(startDate !== endDate);
  const [month, setMonth] = useState(() => (startDate || localToday()).slice(0, 7));
  const shift = (offset: number) => {
    const date = new Date(`${month}-01T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + offset);
    if (date.getUTCFullYear() > 1900 && date.getUTCFullYear() < 2200)
      setMonth(date.toISOString().slice(0, 7));
  };
  const choose = (date: string) => {
    if (!range) {
      setStart(date);
      setEnd(date);
    }
    else if (!start || end || date < start) {
      setStart(date);
      setEnd('');
    }
    else
      setEnd(date);
  };
  const renderMonth = (offset: number) => {
    const first = new Date(`${month}-01T00:00:00Z`);
    first.setUTCMonth(first.getUTCMonth() + offset);
    const year = first.getUTCFullYear(), number = first.getUTCMonth();
    const length = new Date(Date.UTC(year, number + 1, 0)).getUTCDate();
    const cells = Array.from({ length: Math.ceil((first.getUTCDay() + length) / 7) * 7 }, (_, index) => index - first.getUTCDay() + 1);
    return <Column key={offset} style={{ padding: 20 }}>
      <Heading>{year}년 {number + 1}월</Heading>
      <Row>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => <Text key={index} color="textPlaceholder" fontSize={12} style={{ width: '12.5%', textAlign: 'center' }}>
          {day}
        </Text>)}
      </Row>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, index) => {
          const date = `${year}-${String(number + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const valid = day > 0 && day <= length;
          const endpoint = date === start || date === end;
          const inside = valid && !!start && !!end && date >= start && date <= end;
          return <Pressable key={index} disabled={!valid} accessibilityRole="button" accessibilityLabel={valid ? date : undefined} accessibilityState={{ selected: endpoint }} onPress={() => choose(date)} style={{ width: `${100 / 7}%`, height: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: inside ? tripColors.accentOrangeSubtle : undefined }}>

            {valid ? <View style={{ width: 38, height: 38, borderRadius: 19, borderTopLeftRadius: 19, borderTopRightRadius: 19, borderBottomLeftRadius: 19, borderBottomRightRadius: 19, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: endpoint ? tripColors.primary : undefined }}>
              <Text fontSize={14} color={endpoint ? 'onPrimary' : 'textPrimary'}>{day}</Text>
            </View> : null}

          </Pressable>;
        })}
      </View>
    </Column>;
  };
  return <View style={{ flex: 1 }}>
    <Header title="여행 일정" onBack={onCancel} />
    <Column style={{ paddingHorizontal: 20 }}>
      <Heading>언제 여행을 계획중이신가요?</Heading>
      <Row>
        <Chip selected={!range} onPress={() => { setRange(false); setEnd(start); }}>하루</Chip>
        <Chip selected={range} onPress={() => { setRange(true); setEnd(''); }}>기간</Chip>
      </Row>
      <Spread>
        <Button type="ghost" size="m" onPress={() => shift(-1)}>이전 달</Button>
        <Button type="ghost" size="m" onPress={() => shift(1)}>다음 달</Button>
      </Spread>
    </Column>
    <ScrollView>{renderMonth(0)}{renderMonth(1)}</ScrollView>
    <Footer>
      <Button disabled={!dateCount(start, end || start)} onPress={() => onSelect(start, end || start)}>
        {start ? `${formatDate(start)}${end && end !== start ? ` ~ ${formatDate(end)}` : ''} 일정 등록` : '날짜를 선택해 주세요'}
      </Button>
    </Footer>
  </View>;
}
