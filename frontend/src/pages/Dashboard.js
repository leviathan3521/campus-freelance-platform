import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({});
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/");
    return;
  }

  fetchTasks();
  getUserFromToken();
}, [navigate]);

  const getUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUserRole(payload.role);
    setUserId(payload.id);
  };

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  const createTask = async () => {
    await API.post("/tasks", form);
    setForm({});
    fetchTasks();
  };

  const applyToTask = async (taskId) => {
    await API.post("/applications", {
      taskId,
      proposal: "I am interested in this task",
    });
    alert("Applied successfully");
  };

  const fetchApplications = async (taskId) => {
    const res = await API.get(`/applications/${taskId}`);
    setApplications(res.data);
    setSelectedTask(taskId);
  };

  const assignFreelancer = async (taskId, freelancerId) => {
    await API.patch("/tasks/assign", { taskId, freelancerId });
    alert("Task Assigned");
    setApplications([]);
    setSelectedTask(null);
    fetchTasks();
  };

  const completeTask = async (taskId) => {
    await API.patch("/tasks/complete", { taskId });
    alert("Task Completed");
    fetchTasks();
  };

  // ================= FILTER LOGIC =================
  const filteredTasks = tasks.filter((task) => {
    if (filter === "open") return task.status === "open";
    if (filter === "assigned") return task.status === "assigned";
    if (filter === "completed") return task.status === "completed";

    if (filter === "myTasks" && userRole === "client")
      return task.postedBy?._id === userId;

    if (filter === "applied" && userRole === "freelancer")
      return task.status !== "open";

    return true;
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Dashboard</h2>

      {/* ================= FILTER BUTTONS ================= */}
      <div style={styles.filterContainer}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("open")}>Open</button>
        <button onClick={() => setFilter("assigned")}>Assigned</button>
        <button onClick={() => setFilter("completed")}>Completed</button>

        {userRole === "client" && (
          <button onClick={() => setFilter("myTasks")}>My Tasks</button>
        )}

        {userRole === "freelancer" && (
          <button onClick={() => setFilter("applied")}>
            Applied Tasks
          </button>
        )}
      </div>

      {/* ================= CREATE TASK ================= */}
      {userRole === "client" && (
        <div style={styles.card}>
          <h3>Create Task</h3>
          <input
            placeholder="Title"
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
          <input
            placeholder="Description"
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Budget"
            onChange={(e) =>
              setForm({ ...form, budget: e.target.value })
            }
          />
          <button style={styles.primaryBtn} onClick={createTask}>
            Create
          </button>
        </div>
      )}

      {/* ================= TASK LIST ================= */}
      {filteredTasks.map((task) => (
        <div key={task._id} style={styles.card}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>
            Status:{" "}
            <span style={styles.status(task.status)}>
              {task.status}
            </span>
          </p>

          {/* FREELANCER APPLY */}
          {userRole === "freelancer" &&
            task.status === "open" && (
              <button
                style={styles.primaryBtn}
                onClick={() => applyToTask(task._id)}
              >
                Apply
              </button>
            )}

          {/* CLIENT VIEW APPLICATIONS */}
          {userRole === "client" && (
            <>
              <button
                style={styles.secondaryBtn}
                onClick={() => fetchApplications(task._id)}
              >
                View Applications
              </button>

              {selectedTask === task._id &&
                applications.map((app) => (
                  <div key={app._id} style={styles.subCard}>
                    <p>
                      {app.freelancerId?.name} (
                      {app.freelancerId?.email})
                    </p>
                    <button
                      style={styles.primaryBtn}
                      onClick={() =>
                        assignFreelancer(
                          task._id,
                          app.freelancerId?._id
                        )
                      }
                    >
                      Assign
                    </button>
                  </div>
                ))}
            </>
          )}

          {/* FREELANCER COMPLETE */}
          {userRole === "freelancer" &&
            task.status === "assigned" &&
            task.assignedTo?._id === userId && (
              <button
                style={styles.primaryBtn}
                onClick={() => completeTask(task._id)}
              >
                Complete
              </button>
            )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  filterContainer: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  card: {
    background: "#f9f9f9",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  subCard: {
    background: "#ffffff",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  primaryBtn: {
    background: "#4CAF50",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#2196F3",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  status: (status) => ({
    color:
      status === "completed"
        ? "green"
        : status === "assigned"
        ? "orange"
        : "blue",
    fontWeight: "bold",
  }),
};

export default Dashboard;