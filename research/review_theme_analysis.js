const fs = require("fs");
const path = require("path");

const outDir = path.join(process.cwd(), "research", "output");
const reviewsPath = path.join(outDir, "playstore_reviews_raw.json");

const reviews = JSON.parse(fs.readFileSync(reviewsPath, "utf8"));

const themes = [
  {
    id: "ads",
    label: "Ads interrupt core task",
    keywords: ["ad", "ads", "advertisement", "pop out", "remove ads", "unremoval"],
  },
  {
    id: "accuracy",
    label: "Calculation accuracy and fee trust",
    keywords: ["legal fee", "legal fees", "stamp", "stamping", "wrong", "not right", "basis", "downpayment"],
  },
  {
    id: "reliability",
    label: "Crashes, loading, unable to use",
    keywords: ["crash", "crashes", "crashing", "cannot open", "cant open", "can't open", "unable to use", "not working", "slow loading", "error"],
  },
  {
    id: "reporting",
    label: "Report generation/export problems",
    keywords: ["generate report", "create report", "d report", "report"],
  },
  {
    id: "ux",
    label: "Navigation and platform UX gaps",
    keywords: ["back button", "difficult", "exit", "button", "android version", "apple"],
  },
  {
    id: "updates",
    label: "Need current rates and rule updates",
    keywords: ["update", "latest", "2025", "new rate", "new stamping"],
  },
  {
    id: "first_home",
    label: "First-time buyer handling",
    keywords: ["first time", "first-time", "first home", "home buyer"],
  },
  {
    id: "easy_useful",
    label: "Easy, useful, convenient",
    keywords: ["easy", "useful", "convenient", "simple", "helpful", "great", "good", "nice", "excellent", "best"],
  },
  {
    id: "agent_workflow",
    label: "Useful for agents/property hunting",
    keywords: ["agent", "real estate", "property hunting", "client", "customer", "job"],
  },
  {
    id: "feature_depth",
    label: "Feature depth/completeness",
    keywords: ["complete", "detail", "comprehensive", "bank", "loan", "calculate", "calculation"],
  },
];

function csvValue(value) {
  if (value === null || value === undefined) return "";
  return `"${String(value).replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

function writeCsv(filePath, rows) {
  if (!rows.length) {
    fs.writeFileSync(filePath, "", "utf8");
    return;
  }
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(csvValue).join(","),
    ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(",")),
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function sentiment(score) {
  if (score <= 2) return "negative";
  if (score === 3) return "neutral";
  return "positive";
}

function matchesTheme(review, theme) {
  const text = `${review.title || ""} ${review.text || ""}`.toLowerCase();
  return theme.keywords.some((keyword) => text.includes(keyword));
}

function shortExample(review) {
  const text = (review.text || "").replace(/\s+/g, " ").trim();
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

const taggedReviews = reviews.map((review) => {
  const matchedThemes = themes
    .filter((theme) => matchesTheme(review, theme))
    .map((theme) => theme.id);
  return {
    ...review,
    sentiment: sentiment(review.score),
    themeIds: matchedThemes,
  };
});

const themeRows = [];
for (const reviewSentiment of ["negative", "positive", "neutral"]) {
  const sentimentReviews = taggedReviews.filter((review) => review.sentiment === reviewSentiment);
  for (const theme of themes) {
    const matched = sentimentReviews.filter((review) => review.themeIds.includes(theme.id));
    themeRows.push({
      sentiment: reviewSentiment,
      themeId: theme.id,
      theme: theme.label,
      reviewCount: matched.length,
      reviewShare: sentimentReviews.length ? matched.length / sentimentReviews.length : 0,
      examples: matched.slice(0, 3).map(shortExample).join(" || "),
    });
  }
}

const appRows = Object.values(
  taggedReviews.reduce((acc, review) => {
    acc[review.appId] ||= {
      appId: review.appId,
      appLabel: review.appLabel,
      collectedReviews: 0,
      avgScore: 0,
      negativeReviews: 0,
      positiveReviews: 0,
      neutralReviews: 0,
      ads: 0,
      accuracy: 0,
      reliability: 0,
      reporting: 0,
      ux: 0,
      updates: 0,
      easy_useful: 0,
      agent_workflow: 0,
      feature_depth: 0,
    };
    const row = acc[review.appId];
    row.collectedReviews += 1;
    row.avgScore += Number(review.score) || 0;
    row[`${review.sentiment}Reviews`] += 1;
    for (const themeId of review.themeIds) {
      row[themeId] = (row[themeId] || 0) + 1;
    }
    return acc;
  }, {}),
).map((row) => ({
  ...row,
  avgScore: row.collectedReviews ? row.avgScore / row.collectedReviews : 0,
}));

const sampleRows = taggedReviews
  .filter((review) => review.themeIds.length)
  .map((review) => ({
    appId: review.appId,
    appLabel: review.appLabel,
    date: review.date,
    score: review.score,
    sentiment: review.sentiment,
    themes: review.themeIds.join(";"),
    text: review.text,
    url: review.url,
  }));

fs.writeFileSync(
  path.join(outDir, "playstore_tagged_reviews.json"),
  JSON.stringify(taggedReviews, null, 2),
  "utf8",
);
writeCsv(path.join(outDir, "review_theme_counts.csv"), themeRows);
writeCsv(path.join(outDir, "app_review_theme_stats.csv"), appRows);
writeCsv(path.join(outDir, "tagged_review_samples.csv"), sampleRows);

console.log(
  JSON.stringify(
    {
      reviews: reviews.length,
      themeRows: themeRows.length,
      appRows: appRows.length,
      output: outDir,
    },
    null,
    2,
  ),
);
