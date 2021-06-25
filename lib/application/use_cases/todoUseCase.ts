import { AppContext } from '../../domain/types/appContext';
import { PaginationParams } from '../../domain/types';
import Joi from 'joi';

const todoSchemaMap = {
  id: Joi.number(),
  name: Joi.string().min(5).max(100) // TODO: Keep an eye on XSS
};

const paginationSchema = Joi.object({
  page: Joi.number().default(1),
  sort: Joi.string().max(20).regex(/^[A-Za-z0-9-]+$/)
});

export default class TodoUseCases {
  private todoRepository: AppContext['repositories']['todoRepository'];
  constructor(appContext: AppContext) {
    this.todoRepository = appContext.repositories.todoRepository;
  }
 
  private validate(schema: Joi.Schema, data: any) {
    // TODO: implement validation with decorators
    const { value, error } = schema.validate(data);
    if (error) { 
      const badDataError = new Error('Bad data');
      badDataError.name = 'BAD_DATA';
      throw badDataError;
    }

    return value;
  }

  async getTodos(paginationParams: PaginationParams): Promise<any> {
    paginationParams = this.validate(paginationSchema, paginationParams);
    const todos = await this.todoRepository.getTodos(paginationParams);
    return todos;
  }

  async createTodo(data: any): Promise<any> {0
    const schema = Joi.object({ name: todoSchemaMap.name })
      .fork(['name'], (schema) => schema.required());
    data = this.validate(schema, data);

    await this.todoRepository.createTodo(data);
  }

  async editTodo(todoId: number | string, data: any): Promise<any> {    
    const schema = Joi.object({ name: todoSchemaMap.name })
      .fork(['name'], (schema) => schema.required());
    data = this.validate(schema, data);
    todoId = this.validate(todoSchemaMap.id, todoId);

    await this.todoRepository.editTodo(todoId as number, data);
  }

  async deleteTodo(todoId: number | string): Promise<any> {
    todoId = this.validate(todoSchemaMap.id, todoId);
    await this.todoRepository.deleteTodo(todoId as number);
  }
}
