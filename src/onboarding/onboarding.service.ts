import { AppDataSource } from '../database';
import { User } from '../database/entities/user.entity';
import { Job } from '../job/job.entity';
import { buildOnboardingPrompt } from '../prompts/onboarding.prompt';
import { LLMService } from '../services/llm.service';
import { TaskService } from '../task/task.service';
import { OnBoarding } from './onBoarding.entity';
import { OnboardingRepository } from './onBoarding.repository';

export interface GenerateOnboardingInput {
  userId: number;
  jobId: number;
  documents?: string[];
  daysDuration: number;
}

export class OnboardingService {
  private llmService: LLMService;
  private taskService: TaskService;
  private onboardingRepository: OnboardingRepository;

  constructor() {
    this.llmService = new LLMService();
    this.taskService = new TaskService();
    this.onboardingRepository = new OnboardingRepository();
  }

  async getOnBoardingById(id: number): Promise<OnBoarding | null> {
    return this.onboardingRepository.getOnboarding(id);
  }

  async getOnboarding(
    userId: number,
    jobId: number
  ): Promise<OnBoarding | null> {
    return this.onboardingRepository.getOnboardingByUserIdAndJobId(
      userId,
      jobId
    );
  }

  async generateBoard(input: GenerateOnboardingInput): Promise<OnBoarding> {
    const { userId, jobId, documents = [], daysDuration } = input;
    console.log(`[Onboarding] Starting generation for userId=${userId}, jobId=${jobId}, daysDuration=${daysDuration}, documents=${documents.length}`);

    const userRepo = AppDataSource.getRepository(User);
    const jobRepo = AppDataSource.getRepository(Job);

    const [user, job] = await Promise.all([
      userRepo.findOne({
        where: { id: userId },
        relations: { skills: true },
      }),
      jobRepo.findOne({
        where: { id: jobId },
        relations: { skills: true, project: true },
      }),
    ]);

    if (!user) {
      console.error(`[Onboarding] User not found: userId=${userId}`);
      throw new Error(`User with id ${userId} not found`);
    }
    if (!job) {
      console.error(`[Onboarding] Job not found: jobId=${jobId}`);
      throw new Error(`Job with id ${jobId} not found`);
    }
    if (!job.project) {
      console.error(`[Onboarding] Job has no associated project: jobId=${jobId}`);
      throw new Error(
        `Job with id ${jobId} is not associated with any project`
      );
    }

    console.log(`[Onboarding] Resolved user="${user.name}", job="${job.title}", project="${job.project.name}"`);

    const onboarding = await this.onboardingRepository.createOnboarding({
      userId: user.id,
      jobId: job.id,
      projectId: job.project.id,
    });
    console.log(`[Onboarding] Created onboarding record id=${onboarding.id}`);

    const prompt = buildOnboardingPrompt({
      onboardingId: onboarding.id,
      userName: user.name,
      userExperienceYears: user.experienceYears,
      userSkills: user.skills.map(s => s.name),
      jobTitle: job.title,
      jobRequiredSkills: job.skills.map(s => s.name),
      projectName: job.project.name,
      projectDescription: job.project.description,
      documents,
      daysDuration,
    });

    console.log(`[Onboarding] Sending prompt to LLM for onboarding id=${onboarding.id}`);
    const tasks = await this.llmService.generateOnboardingTasks(prompt);
    console.log(`[Onboarding] LLM returned ${tasks.length} tasks for onboarding id=${onboarding.id}`);

    await this.taskService.createTasks(
      tasks.map(task => ({
        ...task,
        onboarding,
      }))
    );
    console.log(`[Onboarding] Saved ${tasks.length} tasks for onboarding id=${onboarding.id}`);

    const fullOnboarding = await this.getOnBoardingById(onboarding.id);

    if (!fullOnboarding) {
      console.error(`[Onboarding] Could not retrieve onboarding after save: id=${onboarding.id}`);
      throw new Error(
        `Onboarding with id ${onboarding.id} could not be retrieved after save`
      );
    }

    console.log(`[Onboarding] Generation complete for onboarding id=${onboarding.id}`);
    return fullOnboarding;
  }
}
