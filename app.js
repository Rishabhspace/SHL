//Complete assessment recommendation API

const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const natural = require("natural");
const { TfIdf, WordTokenizer, PorterStemmer } = natural;

// Initialize Express app
const app = express();
app.use(express.json());

// Load data at startup
let assessmentsData = null;

async function loadData() {
  try {
    const dataPath = path.join(__dirname, "SHL.json");
    const data = await fs.readFile(dataPath, "utf8");
    assessmentsData = JSON.parse(data);
    console.log("Successfully loaded assessments data");
  } catch (error) {
    console.error("Error loading assessments data:", error);
    process.exit(1);
  }
}

// --------------------------------
// Recommendation Engine Functions
// --------------------------------

/**
 * Preprocess text by tokenizing, removing stopwords, and stemming
 * @param {string} text - Input text
 * @param {object} tokenizer - Tokenizer instance
 * @returns {Array} - Preprocessed tokens
 */
function preprocessText(text, tokenizer) {
  if (!text) return [];

  // Common stopwords
  const stopwords = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "is",
    "are",
    "of",
    "for",
    "in",
    "to",
    "with",
    "on",
    "at",
    "this",
    "that",
    "be",
    "by",
    "as",
  ]);

  // Tokenize, convert to lowercase, remove stopwords, and stem
  const tokens = tokenizer
    .tokenize(text.toLowerCase())
    .filter((token) => !stopwords.has(token) && token.length > 1)
    .map((token) => PorterStemmer.stem(token));

  return tokens;
}

/**
 * Extract key terms and technical concepts from a query
 * @param {string} query - Input query or job description
 * @returns {Array} - Extracted key terms
 */
function extractKeyTerms(query) {
  // Common job skills and technologies to look for
  const technicalTerms = [
    "javascript",
    "js",
    "typescript",
    "ts",
    "node",
    "nodejs",
    "react",
    "angular",
    "vue",
    "java",
    "python",
    "ruby",
    "php",
    "c#",
    ".net",
    "sql",
    "nosql",
    "database",
    "aws",
    "azure",
    "cloud",
    "docker",
    "kubernetes",
    "devops",
    "agile",
    "scrum",
    "frontend",
    "backend",
    "fullstack",
    "web",
    "mobile",
    "api",
    "rest",
    "graphql",
    "test",
    "qa",
    "quality",
    "security",
    "machine learning",
    "ml",
    "ai",
    "data science",
    "analytics",
    "leadership",
    "management",
    "communication",
    "problem solving",
    "critical thinking",
    "collaboration",
    "teamwork",
    "project",
    "product",
  ];

  const queryLower = query.toLowerCase();

  // Find all technical terms that appear in the query
  const foundTerms = technicalTerms.filter((term) => queryLower.includes(term));

  // Extract other potential key terms (capitalized words, words preceded by certain indicators)
  const tokenizer = new WordTokenizer();
  const allTokens = tokenizer.tokenize(query);

  const skillIndicators = [
    "experience",
    "knowledge",
    "proficiency",
    "skills",
    "familiar",
    "competent",
  ];
  let potentialSkills = [];

  for (let i = 0; i < allTokens.length; i++) {
    // Capitalized words might be important terms
    if (
      allTokens[i][0] === allTokens[i][0].toUpperCase() &&
      allTokens[i].length > 1
    ) {
      potentialSkills.push(allTokens[i].toLowerCase());
    }

    // Words that follow skill indicators
    if (
      skillIndicators.includes(allTokens[i].toLowerCase()) &&
      i < allTokens.length - 1
    ) {
      potentialSkills.push(allTokens[i + 1].toLowerCase());
    }
  }

  // Combine and remove duplicates
  const allKeyTerms = [...new Set([...foundTerms, ...potentialSkills])];

  // Stem the terms for better matching
  return allKeyTerms.map((term) => PorterStemmer.stem(term));
}

/**
 * Calculate keyword match score
 * @param {Array} keyTerms - Key terms from the query
 * @param {string} assessmentText - Processed assessment text
 * @returns {number} - Keyword match score
 */
function calculateKeywordMatchScore(keyTerms, assessmentText) {
  if (keyTerms.length === 0) return 0;

  let matchCount = 0;
  keyTerms.forEach((term) => {
    if (assessmentText.includes(term)) {
      matchCount++;
    }
  });

  return matchCount / keyTerms.length;
}

/**
 * Calculate test type relevance
 * @param {Array} keyTerms - Key terms from the query
 * @param {Array} testTypes - Test types of the assessment
 * @returns {number} - Test type relevance score
 */
