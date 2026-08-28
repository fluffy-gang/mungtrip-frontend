import { StatusBar, View } from 'react-native';

import { CategoryRail } from '../components/category-rail';
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
  const home = useHomeScreen();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View
        pointerEvents={home.mode === 'search' ? 'none' : 'auto'}
        style={home.mode === 'search' ? styles.homeContentHidden : styles.homeContent}
      >
        <View
          style={[styles.headerBar, { paddingTop: home.insets.top + 16 }]}
        >
          <HomeTopControls
            keyword={home.keyword}
            onClearKeyword={home.clearKeyword}
            onOpenSearch={home.openSearch}
          />
          <CategoryRail
            activeCategoryCode={home.activeCategoryCode}
            activeTagCode={home.tag}
            categories={home.categories}
            onSelectCategory={home.selectCategory}
            onSelectTag={home.selectTag}
            tags={home.tags}
          />
        </View>
        <View
          style={[styles.mapArea, { marginBottom: home.insets.bottom }]}
        >
          <MapCanvas
            mapCamera={home.mapCamera}
            onSelectPlace={home.previewPlace}
            places={home.mapPlaces}
            fitToPlaces={Boolean(home.keyword)}
            fitRequestKey={home.keyword}
            mapBottomInset={home.mapSheetHeight}
            selectedPlaceId={home.selectedPlaceId ?? undefined}
            setMapBounds={home.updateMapBounds}
            setMapCamera={home.setMapCamera}
          />
          <MapOverlayControls
            onZoomIn={home.zoomIn}
            onZoomOut={home.zoomOut}
            visible={isNativeMapAvailable}
            zoomControlBottom={home.zoomControlBottom}
          />
          <MapFloatingAction
            bottom={home.floatingActionBottom}
            icon={{ android: 'search', ios: 'magnifyingglass', web: 'search' }}
            onPress={home.searchCurrentArea}
            text="이 지역 검색"
            visible={home.hasDraftBounds && !home.selectedPlace}
          />
          {!home.selectedPlace ? (
            <HomeMapSheet
              height={home.mapSheetHeight}
              onResetConditions={home.resetConditions}
              onRetry={home.retry}
              onSelectPlace={home.selectPlace}
              onShowMap={home.showMapView}
              panHandlers={home.mapSheetPanHandlers}
              places={home.filteredPlaces}
              selectedPlaceId={home.selectedPlaceId ?? undefined}
              status={home.status}
            />
          ) : null}
          {home.selectedPlace ? (
            <PlacePreviewCard
              bottom={12}
              onClose={home.closeSelectedPlace}
              onSelectPlace={home.selectPlace}
              place={home.selectedPlace}
            />
          ) : null}
        </View>
      </View>
      {home.mode === 'search' ? (
        <View style={styles.searchOverlay}>
          <SearchView
            insetsTop={home.insets.top}
            onBack={home.closeSearch}
            onSelectKeyword={home.submitSearch}
            places={home.places}
            query={home.query}
            setQuery={home.setQuery}
          />
        </View>
      ) : null}
    </View>
  );
}
