import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="select-menu" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="matching" />
      <Stack.Screen name="tracking" />
      <Stack.Screen name="complete" />
      <Stack.Screen name="review" />
    </Stack>
  );
}
