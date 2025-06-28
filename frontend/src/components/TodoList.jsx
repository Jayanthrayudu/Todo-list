import { useState, useEffect } from 'react';
import axios from 'axios';
import './TodoList.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL);
      console.log("Fetched Todos:", response.data);

      // Handle array or object response
      const todoData = Array.isArray(response.data)
        ? response.data
        : response.data.todos || response.data || [];

      setTodos(todoData);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setTodos([]); // fallback
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      try {
        const response = await axios.put(`${import.meta.env.VITE_API_URL}/${editId}`, {
          title: editTitle,
          completed: todos.find(todo => todo._id === editId).completed
        });
        setTodos(todos.map(todo => (todo._id === editId ? response.data : todo)));
        setEditId(null);
        setEditTitle('');
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    } else {
      try {
        const response = await axios.post(import.meta.env.VITE_API_URL, { title });
        setTodos([...todos, response.data]);
        setTitle('');
      } catch (error) {
        console.error('Error creating todo:', error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/${id}`, {
        title: todos.find(todo => todo._id === id).title,
        completed: !completed
      });
      setTodos(todos.map(todo => (todo._id === id ? response.data : todo)));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleEdit = (id, title) => {
    setEditId(id);
    setEditTitle(title);
  };

  return (
    <div className="todo-list">
      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={editId ? editTitle : title}
          onChange={(e) => editId ? setEditTitle(e.target.value) : setTitle(e.target.value)}
          placeholder="Enter a todo"
          required
        />
        <button type="submit">{editId ? 'Update' : 'Add'}</button>
      </form>
      <ul className="todo-items">
        {Array.isArray(todos) && todos.map(todo => (
          <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo._id, todo.completed)}
            />
            <span>{todo.title}</span>
            <div className="todo-actions">
              <button onClick={() => handleEdit(todo._id, todo.title)}>Edit</button>
              <button onClick={() => handleDelete(todo._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
