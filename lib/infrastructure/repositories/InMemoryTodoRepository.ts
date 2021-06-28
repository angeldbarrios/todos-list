import ITodoRepository from '../../domain/repositories/ITodoRepository';
import { PaginationParams } from '../../domain/types';

export default class InMemoryTodoRepository implements ITodoRepository {
  private todosList: Array<any> = [];
  private todosIdIndex: object = {};
  private sequence: number = 1;
  private editableProperties = ['name', 'checked'];
  private sortableProperties = ['name', 'created_at', 'updated_at', 'checked']
  private pageSize = 10;

  constructor() {
    const exampleTodo = { name: 'Example TODO' };
    this.createTodo(exampleTodo);
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

      const sortedResults = [...this.todosList].sort(function (a, b) {
        let valueA = a[paginationParams.sort] || null;
        let valueB = b[paginationParams.sort] || null;

        if(valueA === valueB) {
          return 0;
        }

        if(valueA === null) {
          return order === 'asc' ? -1 : 1;
        }

        if(valueB === null) {
          return order === 'asc' ? 1 : -1;
        }

        if (order === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });

      const from = (Number(paginationParams.page) - 1) * this.pageSize;
      const finalResults = sortedResults.slice().slice(from, from + this.pageSize);

      return {
        data: finalResults,
        totalPages: Math.ceil(this.todosList.length / this.pageSize),
        currentPage: paginationParams.page
      };

    } else {
      const from = (Number(paginationParams.page) - 1) * this.pageSize;
      const idIndexKeys = Object.keys(this.todosIdIndex).slice(from, from + this.pageSize);
      const results = idIndexKeys.map((key) => {
        return this.todosIdIndex[key];
      });

      return {
        data: results,
        totalPages: Math.ceil(this.todosList.length / this.pageSize),
        currentPage: paginationParams.page
      };
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
    const update: any = {};

    dataKeys.forEach(key => {
      if (this.editableProperties.indexOf(key) !== -1) {
        update[key] = data[key];
      }
    });

    if(Object.keys(update).length > 0) {
      update.updated_at = new Date();
      Object.assign(todo, update);
    }
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
}
