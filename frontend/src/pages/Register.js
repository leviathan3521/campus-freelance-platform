import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await API.post("/auth/register", form);
      alert("Registered successfully!");
      navigate("/");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>

      <input
        placeholder="Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      /><br /><br />

      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      /><br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      /><br /><br />

      <select
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="client">Client</option>
        <option value="freelancer">Freelancer</option>
      </select><br /><br />

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;