const fs = require("fs");
const path = require("path");
const scraperModule = require("google-play-scraper");

const gplay = scraperModule.default || scraperModule;

const apps = [
  {
    appId: "com.appnextdoor.homeloancalculator",
    label: "Home Loan Calculator Malaysia",
  },
  {
    appId: "com.agmostudio.myhomeloancalculator.my",
    label: "Malaysia Home Loan Calculator",
  },
  {
    appId: "syncteq.propertycalculatormalaysia",
    label: "PCMY - Property Calculator Malaysia",
  },
  {
    appId: "com.propertyXMalaysiaHomeLoan",
    label: "PropertyX Malaysia Home Loan",
  },
  {
    appId: "com.yestronic.loan",
    label: "Yest Loan Calculator",
  },
  {
    appId: "com.yestronic.homeloan",
    label: "Yest Home Loan Calculator",
  },
];

const locales = [
  { lang: "en", country: "my" },
  { lang: "ms", country: "my" },
];

const sorts = [
  { name: "newest", value: gplay.sort.NEWEST },
  { name: "rating", value: gplay.sort.RATING },
  { name: "helpfulness", value: gplay.sort.HELPFULNESS },
];

const outDir = path.join(process.cwd(), "research", "output");

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

function compactReview(review, appId, appLabel, source) {
  return {
    appId,
    appLabel,
    reviewId: review.id,
    userName: review.userName,
    date: review.date,
    score: review.score,
    version: review.version,
    thumbsUp: review.thumbsUp,
    title: review.title,
    text: review.text,
    url: review.url,
    replyDate: review.replyDate,
    replyText: review.replyText,
    sources: [source],
  };
}

async function fetchAppMetadata(app) {
  for (const locale of locales) {
    try {
      const data = await gplay.app({
        appId: app.appId,
        lang: locale.lang,
        country: locale.country,
      });
      return {
        appId: app.appId,
        label: app.label,
        title: data.title,
        developer: data.developer,
        score: data.score,
        ratings: data.ratings,
        reviews: data.reviews,
        histogram: data.histogram,
        installs: data.installs,
        minInstalls: data.minInstalls,
        maxInstalls: data.maxInstalls,
        price: data.price,
        free: data.free,
        genre: data.genre,
        updated: data.updated,
        version: data.version,
        androidVersion: data.androidVersion,
        url: data.url,
        locale: `${locale.lang}-${locale.country}`,
      };
    } catch (error) {
      if (locale === locales[locales.length - 1]) {
        return {
          appId: app.appId,
          label: app.label,
          error: error.message,
        };
      }
    }
  }
}

async function fetchReviewsForApp(app) {
  const byId = new Map();
  const errors = [];

  for (const locale of locales) {
    for (const sort of sorts) {
      const source = `${locale.lang}-${locale.country}:${sort.name}`;
      try {
        const response = await gplay.reviews({
          appId: app.appId,
          lang: locale.lang,
          country: locale.country,
          sort: sort.value,
          num: 1000,
        });
        for (const review of response.data || []) {
          const key = review.id || `${review.userName}|${review.date}|${review.text}`;
          const existing = byId.get(key);
          if (existing) {
            existing.sources.push(source);
          } else {
            byId.set(key, compactReview(review, app.appId, app.label, source));
          }
        }
      } catch (error) {
        errors.push({ appId: app.appId, source, error: error.message });
      }
    }
  }

  return { reviews: [...byId.values()], errors };
}

function summarize(appsMetadata, reviews, errors) {
  return appsMetadata.map((meta) => {
    const appReviews = reviews.filter((review) => review.appId === meta.appId);
    const negativeReviews = appReviews.filter((review) => review.score <= 2);
    const scoreCounts = appReviews.reduce((acc, review) => {
      acc[review.score] = (acc[review.score] || 0) + 1;
      return acc;
    }, {});
    return {
      ...meta,
      collectedReviews: appReviews.length,
      collectedNegativeReviews: negativeReviews.length,
      collectedScoreCounts: scoreCounts,
      scrapeErrors: errors.filter((error) => error.appId === meta.appId),
    };
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const metadata = [];
  const allReviews = [];
  const allErrors = [];

  for (const app of apps) {
    console.log(`Fetching ${app.appId}`);
    const appMetadata = await fetchAppMetadata(app);
    metadata.push(appMetadata);

    const { reviews, errors } = await fetchReviewsForApp(app);
    allReviews.push(...reviews);
    allErrors.push(...errors);
  }

  const summary = summarize(metadata, allReviews, allErrors);
  const negativeReviews = allReviews.filter((review) => review.score <= 2);

  fs.writeFileSync(
    path.join(outDir, "playstore_app_metadata.json"),
    JSON.stringify(metadata, null, 2),
    "utf8",
  );
  fs.writeFileSync(
    path.join(outDir, "playstore_reviews_raw.json"),
    JSON.stringify(allReviews, null, 2),
    "utf8",
  );
  fs.writeFileSync(
    path.join(outDir, "playstore_summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8",
  );
  fs.writeFileSync(
    path.join(outDir, "playstore_scrape_errors.json"),
    JSON.stringify(allErrors, null, 2),
    "utf8",
  );

  writeCsv(path.join(outDir, "playstore_reviews.csv"), allReviews);
  writeCsv(path.join(outDir, "playstore_negative_reviews.csv"), negativeReviews);
  writeCsv(path.join(outDir, "playstore_summary.csv"), summary);

  console.log(
    JSON.stringify(
      {
        apps: metadata.length,
        reviews: allReviews.length,
        negativeReviews: negativeReviews.length,
        errors: allErrors.length,
        output: outDir,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
