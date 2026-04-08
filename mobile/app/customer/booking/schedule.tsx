import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { SCHEDULED_BOOKING } from '@/constants/business-rules';

function generateDates(count: number): { label: string; date: string; dayOfWeek: string }[] {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const dates: { label: string; date: string; dayOfWeek: string }[] = [];
  const now = new Date();
  // Start from tomorrow
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    dates.push({
      label: `${month}/${day}`,
      date: d.toISOString().split('T')[0],
      dayOfWeek: days[d.getDay()],
    });
  }
  return dates;
}

const DATES = generateDates(SCHEDULED_BOOKING.MAX_ADVANCE_DAYS);

export default function ScheduleScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const canBook = selectedDate && selectedTime;

  const handleBook = () => {
    if (!canBook) return;
    const dateObj = DATES.find((d) => d.date === selectedDate);
    Alert.alert(
      '日時予約を確定',
      `${dateObj?.label}（${dateObj?.dayOfWeek}） ${selectedTime}で予約しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '予約する',
          onPress: () => {
            router.push({
              pathname: '/customer/booking/select-menu',
              params: { scheduledDate: selectedDate, scheduledTime: selectedTime },
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>日時を指定して予約</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="calendar" size={20} color={Colors.primaryMedium} />
          <Text style={styles.infoText}>
            最大{SCHEDULED_BOOKING.MAX_ADVANCE_DAYS}日先まで予約可能です。
            ご希望の日時を選択してください。
          </Text>
        </View>

        {/* Date Selection */}
        <Text style={styles.sectionLabel}>日付を選択</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScroll}
        >
          {DATES.map((d) => {
            const isSelected = selectedDate === d.date;
            const isWeekend = d.dayOfWeek === '土' || d.dayOfWeek === '日';
            return (
              <TouchableOpacity
                key={d.date}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                onPress={() => setSelectedDate(d.date)}
              >
                <Text style={[
                  styles.dateDow,
                  isSelected && styles.dateDowSelected,
                  isWeekend && !isSelected && { color: Colors.error },
                ]}>
                  {d.dayOfWeek}
                </Text>
                <Text style={[styles.dateLabel, isSelected && styles.dateLabelSelected]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Selection */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>時間を選択</Text>
        <View style={styles.timeGrid}>
          {SCHEDULED_BOOKING.TIME_SLOTS.map((time) => {
            const isSelected = selectedTime === time;
            return (
              <TouchableOpacity
                key={time}
                style={[styles.timeCard, isSelected && styles.timeCardSelected]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected summary */}
        {selectedDate && selectedTime && (
          <View style={styles.selectedSummary}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.selectedText}>
              {DATES.find((d) => d.date === selectedDate)?.label}
              （{DATES.find((d) => d.date === selectedDate)?.dayOfWeek}）
              {' '}{selectedTime} を選択中
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bookButton, !canBook && styles.bookButtonDisabled]}
          onPress={handleBook}
          disabled={!canBook}
        >
          <Ionicons name="calendar-outline" size={20} color={Colors.white} />
          <Text style={styles.bookButtonText}>この日時でメニューを選ぶ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  content: { padding: Spacing.lg, paddingBottom: 140 },

  // Info
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.primaryFaint,
    padding: Spacing.md, borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl, gap: Spacing.sm,
  },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.primaryLight, lineHeight: 20 },

  sectionLabel: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Dates
  dateScroll: { gap: Spacing.sm, paddingRight: Spacing.lg },
  dateCard: {
    width: 64, height: 72,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  dateCardSelected: {
    borderColor: Colors.primary, backgroundColor: Colors.primary,
  },
  dateDow: {
    fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMuted,
    marginBottom: 4,
  },
  dateDowSelected: { color: Colors.primaryPale },
  dateLabel: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary,
  },
  dateLabelSelected: { color: Colors.white },

  // Times
  timeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
  },
  timeCard: {
    width: '22%',
    backgroundColor: Colors.card,
    borderWidth: 2, borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  timeCardSelected: {
    borderColor: Colors.primary, backgroundColor: Colors.primaryFaint,
  },
  timeText: {
    fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary,
  },
  timeTextSelected: { color: Colors.primary, fontWeight: '700' },

  // Selected summary
  selectedSummary: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: Spacing.md, borderRadius: BorderRadius.md,
    marginTop: Spacing.lg, gap: Spacing.sm,
  },
  selectedText: {
    fontSize: FontSize.md, fontWeight: '600', color: '#166534',
  },

  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, padding: Spacing.lg, paddingBottom: Spacing.xxl,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    shadowColor: Colors.shadowDark, shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  bookButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16, borderRadius: BorderRadius.md, gap: Spacing.sm,
  },
  bookButtonDisabled: { opacity: 0.4 },
  bookButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
});
