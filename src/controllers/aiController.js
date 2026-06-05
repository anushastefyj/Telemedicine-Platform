const { OpenAI } = require('openai');
const { ErrorResponse, asyncHandler } = require('../middleware/error');

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key') {
    console.warn('OPENAI_API_KEY is not configured. Falling back to Mock AI engine.');
    return null;
  }
  return new OpenAI({ apiKey });
};

// @desc    Check symptoms and suggest conditions
// @route   POST /api/ai/symptoms
// @access  Private
exports.analyzeSymptoms = asyncHandler(async (req, res, next) => {
  const { symptoms } = req.body;

  if (!symptoms || symptoms.trim() === '') {
    return next(new ErrorResponse('Please provide symptoms to analyze', 400));
  }

  const openai = getOpenAIClient();

  if (!openai) {
    return res.status(200).json({
      success: true,
      provider: 'mock-ai',
      data: {
        possibleConditions: [
          { name: 'Common Cold', probability: '70%', description: 'A mild viral infection of the upper respiratory tract.' },
          { name: 'Influenza', probability: '20%', description: 'A highly contagious respiratory illness caused by influenza viruses.' },
        ],
        recommendation: 'Rest, drink plenty of fluids, and consider over-the-counter cold remedies. Book a doctor if fever rises.',
        suggestBookDoctor: true,
        suggestedSpecialty: 'General Physician',
      },
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a medical AI assistant. You must respond with a strictly formatted JSON object and nothing else.',
        },
        {
          role: 'user',
          content: `Based on symptoms: "${symptoms}", suggest possible medical conditions with probabilities.
          
          Return ONLY a JSON object with this exact structure:
          {
            "possibleConditions": [{"name": "string", "probability": "string (e.g. 80%)", "description": "string"}],
            "recommendation": "string",
            "suggestBookDoctor": boolean,
            "suggestedSpecialty": "string"
          }
          Do not wrap in markdown or code blocks.`,
        },
      ],
    });

    const outputText = response.choices[0].message.content.trim();
    const data = JSON.parse(outputText);

    res.status(200).json({
      success: true,
      provider: 'openai',
      data,
    });
  } catch (err) {
    console.error('OpenAI Symptom Checker failed:', err);
    res.status(200).json({
      success: true,
      provider: 'mock-fallback',
      data: {
        possibleConditions: [{ name: 'Viral Infection', probability: '50%', description: 'General viral syndrome.' }],
        recommendation: 'API connection failed. Please rest and consult a doctor if condition persists.',
        suggestBookDoctor: true,
        suggestedSpecialty: 'General Physician',
      },
    });
  }
});

// @desc    Convert prescription text to structured format
// @route   POST /api/ai/prescription-summary
// @access  Private
exports.summarizePrescription = asyncHandler(async (req, res, next) => {
  const { prescriptionText } = req.body;

  if (!prescriptionText || prescriptionText.trim() === '') {
    return next(new ErrorResponse('Please provide prescription text to summarize', 400));
  }

  const openai = getOpenAIClient();

  if (!openai) {
    return res.status(200).json({
      success: true,
      provider: 'mock-ai',
      data: {
        medicines: [
          {
            name: 'Amoxicillin 500mg',
            dosage: '1 capsule',
            duration: '7 days',
            frequency: 'Thrice a day',
            instructions: 'Take after meals',
          },
        ],
        summary: 'Take Amoxicillin 500mg three times daily for 7 days after food.',
      },
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a clinical AI assistant. You must respond with a strictly formatted JSON object and nothing else.',
        },
        {
          role: 'user',
          content: `Extract the medicines from this prescription text: "${prescriptionText}".
          
          Return ONLY a JSON object with this exact structure:
          {
            "medicines": [{
              "name": "string",
              "dosage": "string",
              "duration": "string",
              "frequency": "string",
              "instructions": "string"
            }],
            "summary": "string summary describing overall course"
          }
          Do not wrap in markdown or code blocks.`,
        },
      ],
    });

    const outputText = response.choices[0].message.content.trim();
    const data = JSON.parse(outputText);

    res.status(200).json({
      success: true,
      provider: 'openai',
      data,
    });
  } catch (err) {
    console.error('OpenAI Prescription structurer failed:', err);
    res.status(200).json({
      success: true,
      provider: 'mock-fallback',
      data: {
        medicines: [
          {
            name: 'Parsed Drug',
            dosage: 'As instructed',
            duration: 'As indicated',
            frequency: 'Refer to original text',
            instructions: 'Verify with pharmacist',
          },
        ],
        summary: 'Error parsing text. Please read original text.',
      },
    });
  }
});
