"use client";

import { useState } from "react";

export default function InputForm({ onGenerate }) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional"); // Matched default in backend
  const [contentType, setContentType] = useState("blog post"); // New field
  const [targetAudience, setTargetAudience] = useState("general audience"); // New field

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      alert("Please enter a topic bro 😭");
      return;
    }

    // Send data matching the Python Schema (camelCase to snake_case conversion happens here or in page.js)
    // We will send it as simple JS objects and map them in the fetch call
    onGenerate({ 
      topic, 
      tone, 
      content_type: contentType, 
      target_audience: targetAudience 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto bg-neutral-900 p-6 rounded-lg border border-neutral-800">
      
      {/* TOPIC */}
      <div>
        <label className="block mb-2 text-sm font-medium text-neutral-300">Topic</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2.5 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-2 focus:ring-green-500 outline-none"
          placeholder="e.g. Future of AI, Digital Marketing..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* CONTENT TYPE */}
        <div>
          <label className="block mb-2 text-sm font-medium text-neutral-300">Content Type</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full p-2.5 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="blog post">Blog Post</option>
            <option value="tweet">Tweet</option>
            <option value="linkedin post">LinkedIn Post</option>
            <option value="email newsletter">Email Newsletter</option>
          </select>
        </div>

        {/* TONE */}
        <div>
          <label className="block mb-2 text-sm font-medium text-neutral-300">Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full p-2.5 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="professional">Professional</option>
            <option value="funny">Funny</option>
            <option value="enthusiastic">Enthusiastic</option>
            <option value="serious">Serious</option>
            <option value="casual">Casual</option>
          </select>
        </div>
      </div>

      {/* TARGET AUDIENCE */}
      <div>
        <label className="block mb-2 text-sm font-medium text-neutral-300">Target Audience</label>
        <input
          type="text"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          className="w-full p-2.5 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-2 focus:ring-green-500 outline-none"
          placeholder="e.g. Developers, Students, CEOs..."
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-green-500 text-black rounded font-bold hover:bg-green-400 transition transform active:scale-95"
      >
        ✨ Generate Content
      </button>
    </form>
  );
}