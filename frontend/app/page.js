"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/") 
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Frontend is running</h1>

      <div className="mt-4">
        {data ? (
          <p className="text-green-500">
            Backend says: {data.message}
          </p>
        ) : (
          <p className="text-red-500">Waiting for backend...</p>
        )}
      </div>
    </main>
  );
}
