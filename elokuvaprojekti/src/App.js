import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeScreen from "./screens/HomeScreen";
import MovieScreen from "./screens/MovieScreen";
import GroupScreen from "./screens/GroupScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ShowScreen from "./screens/ShowScreen";
import { AuthProvider } from "./context/authContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container py-4">
          <Routes>
            {/* <Route path="/" element={<HomeScreen />} /> */}
            <Route path="/movie/:id" element={<MovieScreen />} />
            <Route path="/shows" element={<ShowScreen />} />
            <Route path="/group" element={<GroupScreen />} />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            }/>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;



