import React, { useState, useEffect } from "react";
import "../styles/main.css"; // Import the CSS

const Dropdown = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/data/users.json") // Load JSON data
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <div className="dropdown">
      <label>Select User: </label>
      <select onChange={(e) => onSelectUser(e.target.value)}>
        <option value="">-- Select --</option>
        {users.map((user) => (
          <option key={user.userId} value={user.userId}>
            {user.userName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
