import { Router } from 'express';
import { ProjectController } from './project.controller';
import { ProjectMemberController } from '../projectMember/projectMember.controller';

const router = Router();
const projectController = new ProjectController();
const projectMemberController = new ProjectMemberController();

/*
mission - initial-connect-project-page-to-server
6. remove weird things from seed - make job uniq`ue to project member
7. put email in the seed
8. maybe add job column to ui table?
10. put click outside in hook
*/
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.patch('/:projectId/members/:memberId/role', projectMemberController.updateMemberRole);
router.delete('/members/:memberId', projectMemberController.removeMember);

export default router;