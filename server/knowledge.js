const SPELLING = [
  [/ohms?\s*low/g, "ohms law"],
  [/ohm\s*law/g, "ohms law"],
  [/kirchoff/g, "kirchhoff"],
  [/pythagorus|pythagoras/g, "pythagoras"],
  [/photosythesis|photosynthesis/g, "photosynthesis"],
  [/recusion|recurrsion/g, "recursion"],
  [/binery/g, "binary"],
  [/derivitive/g, "derivative"],
  [/intergration/g, "integration"],
  [/transister/g, "transistor"],
  [/capicitor|capacitance/g, "capacitor"],
  [/resistence/g, "resistance"],
  [/currant/g, "current"],
  [/voltge/g, "voltage"],
  [/algorithim/g, "algorithm"],
  [/databse/g, "database"],
];

const LEAD_IN =
  /^(please\s+)?((can|could|would)\s+you\s+)?(please\s+)?(help\s+me\s+(with|understand)\s+)?(explain|define|describe|what\s+is|whats|what's|tell\s+me\s+about|how\s+does|how\s+do|how\s+to|give\s+me|solve|derive)?\s*/i;

export function normaliseQuery(value) {
  let text = String(value || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[×]/g, "x")
    .replace(/[^a-z0-9+=x\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  text = text.replace(LEAD_IN, "").replace(/[?!.,;:]+$/g, "").trim();
  for (const [pattern, replacement] of SPELLING) {
    text = text.replace(pattern, replacement);
  }
  return text.replace(/\s+/g, " ").trim();
}

function compact(text) {
  return normaliseQuery(text).replace(/\s+/g, "");
}

const ARTICLES = [
  {
    id: "ohms-law",
    title: "Ohm's Law",
    subjects: ["Physics", "Electronics"],
    aliases: [
      "ohms law",
      "ohm law",
      "ohm",
      "ohms",
      "v=ir",
      "v = i r",
      "v=i*r",
      "voltage current resistance",
      "current voltage resistance",
      "electrical resistance law",
    ],
    keywords: ["ohm", "voltage", "current", "resistance", "v=ir", "ampere", "volt"],
    summary:
      "Ohm's Law is an electrical principle: V = I × R, where V is voltage, I is current, and R is resistance.",
    formulas: ["V = I × R", "I = V / R", "R = V / I"],
    explanation: [
      "Ohm's Law is a basic rule of electric circuits. It says the voltage across a conductor is proportional to the current through it, as long as temperature and other physical conditions stay the same.",
      "The formula is V = I × R.",
      "V is voltage (potential difference), measured in volts (V). It is the electrical 'push' that moves charge.",
      "I is current, measured in amperes (A). It is the flow of electric charge.",
      "R is resistance, measured in ohms (Ω). It is how strongly the material opposes that flow.",
      "You can rearrange the same relationship: I = V / R and R = V / I. If voltage stays the same and resistance increases, current decreases. If resistance stays the same and voltage increases, current increases.",
      "Ohm's Law is reliable for ohmic materials such as many metal resistors at constant temperature. It does not always hold for devices such as diodes, transistors, and lamps, whose resistance changes with voltage or temperature.",
      "Power in a circuit is a different formula: P = V × I. Do not mix that up with Ohm's Law.",
    ].join("\n\n"),
    examples: [
      {
        title: "Find the current",
        body: "A 12 V battery is connected across a 4 Ω resistor. I = V / R = 12 / 4 = 3 A. So 3 amperes flow through the resistor.",
      },
      {
        title: "Find the resistance",
        body: "A bulb draws 0.5 A from a 230 V supply. R = V / I = 230 / 0.5 = 460 Ω.",
      },
    ],
    commonMistakes: [
      "Writing V = I / R or mixing up which quantity is on top.",
      "Forgetting units: volts, amperes, and ohms must be consistent (use milliamperes carefully).",
      "Applying Ohm's Law to a diode or LED as if resistance were constant.",
      "Confusing Ohm's Law (V = IR) with electric power (P = VI).",
    ],
    followUps: [
      "What happens to current if resistance doubles and voltage stays the same?",
      "How do you find resistance from voltage and current?",
      "Does Ohm's Law apply to a diode?",
      "How is electric power different from Ohm's Law?",
    ],
    tips: [
      "Memorise the triangle: V on top, I and R below. Cover the unknown to see the formula.",
      "Always write units next to each number before you calculate.",
      "Check the answer with a rough estimate: bigger R should mean smaller I for the same V.",
    ],
    qa: [
      {
        test: /double|twice|increas.*resist|resist.*increas|resist.*up/i,
        answer:
          "If voltage is constant and resistance doubles, current becomes half because I = V / R. More opposition means less charge flow for the same push.",
      },
      {
        test: /diode|led|non-?ohmic/i,
        answer:
          "A diode is non-ohmic. Its current-voltage graph is not a straight line, so you cannot treat it as a single fixed R in V = IR for all voltages. Use the diode equation or a datasheet instead.",
      },
      {
        test: /power|watt/i,
        answer:
          "Ohm's Law is V = I × R. Electric power is P = V × I, which can also be written P = I²R or P = V²/R after substituting Ohm's Law. Power tells you the energy per second, not the V–I–R relationship itself.",
      },
      {
        test: /unit|ohm symbol|measured/i,
        answer:
          "Voltage is measured in volts (V), current in amperes (A), and resistance in ohms (Ω). 1 Ω means 1 volt is needed to drive 1 ampere.",
      },
    ],
    quiz: [
      {
        question: "Ohm's Law is usually written as which formula?",
        options: ["V = I × R", "P = I × R", "F = m × a", "E = m × c²"],
        correctIndex: 0,
        explanation: "Ohm's Law relates voltage, current, and resistance: V = I × R.",
      },
      {
        question: "In V = I × R, what does I stand for?",
        options: ["Inductance", "Current", "Intensity of light", "Impedance only in AC motors"],
        correctIndex: 1,
        explanation: "I is electric current, measured in amperes (A).",
      },
      {
        question: "A 10 V supply is connected to a 5 Ω resistor. What is the current?",
        options: ["2 A", "50 A", "0.5 A", "15 A"],
        correctIndex: 0,
        explanation: "I = V / R = 10 / 5 = 2 A.",
      },
      {
        question: "If voltage is held constant and resistance increases, current will:",
        options: ["Increase", "Stay exactly the same", "Decrease", "Become negative"],
        correctIndex: 2,
        explanation: "I = V / R, so larger R means smaller I when V is unchanged.",
      },
      {
        question: "Resistance is measured in:",
        options: ["Volts", "Amperes", "Watts", "Ohms"],
        correctIndex: 3,
        explanation: "The SI unit of resistance is the ohm (Ω).",
      },
      {
        question: "Ohm's Law is most reliable for which of these?",
        options: [
          "A metal resistor at constant temperature",
          "A semiconductor diode at any voltage",
          "An LED in both forward and reverse bias",
          "A filament lamp as it heats up",
        ],
        correctIndex: 0,
        explanation: "Ohmic conductors have a linear V–I graph at constant temperature. Diodes and lamps are typically non-ohmic.",
      },
    ],
  },
  {
    id: "newtons-laws",
    title: "Newton's Laws of Motion",
    subjects: ["Physics"],
    aliases: ["newtons laws", "newton law", "newtons first law", "laws of motion", "f=ma"],
    keywords: ["newton", "force", "acceleration", "inertia", "momentum"],
    summary:
      "Newton's three laws describe inertia, F = m × a, and action–reaction pairs. They are the foundation of classical mechanics.",
    formulas: ["F = m × a", "p = m × v"],
    explanation: [
      "First law (inertia): a body stays at rest or in uniform motion in a straight line unless a net external force acts on it.",
      "Second law: the net force equals mass times acceleration, F = m × a. Force is in newtons (N), mass in kilograms (kg), acceleration in m/s².",
      "Third law: if body A pushes body B, body B pushes A with an equal force in the opposite direction. The two forces act on different bodies.",
      "Weight is the gravitational force W = m × g, not the same word as mass. Mass is the amount of matter; weight depends on g.",
    ].join("\n\n"),
    examples: [
      {
        title: "Find acceleration",
        body: "A 2 kg cart feels a net force of 10 N. a = F / m = 10 / 2 = 5 m/s² in the direction of the net force.",
      },
      {
        title: "Third-law pair",
        body: "When you jump, your feet push the Earth down. The Earth pushes you up with the same magnitude. You move because your mass is much smaller.",
      },
    ],
    commonMistakes: [
      "Thinking a force is needed to keep constant velocity (that would be first-law confusion).",
      "Adding action and reaction as if they acted on the same object.",
      "Mixing up mass and weight.",
    ],
    followUps: [
      "What is the difference between mass and weight?",
      "Why does a moving object not need a force to keep a constant speed in space?",
      "How do you find net force from several forces?",
    ],
    tips: [
      "Draw a free-body diagram before writing F = ma.",
      "Use net force, not just one of the forces.",
    ],
    qa: [],
    quiz: [
      {
        question: "Newton's second law is usually written as:",
        options: ["V = I × R", "F = m × a", "E = m × c²", "P = V × I"],
        correctIndex: 1,
        explanation: "Net force equals mass times acceleration.",
      },
      {
        question: "The first law is mainly about:",
        options: ["Electric charge", "Inertia", "Nuclear decay", "Refraction"],
        correctIndex: 1,
        explanation: "Inertia is the tendency to keep the current state of motion.",
      },
      {
        question: "Action and reaction forces:",
        options: [
          "Cancel on the same object so nothing can move",
          "Act on two different objects",
          "Have different magnitudes",
          "Only exist on Earth",
        ],
        correctIndex: 1,
        explanation: "They are equal and opposite but act on different bodies, so they do not cancel for one free-body diagram.",
      },
    ],
  },
  {
    id: "kirchhoff",
    title: "Kirchhoff's Laws",
    subjects: ["Physics", "Electronics"],
    aliases: ["kirchhoffs laws", "kirchhoff", "kcl", "kvl", "junction rule", "loop rule"],
    keywords: ["kirchhoff", "kcl", "kvl", "junction", "loop"],
    summary:
      "Kirchhoff's Current Law (KCL) says current into a junction equals current out. Kirchhoff's Voltage Law (KVL) says the signed voltages around a closed loop add to zero.",
    formulas: ["Σ I_in = Σ I_out  (KCL)", "Σ V = 0 around a loop  (KVL)"],
    explanation: [
      "KCL comes from conservation of charge: charge does not pile up at a node in a lumped circuit.",
      "KVL comes from conservation of energy: going around a loop, rises and drops of electric potential sum to zero.",
      "Use KCL at nodes and KVL around loops together with Ohm's Law (V = IR) to solve multi-resistor circuits that a single Ohm's Law step cannot finish.",
    ].join("\n\n"),
    examples: [
      {
        title: "Simple junction",
        body: "Currents 2 A and 3 A enter a node. One wire leaves. The leaving current is 5 A.",
      },
      {
        title: "Series loop",
        body: "A 9 V battery and two resistors in series: the two resistor voltage drops add up to 9 V.",
      },
    ],
    commonMistakes: [
      "Forgetting sign conventions around a loop.",
      "Treating a parallel circuit as if the same current flowed through every branch.",
    ],
    followUps: ["How is KVL related to Ohm's Law?", "When should I use mesh analysis?"],
    tips: ["Label currents with arrows before writing equations.", "Be consistent with clockwise or anticlockwise loops."],
    qa: [],
    quiz: [
      {
        question: "KCL is mainly a statement of:",
        options: ["Conservation of charge", "Conservation of momentum", "Snell's law", "Faraday's law"],
        correctIndex: 0,
        explanation: "Current in equals current out because charge is conserved at the node.",
      },
      {
        question: "KVL says that around a closed loop:",
        options: [
          "Currents are all equal",
          "Signed voltages sum to zero",
          "Resistance is infinite",
          "Power is always zero",
        ],
        correctIndex: 1,
        explanation: "The algebraic sum of potential differences around a loop is zero.",
      },
    ],
  },
  {
    id: "binary-search",
    title: "Binary Search",
    subjects: ["Computer Science", "Programming"],
    aliases: ["binary search", "bin search", "logarithmic search"],
    keywords: ["binary search", "sorted array", "log n"],
    summary:
      "Binary search finds a target in a sorted list by repeatedly checking the middle element and discarding half of the remaining range.",
    formulas: ["Time complexity: O(log n) comparisons"],
    explanation: [
      "The array (or a random-access sorted sequence) must already be sorted.",
      "Keep two indices, low and high. Compute mid. If a[mid] equals the target, you are done. If the target is smaller, search the left half; if larger, search the right half.",
      "Each step halves the search space, so the number of steps grows with log₂(n), not with n.",
      "Linear search checks items one by one and is O(n). Use it when the collection is unsorted or very small.",
    ].join("\n\n"),
    examples: [
      {
        title: "Find 13 in [1, 3, 4, 7, 13, 18, 21]",
        body: "mid is 7, 13 > 7 so go right. Next mid is 18, 13 < 18 so go left. Next mid is 13. Found.",
      },
      {
        title: "Off-by-one trap",
        body: "Update low = mid + 1 or high = mid - 1 after a miss, or the loop may never shrink.",
      },
    ],
    commonMistakes: [
      "Running binary search on an unsorted array.",
      "Integer overflow or off-by-one when computing mid in some languages.",
      "Confusing binary search with binary trees.",
    ],
    followUps: [
      "What is the time complexity of binary search?",
      "Why must the array be sorted?",
      "How is this different from a binary search tree?",
    ],
    tips: ["Trace one example on paper with low, mid, and high.", "Write a test for 'not found' as well as 'found'."],
    qa: [],
    quiz: [
      {
        question: "Binary search requires which precondition?",
        options: ["The array is sorted", "The array has even length", "All values are unique and negative", "The array is a linked list"],
        correctIndex: 0,
        explanation: "Halving the range is only valid when order tells you which side to keep.",
      },
      {
        question: "Typical time complexity of binary search is:",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctIndex: 1,
        explanation: "Each comparison discards half of the remaining elements.",
      },
    ],
  },
  {
    id: "stack-queue",
    title: "Stacks and Queues",
    subjects: ["Computer Science", "Programming"],
    aliases: ["stack", "queue", "stacks and queues", "lifo", "fifo"],
    keywords: ["stack", "queue", "lifo", "fifo", "push", "pop"],
    summary:
      "A stack is last-in, first-out (LIFO). A queue is first-in, first-out (FIFO). Both store items, but they remove them in different orders.",
    formulas: [],
    explanation: [
      "Stack operations: push (add on top), pop (remove from top), peek/top (read the top). Think of a pile of plates.",
      "Queue operations: enqueue (add at the back), dequeue (remove from the front). Think of a ticket line.",
      "Stacks appear in undo, function-call recursion, and bracket matching. Queues appear in printers, request handling, and breadth-first search.",
    ].join("\n\n"),
    examples: [
      {
        title: "Stack",
        body: "Push 1, push 2, push 3, pop → 3 comes out first.",
      },
      {
        title: "Queue",
        body: "Enqueue 1, enqueue 2, enqueue 3, dequeue → 1 comes out first.",
      },
    ],
    commonMistakes: [
      "Using a stack when order of arrival must be preserved (that is a queue).",
      "Forgetting that pop on an empty stack is an error.",
    ],
    followUps: ["Where is a stack used in programming languages?", "What is a deque?"],
    tips: ["Draw the structure after every operation in an exam."],
    qa: [],
    quiz: [
      {
        question: "A stack follows:",
        options: ["FIFO", "LIFO", "Random order", "Sorted order only"],
        correctIndex: 1,
        explanation: "Last in, first out.",
      },
      {
        question: "Breadth-first search typically uses a:",
        options: ["Stack", "Queue", "Min-heap only", "Hash set only"],
        correctIndex: 1,
        explanation: "BFS explores nodes in the order they were discovered, which a queue preserves.",
      },
    ],
  },
  {
    id: "recursion",
    title: "Recursion",
    subjects: ["Computer Science", "Programming", "Mathematics"],
    aliases: ["recursion", "recursive function", "base case"],
    keywords: ["recursion", "base case", "recursive"],
    summary:
      "Recursion is when a function solves a problem by calling itself on a smaller input, until a base case stops the chain.",
    formulas: [],
    explanation: [
      "Every recursive solution needs a base case (the smallest input you can answer directly) and a recursive case (reduce the problem and call the same function).",
      "Without a base case, calls continue until the call stack overflows.",
      "Classic examples: factorial, Fibonacci, tree traversals, and divide-and-conquer algorithms.",
      "Anything recursive can be rewritten with an explicit stack, but recursion is often clearer for trees and nested structures.",
    ].join("\n\n"),
    examples: [
      {
        title: "Factorial",
        body: "n! = n × (n-1)! with 0! = 1. So factorial(4) = 4 × 3 × 2 × 1 × 1.",
      },
    ],
    commonMistakes: [
      "Missing or unreachable base case.",
      "Not making the input strictly smaller, so recursion never ends.",
    ],
    followUps: ["What is a call stack?", "When is iteration better than recursion?"],
    tips: ["Trace a tiny input on paper before coding."],
    qa: [],
    quiz: [
      {
        question: "A recursive function must have:",
        options: ["A global variable named temp", "A base case", "Only even arguments", "No return value"],
        correctIndex: 1,
        explanation: "The base case stops further calls.",
      },
    ],
  },
  {
    id: "complexity",
    title: "Time Complexity",
    subjects: ["Computer Science"],
    aliases: ["time complexity", "big o", "big-o", "asymptotic notation", "o(n)"],
    keywords: ["complexity", "big o", "asymptotic"],
    summary:
      "Time complexity describes how running time grows as the input size n grows. Big-O notation gives an upper bound such as O(n) or O(n log n).",
    formulas: ["O(1) < O(log n) < O(n) < O(n log n) < O(n²)"],
    explanation: [
      "Ignore constant factors and lower-order terms. 3n + 10 and 5n are both O(n).",
      "O(1) is constant time (array index). O(log n) is typical of binary search. O(n) is a single loop. O(n²) is a nested loop over the same n.",
      "Worst-case Big-O is the usual exam answer unless the question asks for best or average case.",
    ].join("\n\n"),
    examples: [
      {
        title: "Nested loops",
        body: "for i in 1..n: for j in 1..n: work() runs about n² times, so O(n²).",
      },
    ],
    commonMistakes: [
      "Thinking Big-O is an exact number of seconds.",
      "Dropping the dominant term incorrectly, e.g. calling n² + n 'O(n)'.",
    ],
    followUps: ["What is space complexity?", "Why is O(n log n) typical of efficient comparison sorts?"],
    tips: ["Count loops and how the input shrinks."],
    qa: [],
    quiz: [
      {
        question: "Binary search is typically:",
        options: ["O(1)", "O(log n)", "O(n²)", "O(2ⁿ)"],
        correctIndex: 1,
        explanation: "The range halves each step.",
      },
    ],
  },
  {
    id: "sql-joins",
    title: "SQL Joins",
    subjects: ["Computer Science"],
    aliases: ["sql joins", "sql join", "inner join", "left join", "outer join"],
    keywords: ["join", "sql", "inner join", "left join"],
    summary:
      "A join combines rows from two tables using a related column. INNER JOIN keeps matches only; LEFT JOIN keeps all left rows and matching right rows.",
    formulas: [],
    explanation: [
      "INNER JOIN: rows where the join key exists in both tables.",
      "LEFT (OUTER) JOIN: all rows from the left table; unmatched right columns are NULL.",
      "RIGHT JOIN is the mirror of LEFT JOIN. FULL OUTER JOIN keeps unmatched rows from both sides.",
      "CROSS JOIN is a Cartesian product and is rarely what you want by accident.",
    ].join("\n\n"),
    examples: [
      {
        title: "Students and marks",
        body: "FROM students s INNER JOIN marks m ON s.id = m.student_id returns only students who have at least one marks row.",
      },
    ],
    commonMistakes: [
      "Using INNER JOIN when you still need students with no marks (use LEFT JOIN).",
      "Forgetting the ON condition and creating a huge Cartesian product.",
    ],
    followUps: ["What does NULL mean after a LEFT JOIN?", "When would you use GROUP BY with a join?"],
    tips: ["Sketch two sample tables and the result rows."],
    qa: [],
    quiz: [
      {
        question: "INNER JOIN returns:",
        options: [
          "All rows from both tables whether they match or not",
          "Only rows with matching keys in both tables",
          "Only the left table",
          "Duplicate keys deleted automatically",
        ],
        correctIndex: 1,
        explanation: "Non-matching rows are dropped by INNER JOIN.",
      },
    ],
  },
  {
    id: "quadratic",
    title: "Quadratic Formula",
    subjects: ["Mathematics"],
    aliases: ["quadratic formula", "quadratic equation", "ax2+bx+c", "roots of quadratic"],
    keywords: ["quadratic", "discriminant", "roots"],
    summary:
      "A quadratic equation ax² + bx + c = 0 has solutions x = (-b ± √(b² - 4ac)) / (2a), provided a ≠ 0.",
    formulas: ["x = (-b ± √(b² - 4ac)) / (2a)", "Discriminant D = b² - 4ac"],
    explanation: [
      "The discriminant D = b² - 4ac tells you the type of roots (for real coefficients): D > 0 two distinct real roots, D = 0 one real root (repeated), D < 0 two complex conjugate roots.",
      "You can also factor, complete the square, or graph y = ax² + bx + c and read the x-intercepts.",
      "Always identify a, b, and c carefully, including signs.",
    ].join("\n\n"),
    examples: [
      {
        title: "x² - 5x + 6 = 0",
        body: "a = 1, b = -5, c = 6. D = 25 - 24 = 1. x = (5 ± 1) / 2 → x = 3 or x = 2. Check: (x-2)(x-3)=0.",
      },
    ],
    commonMistakes: [
      "Dropping the minus in -b.",
      "Forgetting to divide the entire numerator by 2a.",
      "Using the formula when a = 0 (then it is linear, not quadratic).",
    ],
    followUps: ["What does a negative discriminant mean?", "How do you complete the square?"],
    tips: ["Substitute roots back into the original equation to check."],
    qa: [],
    quiz: [
      {
        question: "The quadratic formula for ax² + bx + c = 0 is:",
        options: [
          "x = (-b ± √(b² - 4ac)) / (2a)",
          "x = (b ± √(b² - 4ac)) / 2a",
          "x = -c / a",
          "x = a / (b + c)",
        ],
        correctIndex: 0,
        explanation: "Standard quadratic formula. The sign in front of b is minus.",
      },
      {
        question: "If the discriminant is zero, the equation has:",
        options: ["Two distinct real roots", "No roots", "One repeated real root", "Infinitely many roots"],
        correctIndex: 2,
        explanation: "The graph touches the x-axis at exactly one point.",
      },
    ],
  },
  {
    id: "derivative",
    title: "Derivatives",
    subjects: ["Mathematics"],
    aliases: ["derivative", "differentiation", "dy/dx", "rate of change"],
    keywords: ["derivative", "differenti", "slope", "dy dx"],
    summary:
      "The derivative dy/dx measures instantaneous rate of change: the slope of the tangent to y = f(x) at a point.",
    formulas: ["d/dx (xⁿ) = n xⁿ⁻¹", "d/dx (sin x) = cos x", "d/dx (uv) = u'v + uv'"],
    explanation: [
      "Geometrically, f'(a) is the slope of the curve at x = a.",
      "Physically, if s(t) is position, s'(t) is velocity and s''(t) is acceleration.",
      "Common rules: power, sum, product, quotient, and chain rule.",
      "A derivative of zero can mark a turning point; use the first or second derivative test to classify it.",
    ].join("\n\n"),
    examples: [
      {
        title: "Power rule",
        body: "f(x) = 3x⁴. f'(x) = 12x³.",
      },
    ],
    commonMistakes: [
      "Forgetting the chain rule on compositions such as (3x+1)⁵.",
      "Mixing up derivative and integral.",
    ],
    followUps: ["What is the chain rule?", "How is a derivative different from an integral?"],
    tips: ["Name the outer and inner function before differentiating a composition."],
    qa: [],
    quiz: [
      {
        question: "d/dx (x³) equals:",
        options: ["x²", "3x²", "3x³", "x⁴ / 4"],
        correctIndex: 1,
        explanation: "Power rule: bring down the 3 and reduce the power by 1.",
      },
    ],
  },
  {
    id: "pythagoras",
    title: "Pythagoras' Theorem",
    subjects: ["Mathematics"],
    aliases: ["pythagoras", "pythagorean theorem", "right triangle hypotenuse"],
    keywords: ["pythagoras", "hypotenuse", "right triangle"],
    summary:
      "In a right-angled triangle, a² + b² = c², where c is the hypotenuse (the side opposite the right angle).",
    formulas: ["a² + b² = c²"],
    explanation: [
      "The theorem applies only to right-angled triangles.",
      "If you know two sides, you can find the third. If a² + b² equals c² for three lengths, the triangle is right-angled (converse).",
      "Distance between two points (x1, y1) and (x2, y2) is a Pythagoras application: √((x2-x1)² + (y2-y1)²).",
    ].join("\n\n"),
    examples: [
      {
        title: "3-4-5 triangle",
        body: "3² + 4² = 9 + 16 = 25 = 5². A triangle with sides 3, 4, 5 is right-angled.",
      },
    ],
    commonMistakes: [
      "Putting a leg in the c² place instead of the hypotenuse.",
      "Using the theorem on a triangle that is not right-angled.",
    ],
    followUps: ["What is the converse of Pythagoras' theorem?", "How does this give the distance formula?"],
    tips: ["Always identify the hypotenuse first."],
    qa: [],
    quiz: [
      {
        question: "In a right triangle with legs 6 and 8, the hypotenuse is:",
        options: ["10", "14", "48", "7"],
        correctIndex: 0,
        explanation: "6² + 8² = 36 + 64 = 100, so c = 10.",
      },
    ],
  },
  {
    id: "photosynthesis",
    title: "Photosynthesis",
    subjects: ["Biology"],
    aliases: ["photosynthesis", "how plants make food"],
    keywords: ["photosynthesis", "chlorophyll", "glucose"],
    summary:
      "Photosynthesis is how green plants make glucose using light, carbon dioxide, and water, releasing oxygen.",
    formulas: ["6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂  (in the presence of light and chlorophyll)"],
    explanation: [
      "Chlorophyll in chloroplasts absorbs light. Light-dependent reactions split water and make ATP and NADPH; oxygen is released.",
      "The Calvin cycle (light-independent reactions) uses CO₂, ATP, and NADPH to build glucose.",
      "Photosynthesis stores energy in chemical bonds; respiration later releases it.",
    ].join("\n\n"),
    examples: [
      {
        title: "Why leaves look green",
        body: "Chlorophyll reflects green wavelengths more than red and blue, which it absorbs for energy.",
      },
    ],
    commonMistakes: [
      "Thinking plants do not respire.",
      "Writing the equation without balancing or omitting light/chlorophyll as conditions.",
    ],
    followUps: ["What is the difference between light and dark reactions?", "Where in the cell does this happen?"],
    tips: ["Learn the word equation and then the balanced symbol equation."],
    qa: [],
    quiz: [
      {
        question: "A product of photosynthesis is:",
        options: ["Nitrogen gas", "Glucose", "Ammonia", "Urea"],
        correctIndex: 1,
        explanation: "Glucose (and oxygen) are the usual products in school-level equations.",
      },
    ],
  },
  {
    id: "loops",
    title: "Loops in Programming",
    subjects: ["Programming", "Computer Science"],
    aliases: ["loops", "for loop", "while loop", "iteration"],
    keywords: ["loop", "for loop", "while", "iterate"],
    summary:
      "A loop repeats a block of code. Use a for loop when you know how many times; use a while loop when you repeat until a condition fails.",
    formulas: [],
    explanation: [
      "for: initialise, test, update. Typical for counting through arrays.",
      "while: repeat as long as a condition is true. Check that the condition will eventually become false.",
      "do-while (in some languages) runs the body at least once.",
      "Infinite loops happen when the update never changes the condition. break exits early; continue skips to the next iteration.",
    ].join("\n\n"),
    examples: [
      {
        title: "Sum 1 to 5",
        body: "total = 0; for i from 1 to 5: total = total + i. Result 15.",
      },
    ],
    commonMistakes: [
      "Off-by-one errors (starting at 0 vs 1, or using <= vs <).",
      "Modifying the loop variable in conflicting ways inside the body.",
    ],
    followUps: ["What is an off-by-one error?", "When is a for-each loop better?"],
    tips: ["Trace the loop variable after each pass on paper."],
    qa: [],
    quiz: [
      {
        question: "A while loop continues until:",
        options: [
          "The program is compiled",
          "Its condition becomes false",
          "The CPU overheats",
          "A for loop starts",
        ],
        correctIndex: 1,
        explanation: "The condition is checked each time; false ends the loop.",
      },
    ],
  },
  {
    id: "oop",
    title: "Object-Oriented Programming",
    subjects: ["Computer Science", "Programming"],
    aliases: ["oop", "object oriented", "classes and objects", "inheritance"],
    keywords: ["oop", "class", "object", "inheritance", "encapsulation"],
    summary:
      "OOP models programs as objects. A class is a blueprint; an object is an instance. Core ideas include encapsulation, inheritance, and polymorphism.",
    formulas: [],
    explanation: [
      "Encapsulation: keep data and the methods that use it together; hide internal details.",
      "Inheritance: a child class reuses and extends a parent class.",
      "Polymorphism: the same method name can behave differently on different classes (often via overriding).",
      "Abstraction: show a simple interface and hide complexity.",
    ].join("\n\n"),
    examples: [
      {
        title: "Class vs object",
        body: "Student is a class with fields name and marks. 'Asha' stored as a Student is one object.",
      },
    ],
    commonMistakes: [
      "Confusing a class (type) with an object (instance).",
      "Deep inheritance trees that are hard to change.",
    ],
    followUps: ["What is method overriding?", "How is this different from functional programming?"],
    tips: ["Name classes as nouns and methods as verbs."],
    qa: [],
    quiz: [
      {
        question: "A class is best described as:",
        options: ["A running program", "A blueprint for objects", "A database row only", "A compiler error"],
        correctIndex: 1,
        explanation: "Objects are created from the class definition.",
      },
    ],
  },
  {
    id: "diode",
    title: "Semiconductor Diode",
    subjects: ["Electronics", "Physics"],
    aliases: ["diode", "pn junction", "pn-junction"],
    keywords: ["diode", "pn junction", "forward bias"],
    summary:
      "A diode allows current easily in one direction (forward bias) and blocks it in the other (reverse bias), because of a p–n junction.",
    formulas: [],
    explanation: [
      "A p–n junction forms a depletion region. Forward bias narrows it and current can flow after about 0.7 V for silicon.",
      "Reverse bias widens the depletion region; only a tiny leakage current flows until breakdown.",
      "Diodes are used for rectification (AC to DC), protection, and logic. They are non-ohmic: Ohm's Law with a single R does not describe them fully.",
    ].join("\n\n"),
    examples: [
      {
        title: "Half-wave rectifier",
        body: "A diode in series with an AC source and load passes only one half-cycle to the load.",
      },
    ],
    commonMistakes: [
      "Treating a diode as a constant resistor.",
      "Forgetting the silicon forward drop of about 0.7 V in simple models.",
    ],
    followUps: ["What is an LED?", "What is breakdown voltage?"],
    tips: ["Remember the arrow of the diode symbol points the easy-current direction of conventional current."],
    qa: [],
    quiz: [
      {
        question: "In forward bias, a silicon diode typically conducts after about:",
        options: ["0.07 V", "0.7 V", "12 V", "230 V"],
        correctIndex: 1,
        explanation: "The usual school-level silicon drop is about 0.7 volts.",
      },
    ],
  },
  {
    id: "capacitor",
    title: "Capacitors",
    subjects: ["Electronics", "Physics"],
    aliases: ["capacitor", "capacitance", "farad"],
    keywords: ["capacitor", "capacitance", "farad"],
    summary:
      "A capacitor stores charge (and energy) in an electric field. Capacitance C = Q / V, measured in farads (F).",
    formulas: ["C = Q / V", "E = ½ C V²", "Series: 1/C = 1/C1 + 1/C2", "Parallel: C = C1 + C2"],
    explanation: [
      "Two conductors separated by an insulator form a capacitor. Charge +Q and −Q appear on the plates when a voltage V is applied.",
      "In DC steady state an ideal capacitor acts like an open circuit. In AC, a capacitor's opposition is reactance 1/(2πfC).",
      "Parallel capacitances add. Series capacitances combine like parallel resistors.",
    ].join("\n\n"),
    examples: [
      {
        title: "Energy",
        body: "A 2 µF capacitor charged to 10 V stores E = ½ × 2×10⁻⁶ × 100 = 1×10⁻⁴ J.",
      },
    ],
    commonMistakes: [
      "Using series and parallel formulas the wrong way around (they are opposite to resistors).",
      "Leaving units in microfarads while using farads in the formula.",
    ],
    followUps: ["Why does a capacitor block DC?", "How do you combine two capacitors in series?"],
    tips: ["Convert µF to F before substituting: 1 µF = 10⁻⁶ F."],
    qa: [],
    quiz: [
      {
        question: "Capacitance C equals:",
        options: ["Q × V", "Q / V", "V / Q", "I × R"],
        correctIndex: 1,
        explanation: "C is charge stored per volt.",
      },
    ],
  },
  {
    id: "work-energy",
    title: "Work and Energy",
    subjects: ["Physics"],
    aliases: ["work energy", "work-energy theorem", "kinetic energy", "potential energy"],
    keywords: ["work", "kinetic", "potential energy", "joule"],
    summary:
      "Mechanical work is W = F × s × cosθ. Kinetic energy is ½mv². The work–energy theorem says net work equals the change in kinetic energy.",
    formulas: ["W = F s cosθ", "KE = ½ m v²", "PE = m g h", "W_net = ΔKE"],
    explanation: [
      "Work is energy transferred by a force acting through a displacement. The SI unit is the joule (J).",
      "If force is perpendicular to motion, work is zero (cos90° = 0), as with uniform circular motion's centripetal force.",
      "Gravitational potential energy near Earth is mgh. Energy is conserved in an isolated system if you include all forms; friction turns mechanical energy into internal energy.",
    ].join("\n\n"),
    examples: [
      {
        title: "Work against gravity",
        body: "Lift a 2 kg mass by 3 m: W = mgh = 2 × 10 × 3 = 60 J if g = 10 m/s².",
      },
    ],
    commonMistakes: [
      "Using W = Fs when the force is not along the displacement.",
      "Treating energy as a force.",
    ],
    followUps: ["What is power?", "How does friction affect mechanical energy?"],
    tips: ["Always state whether g is 9.8 or 10 m/s² in numerical problems."],
    qa: [],
    quiz: [
      {
        question: "Kinetic energy of a mass m moving at speed v is:",
        options: ["m v", "½ m v²", "m g h", "F / a"],
        correctIndex: 1,
        explanation: "KE = ½mv².",
      },
    ],
  },
  {
    id: "mole",
    title: "The Mole",
    subjects: ["Chemistry"],
    aliases: ["mole concept", "avogadro", "molar mass"],
    keywords: ["mole", "avogadro", "molar"],
    summary:
      "A mole is 6.022 × 10²³ particles (Avogadro's number). Molar mass in grams per mole equals the relative mass from the periodic table.",
    formulas: ["n = m / M", "n = N / N_A", "N_A ≈ 6.022 × 10²³ mol⁻¹"],
    explanation: [
      "Use moles to count atoms and molecules on a human scale.",
      "n = mass / molar mass. One mole of carbon-12 atoms has a mass of 12 g.",
      "In gases at STP, older school books use 22.4 L per mole; always check which conditions the question states.",
    ].join("\n\n"),
    examples: [
      {
        title: "Moles of water",
        body: "18 g of H₂O is about 1 mole because M(H₂O) ≈ 18 g/mol, so about 6.022 × 10²³ molecules.",
      },
    ],
    commonMistakes: [
      "Confusing atomic mass units with grams without using moles.",
      "Using 22.4 L at conditions that are not STP.",
    ],
    followUps: ["What is molarity?", "How do you convert moles to number of atoms?"],
    tips: ["Write the formula of the compound before looking up molar mass."],
    qa: [],
    quiz: [
      {
        question: "Avogadro's number is approximately:",
        options: ["6.022 × 10²³", "3 × 10⁸", "9.8", "1.6 × 10⁻¹⁹"],
        correctIndex: 0,
        explanation: "One mole contains about 6.022 × 10²³ specified particles.",
      },
    ],
  },
  {
    id: "logic-gates",
    title: "Logic Gates",
    subjects: ["Electronics", "Computer Science"],
    aliases: ["logic gates", "and gate", "or gate", "not gate", "boolean gates"],
    keywords: ["logic gate", "and gate", "boolean", "nand"],
    summary:
      "Logic gates compute Boolean functions. AND is 1 only if all inputs are 1; OR is 1 if any input is 1; NOT inverts a single input.",
    formulas: ["AND: Y = A · B", "OR: Y = A + B", "NOT: Y = A̅", "NAND: Y = (A · B)̅"],
    explanation: [
      "Truth tables list every input combination. Digital electronics uses two voltage levels as 0 and 1.",
      "NAND and NOR are universal: you can build any other gate from them.",
      "De Morgan's laws help simplify Boolean expressions before you draw a circuit.",
    ].join("\n\n"),
    examples: [
      {
        title: "AND",
        body: "Inputs 1 and 0 → output 0. Both must be 1 for AND to output 1.",
      },
    ],
    commonMistakes: [
      "Mixing Boolean + with ordinary arithmetic addition.",
      "Forgetting that NOT has only one input.",
    ],
    followUps: ["Why is NAND called universal?", "What is a truth table?"],
    tips: ["Write the truth table before the circuit if the question allows."],
    qa: [],
    quiz: [
      {
        question: "The AND output is 1 when:",
        options: ["Any input is 1", "All inputs are 1", "All inputs are 0", "Inputs are different"],
        correctIndex: 1,
        explanation: "AND requires every input to be high.",
      },
    ],
  },
];

function scoreArticle(article, query, subject) {
  const n = normaliseQuery(query);
  const packed = compact(query);
  if (!n) return 0;
  let score = 0;
  for (const alias of article.aliases) {
    const a = normaliseQuery(alias);
    if (n === a || packed === compact(alias)) score = Math.max(score, 100);
    else if (n.includes(a) || a.includes(n)) score = Math.max(score, 80);
  }
  for (const keyword of article.keywords) {
    if (n.includes(normaliseQuery(keyword))) score = Math.max(score, 55);
  }
  if (subject && article.subjects.some((item) => item.toLowerCase() === String(subject).toLowerCase())) {
    score += 5;
  }
  return score;
}

export function findArticle(subject, topic) {
  const query = `${topic || ""}`;
  let best = null;
  let bestScore = 0;
  for (const article of ARTICLES) {
    const score = scoreArticle(article, query, subject);
    if (score > bestScore) {
      best = article;
      bestScore = score;
    }
  }
  return bestScore >= 50 ? best : null;
}

function levelNote(difficulty) {
  if (difficulty === "advanced") {
    return "Advanced view: pay attention to conditions, units, and exam-style exceptions.";
  }
  if (difficulty === "intermediate") {
    return "Intermediate view: connect the definition to a formula and a typical numerical problem.";
  }
  return "Beginner view: start with plain language, then the formula and a small example.";
}

export function explanationFromArticle(article, { subject, topic, difficulty }) {
  return {
    title: article.title,
    summary: article.summary,
    explanation: `${levelNote(difficulty)}\n\n${article.explanation}`,
    formulas: article.formulas || [],
    examples: article.examples,
    commonMistakes: article.commonMistakes || [],
    followUps: article.followUps,
    tips: article.tips,
    matchedTopic: article.id,
    requestedTopic: topic,
    subject: subject || article.subjects[0],
  };
}

export function followUpFromArticle(article, question) {
  const match = (article.qa || []).find((item) => item.test.test(question));
  if (match) {
    return {
      answer: match.answer,
      followUps: article.followUps,
    };
  }
  return {
    answer: [
      `Still on ${article.title}:`,
      "",
      article.summary,
      "",
      question?.trim() ? `You asked: “${question.trim()}”` : "",
      "",
      "Use the formula (if any), substitute known values with units, then check whether the assumptions still hold. For this topic, a common miss is listed in the common-mistakes section of the main explanation.",
      article.formulas?.length ? `\nKey formula(s): ${article.formulas.join("; ")}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    followUps: article.followUps,
  };
}

function shuffleToLength(items, count, seed) {
  const copy = [...items];
  if (!copy.length) return [];
  const result = [];
  for (let i = 0; i < count; i += 1) {
    const index = (seed + i * 3) % copy.length;
    result.push(copy[index]);
  }
  return result;
}

export function quizFromArticle(article, { subject, topic, difficulty, count }) {
  const total = Math.min(8, Math.max(3, Number(count) || 5));
  const bank = article.quiz || [];
  const seed = Array.from(`${article.id}${difficulty}`).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const picked = shuffleToLength(bank, total, seed);
  const questions = picked.map((item, index) => ({
    id: `${article.id}-${index + 1}`,
    question: item.question,
    options: item.options,
    correctIndex: item.correctIndex,
    explanation: item.explanation,
  }));
  return {
    title: `${article.title} practice quiz`,
    subject: subject || article.subjects[0],
    topic: topic || article.title,
    difficulty: difficulty || "beginner",
    questions,
  };
}

export const SUBJECT_HINTS = {
  Physics:
    "Name the physical quantities, their SI units, and any formula. State when the formula is valid.",
  Mathematics:
    "Write the definition, the formula or theorem, the conditions, and one short worked example.",
  Electronics:
    "Say what the device or law does in a circuit, the governing relation, and a typical application.",
  "Computer Science":
    "State the problem it solves, the main steps or structure, complexity if relevant, and a tiny example.",
  Programming:
    "Describe the construct, when to use it, a 4–8 line example, and a common bug.",
  Chemistry:
    "Give the definition, equation or mole relation, and one numerical or reaction example.",
  Biology: "Give the process, where it happens, the main equation or stages, and why it matters.",
  English: "Give the rule, one weak example, and one improved example.",
  History: "Give the event or idea, when/where, why it mattered, and one cause-effect link.",
  Economics: "Give the definition, the relationship between quantities, and a small numerical or graph example.",
  "General Studies": "Write a definition, the main parts, and one short example from class.",
};

export { ARTICLES };
