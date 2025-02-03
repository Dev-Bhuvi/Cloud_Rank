import React, { useEffect, useState } from "react";
import CallsEmailsChart from "./CallsEmailsChart";
import "./Dashboard.css";

const Dashboard = ({ selectedUserId }) => {
  const [accounts, setAccounts] = useState([]);
  const [calls, setCalls] = useState([]);
  const [emails, setEmails] = useState([]);
  const [userTerritory, setUserTerritory] = useState("");
  const [selectedCallType, setSelectedCallType] = useState(null); // Track selected call type for the right table
  const [currentPage, setCurrentPage] = useState(1); // Track current page for account summary table
  const [selectedCallPage, setSelectedCallPage] = useState(1); // Track current page for selected call type table
  const itemsPerPage = 12; // Items per page for tables
  const [selectedUserName, setSelectedUserName] = useState("");

  useEffect(() => {
    if (!selectedUserId) return;

    Promise.all([
      fetch("/data/users.json").then((res) => res.json()),
      fetch("/data/accounts.json").then((res) => res.json()),
      fetch("/data/calls.json").then((res) => res.json()),
      fetch("/data/emails.json").then((res) => res.json()),
    ])
      .then(([usersData, accountsData, callsData, emailsData]) => {
        const user = usersData.find((u) => u.userId === selectedUserId);
        if (!user) return;

        setUserTerritory(user.territory);
        setSelectedUserName(user.userName);

        const userAccounts = accountsData.filter(
          (acc) => acc.territory === user.territory
        );
        setAccounts(userAccounts);

        const accountIds = userAccounts.map((acc) => acc.id);
        const filteredCalls = callsData.filter((call) =>
          accountIds.includes(call.accountId)
        );

        setCalls(filteredCalls);
        setEmails(emailsData.filter((email) => accountIds.includes(email.accountId)));
      })
      .catch((error) => console.error("Error loading data:", error));
  }, [selectedUserId]);

  const handleCallTypeClick = (callType) => {
    setSelectedCallType(callType); // Set the selected call type when clicked on a chart segment
    setSelectedCallPage(1); // Reset to first page when changing the call type
  };

  // Get filtered calls based on selected call type
  const filteredCalls = selectedCallType
    ? calls.filter((call) => call.callType === selectedCallType)
    : [];

  // Aggregate data for the account summary table for the selected user's territory only
  const accountSummary = accounts
    .filter((account) => account.territory === userTerritory)
    .map((account) => {
      const accountCalls = calls.filter((call) => call.accountId === account.id);
      const accountEmails = emails.filter((email) => email.accountId === account.id);

      const latestCallDate = accountCalls.length
        ? new Date(Math.max(...accountCalls.map((call) => new Date(call.callDate))))
        : null;

      const latestEmailDate = accountEmails.length
        ? new Date(Math.max(...accountEmails.map((email) => new Date(email.emailDate))))
        : null;

      return {
        accountName: account.name,
        totalCalls: accountCalls.length,
        totalEmails: accountEmails.length,
        latestCallDate: latestCallDate ? latestCallDate.toLocaleDateString() : "N/A",
latestEmailDate: latestEmailDate ? latestEmailDate.toLocaleDateString() : "N/A",
      };
    });

  // Get current page's account summary for the selected user's territory
  const currentAccountSummary = accountSummary.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get current page's filtered calls for the selected call type
  const currentSelectedCalls = filteredCalls.slice(
    (selectedCallPage - 1) * itemsPerPage,
    selectedCallPage * itemsPerPage
  );

  // Pagination control for account summary table
  const handleSummaryPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalSummaryPages) return;
    setCurrentPage(newPage);
  };

  // Pagination control for selected call type table
  const handleSelectedCallPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalSelectedCallPages) return;
    setSelectedCallPage(newPage);
  };

  // Calculate total pages for account summary
  const totalSummaryPages = Math.ceil(accountSummary.length / itemsPerPage);
  
  // Calculate total pages for selected call type table
  const totalSelectedCallPages = Math.ceil(filteredCalls.length / itemsPerPage);

  return (
    <div className="dashboard-container">
      {/* Section 1 */}
      <div className="section-one">
        <div className="left-section">
          <CallsEmailsChart calls={calls} onClickCallType={handleCallTypeClick} />
        </div>

        <div className="right-section">
          {selectedCallType && (
            <>
              <h3>{selectedCallType} Calls</h3>
              <table>
                <thead>
                  <tr>
                    <th>Call ID</th>
                    <th>Account Name</th>
                    <th>Call Date</th>
                    <th>Call Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSelectedCalls.length === 0 ? (
                    <tr>
                      <td colSpan="4">No calls found for {selectedCallType}.</td>
                    </tr>
                  ) : (
                    currentSelectedCalls.map((call) => {
                      const account = accounts.find((acc) => acc.id === call.accountId);
                      return (
                        <tr key={call.id}>
                          <td>{call.id}</td>
                          <td>{account ? account.name : "Unknown"}</td>
                          <td>{new Date(call.callDate).toLocaleDateString()}</td>
                          <td>{call.callStatus}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination for Selected Call Type Table */}
              <div className="pagination">
                <button onClick={() => handleSelectedCallPageChange(selectedCallPage - 1)} disabled={selectedCallPage === 1}>
                  Previous
                </button>
                <span>{`${selectedCallPage} / ${totalSelectedCallPages}`}</span>
                <button onClick={() => handleSelectedCallPageChange(selectedCallPage + 1)} disabled={selectedCallPage === totalSelectedCallPages}>
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section 2 */}
      <div className="section-two">
        <h3>{selectedUserName ? `${selectedUserName}'s Teritory Account Details` : "Account Summary"}</h3>
        <table>
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Total Calls</th>
              <th>Total Emails</th>
              <th>Latest Call Date</th>
              <th>Latest Email Date</th>
            </tr>
          </thead>
          <tbody>
            {currentAccountSummary.length === 0 ? (
              <tr>
                <td colSpan="5">No summary data available.</td>
              </tr>
            ) : (
              currentAccountSummary.map((summary, index) => (
                <tr key={index}>
                  <td>{summary.accountName}</td>
                  <td>{summary.totalCalls}</td>
                  <td>{summary.totalEmails}</td>
                  <td>{summary.latestCallDate}</td>
                  <td>{summary.latestEmailDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination for Account Summary Table */}
        <div className="pagination">
          <button onClick={() => handleSummaryPageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span>{`Page ${currentPage} of ${totalSummaryPages}`}</span>
          <button onClick={() => handleSummaryPageChange(currentPage + 1)} disabled={currentPage === totalSummaryPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
