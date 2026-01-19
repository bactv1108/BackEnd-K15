import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const API = "http://localhost:3001/api/tasks";

  fetch(
  "http://localhost:3001/bypass-cors?url=https://api-gateway.fullstack.edu.vn/api/analytics"
)
  .then((res) => res.json())
  .then((data) => console.log(data));


  // GET all tasks
  const fetchTasks = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setTasks(data);
  };

  // POST new task
  const addTask = async () => {
    if (!title.trim()) return alert("Vui lòng nhập task!");

    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    setTitle("");
    fetchTasks();
  };

  // PUT toggle completed
  const toggleCompleted = async (task) => {
    await fetch(`${API}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isCompleted: !task.isCompleted,
      }),
    });

    fetchTasks();
  };

  // DELETE task
  const deleteTask = async (id) => {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div
      style={{
        marginTop: 20,
        padding: 0,
      }}
    >
      <div style={{ width: 400 }}>
        <h1 style={{ textAlign: "center" }}>Todo App</h1>

        {/* Input thêm task */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập task..."
            style={{ flex: 1 }}
          />
          <button onClick={addTask}>Thêm</button>
        </div>

        {/* Danh sách tasks */}
        <ul style={{ marginTop: 20, padding: 0 }}>
          {tasks.map((task) => (
            <li
              key={task.id}
              style={{
                marginBottom: 10,
                listStyle: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => toggleCompleted(task)}
              />

              <span
                style={{
                  marginLeft: 8,
                  marginRight: 8,
                  flex: 1,
                  textDecoration: task.isCompleted ? "line-through" : "none",
                }}
              >
                {task.title}
              </span>

              <button onClick={() => deleteTask(task.id)}>Xóa</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
