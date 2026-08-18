import { StatusBar, View } from 'react-native';

import { showComingSoon } from '@/shared/utils/show-coming-soon';

import { BOTTOM_TAB_HEIGHT } from '../constants';
import { CategoryRail } from '../components/category-rail';
import { DogSelectorSheet } from '../components/dog-selector-sheet';
import { HomeBottomTabs } from '../components/home-bottom-tabs';
import { HomeMapSheet } from '../components/home-map-sheet';
import { HomeTopControls } from '../components/home-top-controls';
import { MapCanvas } from '../components/map-canvas';
import { MapFloatingAction } from '../components/map-floating-action';
import { MapOverlayControls } from '../components/map-overlay-controls';
import { SearchResultsPanel } from '../components/search-results-panel';
import { SearchView } from '../components/search-view';
import { useHomeScreen } from '../hooks/use-home-screen';
import { styles } from '../styles';
import { isNativeMapAvailable } from '../utils/native-modules';

export function HomeScreen() {
  const home = useHomeScreen();
  const bottomTabHeight = home.insets.bottom + BOTTOM_TAB_HEIGHT;

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
          {home.mode === 'list' ? null : (
            <MapCanvas
              mapCamera={home.mapCamera}
              onSelectPlace={home.selectPlace}
              places={home.mapPlaces}
              selectedCategory={home.selectedCategory}
              selectedPlaceId={home.selectedPlace?.id}
              setMapBounds={home.updateMapBounds}
              setMapCamera={home.setMapCamera}
              userCoordinate={home.userCoordinate}
              userProfileImageUrl={home.homeViewer.activeDog?.imageUrl}
            />
          )}
          <HomeTopControls
            activeDog={home.homeViewer.activeDog}
            onAddDog={showComingSoon}
            onOpenDogSelector={() => home.setIsDogSheetVisible(true)}
            onOpenSearch={home.openSearch}
            selectedDogs={home.homeViewer.selectedDogs}
            top={home.insets.top + 8}
          />
          <CategoryRail
            activeCategoryCode={home.activeCategoryCode}
            categories={home.categories}
            onSelectCategory={home.selectCategory}
            top={home.insets.top + 58}
          />
          <MapOverlayControls
            myLocationButtonBottom={home.myLocationButtonBottom}
            onMoveToCurrentLocation={home.moveToCurrentLocation}
            onZoomIn={home.zoomIn}
            onZoomOut={home.zoomOut}
            visible={isNativeMapAvailable && home.mode === 'map'}
            zoomControlBottom={home.zoomControlBottom}
          />
          {home.mode === 'list' ? (
            <SearchResultsPanel
              bottom={bottomTabHeight}
              dogs={home.homeViewer.selectedDogs}
              places={home.filteredPlaces}
              onSelectPlace={home.selectPlace}
              onShowMap={home.showMapView}
              top={home.insets.top + 104}
            />
          ) : (
            <>
              <MapFloatingAction
                bottom={home.floatingActionBottom}
                icon={home.mapFloatingActionIcon}
                onPress={home.handleMapFloatingAction}
                text={home.mapFloatingActionText}
                visible
              />
              <HomeMapSheet
                bottom={bottomTabHeight}
                dogs={home.homeViewer.selectedDogs}
                hasError={home.hasError}
                height={home.mapSheetHeight}
                isPlaceList={home.isMapSheetPlaceList}
                loading={home.loading}
                onRetry={home.retry}
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
            </>
          )}
          <HomeBottomTabs
            height={bottomTabHeight}
            onOpenSearch={home.openSearch}
            onShowHome={home.showHomeFeed}
            paddingBottom={home.insets.bottom}
          />
          {home.isDogSheetVisible ? (
            <DogSelectorSheet
              dogs={home.homeViewer.dogs}
              onClose={() => home.setIsDogSheetVisible(false)}
              onSave={home.homeViewer.saveDogSelection}
              selectedDogIds={home.homeViewer.selectedDogIds}
            />
          ) : null}
        </>
      )}
    </View>
  );
}
