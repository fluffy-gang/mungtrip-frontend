import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, StatusBar, View } from 'react-native';
import { useEffect } from 'react';

import { useTabNavigation } from '@/features/app-integration/tab-shell';
import { useOnboarding } from '@/features/onboarding/context';
import { BOTTOM_TAB_HEIGHT } from '../constants';
import { CategoryRail } from '../components/category-rail';
import { DogSelectorSheet } from '../components/dog-selector-sheet';
import { HomeBottomTabs } from '../components/home-bottom-tabs';
import { HomeMapSheet } from '../components/home-map-sheet';
import { HomeTopControls } from '../components/home-top-controls';
import { MapCanvas } from '../components/map-canvas';
import { MapFloatingAction } from '../components/map-floating-action';
import { MapOverlayControls } from '../components/map-overlay-controls';
import { PlacePreviewCard } from '../components/place-preview-card';
import { SearchView } from '../components/search-view';
import { useHomeScreen } from '../hooks/use-home-screen';
import { styles } from '../styles';
import { isNativeMapAvailable } from '../utils/native-modules';

export function HomeScreen() {
  const { view } = useLocalSearchParams<{ view?: string }>();
  // Search routes must not mount and immediately tear down a native map during initialization.
  const home = useHomeScreen(view === 'search' ? 'search' : 'map');
  const navigate = useTabNavigation();
  const router = useRouter();
  const { resetDraft } = useOnboarding();
  const { openSearch } = home;
  useEffect(() => { if (view === 'search') openSearch(); }, [view, openSearch]);
  const bottomTabHeight = home.insets.bottom + BOTTOM_TAB_HEIGHT;

  const openDogRegistration = () => {
    resetDraft();
    router.push('/profile/dogs/new');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {home.mode === 'search' ? (
        <SearchView
          insetsTop={home.insets.top}
          onBack={home.closeSearch}
          onRemoveRecentSearch={home.removeRecentSearch}
          onSelectKeyword={home.submitSearch}
          places={home.places}
          popularKeywords={home.popularKeywords}
          query={home.query}
          recentSearches={home.recentSearches}
          setQuery={home.setQuery}
        />
      ) : (
        <>
          <View style={[styles.headerBar, { paddingTop: home.insets.top + 8 }]}>
            <HomeTopControls onOpenSearch={home.openSearch} />
            <CategoryRail
              activeCategoryCode={home.activeCategoryCode}
              activeDog={home.homeViewer.activeDog}
              categories={home.categories}
              onAddDog={openDogRegistration}
              onOpenDogSelector={() => home.setIsDogSheetVisible(true)}
              onSelectCategory={home.selectCategory}
              selectedDogs={home.homeViewer.selectedDogs}
            />
          </View>
          <View style={styles.mapArea}>
            <MapCanvas
              mapCamera={home.mapCamera}
              onSelectPlace={home.previewPlace}
              onUserMove={home.handleMapUserMove}
              places={home.mapPlaces}
              selectedCategory={home.selectedCategory}
              selectedPlaceId={home.selectedPlace?.id}
              setMapBounds={home.updateMapBounds}
              setMapCamera={home.setMapCamera}
              userCoordinate={home.userCoordinate}
              userProfileImageUrl={home.homeViewer.activeDog?.imageUrl}
            />
            <MapOverlayControls
              myLocationButtonBottom={home.myLocationButtonBottom}
              onMoveToCurrentLocation={home.moveToCurrentLocation}
              onZoomIn={home.zoomIn}
              onZoomOut={home.zoomOut}
              visible={isNativeMapAvailable || Platform.OS === 'web'}
              zoomControlBottom={home.zoomControlBottom}
            />
            <MapFloatingAction
              bottom={home.floatingActionBottom}
              icon={home.mapFloatingActionIcon}
              onPress={home.handleMapFloatingAction}
              text={home.mapFloatingActionText}
              visible={!home.selectedPlace}
            />
            {home.selectedPlace ? (
              <PlacePreviewCard
                bottom={bottomTabHeight + 12}
                dogs={home.homeViewer.selectedDogs}
                onClose={home.closeSelectedPlace}
                onSelectPlace={home.selectPlace}
                place={home.selectedPlace}
              />
            ) : (
              <HomeMapSheet
                bottom={bottomTabHeight}
                courses={home.courses}
                dogs={home.homeViewer.selectedDogs}
                hasError={home.isMapSheetPlaceList ? home.placesHasError : home.feedHasError}
                height={home.mapSheetHeight}
                isExpanded={home.isMapSheetExpanded}
                isPlaceList={home.isMapSheetPlaceList}
                loading={home.isMapSheetPlaceList ? home.placesLoading : home.feedLoading}
                onRetry={home.retry}
                onClearFilters={home.hasPlaceFilters ? home.clearPlaceFilters : undefined}
                onExpand={home.expandMapSheet}
                onSelectPlace={home.selectPlace}
                onShowCategoryPlaces={home.showCategoryPlaces}
                onShowMap={home.showMapView}
                onShowRecommendedPlaces={home.showRecommendationList}
                panHandlers={home.mapSheetPanHandlers}
                places={home.filteredPlaces}
                recentlyVerified={home.recentlyVerified}
                topCafePlaces={home.topCafePlaces}
                topRestaurantPlaces={home.topRestaurantPlaces}
              />
            )}
          </View>
          <HomeBottomTabs
            height={bottomTabHeight}
            onOpenSearch={home.openSearch}
            onShowHome={home.showHomeFeed}
            onShowProfile={home.showProfile}
            paddingBottom={home.insets.bottom}
            selectedTab="home"
            onSelectTab={tab => {
              if (tab === 'home') home.showHomeFeed();
              else if (tab === 'search') home.openSearch();
              else navigate(tab);
            }}
          />
          {home.isDogSheetVisible ? (
            <DogSelectorSheet
              dogs={home.homeViewer.dogs}
              onClose={() => home.setIsDogSheetVisible(false)}
              onOpenDogManagement={() => {
                home.setIsDogSheetVisible(false);
                home.showProfile();
              }}
              onSave={home.homeViewer.saveDogSelection}
              selectedDogIds={home.homeViewer.selectedDogIds}
            />
          ) : null}
        </>
      )}
    </View>
  );
}
