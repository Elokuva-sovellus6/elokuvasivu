import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeScreen from "./screens/HomeScreen";
import MovieScreen from "./screens/MovieScreen";
import MoviePage from "./components/MoviePage";
import GroupScreen from "./screens/GroupScreen";
import GroupPage from "./components/GroupPage";
import ProfileScreen from "./screens/ProfileScreen";
import ShowScreen from "./screens/ShowScreen";
import FavouriteList from "./components/FavouriteList";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/authContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <div className="container py-4">
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/movie/:id" element={<MoviePage />} />
                <Route path="/movies" element={<MovieScreen />} />
                <Route path="/shows" element={<ShowScreen />} />
                <Route path="/groups/:groupId" element={<GroupPage />} />
                <Route path="/groups" element={<GroupScreen />} />
                <Route path="/favourites/:userId/public" element={<FavouriteList />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileScreen />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;