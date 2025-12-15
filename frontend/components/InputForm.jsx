"use client";

import { useState } from "react";

export default function InputForm({ onGenerate }) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("neutral");
  const [length, setLength] = useState(500);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      alert("Please enter a topic bro 😭");
      return;
    }

    onGenerate({ topic, tone, length });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <div>
        <label className="block mb-1 font-medium">Topic</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 rounded bg-neutral-900 border border-neutral-700"
          placeholder="e.g. Future of AI, Digital Marketing, etc"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Tone</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full p-2 rounded bg-neutral-900 border border-neutral-700"
        >
          <option value="neutral">Neutral</option>
          <option value="formal">Formal</option>
          <option value="informal">Informal</option>
          <option value="friendly">Friendly</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Length: {length} words</label>
        <input
          type="range"
          min="100"
          max="1500"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-green-500 text-black rounded font-semibold hover:bg-green-400 transition"
      >
        Generate Content
      </button>
    </form>
  );
}
