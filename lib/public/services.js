import axios from 'axios';

let BASE = '';

export async function getTodos(page = 1, sortField) {
  try {
    const response = await axios.get(`${BASE}/api/v1/todo`, {
      params: { page: page, sort: sortField }
    });

    if(!response.data) {
      throw new Error('No data');
    }

    if(!response.data.data || !Array.isArray(response.data.data.data)) {
      throw new Error('Invalid data');
    }

    return response.data.data;
  } catch (error) {
    console.error(error.message);
    alert('Error getting todos');
    return null;
  }
};

export async function createTodo(data) {
  const response = await axios.post(`${BASE}/api/v1/todo`, data);
  console.log(response.data);
};

export async function editTodo(todoId, data) {
  const response = await axios.put(`${BASE}/api/v1/todo/${todoId}`, data);
  console.log(response.data);
};



export async function deleteTodo(todoId) {
  const response = await axios.delete(`${BASE}/api/v1/todo/${todoId}`);
  console.log(response.data);
};