import InMemoryTodosRepository from './InMemoryTodoRepository';
import { Repositories } from '../../domain/types/appContext';

export default () => {
  const repositories: Repositories = {
    todoRepository: new InMemoryTodosRepository(),
  };

  return repositories;
};
