import { Router } from 'express';
import { JobController } from './job.controller';
import { authenticateAccessToken } from '../auth/auth.middleware';

const router = Router();
const jobController = new JobController();

router.get('/', jobController.getAllJobs);
router.get('/:jobId', jobController.getJobById);
router.post('/', jobController.createJob);
router.post('/:jobId/skills', jobController.addSkillsToJob);

export default router;