import { PaginationParams } from "../types";

export default interface ITodoRepository {
  getTodos(paginationParams: PaginationParams): Promise<any>;
  createTodo(data: any): Promise<any>;
  editTodo(todoId: number, data: any): Promise<any>;
  deleteTodo(todoId: number): Promise<any>;
}
