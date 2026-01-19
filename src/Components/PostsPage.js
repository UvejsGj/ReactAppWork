import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "./styles/PostsPage.css"; 

function PostsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchPosts = async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!res.ok) throw new Error("Failed to fetch posts");
    return res.json();
  };

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        return old.filter((post) => post.id !== id);
      });
    },
  });

  if (isLoading) return <h2>Loading...</h2>;
  if (isError) return <h2>Error</h2>;

  return (
    <div className="main_div posts_app">
      {/* Give this button a class so CSS can target it without breaking other pages */}
      <button className="create_btn" onClick={() => navigate("/new")}>
        Create Post
      </button>

      <h1>Posts</h1>
      <p>Browse and manage your posts</p>

      {posts.map((post) => (
        <div
          key={post.id}
          className="card"
          onClick={() => navigate(`/posts/${post.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate(`/posts/${post.id}`);
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <h3>{post.title}</h3>
          <h2>User {post.userId}</h2>
          <p className="pbody">{post.body}</p>

          
        </div>
      ))}
    </div>
  );
}

export default PostsPage;
