import { BrowserRouter, Routes, Route } from "react-router-dom";
import TutorWhiteboard from "./components/TutorWhiteboard";
import StudentWhiteboard from "./components/StudentWhiteboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tutor" element={<TutorWhiteboard />} />
        <Route path="/student" element={<StudentWhiteboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
