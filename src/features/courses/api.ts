import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

import type { Course } from './types';

interface CourseListResponse {
  courses: Course[];
  page: number;
  size: number;
  totalCount: number;
}

export const getCourses = async (limit = 10): Promise<Course[]> => {
  const { data } = await apiClient.get<CourseListResponse>(
    ENDPOINTS.courses.list,
    { params: { size: limit } },
  );

  return data.courses;
};
