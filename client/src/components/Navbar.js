import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="navbar">
      <h3>Task Manager</h3>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;