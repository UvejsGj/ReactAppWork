import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import "./styles/CreatePostPage.css";
import "../App.css";


function CreatePostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [userId, setUserId] = useState("");

  const createPost = async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        userId: Number(userId),
      }),
    });

    return res.json();
  };

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return [newPost];
        return [newPost, ...old];
      });
      navigate("/");
    },
  });

  return (

    <div className="main_div posts_app create_page">
      <button className="back_btn" onClick={() => navigate("/")}>
        ← Back to Posts
      </button>

      <div className="create_card">
        <h2>Create New Post</h2>
        <p>Share your thoughts with the world</p>

        <label className="form_label">Title</label>
        <input
          className="form_input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title"
        />

        <label className="form_label">User ID</label>
        <input
          className="form_input"
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <label className="form_label">Content</label>
        <textarea
          className="form_textarea"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your post content here..."
        />

        <div className="form_actions">
          <button className="cancel_btn" onClick={() => navigate("/")}>
            Cancel
          </button>
          <button
            className="publish_btn"
            onClick={() => mutation.mutate()}
            disabled={!title.trim() || !body.trim() || !userId || mutation.isPending}
          >
            {mutation.isPending ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;
