import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { OnBoarding } from './onBoarding.entity';

export class OnboardingRepository {
  private onboardingRepository: Repository<OnBoarding>;

  constructor() {
    this.onboardingRepository = AppDataSource.getRepository(OnBoarding);
  }

  async getOnboarding(id: number): Promise<OnBoarding | null> {
    return this.onboardingRepository.findOne({
      where: { id },
      relations: { user: true, job: true, project: true, tasks: { subtasks: true } },
      order: { tasks: { order: 'ASC', subtasks: { order: 'ASC' } } },
    });
  }

  async getOnboardingByUserIdAndJobId(
    userId: number,
    jobId: number,
  ): Promise<OnBoarding | null> {
    return this.onboardingRepository.findOne({
      where: { user: { id: userId }, job: { id: jobId } },
      relations: { user: true, job: true, project: true, tasks: { subtasks: true } },
      order: { tasks: { order: 'ASC', subtasks: { order: 'ASC' } } },
    });
  }

  async getOnboardingsByProjectId(projectId: number): Promise<OnBoarding[]> {
    return this.onboardingRepository.find({
      where: { project: { id: projectId } },
      relations: { user: true, job: true, project: true, tasks: { subtasks: true } },
      order: { tasks: { order: 'ASC', subtasks: { order: 'ASC' } } },
    });
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
