import React from "react";
import { useEffect } from "react";
import "./dashboard.css";

const Dashboard = () => {
  useEffect(() => {

    // for (let row = 0; row < numRows; row++) {
    //   for (let col = 0; col < numCols; col++) {
    //     ctx.fillText(
    //       `N`,
    //       col * cellWidth + cellWidth / 1,
    //       row * cellHeight + cellHeight / 1
    //     );
    //   }
    // }
  }, []);
  return (
    <div className="dashBoard">
      <canvas id="myCanvas" className="myCanvas" ></canvas>
    </div>
  );
};

export default Dashboard;
