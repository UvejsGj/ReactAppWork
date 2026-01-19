import "./App.css";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = "https://jsonplaceholder.typicode.com/posts";
const MODAL_ANIM_MS = 200;

/** --- API helpers --- */
async function fetchPosts() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

async function createPost({ title, body }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ title, body, userId: 1 }),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}

async function deletePost(postId) {
  const res = await fetch(`${API_URL}/${postId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete post");
  return postId;
}

/** --- tiny modal state helper --- */
function useModal(animationMs = MODAL_ANIM_MS) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const open = () => {
    setIsClosing(false);
    setIsOpen(true);
  };

  const close = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, animationMs);
  };

  return { isOpen, isClosing, open, close };
}

function App() {
  const queryClient = useQueryClient();

  const modal = useModal();
  const [form, setForm] = useState({ title: "", body: "" });
  const [deletingId, setDeletingId] = useState(null);

  const isSubmitDisabled = useMemo(() => {
    return !form.title.trim() || !form.body.trim();
  }, [form.title, form.body]);

  const {
    data: posts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      queryClient.setQueryData(["posts"], (old = []) => [newPost, ...old]);
      modal.close();
      setForm({ title: "", body: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onMutate: (postId) => {
      setDeletingId(postId);
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(["posts"], (old = []) =>
        old.filter((p) => p.id !== deletedId),
      );
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleSubmit = async () => {
    // optional: guard for safety
    if (isSubmitDisabled || createMutation.isPending) return;
    await createMutation.mutateAsync({ title: form.title, body: form.body });
  };

  if (isLoading) return <h2>Loading...</h2>;
  if (isError) return <h2>Error fetching posts</h2>;

  return (
    <div className="main_div posts_app">
      <button className="createbttn" onClick={modal.open}>Create Post</button>

      {modal.isOpen && (
        <div
          className={`modal_overlay ${modal.isClosing ? "closing" : "open"}`}
          onClick={modal.close}
        >
          <div
            className={`modal ${modal.isClosing ? "closing" : "open"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create a post</h2>

            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />

            <textarea
              placeholder="Body"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={5}
            />

            <div className="modal_actions">
              <button className="cancel_btn" onClick={modal.close}>
                Cancel
              </button>

              <button
                className="submit_btn"
                onClick={handleSubmit}
                disabled={isSubmitDisabled || createMutation.isPending}
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

      {posts.map((post) => {
        const isDeletingThis =
          deletingId === post.id && deleteMutation.isPending;

        return (
          <div
            className="card"
            key={post.id}
            style={{ border: "1px solid gray", margin: 10, padding: 10 }}
          >
            <h3>{post.title}</h3>
            <h2>User {post.userId}</h2>
            <p className="pbody">{post.body}</p>

            <button
              className="delbttn"
              onClick={() => deleteMutation.mutate(post.id)}
              disabled={isDeletingThis}
            >
              {isDeletingThis ? "Deleting..." : "Delete Data"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default App;
