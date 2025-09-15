import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomeScreen from "./screens/HomeScreen";
import MovieScreen from "./screens/MovieScreen";
import GroupScreen from "./screens/GroupScreen";
import ShowScreen from "./screens/ShowScreen";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container py-4">
        <Routes>
          {/* <Route path="/" element={<HomeScreen />} /> */}
          <Route path="/movie/:id" element={<MovieScreen />} />
          {/* <Route path="/profile" element={<ProfileScreen />} /> */}
          <Route path="/shows" element={<ShowScreen />} />
          <Route path="/group" element={<GroupScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;



