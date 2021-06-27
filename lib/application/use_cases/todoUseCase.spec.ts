import chai, { expect } from 'chai';
import sinon from 'sinon';
import chaiAsPromise from 'chai-as-promised';
chai.use(chaiAsPromise);

import { AppContext } from '../../domain/types/appContext';
import TodoUseCases from './todoUseCase';

describe('TODO use cases', function () {
  let appContext: AppContext;
  let todoUseCases: TodoUseCases;

  beforeEach(function () {
    appContext = {
      repositories: {
        todoRepository: {
          getTodos: async function() {},
          createTodo: async function() {},
          editTodo: async function() {},
          deleteTodo: async function() {}
        }
      }
    };

    todoUseCases = new TodoUseCases(appContext);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('GET TODOS', function () {
    it('should fail if data is not valid', async function () {
      const getTodosStub = sinon.stub(appContext.repositories.todoRepository, 'getTodos');
      const promise = todoUseCases.getTodos({ page: 'aa' });
      await expect(promise).to.be.rejected;
      expect(getTodosStub.callCount).to.be.eq(0);
    });
  });

  describe('EDIT TODOS', function () {
    let editTodoStub: sinon.SinonStub;

    beforeEach(function () {
      editTodoStub = sinon.stub(appContext.repositories.todoRepository, 'editTodo');
    });

    it('should fail if page is not a number', async function () {
      const promise = todoUseCases.editTodo('n', {});
      await expect(promise).to.be.rejected;
      expect(editTodoStub.callCount).to.be.eq(0);
    });

    it('should fail if data is an empty object', async function () {
      const promise = todoUseCases.editTodo(1, {});
      await expect(promise).to.be.rejected;
      expect(editTodoStub.callCount).to.be.eq(0);
    });

    it('should fail if data.name length is less than 5', async function () {
      const promise = todoUseCases.editTodo(1, { name: '1234' });
      await expect(promise).to.be.rejected;
      expect(editTodoStub.callCount).to.be.eq(0);
    });

    it('should fail if data.name length is more than 100', async function () {
      const name = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'.repeat(2) + 'y';
      const promise = todoUseCases.editTodo(1, { name });
      await expect(promise).to.be.rejected;
      expect(editTodoStub.callCount).to.be.eq(0);
    });

    it('should fail if data contains additional props', async function () {
      const promise = todoUseCases.editTodo(1, { name: 'John Doe', age: 40 });
      await expect(promise).to.be.rejected;
      expect(editTodoStub.callCount).to.be.eq(0);
    });

    it('should fail if data.checked is not of type boolean', async function () {
      const promise = todoUseCases.editTodo(1, { name: 'John Doe', checked: 'not_boolean' });
      await expect(promise).to.be.rejected;
      expect(editTodoStub.callCount).to.be.eq(0);
    });
    
    it('should pass if data.checked property is boolean', async function () {
      const promise = todoUseCases.editTodo(1, { name: 'John Doe', checked: true });        
      await expect(promise).to.be.fulfilled;
      expect(editTodoStub.callCount).to.be.eq(1);
      expect(editTodoStub.getCall(0).args).to.be.eql([1, { name: 'John Doe', checked: true }]);
    });

    it('should pass if data.checked is the only property', async function () {
      const promise = todoUseCases.editTodo(1, { checked: true });        
      await expect(promise).to.be.fulfilled;
      expect(editTodoStub.callCount).to.be.eq(1);
      expect(editTodoStub.getCall(0).args).to.be.eql([1, { checked: true }]);
    });

    [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'.repeat(2),
      'I have to study for math exam'
    ].forEach(todoName => {
      it(`should pass if data.name length is ${todoName.length}`, async function () {
        const promise = todoUseCases.editTodo(1, { name: todoName });        
        await expect(promise).to.be.fulfilled;
        expect(editTodoStub.callCount).to.be.eq(1);
        expect(editTodoStub.getCall(0).args).to.be.eql([1, { name: todoName }]);
      });
    });

  });

  describe('DELETE TODOS', function () {
    let deleteTodoStub: sinon.SinonStub;

    beforeEach(function () {
      deleteTodoStub = sinon.stub(appContext.repositories.todoRepository, 'deleteTodo');
    });

    it('should fail if id is not a parsable number', async function() {
      const promise = todoUseCases.deleteTodo('not_number');
      await expect(promise).to.be.rejected;
      expect(deleteTodoStub.callCount).to.be.eql(0);
    });

    it('should pass if todoId can be converted into number', async function() {
      const promise = todoUseCases.deleteTodo('2');
      await expect(promise).to.be.fulfilled;
      expect(deleteTodoStub.callCount).to.be.eql(1);
    });

    it('should pass if todoId is a number', async function() {
      const promise = todoUseCases.deleteTodo(3);
      await expect(promise).to.be.fulfilled;
      expect(deleteTodoStub.callCount).to.be.eql(1);
    });
  });

  describe('CREATE TODOS', function() {
    let createTodoStub: sinon.SinonStub;

    beforeEach(function () {
      createTodoStub = sinon.stub(appContext.repositories.todoRepository, 'createTodo');
    });   


    it('should fail if data is an empty object', async function () {
      const promise = todoUseCases.createTodo({});
      await expect(promise).to.be.rejected;
      expect(createTodoStub.callCount).to.be.eq(0);
    });

    it('should fail if data.name length is less than 5', async function () {
      const promise = todoUseCases.createTodo({ name: '1234' });
      await expect(promise).to.be.rejected;
      expect(createTodoStub.callCount).to.be.eq(0);
    });

    it('should fail if data.name length is more than 100', async function () {
      const name = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'.repeat(2) + 'y';
      const promise = todoUseCases.createTodo({ name });
      await expect(promise).to.be.rejected;
      expect(createTodoStub.callCount).to.be.eq(0);
    });

    it('should fail if data contains additional props', async function () {
      const promise = todoUseCases.createTodo({ name: 'John Doe', age: 40 });
      await expect(promise).to.be.rejected;
      expect(createTodoStub.callCount).to.be.eq(0);
    });

    [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'.repeat(2),
      'I have to study for math exam'
    ].forEach(todoName => {
      it(`should pass if data.name length is ${todoName.length}`, async function () {
        const promise = todoUseCases.createTodo({ name: todoName });        
        await expect(promise).to.be.fulfilled;
        expect(createTodoStub.callCount).to.be.eq(1);
        expect(createTodoStub.getCall(0).args).to.be.eql([{ name: todoName }]);
      });
    });

  });

});