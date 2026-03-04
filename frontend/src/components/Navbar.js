import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={styles.nav}>
      <div>
        <Link to="/" style={styles.link}>Login</Link>
        <Link to="/register" style={styles.link}>Register</Link>
        {token && (
          <Link to="/dashboard" style={styles.link}>
            Dashboard
          </Link>
        )}
      </div>

      {token && (
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#222",
    color: "white",
  },
  link: {
    color: "white",
    marginRight: "15px",
    textDecoration: "none",
  },
  logoutBtn: {
    background: "#ff4d4d",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Navbar;