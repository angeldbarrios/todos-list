
import chai, { expect } from 'chai';
import chaiAsPromise from 'chai-as-promised';
chai.use(chaiAsPromise);


import InMemoryTodosRepository from './InMemoryTodoRepository';

const PAGE_SIZE = 10;

describe('InMemoryTodoRepository', function () {
  describe('Instance 1', function () {
    let inMemoryTodosRepository = new InMemoryTodosRepository();

    describe('getTodos', function () {
      it('should return todos list with default item(s)', async function () {
        const result = await inMemoryTodosRepository.getTodos({ page: 1 });
        const todos = result.data;
        expect(todos).to.have.lengthOf(1);
        expect(todos[0]).to.be.an('object');
        expect(todos[0]).to.have.keys('name', 'id', 'created_at', 'updated_at', 'checked');
        expect(todos[0].id).to.eql(1);
        expect(todos[0].checked).to.eql(false);
      });
    });

    describe('createTodo', function () {
      it('should add new item to todo-list', async function () {
        const newTodo = { name: 'Study for English exam' };
        await inMemoryTodosRepository.createTodo(newTodo);
        const result = await inMemoryTodosRepository.getTodos({ page: 1 });
        const todos = result.data;
        
        expect(todos).to.have.lengthOf(2);

        expect(todos[0]).to.be.an('object');
        expect(todos[1]).to.be.an('object');

        expect(todos[0]).to.have.keys('name', 'id', 'created_at', 'updated_at', 'checked');
        expect(todos[1]).to.have.keys('name', 'id', 'created_at', 'updated_at', 'checked');

        expect(todos[1].id).to.be.eql(2);
        expect(todos[1].name).to.be.eql('Study for English exam');
        expect(todos[1].checked).to.eql(false);
      });
    });

    describe('editTodo', function () {
      it('should edit an existing todo item', async function () {
        const resultEdit = await inMemoryTodosRepository.editTodo(2, { name: 'Study for math exam' });
        const resultGet = await inMemoryTodosRepository.getTodos({ page: 1 });
        const todos = resultGet.data;

        expect(resultEdit).to.be.undefined;
        expect(todos[1].name).to.be.eql('Study for math exam');
      });

      it('should mark todo as checked', async function () {
        // schema validations are made in use case
        // repositories will trust use cases validation
        const resultEdit = await inMemoryTodosRepository.editTodo(2, { checked: true });
        const resultGet = await inMemoryTodosRepository.getTodos({ page: 1 });
        const todos = resultGet.data;
        expect(resultEdit).to.be.undefined;
        expect(todos[1].checked).to.be.eql(true);
      });

      it('should not update not allowed properties', async function () {
        // only name and checked properties are allowed
        const prevTodosResult = await inMemoryTodosRepository.getTodos({ page: 1 });
        const prevTodos = prevTodosResult.data;

        // creating copy of object to break reference
        const beforeUpdateItem = { ...prevTodos.find(todo => todo.id === 2) };

        const resultEdit = await inMemoryTodosRepository.editTodo(2, { not_allowed: 'not_allowed' });

        const afterTodosResult = await inMemoryTodosRepository.getTodos({ page: 1 });
        const afterTodos = afterTodosResult.data;

        const afterUpdateItem = afterTodos.find(todo => todo.id === 2);

        expect(resultEdit).to.be.undefined;
        expect(beforeUpdateItem).to.be.eql(afterUpdateItem);
      });

      it('should fail if trying to edit not existing item', async function () {
        const promise = inMemoryTodosRepository.editTodo(3, { name: 'Study for Spanish exam' });
        await expect(promise).to.be.rejected;
      });

      it('should fail if data param is not an object', async function () {
        const promise = inMemoryTodosRepository.editTodo(2, 'not_object');
        await expect(promise).to.be.rejected;
      });
    });

    describe('deleteTodo', function () {
      it('should delele an existing todo item', async function () {
        const resultDeleteOp = await inMemoryTodosRepository.deleteTodo(1);
        const resultGetTodos = await inMemoryTodosRepository.getTodos({ page: 1 });
        const todos = resultGetTodos.data;

        expect(resultDeleteOp).to.be.undefined;
        expect(todos).to.have.lengthOf(1);
        expect(todos[0].id).to.be.eql(2);
        expect(todos[0].name).to.be.eql('Study for math exam');
      });

      it('should fail if trying to delete not existing item', async function () {
        const promise = inMemoryTodosRepository.deleteTodo(1);
        await expect(promise).to.be.rejected;
      });
    });
  });

  describe('Instance 2: pagination and sorting', function () {
    let inMemoryTodosRepository = new InMemoryTodosRepository();
    const fakeTodos = [];

    before(async function () {
      const samples = ['Sample 1', 'Sample 2', 'Sample 3', 'Sample 4', 'Sample 5', 'Sample 6', 'Sample 7'];
      for (let i = 0; i < 11; i++) {
        const sampleMap = samples.map(sample => ({ name: sample }));
        fakeTodos.push(
          ...sampleMap
        );
      }

      // Order is guaranteed since all operations are sync
      // use of promises is just for api compatibility
      await Promise.all(
        fakeTodos.map(
          _data => inMemoryTodosRepository.createTodo(_data)
        )
      );

      // Deleting default to work only with fake data
      await inMemoryTodosRepository.deleteTodo(1);
    });

    describe('pagination', function () {
      // page 9 does not exist, it should return empty array
      [1, 3, 5, 8, 9].forEach(pageNumber => {
        it(`should return page number ${pageNumber} `, async function () {
          const result = await inMemoryTodosRepository.getTodos({ page: pageNumber });
          const todos = result.data;
          const from = (pageNumber - 1) * PAGE_SIZE;
          const fakePage = fakeTodos.slice(from, from + PAGE_SIZE);

          expect(todos).to.have.lengthOf(fakePage.length);
          expect(result.currentPage).to.be.equal(pageNumber);
          expect(result.totalPages).to.be.equal(8);

          fakePage.forEach((item, index) => {
            // TODO: Find other way to do this
            expect(todos[index]).to.be.eql(item);
          });
        });
      });
    });

    describe('sorting', function () {

      [
        { prop: 'name' },
        { prop: 'checked' },
        { prop: 'created_at' },
        { prop: 'updated_at' }
      ].forEach(conf => {
        describe(`sorting by ${conf.prop}`, function () {
          let fakeSortedTodos: Array<any>;

          before(async function () {
            fakeSortedTodos = [ ...fakeTodos].sort(function (a, b) {
              let valueA = a[conf.prop] || null;
              let valueB = b[conf.prop] || null;

              if(valueA === valueB) {
                return 0;
              }

              if(valueA === null) {
                return 1;
              }
      
              if(valueB === null) {
                return -1;
              }

              return a[conf.prop] > b[conf.prop] ? 1 : -1;
            });
          });

          [1, 3, 5, 8, 9].forEach(pageNumber => {
            it(`should return page ${pageNumber} sorting by ${conf.prop}`, async function () {
              const result = await inMemoryTodosRepository.getTodos({ page: pageNumber, sort: conf.prop });
              const todos = result.data;
              const from = (pageNumber - 1) * PAGE_SIZE;
              const fakePage = fakeSortedTodos.slice(from, from + PAGE_SIZE);

              expect(todos).to.have.lengthOf(fakePage.length);
              
              fakePage.forEach((item, index) => {
                // TODO: Find other way to do this
                expect(todos[index]).to.be.eql(item);
              });
            });
          });
        });
      });

      // describe('sort by name', function () {
      //   it('should sort asc page 1', async function () {
      //     let pointer = 0;
      //     const todos = await inMemoryTodosRepository.getTodos({ page: 1, sort: 'name' });

      //     expect(todos).to.have.lengthOf(PAGE_SIZE);
      //     expect(todos).to.be.an('array');

      //     expect(todos[0]).to.be.eql(fakeTodos[0]); 
      //     expect(todos[1]).to.be.eql(fakeTodos[7]);
      //     expect(todos[2]).to.be.eql(fakeTodos[14]);
      //     expect(todos[3]).to.be.eql(fakeTodos[21]);
      //     expect(todos[4]).to.be.eql(fakeTodos[28]);
      //     expect(todos[5]).to.be.eql(fakeTodos[35]);
      //     expect(todos[6]).to.be.eql(fakeTodos[42]);
      //     expect(todos[7]).to.be.eql(fakeTodos[49]);
      //     expect(todos[8]).to.be.eql(fakeTodos[56]);
      //     expect(todos[9]).to.be.eql(fakeTodos[63]);
      //   });
      // });
    });

  });


});