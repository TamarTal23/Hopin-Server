import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Job } from '../database/entities/job.entity';
import { Skill } from '../database/entities/skill.entity';

export class JobRepository {
  private jobRepository: Repository<Job>;
  private skillRepository: Repository<Skill>;

  constructor() {
    this.jobRepository = AppDataSource.getRepository(Job);
    this.skillRepository = AppDataSource.getRepository(Skill);
  }

  async findAll(): Promise<Job[]> {
    return this.jobRepository.find({
      relations: ['skills', 'project']
    });
  }

  async findById(id: number): Promise<Job | null> {
    return this.jobRepository.findOne({
      where: { id },
      relations: ['skills', 'project']
    });
  }

  async create(jobData: Partial<Job>): Promise<Job> {
    const job = this.jobRepository.create(jobData);
    return this.jobRepository.save(job);
  }

  async addSkillsToJob(jobId: number, skillNames: string[]): Promise<Job | null> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['skills']
    });
    if (!job) return null;

    const skills: Skill[] = [];
    for (const name of skillNames) {
      let skill = await this.skillRepository.findOne({ where: { name } });
      if (!skill) {
        skill = this.skillRepository.create({ name });
        skill = await this.skillRepository.save(skill);
      }
      skills.push(skill);
    }

    job.skills = [...(job.skills || []), ...skills];
    return this.jobRepository.save(job);
  }
}