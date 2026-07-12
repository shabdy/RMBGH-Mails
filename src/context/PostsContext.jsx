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

  // Everything below updates local state immediately (optimistic) so the UI
  // never waits on the network round-trip for a click/tap to register — the
  // server call happens in the background and reconciles or rolls back.

  const uploadFiles = async (files) => {
    if (!files?.length) return [];
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const { data } = await api.post("/posts/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.files;
  };

  const createPost = async (content, attachments = []) => {
    const cu = buildCurrentUser();
    if (!cu || (!content?.trim() && attachments.length === 0)) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      content: content.trim(),
      from: cu,
      date: "Just now",
      time: "",
      attachments,
      viewedBy: [], comments: [], reactions: [],
      viewCount: 0, commentCount: 0, reactionCount: 0, reactionCounts: {},
      myReaction: null, viewed: true, _pending: true,
    };
    setPosts((prev) => [optimistic, ...prev]);

    try {
      const { data } = await api.post("/posts", { content: content.trim(), from: cu, userId: cu.id, attachments });
      setPosts((prev) => prev.map((p) => (p.id === tempId ? data : p)));
      return data;
    } catch (err) {
      console.error("Create post failed:", err);
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
    }
  };

  const deletePost = async (id) => {
    const prevPosts = posts;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.delete(`/posts/${id}`);
    } catch (err) {
      console.error("Delete post failed:", err);
      setPosts(prevPosts);
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

    const tempCommentId = `temp-${Date.now()}`;
    setPosts((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const comment = { id: tempCommentId, userId: cu.id, name: cu.name, text: text.trim(), date: "Just now", time: "" };
      return { ...p, comments: [...(p.comments || []), comment], commentCount: (p.commentCount || 0) + 1 };
    }));

    try {
      const { data } = await api.post(`/posts/${id}/comments`, { userId: cu.id, name: cu.name, text: text.trim() });
      setPosts((prev) => prev.map((p) => (p.id === id ? data : p)));
    } catch (err) {
      console.error("Add comment failed:", err);
      setPosts((prev) => prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, comments: (p.comments || []).filter((c) => c.id !== tempCommentId), commentCount: Math.max(0, (p.commentCount || 1) - 1) };
      }));
    }
  };

  const react = async (id, type) => {
    const cu = buildCurrentUser();
    if (!cu) return;

    let prevSnapshot;
    setPosts((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      prevSnapshot = p;
      const reactions = p.reactions || [];
      const existingIdx = reactions.findIndex((r) => String(r.userId) === String(cu.id));
      let nextReactions;
      if (existingIdx !== -1 && reactions[existingIdx].type === type) {
        nextReactions = reactions.filter((_, i) => i !== existingIdx);
      } else if (existingIdx !== -1) {
        nextReactions = reactions.map((r, i) => (i === existingIdx ? { ...r, type } : r));
      } else {
        nextReactions = [...reactions, { userId: cu.id, name: cu.name, type }];
      }
      const reactionCounts = nextReactions.reduce((acc, r) => ({ ...acc, [r.type]: (acc[r.type] || 0) + 1 }), {});
      const myReaction = nextReactions.find((r) => String(r.userId) === String(cu.id))?.type || null;
      return { ...p, reactions: nextReactions, reactionCount: nextReactions.length, reactionCounts, myReaction };
    }));

    try {
      const { data } = await api.post(`/posts/${id}/react`, { userId: cu.id, name: cu.name, type });
      setPosts((prev) => prev.map((p) => (p.id === id ? data : p)));
    } catch (err) {
      console.error("React failed:", err);
      if (prevSnapshot) setPosts((prev) => prev.map((p) => (p.id === id ? prevSnapshot : p)));
    }
  };

  return (
    <PostsContext.Provider
      value={{ posts, currentUser: buildCurrentUser(), createPost, deletePost, markViewed, addComment, react, uploadFiles, reload: loadPosts }}
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
