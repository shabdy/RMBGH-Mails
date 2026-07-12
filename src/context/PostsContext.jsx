import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/apiClient";
import { AuthContext } from "./authContext";

const PostsContext = createContext(null);

export function PostsProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);

  const buildCurrentUser = useCallback(() => {
    if (!user) return null;
    return {
      id:           user.id,
      name:         `${user.firstName} ${user.lastName}`,
      email:        user.email,
      department:   user.department   || "Unknown",
      departmentId: user.departmentId || "NONE",
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.firstName, user?.lastName, user?.email, user?.department, user?.departmentId]);

  const loadPosts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await api.get(`/posts?userId=${user.id}`);
      setPosts(data);
    } catch (err) {
      console.error("Failed to load announcement feed:", err);
    }
  }, [user?.id]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const createPost = async (content) => {
    const cu = buildCurrentUser();
    if (!cu || !content?.trim()) return;
    try {
      const { data } = await api.post("/posts", { content: content.trim(), from: cu, userId: cu.id });
      setPosts((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error("Create post failed:", err);
    }
  };

  const deletePost = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete post failed:", err);
    }
  };

  const markViewed = async (id) => {
    const cu = buildCurrentUser();
    if (!cu) return;
    try {
      const { data } = await api.post(`/posts/${id}/view`, { userId: cu.id, name: cu.name });
      setPosts((prev) => prev.map((p) => (p.id === id ? data : p)));
    } catch (err) {
      console.error("Mark viewed failed:", err);
    }
  };

  const addComment = async (id, text) => {
    const cu = buildCurrentUser();
    if (!cu || !text?.trim()) return;
    try {
      const { data } = await api.post(`/posts/${id}/comments`, { userId: cu.id, name: cu.name, text: text.trim() });
      setPosts((prev) => prev.map((p) => (p.id === id ? data : p)));
    } catch (err) {
      console.error("Add comment failed:", err);
    }
  };

  const react = async (id, type) => {
    const cu = buildCurrentUser();
    if (!cu) return;
    try {
      const { data } = await api.post(`/posts/${id}/react`, { userId: cu.id, name: cu.name, type });
      setPosts((prev) => prev.map((p) => (p.id === id ? data : p)));
    } catch (err) {
      console.error("React failed:", err);
    }
  };

  return (
    <PostsContext.Provider
      value={{ posts, currentUser: buildCurrentUser(), createPost, deletePost, markViewed, addComment, react, reload: loadPosts }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside a PostsProvider");
  return ctx;
}
