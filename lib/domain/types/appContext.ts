import ITodoRepository from '../repositories/ITodoRepository';

export type Repositories = {
  todoRepository?: ITodoRepository;
};

export type AppContext = {
  repositories: Repositories;
  errors?: any;
};
