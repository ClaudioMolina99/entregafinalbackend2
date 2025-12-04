import { Router } from 'express';
const router = Router();

router.post('/', (req, res) => {
  res.json({ message: '¡POST test recibido!' });
});

export default router;
