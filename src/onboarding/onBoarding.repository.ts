import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { OnBoarding } from './onBoarding.entity';

export class OnboardingRepository {
  private onboardingRepository: Repository<OnBoarding>;

  constructor() {
    this.onboardingRepository = AppDataSource.getRepository(OnBoarding);
  }

  async getOnboarding(id: number): Promise<OnBoarding | null> {
    return this.onboardingRepository.createQueryBuilder('onboarding')
      .leftJoinAndSelect('onboarding.user', 'user')
      .leftJoinAndSelect('onboarding.job', 'job')
      .leftJoinAndSelect('onboarding.project', 'project')
      .leftJoinAndSelect('onboarding.tasks', 'task', 'task.parent_id IS NULL')
      .leftJoinAndSelect('task.subtasks', 'subtask')
      .where('onboarding.id = :id', { id })
      .orderBy('task.order', 'ASC')
      .addOrderBy('subtask.order', 'ASC')
      .getOne();
  }

  async getOnboardingByUserIdAndJobId(
    userId: number,
    jobId: number,
  ): Promise<OnBoarding | null> {
    return this.onboardingRepository.createQueryBuilder('onboarding')
      .leftJoinAndSelect('onboarding.user', 'user')
      .leftJoinAndSelect('onboarding.job', 'job')
      .leftJoinAndSelect('onboarding.project', 'project')
      .leftJoinAndSelect('onboarding.tasks', 'task', 'task.parent_id IS NULL')
      .leftJoinAndSelect('task.subtasks', 'subtask')
      .where('user.id = :userId AND job.id = :jobId', { userId, jobId })
      .orderBy('task.order', 'ASC')
      .addOrderBy('subtask.order', 'ASC')
      .getOne();
  }

  async getOnboardingsByProjectId(projectId: number): Promise<OnBoarding[]> {
    return this.onboardingRepository.createQueryBuilder('onboarding')
      .leftJoinAndSelect('onboarding.user', 'user')
      .leftJoinAndSelect('onboarding.job', 'job')
      .leftJoinAndSelect('onboarding.project', 'project')
      .leftJoinAndSelect('onboarding.tasks', 'task', 'task.parent_id IS NULL')
      .leftJoinAndSelect('task.subtasks', 'subtask')
      .where('project.id = :projectId', { projectId })
      .orderBy('task.order', 'ASC')
      .addOrderBy('subtask.order', 'ASC')
      .getMany();
  }

  // TODO: remove the project relation from OnBoarding entirely — project is already
  // reachable via job (onboarding → job → project), so storing it here is redundant
  // and risks getting out of sync. Queries that filter or join by project should go
  // through the job relation instead.
  async deleteOnboarding(id: number): Promise<void> {
    await this.onboardingRepository.delete(id);
  }

  async createOnboarding(data: Partial<OnBoarding>): Promise<OnBoarding> {
    const onboarding = this.onboardingRepository.create({
      job: { id: data.jobId },
      user: { id: data.userId },
      project: { id: data.projectId },
    });

    return await this.onboardingRepository.save(onboarding);
  }
}
