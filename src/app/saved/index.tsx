import { SavedScreen } from '@/features/saved';
import { useFeatureIntegration } from '@/features/app-integration/context';
import { useTabNavigation } from '@/features/app-integration/tab-shell';
import { showComingSoon } from '@/shared/utils/show-coming-soon';

export default function SavedRoute() {
  const app = useFeatureIntegration();
  const navigate = useTabNavigation();
  return <SavedScreen provider={app.saved}
    onOpenPlace={({ placeId }) => app.openPlace(placeId)}
    // TODO(#19): Connect the independently owned course-detail route when available.
    onOpenCourse={showComingSoon}
    onShowMap={({ places }) => app.showSavedMap(places)}
    onFindPlaces={() => navigate('search')}
    onCreateOrAddTrip={({ places, source }) => app.openTrip({ mode: 'create', source, selection: {
      kind: 'place', places: places.map(place => ({ ...place, thumbnailUrl: place.imageUrl })),
    } })}
    onAddCourseToTrip={({ course, source }) => app.openTrip({ mode: 'add', source,
      selection: { kind: 'course', courseId: course.id, title: course.title } })} />;
}
