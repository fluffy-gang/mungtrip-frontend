import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MungTrip</Text>
        <Text style={styles.description}>온보딩 화면 연결 전 임시 진입 화면입니다.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#111111',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    marginTop: 12,
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
  },
});
