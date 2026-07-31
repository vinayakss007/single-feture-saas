import type { RunInput, RunResult, Severity } from "./types.ts";

type FoodItem = { name: string; proteinPerServing: number; servingSize: string; costPerServing: number; calories: number; category: string; dietTypes: string[] };

const FOOD_DB: FoodItem[] = [
  { name: "Paneer (100g)", proteinPerServing: 18, servingSize: "100g", costPerServing: 40, calories: 265, category: "Dairy", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Curd/Yogurt (200g)", proteinPerServing: 8, servingSize: "200g (1 bowl)", costPerServing: 15, calories: 120, category: "Dairy", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Greek Yogurt (100g)", proteinPerServing: 10, servingSize: "100g", costPerServing: 35, calories: 90, category: "Dairy", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Milk (250ml)", proteinPerServing: 8, servingSize: "250ml (1 glass)", costPerServing: 14, calories: 150, category: "Dairy", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Cottage Cheese/Chenna (100g)", proteinPerServing: 11, servingSize: "100g", costPerServing: 35, calories: 98, category: "Dairy", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Soya Chunks (50g dry = 150g cooked)", proteinPerServing: 26, servingSize: "50g dry", costPerServing: 10, calories: 170, category: "Legumes", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Moong Dal (30g dry, 1 bowl cooked)", proteinPerServing: 7, servingSize: "30g dry (1 bowl)", costPerServing: 6, calories: 105, category: "Legumes", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Chana/Chickpeas (100g cooked)", proteinPerServing: 9, servingSize: "100g cooked", costPerServing: 8, calories: 160, category: "Legumes", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Rajma/Kidney beans (100g cooked)", proteinPerServing: 8, servingSize: "100g cooked", costPerServing: 8, calories: 130, category: "Legumes", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Sprouted Moong (100g)", proteinPerServing: 7, servingSize: "100g", costPerServing: 8, calories: 65, category: "Legumes", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Tofu (100g)", proteinPerServing: 8, servingSize: "100g", costPerServing: 25, calories: 76, category: "Soya", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Peanuts (30g handful)", proteinPerServing: 8, servingSize: "30g", costPerServing: 6, calories: 170, category: "Nuts", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Almonds (20g, 14 pieces)", proteinPerServing: 4, servingSize: "20g", costPerServing: 20, calories: 116, category: "Nuts", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Whey Protein (1 scoop 30g)", proteinPerServing: 24, servingSize: "1 scoop", costPerServing: 55, calories: 120, category: "Supplement", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Egg (1 whole boiled)", proteinPerServing: 6, servingSize: "1 egg (50g)", costPerServing: 8, calories: 78, category: "Eggs", dietTypes: ["Egg-included", "Non-vegetarian"] },
  { name: "Egg whites (3 whites)", proteinPerServing: 11, servingSize: "3 whites", costPerServing: 18, calories: 51, category: "Eggs", dietTypes: ["Egg-included", "Non-vegetarian"] },
  { name: "Chicken breast (100g cooked)", proteinPerServing: 31, servingSize: "100g", costPerServing: 35, calories: 165, category: "Meat", dietTypes: ["Non-vegetarian"] },
  { name: "Chicken thigh (100g cooked)", proteinPerServing: 26, servingSize: "100g", costPerServing: 28, calories: 209, category: "Meat", dietTypes: ["Non-vegetarian"] },
  { name: "Fish/Rohu (100g cooked)", proteinPerServing: 22, servingSize: "100g", costPerServing: 30, calories: 140, category: "Meat", dietTypes: ["Non-vegetarian"] },
  { name: "Mutton (100g cooked)", proteinPerServing: 25, servingSize: "100g", costPerServing: 60, calories: 250, category: "Meat", dietTypes: ["Non-vegetarian"] },
  { name: "Sattu (30g)", proteinPerServing: 6, servingSize: "30g (1 glass drink)", costPerServing: 5, calories: 110, category: "Legumes", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
  { name: "Besan/Gram flour chilla (50g dry)", proteinPerServing: 10, servingSize: "50g flour (2 chillas)", costPerServing: 8, calories: 180, category: "Legumes", dietTypes: ["Vegetarian", "Egg-included", "Non-vegetarian"] },
];

const MYTHS = [
  { myth: "Dal has 20g protein per bowl", reality: "One bowl of cooked dal (30g dry lentils) has only 6-8g protein. The 24g per 100g on labels is DRY weight. Nobody eats 100g dry dal (that would be 3-4 bowls cooked)." },
  { myth: "Peanut butter is a protein source", reality: "2 tbsp peanut butter = 7g protein BUT 16g fat (190 cal). To get 30g protein, you eat 800+ calories. It is a fat source with some protein, not a protein source." },
  { myth: "Milk is high in protein", reality: "Milk has 3.3g per 100ml. One glass (250ml) = 8g. You need 12 glasses for 100g protein. Curd is slightly better at 4g/100g. Use as supplementary, not primary." },
  { myth: "Rice and roti have significant protein", reality: "Rice: 2.7g per 100g cooked. 2 rotis: 5g. These are carb sources. Count them as bonus but do not rely on them for protein targets." },
];

export function run(input: RunInput): RunResult {
  const targetStr = (input.proteinTarget ?? "").trim();
  const dietType = (input.dietType ?? "").trim();
  const mealsStr = (input.mealsPerDay ?? "").trim();
  const budgetStr = (input.budget ?? "").trim();
  const preferences = (input.preferences ?? "").trim().toLowerCase();

  if (!targetStr) throw new Error("Enter your daily protein target in grams (e.g., 100 for muscle building).");
  if (!dietType) throw new Error("Select diet type (Vegetarian, Egg-included, or Non-vegetarian).");
  if (!mealsStr) throw new Error("Select meals per day (2, 3, or 4).");
  if (!budgetStr) throw new Error("Enter daily food budget in rupees.");

  const target = Number(targetStr);
  const meals = Number(mealsStr);
  const budget = Number(budgetStr);

  if (isNaN(target) || target < 20 || target > 300) throw new Error("Protein target should be 20-300g per day.");
  if (isNaN(budget) || budget < 50) throw new Error("Budget must be at least Rs 50 per day.");

  // Filter foods by diet type and preferences
  const excluded = preferences.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
  const available = FOOD_DB.filter((f) => {
    if (!f.dietTypes.includes(dietType)) return false;
    if (excluded.some((e) => f.name.toLowerCase().includes(e) || f.category.toLowerCase().includes(e))) return false;
    return true;
  });

  // Greedy allocation: best protein-per-rupee items first
  const sorted = [...available].sort((a, b) => (b.proteinPerServing / b.costPerServing) - (a.proteinPerServing / a.costPerServing));

  let remaining = target;
  let spent = 0;
  let totalCalories = 0;
  const plan: { food: FoodItem; servings: number }[] = [];

  for (const food of sorted) {
    if (remaining <= 0) break;
    const maxServings = food.category === "Supplement" ? 2 : food.category === "Eggs" ? 6 : 3;
    const affordableServings = Math.floor((budget - spent) / food.costPerServing);
    const neededServings = Math.ceil(remaining / food.proteinPerServing);
    const servings = Math.min(maxServings, affordableServings, neededServings);
    if (servings > 0) {
      plan.push({ food, servings });
      remaining -= food.proteinPerServing * servings;
      spent += food.costPerServing * servings;
      totalCalories += food.calories * servings;
    }
  }

  const achieved = target - Math.max(0, remaining);
  const gap = Math.max(0, remaining);
  const withinBudget = spent <= budget;
  const proteinPerRupee = spent > 0 ? achieved / spent : 0;

  // Distribute across meals
  const perMeal = Math.ceil(achieved / meals);
  const mealPlan: { meal: string; items: string[]; protein: number; cost: number }[] = [];
  const mealNames = meals === 2 ? ["Breakfast/Lunch", "Dinner"] : meals === 3 ? ["Breakfast", "Lunch", "Dinner"] : ["Breakfast", "Lunch", "Snack", "Dinner"];
  let planIdx = 0;
  for (let m = 0; m < meals; m++) {
    let mealProtein = 0;
    let mealCost = 0;
    const items: string[] = [];
    while (planIdx < plan.length && mealProtein < perMeal) {
      const p = plan[planIdx];
      items.push(`${p.food.name} x${p.servings} (${p.food.proteinPerServing * p.servings}g protein, Rs ${p.food.costPerServing * p.servings})`);
      mealProtein += p.food.proteinPerServing * p.servings;
      mealCost += p.food.costPerServing * p.servings;
      planIdx++;
    }
    mealPlan.push({ meal: mealNames[m], items, protein: mealProtein, cost: mealCost });
  }
  // Distribute remaining items to last meal
  while (planIdx < plan.length) {
    const p = plan[planIdx];
    const lastMeal = mealPlan[mealPlan.length - 1];
    lastMeal.items.push(`${p.food.name} x${p.servings} (${p.food.proteinPerServing * p.servings}g, Rs ${p.food.costPerServing * p.servings})`);
    lastMeal.protein += p.food.proteinPerServing * p.servings;
    lastMeal.cost += p.food.costPerServing * p.servings;
    planIdx++;
  }

  const band = gap === 0 ? "good" : gap < target * 0.2 ? "warn" : "bad";
  const headline = gap === 0
    ? `${achieved}g protein achievable within Rs ${spent} budget (${meals} meals). Cost: Rs ${(spent / achieved).toFixed(1)} per gram protein. Total ~${totalCalories} calories from protein sources alone.`
    : `Gap: ${Math.round(gap)}g protein cannot be met within Rs ${budget} budget from ${dietType.toLowerCase()} sources. Achieved: ${achieved}g/${target}g. ${gap > 20 ? "Consider adding eggs/whey or increasing budget." : "Close to target - add one more serving."}`;

  return {
    headline,
    score: { label: "Protein Target", value: Math.min(100, Math.round((achieved / target) * 100)), max: 100, band },
    metrics: [
      { label: "Achieved", value: `${achieved}g / ${target}g`, hint: gap > 0 ? `${Math.round(gap)}g short` : "Target met!" },
      { label: "Total cost", value: `Rs ${spent}`, hint: `Budget: Rs ${budget}` },
      { label: "Cost per g protein", value: `Rs ${(spent / Math.max(1, achieved)).toFixed(1)}`, hint: "Lower is better" },
      { label: "Calories (protein sources)", value: String(totalCalories), hint: "Excludes rice/roti" },
    ],
    sections: [
      ...mealPlan.map((m) => ({
        title: `${m.meal} (${m.protein}g protein, Rs ${m.cost})`,
        items: m.items.map((item) => ({ title: item, body: "", severity: "low" as Severity })),
      })),
      {
        title: "Common Protein Myths - Corrected",
        items: MYTHS.map((m) => ({ title: m.myth, body: m.reality, severity: "medium" as Severity, tag: "myth" })),
      },
      ...(gap > 0 ? [{
        title: "How to Close the Gap",
        items: [
          { title: `Short by ${Math.round(gap)}g protein`, body: `Options: increase budget by Rs ${Math.round(gap * (spent / achieved))} | add eggs (6g each, Rs 8) | add whey protein (24g, Rs 55) | add soya chunks (26g, Rs 10). Cheapest option: soya chunks.`, severity: "high" as Severity },
        ],
      }] : []),
      {
        title: "Top Protein-per-Rupee Foods",
        items: sorted.slice(0, 5).map((f) => ({
          title: `${f.name}: ${f.proteinPerServing}g for Rs ${f.costPerServing} (Rs ${(f.costPerServing / f.proteinPerServing).toFixed(1)}/g)`,
          body: `${f.servingSize}. ${f.calories} cal. Best value in ${f.category} category.`,
          severity: "low" as Severity,
        })),
      },
    ],
    table: {
      columns: ["Food", "Servings", "Protein (g)", "Cost (Rs)", "Rs per g"],
      rows: plan.map((p) => [p.food.name, String(p.servings), String(p.food.proteinPerServing * p.servings), String(p.food.costPerServing * p.servings), (p.food.costPerServing / p.food.proteinPerServing).toFixed(1)]),
    },
    json: {
      target, achieved, gap: Math.round(gap), dietType, meals, budget, spent, totalCalories,
      costPerGramProtein: Number((spent / Math.max(1, achieved)).toFixed(2)),
      plan: plan.map((p) => ({ food: p.food.name, servings: p.servings, protein: p.food.proteinPerServing * p.servings, cost: p.food.costPerServing * p.servings })),
      mealDistribution: mealPlan,
    },
  };
}
