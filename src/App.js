// import logo from "./logo.svg";
import "./App.css";
// import Posts from "./Components/Posts";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

function App() {
  const queryClient = useQueryClient();

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

  

  const mutation = useMutation({
    mutationFn: (deletePostId) => {
      return fetch(
        `https://jsonplaceholder.typicode.com/posts/${deletePostId}`,
        {
          method: "DELETE",
        },
      );
    },
    onSuccess: (_, deleteId) => {
      // queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.setQueryData(["posts"], (oldPosts) => {
        return oldPosts.filter((post) => post.id !== deleteId);
      });
    },
  });

  if (isLoading) {
    return <h2>Loading...</h2>;
  } else if (isError) {
    return <h2>Error fetching posts</h2>;
  }

  // if (isError) {
  //   return <h2>Error</h2>;
  // }

  return (
    <div>
      {posts.map((post) => (
        <div
          key={post.id}
          style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}
        >
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <button onClick={() => mutation.mutate(post.id)}>Delete</button>
          
        </div>

      ))}
    </div>
  );
}

export default App;
