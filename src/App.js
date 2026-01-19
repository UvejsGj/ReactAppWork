import "./App.css";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

function App() {
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [isAnimatingOpen, setIsAnimatingOpen] = useState(false);


  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const openModal = () => {
    setIsClosing(false);
    setIsOpen(true);
    setIsAnimatingOpen(true);

    requestAnimationFrame(() => {
      setIsAnimatingOpen(false);
    });
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200); 
  };

  const fetchPosts = async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!res.ok) throw new Error("Failed to fetch posts");
    return res.json();
  };

  const {
    data: posts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  // delete
  const deleteMutation = useMutation({
    mutationFn: async (deletePostId) => {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${deletePostId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete post");
      return true;
    },
    onSuccess: (_, deleteId) => {
      queryClient.setQueryData(["posts"], (oldPosts) => {
        if (!oldPosts) return oldPosts;
        return oldPosts.filter((post) => post.id !== deleteId);
      });
    },
  });

  // post
  const createPost = async ({ title, body }) => {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });

    if (!res.ok) throw new Error("Failed to create post");
    return res.json();
  };

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      queryClient.setQueryData(["posts"], (oldPosts) => {
        if (!oldPosts) return [newPost];
        return [newPost, ...oldPosts];
      });

      closeModal();
      setTitle("");
      setBody("");
    },
  });

  if (isLoading) return <h2>Loading...</h2>;
  if (isError) return <h2>Error fetching posts</h2>;

  return (
    <div className="main_div posts_app">
      <button className="createbttn" onClick={openModal}>Create Post</button>

      {isOpen && (
        <div
          className={`modal_overlay ${isClosing ? "closing" : "open"}`}
          onClick={closeModal}
        >
          <div
            className={`modal ${isClosing ? "closing" : "open"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create a post</h2>

            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
            />

            <div className="modal_actions">
              <button className="cancel_btn" onClick={closeModal}>
                Cancel
              </button>

              <button
                className="submit_btn"
                onClick={() => createMutation.mutate({ title, body })}
                disabled={
                  !title.trim() || !body.trim() || createMutation.isPending
                }
              >
                {createMutation.isPending ? "Posting..." : "Post"}
              </button>
            </div>

            {createMutation.isError && (
              <p className="error">Error creating post</p>
            )}
          </div>
        </div>
      )}

      <h1>Posts</h1>
      <p>Browse and manage your posts</p>

      {posts.map((post) => (
        <div
          className="card"
          key={post.id}
          style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}
        >
          <h3>{post.title}</h3>
          <h2>User {post.userId}</h2>
          <p className="pbody">{post.body}</p>

          <button
            className="delbttn"
            onClick={() => deleteMutation.mutate(post.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Data"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
