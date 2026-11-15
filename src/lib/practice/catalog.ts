/**
 * Practice Coach catalogue: an ordered coding ladder (one problem at a time, easiest first inside each topic)
 * plus language warm-ups and open practice links. Links are fixed here so no agent invents a URL.
 */

export type Platform = "LeetCode" | "GeeksforGeeks" | "CodeChef" | "HackerRank";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem { id: string; title: string; platform: Platform; url: string; difficulty: Difficulty; minutes: number }
export interface Topic { id: string; name: string; why: string; problems: Problem[] }

const lc = (slug: string, title: string, difficulty: Difficulty): Problem => ({
  id: `lc-${slug}`, title, platform: "LeetCode", url: `https://leetcode.com/problems/${slug}/`, difficulty,
  minutes: difficulty === "Easy" ? 20 : difficulty === "Medium" ? 40 : 60,
});

/** Default topic order (the learner can reorder topics). Problems inside a topic stay easiest-first. */
export const LADDER: Topic[] = [
  { id: "basics", name: "Warm-up and maths", why: "Loops, conditions and number handling every round starts with.", problems: [
    lc("fizz-buzz", "Fizz Buzz", "Easy"), lc("palindrome-number", "Palindrome Number", "Easy"), lc("roman-to-integer", "Roman to Integer", "Easy"),
    lc("plus-one", "Plus One", "Easy"), lc("sqrtx", "Sqrt(x)", "Easy"), lc("missing-number", "Missing Number", "Easy"), lc("single-number", "Single Number", "Easy"),
  ] },
  { id: "arrays", name: "Arrays and hashing", why: "The most common topic in online assessments.", problems: [
    lc("two-sum", "Two Sum", "Easy"), lc("contains-duplicate", "Contains Duplicate", "Easy"), lc("move-zeroes", "Move Zeroes", "Easy"),
    lc("majority-element", "Majority Element", "Easy"), lc("remove-duplicates-from-sorted-array", "Remove Duplicates from Sorted Array", "Easy"),
    lc("merge-sorted-array", "Merge Sorted Array", "Easy"), lc("best-time-to-buy-and-sell-stock", "Best Time to Buy and Sell Stock", "Easy"),
    lc("group-anagrams", "Group Anagrams", "Medium"), lc("top-k-frequent-elements", "Top K Frequent Elements", "Medium"),
    lc("product-of-array-except-self", "Product of Array Except Self", "Medium"), lc("maximum-subarray", "Maximum Subarray", "Medium"),
    lc("sort-colors", "Sort Colors", "Medium"), lc("longest-consecutive-sequence", "Longest Consecutive Sequence", "Medium"),
  ] },
  { id: "strings", name: "Strings", why: "Parsing and string building appear in almost every company test.", problems: [
    lc("reverse-string", "Reverse String", "Easy"), lc("valid-anagram", "Valid Anagram", "Easy"), lc("longest-common-prefix", "Longest Common Prefix", "Easy"),
    lc("valid-palindrome", "Valid Palindrome", "Easy"), lc("longest-substring-without-repeating-characters", "Longest Substring Without Repeating Characters", "Medium"),
  ] },
  { id: "two-pointers", name: "Two pointers and sliding window", why: "Turns O(n²) brute force into O(n).", problems: [
    lc("container-with-most-water", "Container With Most Water", "Medium"), lc("3sum", "3Sum", "Medium"), lc("trapping-rain-water", "Trapping Rain Water", "Hard"),
  ] },
  { id: "stack", name: "Stacks", why: "Brackets, expressions and 'next greater' problems.", problems: [
    lc("valid-parentheses", "Valid Parentheses", "Easy"), lc("min-stack", "Min Stack", "Medium"),
    lc("evaluate-reverse-polish-notation", "Evaluate Reverse Polish Notation", "Medium"), lc("daily-temperatures", "Daily Temperatures", "Medium"),
    lc("generate-parentheses", "Generate Parentheses", "Medium"),
  ] },
  { id: "binary-search", name: "Binary search", why: "Searching sorted data and 'minimum value that works' questions.", problems: [
    lc("binary-search", "Binary Search", "Easy"), lc("search-insert-position", "Search Insert Position", "Easy"),
    lc("search-a-2d-matrix", "Search a 2D Matrix", "Medium"), lc("koko-eating-bananas", "Koko Eating Bananas", "Medium"),
    lc("find-minimum-in-rotated-sorted-array", "Find Minimum in Rotated Sorted Array", "Medium"), lc("search-in-rotated-sorted-array", "Search in Rotated Sorted Array", "Medium"),
  ] },
  { id: "linked-list", name: "Linked lists", why: "Pointer handling, a favourite of technical interviews.", problems: [
    lc("reverse-linked-list", "Reverse Linked List", "Easy"), lc("merge-two-sorted-lists", "Merge Two Sorted Lists", "Easy"),
    lc("linked-list-cycle", "Linked List Cycle", "Easy"), lc("remove-nth-node-from-end-of-list", "Remove Nth Node From End of List", "Medium"),
    lc("reorder-list", "Reorder List", "Medium"),
  ] },
  { id: "trees", name: "Trees", why: "Recursion practice and a staple of product-company rounds.", problems: [
    lc("invert-binary-tree", "Invert Binary Tree", "Easy"), lc("maximum-depth-of-binary-tree", "Maximum Depth of Binary Tree", "Easy"),
    lc("same-tree", "Same Tree", "Easy"), lc("diameter-of-binary-tree", "Diameter of Binary Tree", "Easy"), lc("balanced-binary-tree", "Balanced Binary Tree", "Easy"),
    lc("subtree-of-another-tree", "Subtree of Another Tree", "Easy"), lc("binary-tree-level-order-traversal", "Binary Tree Level Order Traversal", "Medium"),
    lc("lowest-common-ancestor-of-a-binary-search-tree", "Lowest Common Ancestor of a BST", "Medium"),
    lc("validate-binary-search-tree", "Validate Binary Search Tree", "Medium"), lc("kth-smallest-element-in-a-bst", "Kth Smallest Element in a BST", "Medium"),
  ] },
  { id: "heap-intervals", name: "Heaps and intervals", why: "Scheduling and 'top k' problems.", problems: [
    lc("kth-largest-element-in-an-array", "Kth Largest Element in an Array", "Medium"), lc("merge-intervals", "Merge Intervals", "Medium"),
  ] },
  { id: "backtracking", name: "Backtracking", why: "Generate every option systematically.", problems: [
    lc("subsets", "Subsets", "Medium"), lc("permutations", "Permutations", "Medium"), lc("combination-sum", "Combination Sum", "Medium"), lc("word-search", "Word Search", "Medium"),
  ] },
  { id: "graphs", name: "Graphs", why: "BFS/DFS on grids and dependencies.", problems: [
    lc("number-of-islands", "Number of Islands", "Medium"), lc("rotting-oranges", "Rotting Oranges", "Medium"), lc("clone-graph", "Clone Graph", "Medium"),
    lc("course-schedule", "Course Schedule", "Medium"), lc("pacific-atlantic-water-flow", "Pacific Atlantic Water Flow", "Medium"),
    lc("implement-trie-prefix-tree", "Implement Trie (Prefix Tree)", "Medium"),
  ] },
  { id: "dp", name: "Dynamic programming", why: "The hardest common topic; start only after recursion feels easy.", problems: [
    lc("climbing-stairs", "Climbing Stairs", "Easy"), lc("pascals-triangle", "Pascal's Triangle", "Easy"), lc("house-robber", "House Robber", "Medium"),
    lc("unique-paths", "Unique Paths", "Medium"), lc("jump-game", "Jump Game", "Medium"), lc("coin-change", "Coin Change", "Medium"),
    lc("longest-increasing-subsequence", "Longest Increasing Subsequence", "Medium"), lc("longest-common-subsequence", "Longest Common Subsequence", "Medium"),
  ] },
];

