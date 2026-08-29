const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY } = require('../config/env');
const Complaint = require('../models/Complaint');

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Predict category & confidence for complaint text
 */
const categorizeComplaint = async (title, description) => {
  const text = `${title} ${description}`.toLowerCase();

  // Heuristic Keyword Rules Fallback
  let predictedCategory = 'Other';
  let confidence = 0.88;

  if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet') || text.includes('network') || text.includes('router') || text.includes('connection')) {
    predictedCategory = 'Wi-Fi';
    confidence = 0.94;
  } else if (text.includes('water') || text.includes('clean') || text.includes('dustbin') || text.includes('garbage') || text.includes('washroom') || text.includes('toilet') || text.includes('trash') || text.includes('smell')) {
    predictedCategory = 'Cleanliness';
    confidence = 0.92;
  } else if (text.includes('hostel') || text.includes('room') || text.includes('bed') || text.includes('mess') || text.includes('warden') || text.includes('geyser')) {
    predictedCategory = 'Hostel';
    confidence = 0.91;
  } else if (text.includes('lab') || text.includes('laboratory') || text.includes('pc') || text.includes('computer') || text.includes('projector') || text.includes('instrument') || text.includes('equipment')) {
    predictedCategory = 'Laboratory';
    confidence = 0.89;
  } else if (text.includes('bench') || text.includes('fan') || text.includes('light') || text.includes('blackboard') || text.includes('classroom') || text.includes('desk') || text.includes('ac') || text.includes('air conditioner')) {
    predictedCategory = 'Classroom';
    confidence = 0.93;
  } else if (text.includes('bus') || text.includes('transport') || text.includes('shuttle') || text.includes('driver') || text.includes('parking')) {
    predictedCategory = 'Transportation';
    confidence = 0.90;
  } else if (text.includes('door') || text.includes('window') || text.includes('lift') || text.includes('elevator') || text.includes('wall') || text.includes('stair') || text.includes('pipe')) {
    predictedCategory = 'Infrastructure';
    confidence = 0.87;
  }

  // Attempt Gemini API if key exists
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analyze the following complaint title and description from a college campus. 
Category options: ['Classroom', 'Laboratory', 'Hostel', 'Wi-Fi', 'Infrastructure', 'Transportation', 'Cleanliness', 'Other'].

Title: "${title}"
Description: "${description}"

Respond strictly in JSON format like this:
{"category": "<Category>", "confidence": <float between 0.5 and 0.99>}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.category) {
        predictedCategory = parsed.category;
        confidence = parsed.confidence || 0.95;
      }
    } catch (err) {
      console.warn('[AI Service] Gemini API call failed, using heuristic fallback:', err.message);
    }
  }

  return { category: predictedCategory, confidence };
};

/**
 * Generate executive 1-2 sentence summary
 */
const summarizeComplaint = async (title, description) => {
  let summary = `${title}: ${description.slice(0, 120)}${description.length > 120 ? '...' : ''}`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Summarize this college campus complaint in 1 or 2 concise, executive sentences for an administrator table.
Title: "${title}"
Description: "${description}"`;

      const result = await model.generateContent(prompt);
      summary = result.response.text().trim();
    } catch (err) {
      console.warn('[AI Service] Gemini summarize call failed, using fallback:', err.message);
    }
  }

  return summary;
};

/**
 * Detect duplicates within same category & block
 */
const detectDuplicates = async (title, description, category, location) => {
  try {
    const query = {
      status: { $ne: 'Closed' },
    };

    if (category) query.category = category;
    if (location && location.block) query['location.block'] = location.block;

    const recentComplaints = await Complaint.find(query).limit(10);
    if (!recentComplaints || recentComplaints.length === 0) {
      return { isDuplicate: false, duplicateOfTicketId: '' };
    }

    const currentText = `${title} ${description}`.toLowerCase();

    for (const item of recentComplaints) {
      const existingText = `${item.title} ${item.description}`.toLowerCase();
      // Simple word overlap similarity check
      const currentWords = new Set(currentText.split(/\s+/).filter((w) => w.length > 3));
      const existingWords = new Set(existingText.split(/\s+/).filter((w) => w.length > 3));

      let matchCount = 0;
      currentWords.forEach((word) => {
        if (existingWords.has(word)) matchCount++;
      });

      const similarity = matchCount / Math.max(currentWords.size, 1);
      if (similarity > 0.4) {
        return {
          isDuplicate: true,
          duplicateOfTicketId: item.ticketId,
        };
      }
    }

    return { isDuplicate: false, duplicateOfTicketId: '' };
  } catch (error) {
    console.error('[AI Service] Duplicate detection error:', error.message);
    return { isDuplicate: false, duplicateOfTicketId: '' };
  }
};

module.exports = {
  categorizeComplaint,
  summarizeComplaint,
  detectDuplicates,
};
