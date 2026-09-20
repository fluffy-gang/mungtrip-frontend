import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BOTTOM_TAB_HEIGHT,
  BottomTabBar,
} from '@/components/navigation/bottom-tab-bar';
import { showDialog } from '@/components/ui/dialog';
import { StatePanel } from '@/components/ui/state-panel';

import { useAuthStore } from '@/features/auth/authStore';
import { useAuth } from '@/features/auth/useAuth';
import { useOnboarding } from '@/features/onboarding/context';
import { DogAvatar } from '../components/dog-avatar';
import { NameChangeModal } from '../components/name-change-modal';
import { useDogs } from '../hooks/use-dogs';
import { styles } from '../styles';

const PROFILE_DEFAULT_ICON = require("../assets/profile-default-user.svg");
const PROFILE_CHEVRON_ICON = require("../assets/profile-chevron-right.svg");
const REVIEW_ICON = require("../assets/review-icon.svg");
const TERMS_ICON = require("../assets/profile-terms.svg");

const DOG_SIZE_LABELS = {
  LARGE: "대형견",
  MEDIUM: "중형견",
  SMALL: "소형견",
} as const;

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { handleLogout, handleWithdrawAccount } = useAuth();
  const { bootstrap, resetDraft } = useOnboarding();
  const { dogs, hasError, loading, retry } = useDogs(isLoggedIn);
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const displayName = user?.nickname ?? user?.name ?? "프로필";
  const bottomTabHeight = insets.bottom + BOTTOM_TAB_HEIGHT;

  const openLogin = async () => {
    const status = await bootstrap();

    if (status === "anonymous") {
      router.replace("/onboarding/login");
    }
  };

  const confirmLogout = () => {
    showDialog(
      "로그아웃할까요?",
      "현재 기기에 저장된 로그인 정보가 삭제됩니다.",
      [
        { style: "cancel", text: "취소" },
        {
          style: "destructive",
          text: "로그아웃",
          onPress: () => {
            void handleLogout().then(() => router.replace("/"));
          },
        },
      ],
    );
  };

  const withdraw = async () => {
    if (withdrawing) return;

    setWithdrawing(true);
    try {
      await handleWithdrawAccount();
      showDialog(
        "탈퇴 요청이 완료되었어요.",
        "30일 이내 다시 로그인하면 계정을 복구할 수 있어요.",
        [{ text: "확인", onPress: () => router.replace("/") }],
      );
    } catch {
      showDialog("탈퇴 요청에 실패했어요.", "잠시 후 다시 시도해주세요.");
    } finally {
      setWithdrawing(false);
    }
  };

  const confirmWithdraw = () => {
    showDialog(
      "회원 탈퇴하시겠어요?",
      "탈퇴 요청 즉시 로그아웃하고, 30일 동안 계정 복구가 가능해요.",
      [
        { style: "cancel", text: "취소" },
        {
          style: "destructive",
          text: withdrawing ? "처리 중..." : "탈퇴하기",
          onPress: () => void withdraw(),
        },
      ],
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomTabHeight + 16 },
        ]}
      >
        <Text style={styles.profileTitle}>프로필</Text>

        {isLoggedIn ? (
          <View style={styles.profileCard}>
            <ProfileAvatar imageUrl={user?.profileImageUrl} />
            <View style={styles.profileBody}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileMeta}>
                {user?.email ?? "로그인 사용자"}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsNameModalVisible(true)}
              style={styles.nameChangeButton}
            >
              <Text style={styles.nameChangeText}>이름 변경</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoggedIn ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void openLogin()}
            style={styles.loginBanner}
          >
            <View style={styles.loginBannerBody}>
              <Text style={styles.loginBannerTitle}>
                멍멍트립 로그인 및 회원가입
              </Text>
              <Text style={styles.loginBannerSubtitle}>
                반려견을 등록하고 맞춤 장소를 찾아보세요
              </Text>
            </View>
            <Image
              contentFit="contain"
              source={PROFILE_CHEVRON_ICON}
              style={styles.menuChevron}
            />
          </Pressable>
        ) : (
          <View style={styles.dogSection}>
            {loading ? (
              <StatePanel loading title="반려견 정보를 불러오는 중이에요" />
            ) : hasError ? (
              <StatePanel
                description="잠시 후 다시 시도해주세요."
                onRetry={retry}
                title="반려견 정보를 불러오지 못했어요"
              />
            ) : (
              <View style={styles.dogListCard}>
                {dogs.map((dog) => (
                  <Pressable
                    accessibilityRole="button"
                    key={dog.dogId}
                    onPress={() =>
                      router.push({
                        pathname: "/profile/dogs/[dogId]",
                        params: { dogId: String(dog.dogId) },
                      })
                    }
                    style={styles.dogCard}
                  >
                    <DogAvatar imageUrl={dog.imageUrl} />
                    <View style={styles.dogBody}>
                      <Text style={styles.dogName}>{dog.name}</Text>
                      <Text style={styles.dogMeta}>
                        {[
                          dog.breed.name,
                          DOG_SIZE_LABELS[dog.size],
                          dog.weight ? `${dog.weight}kg` : undefined,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    </View>
                    <Image
                      contentFit="contain"
                      source={PROFILE_CHEVRON_ICON}
                      style={styles.menuChevron}
                    />
                  </Pressable>
                ))}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    resetDraft();
                    router.push("/profile/dogs/new");
                  }}
                  style={styles.addDogButton}
                >
                  <Text style={styles.addDogText}>반려견 추가</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        <View
          style={[styles.section, !isLoggedIn && styles.loggedOutMenuSection]}
        >
          <View style={styles.menuCard}>
            {isLoggedIn ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/profile/reviews")}
                style={styles.menuRow}
              >
                <Image
                  contentFit="contain"
                  source={REVIEW_ICON}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>방문 장소/리뷰</Text>
                <Image
                  contentFit="contain"
                  source={PROFILE_CHEVRON_ICON}
                  style={styles.menuChevron}
                />
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/profile/settings")}
              style={styles.menuRow}
            >
              <Image
                contentFit="contain"
                source={TERMS_ICON}
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>약관 및 정책</Text>
              <Image
                contentFit="contain"
                source={PROFILE_CHEVRON_ICON}
                style={styles.menuChevron}
              />
            </Pressable>
          </View>
          {isLoggedIn ? (
            <View style={styles.bottomLinks}>
              <Pressable accessibilityRole="button" onPress={confirmLogout}>
                <Text style={styles.bottomLinkText}>로그아웃</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={withdrawing}
                onPress={confirmWithdraw}
              >
                <Text style={styles.bottomLinkText}>회원탈퇴</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <BottomTabBar
        active="profile"
        height={bottomTabHeight}
        onPressHome={() => router.navigate("/")}
        onPressProfile={() => router.navigate("/profile")}
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

function ProfileAvatar({ imageUrl }: { imageUrl?: string }) {
  return (
    <View style={styles.profileImage}>
      {imageUrl ? (
        <Image
          contentFit="cover"
          source={{ uri: imageUrl }}
          style={styles.profileImageContent}
        />
      ) : (
        <Image
          contentFit="contain"
          source={PROFILE_DEFAULT_ICON}
          style={styles.profileDefaultIcon}
        />
      )}
    </View>
  );
}
