import { Routes, Route } from "react-router-dom";
import PostsPage from "./Components/PostsPage.js";
import CreatePostPage from "./Components/CreatePostPage.js";
import PostDetailsPage from "./Components/PostDetailsPage.js";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PostsPage />} />
      <Route path="/new" element={<CreatePostPage />} />
      <Route path="/posts/:id" element={<PostDetailsPage />} />
    </Routes>
  );
}

export default App;