// import React, { useState } from "react";
// import "./Home.css";

// import {
//   generateTutorLink,
//   generateStudentLink,
// } from "../api/userAPI";

// const Home = () => {
//   const [tutorLink, setTutorLink] = useState("");
//   const [studentLink, setStudentLink] = useState("");

//   const [roomId, setRoomId] = useState("");
//   const [tutorId, setTutorId] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   /* =======================
//      Generate Tutor + Auto Student
//   ======================= */
//   const handleTutorClick = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // 1️⃣ Tutor link
//       const tutorData = await generateTutorLink();

//       setTutorLink(tutorData.url);
//       setRoomId(tutorData.roomId);
//       setTutorId(tutorData.tutorId);

//       // 2️⃣ Auto student link
//       const studentData = await generateStudentLink({
//         tutorId: tutorData.tutorId,
//         roomId: tutorData.roomId,
//       });

//       setStudentLink(studentData.url);

//     } catch (err) {
//       console.error(err);
//       setError("Failed to generate links");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     alert("Copied to clipboard!");
//   };

//   return (
//     <div className="home-container">
//       <h1 className="home-title text-center">
//         Welcome to the NNIIT!!!
//       </h1>

//       {error && <p className="error-text">{error}</p>}

//       <div className="card-wrapper">
//         {/* Tutor Card */}
//         <div className="card tutor-card">
//           <h2>Tutor Link Generation</h2>

//           <button
//             className="btn tutor-btn"
//             onClick={handleTutorClick}
//             disabled={loading}
//           >
//             Generate Tutor Link
//           </button>

//           <input
//             type="text"
//             value={tutorLink}
//             readOnly
//             placeholder="Tutor link will appear here"
//           />

//           <button
//             className="copy-btn tutor-copy"
//             onClick={() => copyToClipboard(tutorLink)}
//             disabled={!tutorLink}
//           >
//             ✔ Copy Link
//           </button>

//           {roomId && <p><strong>Room ID:</strong> {roomId}</p>}
//           {tutorId && <p><strong>Tutor ID:</strong> {tutorId}</p>}
//         </div>

//         {/* Student Card */}
//         <div className="card student-card">
//           <h2>Student Link Generation</h2>

//           <input
//             type="text"
//             value={studentLink}
//             readOnly
//             placeholder="Student link will appear here"
//           />

//           <button
//             className="copy-btn student-copy"
//             onClick={() => copyToClipboard(studentLink)}
//             disabled={!studentLink}
//           >
//             ✔ Copy Link
//           </button>
//         </div>
//       </div>

//       {loading && <p className="loading-text">Loading...</p>}
//     </div>
//   );
// };

// export default Home;


import React, { useState } from "react";
import "./Home.css";

import {
  generateTutorLink,
  generateStudentLink,
} from "../api/userAPI";

const Home = () => {
  const [tutorLink, setTutorLink] = useState("");
  const [studentLink, setStudentLink] = useState("");

  const [roomId, setRoomId] = useState("");
  const [tutorId, setTutorId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =======================
     Generate Tutor + Auto Student
  ======================= */
  const handleTutorClick = async () => {
    try {
      setLoading(true);
      setError("");

      // 1️⃣ Generate tutor link
      const tutorData = await generateTutorLink();

      setTutorLink(tutorData.url);
      setRoomId(tutorData.roomId);
      setTutorId(tutorData.tutorId);

      // 2️⃣ Auto-generate student link
      const studentData = await generateStudentLink({
        tutorId: tutorData.tutorId,
        roomId: tutorData.roomId,
      });

      setStudentLink(studentData.url);

    } catch (err) {
      console.error(err);
      setError("Failed to generate links");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const openTutorLink = () => {
    if (!tutorLink) return;
    window.open(tutorLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="home-container">
      <h1 className="home-title text-center">
        Welcome to the NNIIT!!!
      </h1>

      {error && <p className="error-text">{error}</p>}

      <div className="card-wrapper">
        {/* ================= Tutor Card ================= */}
        <div className="card tutor-card">
          <h2>Tutor Link Generation</h2>

          <button
            className="btn tutor-btn"
            onClick={handleTutorClick}
            disabled={loading}
          >
            Generate Tutor Link
          </button>

          <input
            type="text"
            value={tutorLink}
            readOnly
            placeholder="Tutor link will appear here"
          />

          <button
            className="copy-btn tutor-copy"
            onClick={() => copyToClipboard(tutorLink)}
            disabled={!tutorLink}
          >
            ✔ Copy Link
          </button>

          <button
            className="open-btn tutor-open"
            onClick={openTutorLink}
            disabled={!tutorLink}
          >
            🔗 Open Tutor Link
          </button>

          {roomId && <p><strong>Room ID:</strong> {roomId}</p>}
          {tutorId && <p><strong>Tutor ID:</strong> {tutorId}</p>}
        </div>

        {/* ================= Student Card ================= */}
        <div className="card student-card">
          <h2>Student Link Generation</h2>

          <input
            type="text"
            value={studentLink}
            readOnly
            placeholder="Student link will appear here"
          />

          <button
            className="copy-btn student-copy"
            onClick={() => copyToClipboard(studentLink)}
            disabled={!studentLink}
          >
            ✔ Copy Link
          </button>
        </div>
      </div>

      {loading && <p className="loading-text">Loading...</p>}
    </div>
  );
};

export default Home;
