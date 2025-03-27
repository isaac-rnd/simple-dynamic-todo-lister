import react, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Task } from './types';

const LOCAL_STORAGE_KEY = 'todoApp.tasks';

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedTasks) {
      return JSON.parse(storedTasks);
    }
    return [];
  });
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskHours, setNewTaskHours] = useState<number | ''>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const draggedItem = useRef<number | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editedTaskContent, setEditedTaskContent] = useState('');
  const [editedTaskHours, setEditedTaskHours] = useState<number | ''>('');

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (newTaskContent.trim() === '') {
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskContent,
      dayId: "today",
      hours: newTaskHours === '' ? 0 : Number(newTaskHours),
    };

    setTasks([...tasks, newTask]);
    setNewTaskContent('');
    setNewTaskHours('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleDragStart = (index: number) => {
    draggedItem.current = index;
  };

  const handleDragOver = (index: number, e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedItem.current === null) return;

    const items = [...tasks];
    const dragged = items[draggedItem.current];
    const newItems = items.filter((_, i) => i !== draggedItem.current);
    newItems.splice(dropIndex, 0, dragged);

    setTasks(newItems);
    draggedItem.current = null;
  };

  const handleEditTask = (taskId: string) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setEditingTask(taskId);
      setEditedTaskContent(taskToEdit.text);
      setEditedTaskHours(taskToEdit.hours);
    }
  };

  const handleSaveEdit = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              text: editedTaskContent,
              hours: editedTaskHours === '' ? 0 : Number(editedTaskHours),
            }
          : task
      )
    );
    setEditingTask(null);
    setEditedTaskContent('');
    setEditedTaskHours('');
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditedTaskContent('');
    setEditedTaskHours('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-700 text-white p-8 flex flex-col">
      <div className="flex-grow flex flex-col items-center w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">Today's Tasks</h1>

        <div className="sticky top-4 bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-lg w-full max-w-xl mb-8 z-10">
          <div className="flex space-x-4 mb-4">
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a task..."
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow bg-gray-700 bg-opacity-50 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Hours"
              value={newTaskHours}
              onChange={(e) => setNewTaskHours(Number(e.target.value))}
              className="w-30 bg-gray-700 bg-opacity-50 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddTask}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </div>

        <ul className="w-full max-w-md">
          {tasks.map((task, index) => (
            <li
              key={task.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDrop={() => handleDrop(index)}
              className="bg-gray-800 bg-opacity-50 p-4 rounded-lg shadow-md mb-4 flex items-center justify-between cursor-move"
            >
              {editingTask === task.id ? (
                <div className="flex-grow flex flex-col space-y-2">
                  <input
                    type="text"
                    value={editedTaskContent}
                    onChange={(e) => setEditedTaskContent(e.target.value)}
                    className="bg-gray-700 bg-opacity-50 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={editedTaskHours}
                    onChange={(e) => setEditedTaskHours(Number(e.target.value))}
                    className="w-30 bg-gray-700 bg-opacity-50 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-grow">
                  <p className="text-lg font-medium">{task.text}</p>
                  <p className="text-sm text-gray-300">Hours: {task.hours}</p>
                </div>
              )}
              {editingTask !== task.id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTask(task.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <footer className="sticky bottom-0 text-green-300 p-4 w-full text-center">
        <div className="flex items-center justify-center space-x-4">
          <p>Made with ❤️ from</p>
          <p>ಬೆಂಗಳೂರು</p>
          <a
            href="https://github.com/isaac-rnd/simple-dynamic-todo-lister"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:underline"
          >
            Checkout Code
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
