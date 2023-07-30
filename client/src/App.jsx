import { Routes, Route } from "react-router-dom";
import AudioRecorder from "./components/AudioRecorder";
import AudioPlayer from "./components/AudioPlayer";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/profesor" element={<AudioRecorder />} />
        <Route path="/alumno" element={<AudioPlayer />} />
      </Routes>
    </div>
  );
}

export default App;
