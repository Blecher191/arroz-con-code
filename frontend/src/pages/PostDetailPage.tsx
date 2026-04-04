import { useParams } from "react-router";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Post #{id}</h1>
      <p className="mt-4 text-gray-600">
        Post body content goes here. This page is public — anyone can read it.
      </p>

      <hr className="my-8 border-gray-200" />

      <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
      <p className="mt-2 text-sm text-gray-500">
        No comments yet. Sign in to leave one.
      </p>

      {/* Comment input — gated behind login in real implementation */}
      <div className="mt-6 flex gap-2">
        <input
          type="text"
          placeholder="Write a comment... (sign in required)"
          disabled
          className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400"
        />
        <button
          disabled
          className="cursor-not-allowed rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-400"
        >
          Post
        </button>
      </div>
    </section>
  );
}
