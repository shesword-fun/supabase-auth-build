"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

export function MerchantComments({ merchantId }: { merchantId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("id, content, created_at, author_id")
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false });
      setComments(data || []);
      setError(error ? "Failed to load comments" : null);
      setLoading(false);
    }
    fetchData();
    // Get current user
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [merchantId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    setError(null);
    const supabase = createClient();
    if (!user) {
      setError("You must be logged in to comment.");
      setPosting(false);
      return;
    }
    const { error } = await supabase
      .from("comments")
      .insert({
        merchant_id: merchantId,
        author_id: user.id,
        content: comment,
      });
    if (error) {
      setError("Failed to post comment");
    } else {
      setComment("");
      // Reload comments
      const { data } = await supabase
        .from("comments")
        .select("id, content, created_at, author_id")
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false });
      setComments(data || []);
    }
    setPosting(false);
  }

  return (
    <div className="mt-8 w-full max-w-md">
      <h2 className="font-semibold mb-2">Comments</h2>
      {loading ? (
        <div>Loading comments...</div>
      ) : (
        <ul className="mb-4">
          {comments.map((c) => (
            <li key={c.id} className="border-b py-2 text-sm">
              <div>{c.content}</div>
              <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
            </li>
          ))}
          {comments.length === 0 && <li className="text-xs text-gray-500">No comments yet.</li>}
        </ul>
      )}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="border rounded px-2 py-1 flex-1"
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={posting}
          />
          <button
            className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
            type="submit"
            disabled={posting || !comment.trim()}
          >
            Post
          </button>
        </form>
      ) : (
        <div className="text-xs text-gray-500">Log in to post a comment.</div>
      )}
      {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
    </div>
  );
}
