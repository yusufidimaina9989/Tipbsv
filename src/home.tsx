import React from "react";

const Homes = () => {
  return (
    <div
      style={{
        backgroundColor: "#f8f8f8",
        padding: "50px 0",
        textAlign: "center",
        margin: "0 20px",
      }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1
          style={{ fontSize: "2.5em", marginBottom: "20px", color: "#4caf50" }}>
          Welcome to TipBSV 💰
        </h1>
        <p style={{ fontSize: "1.2em", marginBottom: "15px",
                  color: "#4caf50", }}>
          Join us in getting more projects on bsv. TipBSV is not just a
          platform; it's a movement towards building secure and scalable
          solutions on enterprise blockchain (bsv blockchain).
        </p>
        <p style={{ fontSize: "1.2em", marginBottom: "15px", color: "#4caf50", }}>
          Contribute to our mission by responsibly tipping or develop a solution
          that will solve problem and increase onchain interaction and
          blockchain adoption.
        </p>

        <div
          style={{
            backgroundColor: "#fff",
            padding: "50px 0",
            textAlign: "center",
            margin: "0 20px",
          }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "2.5em",
                marginBottom: "20px",
                color: "#4caf50",
              }}>
              How It Works
            </h2>
            <hr />
            <div style={{ marginBottom: "30px" }}>
              <p
                style={{
                  fontSize: "1.2em",
                  marginBottom: "10px",
                  color: "#4caf50",
                }}>
                TODO
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          backgroundColor: "#4caf50",
          color: "white",
          padding: "20px 0",
          textAlign: "center",
        }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "20px",
          }}>
          <a
            href="https://twitter.com/gashinge9989"
            target="_blank"
            rel="noopener noreferrer"
            style={{ margin: "0 10px" }}>
            <img
              src="https://res.cloudinary.com/dzl44lobc/image/upload/v1702305527/gi40ee5fzrqxeqq8yzsu.jpg"
              alt="Twitter"
              style={{ width: "40px", height: "auto" }}
            />
          </a>
          <a
            href="https://discord.com/invite/yourdiscordinvite"
            target="_blank"
            rel="noopener noreferrer"
            style={{ margin: "0 10px" }}>
            <img
              src="https://res.cloudinary.com/dzl44lobc/image/upload/v1702305527/nwzrdayxprgodwmjzfid.png"
              alt="Discord"
              style={{ width: "40px", height: "auto" }}
            />
          </a>
        </div>
        <p>&copy; TipBSV. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Homes;