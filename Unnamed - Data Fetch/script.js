// Same-origin proxy in server.js (the URL blocks cross-origin browser calls)
const DATA_URL = "/api/calories";

const show = (id, text) => (document.getElementById(id).textContent = text);

async function main() {
  // 1) fetch + parse
  const response = await fetch(DATA_URL);
  const data = await response.json();
  show("s1", `Loaded ${data.length} entries`);

  // 2) dishes over 49.9, cheapest first, top 3
  const pricey = data
    .filter((d) => d.price > 49.9)
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);
  show("s2", pricey.map((d) => `${d.name} - ${d.price.toFixed(2)}`).join("\n"));

  // 3) 3 most recent by date + time, printed oldest first
  const when = (d) => `${d.date_consumed} ${d.time_consumed}`; // sortable as text
  const recent = [...data]
    .sort((a, b) => when(b).localeCompare(when(a)))
    .slice(0, 3);
  show("s3", recent.map((d) => `${d.name} (${when(d)})`).join("\n"));

  // 4) user 10, Dec 4-10 2022: total each nutrient per meal type
  const totals = {}; // { breakfast: {protein, carbs, fat}, ... }
  data
    .filter((d) => d.user_id === "10" && d.date_consumed >= "2022-12-04" && d.date_consumed <= "2022-12-10")
    .forEach((d) => {
      const t = (totals[d.type] ??= { protein: 0, carbs: 0, fat: 0 });
      t.protein += d.protein;
      t.carbs += d.carbs;
      t.fat += d.fat;
    });

  const winner = (nutrient) =>
    Object.keys(totals).reduce((best, type) => (totals[type][nutrient] > totals[best][nutrient] ? type : best));

  show(
    "s4",
    Object.keys(totals).length === 0
      ? "No entries for user 10 in that range"
      : [
          `Highest proteins: ${winner("protein")} (${totals[winner("protein")].protein.toFixed(2)})`,
          `Highest carbs: ${winner("carbs")} (${totals[winner("carbs")].carbs.toFixed(2)})`,
          `Highest fats: ${winner("fat")} (${totals[winner("fat")].fat.toFixed(2)})`,
        ].join("\n")
  );

  // 5) user with most calories in November 2022
  const calories = {}; // { userId: total }
  data
    .filter((d) => d.date_consumed.startsWith("2022-11"))
    .forEach((d) => (calories[d.user_id] = (calories[d.user_id] || 0) + d.calories));

  const ranked = Object.entries(calories).sort((a, b) => b[1] - a[1]); // [[userId, total], ...] highest first
  const [top, second] = ranked;

  show("s5", top ? `User ${top[0]} - ${top[1]} calories` : "No entries in November 2022");
  show("s6", second ? `Second Top User ${second[0]} - ${second[1]} calories` : "No second user in November 2022");

  // 6) November top user excluding user 18
  const [top17] = ranked.filter(([id]) => id !== "18");
  show("s7", top17 ? `User ${top17[0]} - ${top17[1]} calories` : "No entries in November 2022");

  // 7) same 3 recent entries, printed newest first
  show("s8", recent.map((d) => `${when(d)} - ${d.name} - ${d.user_id}`).join("\n"));
}

main().catch((err) => {
  show("s1", "Failed to load data: " + err.message);
});
