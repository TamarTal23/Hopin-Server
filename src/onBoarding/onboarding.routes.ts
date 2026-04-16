import { Router } from 'express';
import { onboardingController } from './onboarding.controller';

const router = Router();

router.get('/user/:userId/job/:jobId', onboardingController.getOnboarding);
router.post('/generate', onboardingController.generateOnboarding);

export default router;