function calculateTestTypeRelevance(keyTerms, testTypes) {
  // Test type mapping
  const testTypeMapping = {
    K: ["technical", "knowledge", "assessment", "skill"],
    A: ["aptitude", "ability", "reasoning"],
    P: ["personality", "behavior", "soft", "interpersonal"],
    B: ["behavioral", "competency", "performance"],
    C: ["cognitive", "problem", "thinking"],
    D: ["development", "learning", "growth"],
    E: ["emotional", "intelligence", "eq"],
  };

  if (!testTypes || testTypes.length === 0 || keyTerms.length === 0) return 0;

  // Flatten test types string array and split by individual letters
  const types = testTypes
    .join(" ")
    .split("")
    .filter((c) => /[A-Z]/.test(c));

  let relevanceScore = 0;
  types.forEach((type) => {
    if (testTypeMapping[type]) {
      const relevantKeywords = testTypeMapping[type];
      keyTerms.forEach((term) => {
        if (
          relevantKeywords.some(
            (keyword) => keyword.includes(term) || term.includes(keyword)
          )
        ) {
          relevanceScore += 1;
        }
      });
    }
  });

  // Normalize score
  return types.length > 0
    ? relevanceScore / (types.length * keyTerms.length)
    : 0;
}

/**
 * Get assessment recommendations based on a query
 * @param {string} query - The job description or query to match against
 * @param {Array} assessments - All available assessments
 * @returns {Array} - Recommended assessments (up to 10, minimum 1)
 */
async function getRecommendations(query, assessments) {
  // Initialize tokenizer
  const tokenizer = new WordTokenizer();

  // Preprocess the query
  const queryTokens = preprocessText(query, tokenizer);

  // Extract key skills and technologies from the query
  const keyTerms = extractKeyTerms(query);

  // Initialize TF-IDF
  const tfidf = new TfIdf();

  // Add query as the first document (will be used for comparison)
  tfidf.addDocument(queryTokens.join(" "));

  // Process each assessment
  const assessmentDocuments = assessments.map((assessment, index) => {
    // Create a comprehensive document for each assessment
    const documentText = [
      assessment.description,
      assessment.test_type.join(" "),
      assessment.adaptive_support,
      assessment.remote_support,
      `duration ${assessment.duration}`,
    ].join(" ");

    const processedDoc = preprocessText(documentText, tokenizer).join(" ");
    tfidf.addDocument(processedDoc);

    return {
      index,
      processedText: processedDoc,
      originalAssessment: assessment,
    };
  });

  // Calculate similarity scores using multiple methods
  const results = assessmentDocuments.map((doc) => {
    // TF-IDF similarity score
    let tfidfScore = 0;
    tfidf.tfidfs(queryTokens.join(" "), (i, score) => {
      if (i === doc.index + 1) {
        // +1 because query is the first document
        tfidfScore = score;
      }
    });

    // Keyword matching score
    const keywordScore = calculateKeywordMatchScore(
      keyTerms,
      doc.processedText
    );

    // Test type relevance score
    const testTypeScore = calculateTestTypeRelevance(
      keyTerms,
      doc.originalAssessment.test_type
    );

    // Combined score with weights
    const combinedScore =
      tfidfScore * 0.6 + keywordScore * 0.3 + testTypeScore * 0.1;

    return {
      assessment: doc.originalAssessment,
      score: combinedScore,
    };
  });

  // Sort by combined score (descending)
  results.sort((a, b) => b.score - a.score);

  // Return top 10 matches (or fewer if there aren't enough assessments)
  const recommendations = results
    .slice(0, 10)
    .map((result) => result.assessment);

  // Ensure at least one recommendation is returned if available
  if (recommendations.length === 0 && assessments.length > 0) {
    recommendations.push(assessments[0]);
  }

  return recommendations;
}

// --------------------------------
// API Endpoints
// --------------------------------

// 1. Health Check Endpoint
app.get("/health", (req, res) => {
  if (assessmentsData) {
    res.status(200).json({ status: "healthy" });
  } else {
    res.status(503).json({ status: "unhealthy", message: "Data not loaded" });
  }
});

// 2. Assessment Recommendation Endpoint
app.post("/recommend", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({
        error: "Invalid input",
        message: "A valid query string is required",
      });
    }

    if (!assessmentsData) {
      return res.status(503).json({
        error: "Service unavailable",
        message: "Assessment data not loaded",
      });
    }

    const recommendations = await getRecommendations(
      query,
      assessmentsData.recommended_assessments
    );

    res.status(200).json({
      recommended_assessments: recommendations,
    });
  } catch (error) {
    console.error("Error processing recommendation request:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process recommendation request",
    });
  }
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested resource does not exist",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Define port
const PORT = process.env.PORT || 3000;

// Start server
async function startServer() {
  await loadData();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

// Export app for testing purposes
module.exports = app;
