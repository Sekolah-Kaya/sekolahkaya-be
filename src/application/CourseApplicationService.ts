import { ICategoryRepository } from "../domain/category/ICategoryRepository";
import { ApplicationResult, PaginatedResult } from "../domain/common/ResultObject";
import { Course } from "../domain/course/Course";
import { CourseQuery, CreateCourseCommand, PublishCourseCommand, UpdateCourseCommand } from "../domain/course/CourseDTO";
import { ICourseApplicationService } from "../domain/course/ICourseApplicationService";
import { ICourseRepository } from "../domain/course/ICourseRepository";
import { IUserRepository } from "../domain/user/IUserRepository";
import { ICacheService } from "./CacheService";
import { IEventDispatcher } from "./EventDispatcher";

export class CourseApplicationService implements ICourseApplicationService {
    private constructor(
        private readonly courseRepository: ICourseRepository,
        private readonly userRepository: IUserRepository,
        private readonly categoryRepository: ICategoryRepository,
        private readonly eventDispatcher: IEventDispatcher,
        private readonly cacheService: ICacheService,
    ) { }

    async createCourse(command: CreateCourseCommand): Promise<ApplicationResult<Course>> {
        try {
            const instructor = await this.userRepository.findById(command.instructorId)
            if (!instructor || !instructor.canCreateCourse) {
                return {
                    success: false,
                    error: 'Instructor not found or not authorized to create courses'
                }
            }

            const category = await this.categoryRepository.findById(command.categoryId)
            if (!category) {
                return {
                    success: false,
                    error: 'Category not found'
                }
            }

            const course = Course.create({
                instructorId: command.instructorId,
                categoryId: command.categoryId,
                title: command.title,
                description: command.description,
                price: command.price,
                thumbnail: command.thumbnail,
                durationHours: command.durationHours,
                level: command.level
            })

            const savedCourse = await this.courseRepository.create(course);

            await this.cacheService.invalidateKey('courses:*');

            return {
                success: true,
                data: savedCourse
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Course creation failed'
            }
        }
    }

    async updateCourse(command: UpdateCourseCommand): Promise<ApplicationResult<Course>> {
        try {
            const course = await this.courseRepository.findById(command.courseId);
            if (!course) {
                return {
                    success: false,
                    error: 'Course not found'
                };
            }

            // Check authorization
            if (course.instructorId !== command.instructorId) {
                return {
                    success: false,
                    error: 'Not authorized to update this course'
                };
            }

            // Update course
            course.update({
                title: command.title,
                description: command.description,
                thumbnail: command.thumbnail,
                durationHours: command.durationHours
            });

            // Save changes
            const updatedCourse = await this.courseRepository.update(course.id, course);

            // Clear cache
            await this.cacheService.invalidateKey(`course:${course.id}`);

            return {
                success: true,
                data: updatedCourse!
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Course update failed'
            };
        }
    }

    async publishCourse(command: PublishCourseCommand): Promise<ApplicationResult<Course>> {
        try {
            const course = await this.courseRepository.findById(command.courseId);
            if (!course) {
                return {
                    success: false,
                    error: 'Course not found'
                };
            }

            // Check authorization
            if (course.instructorId !== command.instructorId) {
                return {
                    success: false,
                    error: 'Not authorized to publish this course'
                };
            }

            // Business rule: Course must have at least one lesson
            const lessons = await this.courseRepository.getCourseLessons(course.id);
            if (lessons.length === 0) {
                return {
                    success: false,
                    error: 'Course must have at least one lesson before publishing'
                };
            }

            course.publish()

            const publishedCourse = await this.courseRepository.update(course.id, course)

            const events = course.getDomainEvents()
            for (const event of events) {
                await this.eventDispatcher.dispatch(event)
            }
            course.clearDomainEvents()

            await this.cacheService.invalidateKey('courses:*')

            return {
                success: true,
                data: publishedCourse!
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Course publishing failed'
            };
        }
    }

    async getCourseById(id: string): Promise<ApplicationResult<Course>> {
        try {
            // Check cache first
            const cached = await this.cacheService.get(`course:${id}`);
            if (cached) {
                return {
                    success: true,
                    data: cached
                };
            }

            const course = await this.courseRepository.findById(id);
            if (!course) {
                return {
                    success: false,
                    error: 'Course not found'
                };
            }

            // Cache the result
            await this.cacheService.set(`course:${id}`, course, 3600); // 1 hour TTL

            return {
                success: true,
                data: course
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get course'
            };
        }
    }

    async searchCourses(query: CourseQuery): Promise<ApplicationResult<PaginatedResult<Course>>> {
        try {
            const { items, total } = await this.courseRepository.searchCourses(query);
            const limit = query.limit || 20;
            const offset = query.offset || 0;
            const page = Math.floor(offset / limit) + 1;
            const totalPages = Math.ceil(total / limit);

            return {
                success: true,
                data: {
                    items,
                    total,
                    page,
                    limit,
                    totalPages
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Search failed'
            };
        }
    }

    async getInstructorCourses(instructorId: string): Promise<ApplicationResult<Course[]>> {
        try {
            const courses = await this.courseRepository.findByInstructorId(instructorId);
            return {
                success: true,
                data: courses
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get instructor courses'
            };
        }
    }

    async archiveCourse(courseId: string, instructorId: string): Promise<ApplicationResult<Course>> {
        try {
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                return {
                    success: false,
                    error: 'Course not found'
                };
            }

            // Check authorization
            if (course.instructorId !== instructorId) {
                return {
                    success: false,
                    error: 'Not authorized to archive this course'
                };
            }

            course.archive();
            const archivedCourse = await this.courseRepository.update(course.id, course);

            // Clear cache
            await this.cacheService.invalidateKey('courses:*');

            return {
                success: true,
                data: archivedCourse!
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Course archiving failed'
            };
        }
    }

}