export const ALL_PROBLEMS = LADDER.flatMap((t) => t.problems);

/** Language warm-ups (HackerRank tracks) shown before the ladder for the learner's main language. */
export const WARMUPS: Record<string, { title: string; url: string }> = {
  Python: { title: "Python track", url: "https://www.hackerrank.com/domains/python" },
  Java: { title: "Java track", url: "https://www.hackerrank.com/domains/java" },
  C: { title: "C track", url: "https://www.hackerrank.com/domains/c" },
  "C++": { title: "C++ track", url: "https://www.hackerrank.com/domains/cpp" },
  SQL: { title: "SQL track", url: "https://www.hackerrank.com/domains/sql" },
  Bash: { title: "Linux Shell track", url: "https://www.hackerrank.com/domains/shell" },
  JavaScript: { title: "10 Days of JavaScript", url: "https://www.hackerrank.com/domains/tutorials/10-days-of-javascript" },
};

/** Extra open practice once the ladder topic is done. */
export const OPEN_PRACTICE: { platform: Platform; title: string; url: string }[] = [
  { platform: "GeeksforGeeks", title: "Practice problems by topic and company", url: "https://www.geeksforgeeks.org/explore" },
  { platform: "CodeChef", title: "Practice problems by difficulty rating", url: "https://www.codechef.com/practice" },
  { platform: "HackerRank", title: "Algorithms and data structures domains", url: "https://www.hackerrank.com/domains/algorithms" },
  { platform: "LeetCode", title: "Problem set", url: "https://leetcode.com/problemset/" },
];

export type Status = "todo" | "solved" | "skipped";

/**
 * Practice Coach pacing: how many problems to unlock at once.
 * weeklyHours and pace (1.0 = average, from the Progress Tracker) set the daily load; at least 1, at most 5.
 */
export function dailyTarget(weeklyHours: number, pace = 1): number {
  const hoursPerDay = Math.max(0.25, weeklyHours / 7);
  return Math.min(5, Math.max(1, Math.round(hoursPerDay * 1.5 * pace)));
}

/** The next problems to work on, in the learner's topic order, skipping solved/skipped ones. */
export function nextProblems(topicOrder: string[], status: Record<string, Status>, count: number): (Problem & { topic: string })[] {
  const ordered = [...topicOrder.map((id) => LADDER.find((t) => t.id === id)).filter(Boolean), ...LADDER.filter((t) => !topicOrder.includes(t.id))] as Topic[];
  const out: (Problem & { topic: string })[] = [];
  for (const t of ordered) for (const p of t.problems) {
    if (out.length >= count) return out;
    if ((status[p.id] ?? "todo") === "todo") out.push({ ...p, topic: t.name });
  }
  return out;
}

/** Learning pace from real results: time taken vs the estimate for solved problems (clamped 0.5–2). */
export function paceFrom(samples: { estimateMin: number; actualMin: number }[]): number {
  const valid = samples.filter((s) => s.actualMin > 0 && s.estimateMin > 0);
  if (valid.length < 3) return 1;
  const ratio = valid.reduce((t, s) => t + s.estimateMin / s.actualMin, 0) / valid.length;
  return Math.min(2, Math.max(0.5, Math.round(ratio * 100) / 100));
}
