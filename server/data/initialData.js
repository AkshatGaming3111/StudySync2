// Initial seed data for StudySync - Clean Schema without Demo Accounts
const initialData = {
  users: [],
  classes: [],
  assignments: [],
  submissions: [],
  tests: [],
  testResults: [],
  badges: [
    {
      id: "b_founder",
      name: "Platform Pioneer",
      description: "Early educator or student joining StudySync.",
      icon: "Sparkles",
      color: "from-amber-400 to-orange-500",
      rarity: "Legendary"
    },
    {
      id: "b_master_educator",
      name: "Master Educator",
      description: "Created interactive classroom assignments with AI auto-grading.",
      icon: "GraduationCap",
      color: "from-blue-500 to-indigo-600",
      rarity: "Epic"
    },
    {
      id: "b_top_ranker",
      name: "Top Ranker #1",
      description: "Achieved the #1 position on the class or global leaderboard.",
      icon: "Trophy",
      color: "from-yellow-400 to-amber-600",
      rarity: "Legendary"
    },
    {
      id: "b_math_maverick",
      name: "Math Maverick",
      description: "Solved advanced algorithmic, mathematical & science challenges.",
      icon: "Sigma",
      color: "from-emerald-400 to-teal-600",
      rarity: "Rare"
    },
    {
      id: "b_streak_titan",
      name: "Streak Titan (7+ Days)",
      description: "Maintained an active daily learning streak for 7 consecutive days.",
      icon: "Flame",
      color: "from-orange-500 to-red-600",
      rarity: "Epic"
    },
    {
      id: "b_perfect_score",
      name: "Perfect 100%",
      description: "Scored 100% on a timed examination arena test.",
      icon: "Award",
      color: "from-purple-500 to-pink-600",
      rarity: "Rare"
    },
    {
      id: "b_speed_demon",
      name: "Speed Demon",
      description: "Completed a comprehensive quiz in under 5 minutes with >90% accuracy.",
      icon: "Zap",
      color: "from-cyan-400 to-blue-500",
      rarity: "Rare"
    },
    {
      id: "b_code_wizard",
      name: "Code Wizard",
      description: "Submitted high-efficiency algorithms with optimal Big-O bounds.",
      icon: "Code",
      color: "from-violet-500 to-indigo-700",
      rarity: "Epic"
    },
    {
      id: "b_early_bird",
      name: "Early Bird",
      description: "Submitted homework ahead of the final deadline.",
      icon: "Clock",
      color: "from-teal-400 to-cyan-600",
      rarity: "Common"
    },
    {
      id: "b_flashcard_king",
      name: "Memory Master",
      description: "Mastered flashcards using spaced-repetition memory review.",
      icon: "Layers",
      color: "from-amber-500 to-yellow-600",
      rarity: "Rare"
    }
  ],

  flashcardDecks: [
    {
      id: "deck_template_1",
      title: "Core Science & Algorithmic Principles",
      subject: "General STEM",
      cardsCount: 4,
      cards: [
        {
          id: "fc_tpl_1",
          front: "What is the primary difference between BFS and DFS graph search?",
          back: "BFS explores vertices level by level using a FIFO Queue and finds shortest paths in unweighted graphs. DFS explores deeply along branches using a LIFO Stack / recursion.",
          difficulty: "good"
        },
        {
          id: "fc_tpl_2",
          front: "What is an Invariant in algorithm analysis?",
          back: "A condition or logical property that remains true at every stage of program execution (such as loop invariants or binary search bounds).",
          difficulty: "easy"
        },
        {
          id: "fc_tpl_3",
          front: "What is the Space-Time Tradeoff in dynamic programming?",
          back: "Using additional memory (e.g. memoization tables or cache arrays) to store previously computed subproblem solutions and avoid redundant exponential re-computation.",
          difficulty: "good"
        },
        {
          id: "fc_tpl_4",
          front: "How does Spaced Repetition enhance long-term memory retention?",
          back: "By spacing review intervals over expanding time increments (Ebbinghaus Forgetting Curve), reinforcing neural pathways just as the memory begins to decay.",
          difficulty: "easy"
        }
      ]
    }
  ],

  whiteboardSavedNotes: []
};

module.exports = initialData;
