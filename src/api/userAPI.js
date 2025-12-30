

// const BASE_URL = "http://10.140.56.126:5000/api/room"; // m51
// const BASE_URL = "http://192.168.1.147:5000/api/room"; 

const BASE_URL = process.env.VITE_SOCKET_URL + "/api/room";

const commonHeaders = {
  "Content-Type": "application/json",
};

/* =======================
   Tutor API
======================= */
export const generateTutorLink = async () => {
  const body = {
    tutorName: "John Tutor3",
    tutorId: "tutor_1234",
    permissions: {
      canDraw: true,
      canChat: true,
    },
  };

  const response = await fetch(`${BASE_URL}/generate-tutor-link`, {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to generate tutor link");
  }

  return await response.json();
};

/* =======================
   Student API (FIXED)
======================= */
export const generateStudentLink = async ({ tutorId, roomId }) => {
  const body = {
    tutorId,
    roomId,
  };

  const response = await fetch(`${BASE_URL}/generate-student-link`, {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to generate student link");
  }

  return await response.json();
};
