import { Router } from 'express';
import { ProjectController } from './project.controller';

const router = Router();
const projectController = new ProjectController();

router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', projectController.createProject);

export default router;