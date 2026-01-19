import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "./styles/PostDetailsPage.css";
import "../App.css";

function PostDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const postId = Number(id);

  const queryClient = useQueryClient();

  const fetchPost = async () => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
    if (!res.ok) throw new Error("Failed to fetch post");
    return res.json();
  };

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: fetchPost,
    // ✅ use cache from posts list if available
    initialData: () => {
      const posts = queryClient.getQueryData(["posts"]);
      return posts?.find((p) => p.id === postId);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return true;
    },
    onSuccess: () => {
      // remove from posts list cache
      queryClient.setQueryData(["posts"], (old) =>
        old ? old.filter((p) => p.id !== postId) : old
      );
      // remove individual post cache
      queryClient.removeQueries({ queryKey: ["post", postId] });

      navigate("/");
    },
  });

  if (isLoading) return <h2>Loading...</h2>;
  if (isError || !post) return <h2>Post not found</h2>;

  return (
    <div className="main_div posts_app details_page">
      <button className="back_btn" onClick={() => navigate("/")}>
        ← Back to Posts
      </button>

      <button
        className="delete_post_btn"
        onClick={() => deleteMutation.mutate()}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? "Deleting..." : "Delete Post"}
      </button>

      <div className="details_card">
        <h1 className="details_title">{post.title}</h1>
        <p className="details_meta">
          By User {post.userId} • Post #{post.id}
        </p>
        <p className="details_body">{post.body}</p>
      </div>
    </div>
  );
}

export default PostDetailsPage;
