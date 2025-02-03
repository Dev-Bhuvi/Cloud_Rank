import React from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const CallsEmailsChart = ({ calls, onClickCallType }) => {
  if (!calls || calls.length === 0) {
    return <p>No call data available.</p>;
  }

  const callCategories = {
    "Face to Face": 0,
    "InPerson": 0,
    "Phone": 0,
    "Email": 0,
    "Other": 0,
  };

  calls.forEach((call) => {
    if (callCategories.hasOwnProperty(call.callType)) {
      callCategories[call.callType]++;
    } else {
      callCategories["Others"]++;
    }
  });

  const totalCalls = calls.length;
  const data = {
    labels: Object.keys(callCategories),
    datasets: [
      {
        label: "Call Distribution",
        data: Object.values(callCategories),
        backgroundColor: ["#1976d2", "#1976d2", "#90caf9", "#64b5f6", "#2196f3"],
        hoverOffset: 4,
        border:0,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const percentage = ((tooltipItem.raw / totalCalls) * 100).toFixed(2);
            return `${tooltipItem.label}: ${percentage}%`;
          },
        },
      },
      legend: {
        position: "top",
      },
    },
    onClick: (event, chartElement) => {
      if (chartElement.length > 0) {
        const index = chartElement[0].index;
        const clickedLabel = data.labels[index];
        onClickCallType(clickedLabel); // Pass clicked call type to parent component
      }
    },
  };

  return (
    <div className="chart-container">
      
      <Pie data={data} options={options} />
    </div>
  );
};

export default CallsEmailsChart;
