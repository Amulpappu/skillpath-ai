import type { Metadata } from "next";
import { PracticeLadder } from "@/components/PracticeLadder";

export const metadata: Metadata = { title: "Coding practice" };

export default function PracticePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight">Coding practice</h1>
      <p className="mt-1 max-w-3xl text-muted">A ladder of well-known interview problems on LeetCode, with warm-ups on HackerRank and open practice on GeeksforGeeks and CodeChef. You see only the next few problems, sized to your weekly hours.</p>
      <div className="mt-6"><PracticeLadder /></div>
    </div>
  );
}
