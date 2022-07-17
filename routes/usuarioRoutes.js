import express from 'Express';
import { formularioLogin, formularioRegistro, formularioOlvidePassword} from '../controllers/usuarioController.js';


const router = express.Router();

router.get('/login', formularioLogin);
router.get('/registro', formularioRegistro);
router.get('/olvide-password', formularioOlvidePassword);

export default router;