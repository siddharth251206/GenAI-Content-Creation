"use client";

import { useState } from "react";
import InputForm from "../components/InputForm";
import LoadingSection from "../components/LoadingSection";
import ResultSection from "../components/ResultSection";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (formInput) => {
    console.log("User input:", formInput);

    setLoading(true);

    setTimeout(() => {
      setData({
        blog: "This is a placeholder blog generated without backend.",
        keywords: ["AI", "Future", "Tech"],
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen p-10 text-white bg-neutral-950">
      <h1 className="text-3xl font-bold text-center mb-10">
        GenAI Content Creator
      </h1>

      <InputForm onGenerate={handleGenerate} />

{loading && <LoadingSection />}

      {data && <ResultSection data={data} />}

    </main>
  );
}
