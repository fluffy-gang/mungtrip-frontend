import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BOTTOM_TAB_HEIGHT, BottomTabBar } from '@/components/navigation/bottom-tab-bar';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatePanel } from '@/components/ui/state-panel';
import { useAuthStore } from '@/features/auth/authStore';
import { MOCK_USER } from '@/features/auth/mock/user';
import { useAuth } from '@/features/auth/useAuth';

import { DogAvatar } from '../components/dog-avatar';
import { NameChangeModal } from '../components/name-change-modal';
import { useDogs } from '../hooks/use-dogs';
import { styles } from '../styles';

const showComingSoon = () => {
  Alert.alert('아직 지원되지 않는 기능이에요', '곧 만나보실 수 있어요.');
};

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const setMockLogin = useAuthStore(state => state.setMockLogin);
  const { handleLogout } = useAuth();
  const { dogs, hasError, loading, retry } = useDogs(isLoggedIn);
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const displayName = user?.nickname ?? user?.name ?? '프로필';
  const bottomTabHeight = insets.bottom + BOTTOM_TAB_HEIGHT;

  const confirmLogout = () => {
    Alert.alert('로그아웃할까요?', '현재 기기에 저장된 로그인 정보가 삭제됩니다.', [
      { style: 'cancel', text: '취소' },
      {
        style: 'destructive',
        text: '로그아웃',
        onPress: () => {
          void handleLogout().then(() => router.replace('/'));
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomTabHeight + 16 }]}
      >
        <ScreenHeader title="프로필" />

        {isLoggedIn ? (
          <View style={styles.profileCard}>
            {user?.profileImageUrl ? (
              <Image
                contentFit="cover"
                source={{ uri: user.profileImageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <SymbolView
                  name={{ android: 'person', ios: 'person.fill', web: 'person' }}
                  size={32}
                  tintColor="#8B95A1"
                />
              </View>
            )}
            <View style={styles.profileBody}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileMeta}>{user?.email ?? '로그인 사용자'}</Text>
            </View>
            <Button
              fullWidth={false}
              onPress={() => setIsNameModalVisible(true)}
              size="m"
              style={styles.nameChangeButton}
              type="sub"
            >
              이름 변경
            </Button>
          </View>
        ) : null}

        {!isLoggedIn ? (
          // TODO(#9): 온보딩/로그인 라우트가 머지되면 목로그인 대신 로그인 화면으로 연결한다.
          <Pressable
            accessibilityRole="button"
            onPress={() => setMockLogin(MOCK_USER)}
            style={styles.loginBanner}
          >
            <View style={styles.loginBannerBody}>
              <Text style={styles.loginBannerTitle}>댕댕트립 로그인 및 회원가입</Text>
              <Text style={styles.loginBannerSubtitle}>
                내 반려견을 등록하고 맞춤 장소를 찾아보세요
              </Text>
            </View>
            <SymbolView
              name={{ android: 'chevron_right', ios: 'chevron.right', web: 'chevron_right' }}
              size={20}
              tintColor="#8B95A1"
            />
          </Pressable>
        ) : (
          <View style={styles.section}>
            {loading ? (
              <StatePanel loading title="반려견 정보를 불러오는 중이에요" />
            ) : hasError ? (
              <StatePanel
                description="잠시 후 다시 시도해주세요."
                onRetry={retry}
                title="반려견 정보를 불러오지 못했어요"
              />
            ) : (
              <>
                {dogs.map(dog => (
                  <Pressable
                    accessibilityRole="button"
                    key={dog.dogId}
                    onPress={() =>
                      router.push({
                        pathname: '/profile/dogs/[dogId]',
                        params: { dogId: String(dog.dogId) },
                      })
                    }
                    style={styles.dogCard}
                  >
                    <DogAvatar imageUrl={dog.imageUrl} />
                    <View style={styles.dogBody}>
                      <Text style={styles.dogName}>{dog.name}</Text>
                      <Text style={styles.dogMeta}>
                        {dog.breed.name} · {dog.weight}kg
                      </Text>
                    </View>
                    <SymbolView
                      name={{ android: 'chevron_right', ios: 'chevron.right', web: 'chevron_right' }}
                      size={20}
                      tintColor="#8B95A1"
                    />
                  </Pressable>
                ))}
                <Button onPress={showComingSoon} style={styles.addDogButton} type="sub">
                  반려견 추가
                </Button>
              </>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.menuCard}>
            <Pressable accessibilityRole="button" onPress={showComingSoon} style={styles.menuRow}>
              <SymbolView
                name={{ android: 'notifications', ios: 'bell', web: 'notifications' }}
                size={18}
                tintColor="#8B95A1"
              />
              <Text style={styles.menuText}>알림 설정</Text>
            </Pressable>
            {isLoggedIn ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/profile/reviews')}
                style={styles.menuRow}
              >
                <SymbolView
                  name={{ android: 'rate_review', ios: 'text.bubble', web: 'rate_review' }}
                  size={18}
                  tintColor="#8B95A1"
                />
                <Text style={styles.menuText}>방문 장소/리뷰</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/profile/settings')}
              style={[styles.menuRow, styles.menuRowLast]}
            >
              <SymbolView
                name={{ android: 'description', ios: 'doc.text', web: 'description' }}
                size={18}
                tintColor="#8B95A1"
              />
              <Text style={styles.menuText}>약관 및 정책</Text>
              <SymbolView
                name={{ android: 'chevron_right', ios: 'chevron.right', web: 'chevron_right' }}
                size={18}
                tintColor="#8B95A1"
              />
            </Pressable>
          </View>
          {isLoggedIn ? (
            <View style={styles.bottomLinks}>
              <Pressable accessibilityRole="button" onPress={confirmLogout}>
                <Text style={styles.bottomLinkText}>로그아웃</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={showComingSoon}>
                <Text style={styles.bottomLinkText}>회원탈퇴</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <BottomTabBar
        active="profile"
        height={bottomTabHeight}
        onPressHome={() => router.push('/')}
        paddingBottom={insets.bottom}
      />
      {isLoggedIn ? (
        <NameChangeModal
          currentName={displayName}
          onClose={() => setIsNameModalVisible(false)}
          visible={isNameModalVisible}
        />
      ) : null}
    </View>
  );
}
