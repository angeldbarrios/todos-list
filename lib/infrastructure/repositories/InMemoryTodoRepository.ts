import ITodoRepository from '../../domain/repositories/ITodoRepository';
import { PaginationParams } from '../../domain/types';

export default class InMemoryTodoRepository implements ITodoRepository {
  todosList: Array<any> = [];
  todosIdIndex: object = {};
  sequence: number = 1;
  editableProperties = ['name'];
  sortableProperties = ['name', 'created_at', 'updated_at', 'checked']

  constructor() {
    for (let i = 0; i < 1; i++) {
      const exampleTodo = { name: 'Example TODO ' + i };
      this.createTodo(exampleTodo);
    }
  }

  private reIndexData() {
    this.todosIdIndex = this.todosList.reduce((acc, todoItem) => {
      const key = todoItem.id;
      if (acc[key]) {
        throw new Error('Duplicate id');
      }
      acc[key] = todoItem;
      return acc;
    }, {});
  }

  private indexNewTodoItem(item: any) {
    if (this.todosIdIndex[item.id]) {
      throw new Error('Id already exists');
    }
    this.todosIdIndex[item.id] = item;
  }

  private createId() {
    return this.sequence++;
  }

  async getTodos(paginationParams: PaginationParams): Promise<any> {
    // TODO: support index for sorting
    if (paginationParams.sort !== undefined) {
      // Descending order
      let order = 'asc';

      if (paginationParams.sort[0] === '-') {
        order = 'desc';
        paginationParams.sort = paginationParams.sort.substring(1);
      }
      
      if (this.sortableProperties.indexOf(paginationParams.sort) === -1) {
        const error = new Error('Invalid sort field');
        error.name = 'BAD_DATA';
        throw error;
      }

      const results = [...this.todosList].sort(function (a, b) {
        let valueA = typeof a[paginationParams.sort] === 'boolean' 
          ? a[paginationParams.sort].toString() 
          : a[paginationParams.sort];

        let valueB = typeof b[paginationParams.sort] === 'boolean' 
          ? b[paginationParams.sort].toString() 
          : b[paginationParams.sort];
  
        if(order === 'asc') {
          return valueA > valueB ? 1: -1;
        } else {
          return valueA < valueB ? 1: -1;
        }
      });

      const from = (Number(paginationParams.page) - 1) * 10;
      return results.slice().slice(from, from + 10);;

    } else {
      const from = (Number(paginationParams.page) - 1) * 10;
      const idIndexKeys = Object.keys(this.todosIdIndex).slice(from, from + 10);
      return idIndexKeys.map((key) => {
        return this.todosIdIndex[key];
      });
    }
  }

  async createTodo(data: any): Promise<any> {
    const itemId = this.createId();
    data.id = itemId;
    data.created_at = new Date();
    data.updated_at = null;
    data.checked = false;
    this.indexNewTodoItem(data);
    this.todosList.push(data);
  }

  async editTodo(todoId: number, data: any): Promise<any> {
    if (typeof data !== 'object') {
      throw new TypeError('data must be an object');
    }

    const todo = this.todosIdIndex[todoId];
    if (!todo) {
      const error = new Error('Id not found');
      error.name = 'NOT_FOUND';
      throw error;
    }

    const dataKeys = Object.keys(data);
    dataKeys.forEach(key => {
      if (this.editableProperties.indexOf(key) !== -1) {
        todo[key] = data[key];
      }
    });

    todo.updated_at = new Date();
  }

  async deleteTodo(todoId: number): Promise<any> {
    const todo = this.todosIdIndex[todoId];
    if (!todo) {
      const error = new Error('Id not found');
      error.name = 'NOT_FOUND';
      throw error;
    }

    // TODO: index in such a way that the array is not
    // iterated to find the index
    const index = this.todosList.indexOf(todo);
    if (index !== -1) {
      this.todosList.splice(index, 1);
    }
    delete this.todosIdIndex[todoId];
  }

  async getTodoById(todoId: number): Promise<any> {
    const todo = this.todosIdIndex[todoId];
    if (!todo) {
      const error = new Error('Id not found');
      error.name = 'NOT_FOUND';
      throw error;
    }

    return todo;
  }
}
