import React, { useState } from "react";
import Dropdown from "./components/Dropdown";
import Dashboard from "./components/Dashboard";
import CallsEmailsChart from "./components/CallsEmailsChart";
import "./styles/main.css";

function App() {
  const [selectedUserId, setSelectedUserId] = useState("");

  return (
    <div className="app-container">
      <Dropdown onSelectUser={setSelectedUserId} />
      {selectedUserId && <Dashboard selectedUserId={selectedUserId} />}
    </div>
  );
}

export default App;
