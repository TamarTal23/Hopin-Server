import { Router } from 'express';
import { JobController } from './job.controller';

const router = Router();
const jobController = new JobController();

router.get('/jobs', jobController.getAllJobs);
router.get('/jobs/:jobId', jobController.getJobById);
router.post('/jobs', jobController.createJob);
router.post('/jobs/:jobId/skills', jobController.addSkillsToJob);

export default router;