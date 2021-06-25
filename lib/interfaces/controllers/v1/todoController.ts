import express, { NextFunction, Request, Response } from 'express';
import TodoUseCases from '../../../application/use_cases/todoUseCase';
import { AppContext } from '../../../domain/types/appContext';

export default (appContext: AppContext) => {
  const router = express.Router();
  const todoUseCases = new TodoUseCases(appContext);

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, sort } = req.query;
      const data = await todoUseCases.getTodos({
        page: page as string || 1,
        sort: sort as string
      });
      res.json({
        error: false,
        data: data,
      });
    } catch (error) {
      next(error);
    }
  });



  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await todoUseCases.createTodo(req.body);
      res.status(201).json({
        error: false,
        message: 'TODO inserted',
      })
    } catch(error) {
      next(error);
    }
  });


  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await todoUseCases.editTodo(req.params.id, req.body);
      res.json({
        error: false,
        message: 'TODO updated',
      })
    } catch(error) {
      next(error);
    }
  });


  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await todoUseCases.deleteTodo(req.params.id);
      res.json({
        error: false,
        message: 'TODO deleted',
      })
    } catch(error) {
      next(error);
    }
  });

  return router;
};
