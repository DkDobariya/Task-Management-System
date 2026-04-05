import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [confirmData, setConfirmData] = useState(null); 
  // { type: "delete" | "update", task: taskObject }

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ===============================
     Show Message
  ============================== */
  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  /* ===============================
     Fetch Tasks
  ============================== */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(res.data);
    } catch {
      localStorage.removeItem("token");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) navigate("/");
    else fetchTasks();
  }, [token, navigate, fetchTasks]);

  /* ===============================
     Add / Update Task
  ============================== */
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      return showMessage("Please fill all fields", "error");
    }

    if (editingTask) {
      setConfirmData({ type: "update", task: editingTask });
    } else {
      try {
        await axios.post(
          "http://localhost:5000/api/tasks",
          { title, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        showMessage("Task added successfully!");
        setTitle("");
        setDescription("");
        fetchTasks();
      } catch {
        showMessage("Add failed!", "error");
      }
    }
  };

  /* ===============================
     Confirm Action
  ============================== */
  const handleConfirm = async () => {
    if (!confirmData) return;

    try {
      if (confirmData.type === "delete") {
        await axios.delete(
          `http://localhost:5000/api/tasks/${confirmData.task.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTasks(prev =>
          prev.filter(t => t.id !== confirmData.task.id)
        );

        showMessage("Task deleted successfully!");
      }

      if (confirmData.type === "update") {
        await axios.put(
          `http://localhost:5000/api/tasks/${confirmData.task.id}`,
          {
            title,
            description,
            status: confirmData.task.status
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        showMessage("Task updated successfully!");
        setEditingTask(null);
        setTitle("");
        setDescription("");
        fetchTasks();
      }
    } catch {
      showMessage("Operation failed!", "error");
    }

    setConfirmData(null);
  };

  /* ===============================
     Update Status
  ============================== */
  const updateStatus = async (task, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${task.id}`,
        {
          title: task.title,
          description: task.description,
          status: newStatus
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks(prev =>
        prev.map(t =>
          t.id === task.id ? { ...t, status: newStatus } : t
        )
      );

      showMessage("Status updated!");
    } catch {
      showMessage("Status update failed!", "error");
    }
  };

  const filteredTasks =
    filter === "All"
      ? tasks
      : tasks.filter(task => task.status === filter);

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Task Dashboard</h2>

        {message && (
          <div className={`alert-box ${messageType}`}>
            {message}
          </div>
        )}

        {/* Form */}
        <div className="task-form">
          <input
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button onClick={handleSubmit}>
            {editingTask ? "Update Task" : "Add Task"}
          </button>

          {editingTask && (
            <button
              className="cancel-btn"
              onClick={() => {
                setEditingTask(null);
                setTitle("");
                setDescription("");
              }}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="filter-section">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        {/* Tasks */}
        {loading ? (
          <p className="status-msg">Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p className="status-msg">No tasks found.</p>
        ) : (
          <div className="task-list">
            {filteredTasks.map(task => (
              <div key={task.id} className="task-card">
                <h3>{task.title}</h3>
                <p>{task.description}</p>

                <select
                  value={task.status}
                  onChange={(e) =>
                    updateStatus(task, e.target.value)
                  }
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>

                <div className="task-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditingTask(task);
                      setTitle(task.title);
                      setDescription(task.description);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      setConfirmData({ type: "delete", task })
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm Modal */}
        {confirmData && (
          <div className="confirm-modal">
            <div className="confirm-box">
              <p>
                Are you sure you want to {confirmData.type} this task?
              </p>
              <div className="confirm-buttons">
                <button onClick={handleConfirm}>Yes</button>
                <button onClick={() => setConfirmData(null)}>
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;