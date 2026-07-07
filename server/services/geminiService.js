const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API client if key exists
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.error('Failed to initialize Gemini Client:', err.message);
  }
}

// Language Translations for System Responses in fallbacks
const mockResponses = {
  en: {
    chat: {
      response: "This is a demo assistant response. In production, this prompt is processed by Google's Gemini AI to offer detailed advice. Please configure a valid API key.",
      simpleResponse: "This is a simple explanation: The system is running in demo mode. Please add your Gemini API key in the server configuration.",
      bulletSummary: ["Demo mode is active", "Gemini API key might be missing or invalid", "Enter a query to test local fallback structures"]
    },
    checklist: {
      service: "General Government Application",
      documents: ["Identity Proof (Aadhaar Card/PAN Card)", "Address Proof (Electricity Bill/Rent Agreement)", "Passport Size Photographs", "Income Certificate (if applicable)"],
      eligibility: "Indian Citizens age 18 and above",
      estimated_time: "7 to 15 working days",
      important_notes: ["Ensure names on all documents match exactly", "Self-attest photocopies where required"]
    },
    complaint: {
      department: "Municipal Administration",
      issue: "General Civic Problem",
      priority: "Medium",
      description: "This is a structured complaint generated in offline/fallback mode. The user reported a civic grievance that needs inspection and resolution.",
      suggestedSubject: "Grievance Redressal Request regarding civic issues"
    },
    schemes: [
      {
        schemeTitle: "Pradhan Mantri Awas Yojana (PMAY)",
        description: "An initiative by Government of India in which affordable housing will be provided to the urban and rural poor.",
        benefits: "Interest subsidy on home loans or financial assistance up to Rs. 2.5 Lakhs.",
        eligibility: "Economically Weaker Section (EWS), Low Income Group (LIG), and Middle Income Group (MIG).",
        applySteps: ["Visit the official PMAY portal", "Click on Citizen Assessment", "Fill out the application with Aadhaar and income details", "Submit and track application status"]
      },
      {
        schemeTitle: "Atal Pension Yojana (APY)",
        description: "A pension scheme focused on the unorganized sector workers.",
        benefits: "Guaranteed minimum pension of Rs. 1,000 to Rs. 5,000 per month after 60 years of age.",
        eligibility: "All Indian citizens aged between 18 and 40 years with a bank account.",
        applySteps: ["Visit your bank branch", "Fill the APY registration form", "Provide Aadhaar and mobile number", "Set up auto-debit for monthly contributions"]
      }
    ]
  },
  hi: {
    chat: {
      response: "यह एक डेमो सहायक प्रतिक्रिया है। उत्पादन में, यह संकेत विस्तृत सलाह देने के लिए Google के जेमिनी एआई द्वारा संसाधित किया जाता है। कृपया एक वैध एपीआई कुंजी कॉन्फ़िगर करें।",
      simpleResponse: "यह एक सरल व्याख्या है: सिस्टम डेमो मोड में चल रहा है। कृपया सर्वर कॉन्फ़िगरेशन में अपनी जेमिनी एपीआई कुंजी जोड़ें।",
      bulletSummary: ["डेमो मोड सक्रिय है", "जेमिनी एपीआई कुंजी गायब या अमान्य हो सकती है", "स्थानीय फॉलबैक संरचनाओं का परीक्षण करने के लिए एक प्रश्न दर्ज करें"]
    },
    checklist: {
      service: "सामान्य सरकारी आवेदन",
      documents: ["पहचान प्रमाण (आधार कार्ड / पैन कार्ड)", "पता प्रमाण (बिजली बिल / किराया समझौता)", "पासपोर्ट आकार की तस्वीरें", "आय प्रमाण पत्र (यदि लागू हो)"],
      eligibility: "18 वर्ष और उससे अधिक आयु के भारतीय नागरिक",
      estimated_time: "7 से 15 कार्य दिवस",
      important_notes: ["सुनिश्चित करें कि सभी दस्तावेजों पर नाम बिल्कुल मेल खाते हों", "जहां आवश्यक हो, फोटोकॉपी को स्व-सत्यापित करें"]
    },
    complaint: {
      department: "नगर प्रशासन",
      issue: "सामान्य नागरिक समस्या",
      priority: "Medium",
      description: "यह ऑफ़लाइन / फ़ॉलबैक मोड में उत्पन्न एक संरचित शिकायत है। उपयोगकर्ता ने एक नागरिक शिकायत की सूचना दी है जिसके निरीक्षण और समाधान की आवश्यकता है।",
      suggestedSubject: "नागरिक समस्याओं के संबंध में शिकायत निवारण अनुरोध"
    },
    schemes: [
      {
        schemeTitle: "प्रधानमंत्री आवास योजना (PMAY)",
        description: "भारत सरकार की एक पहल जिसमें शहरी और ग्रामीण गरीबों को किफायती आवास प्रदान किया जाएगा।",
        benefits: "गृह ऋण पर ब्याज सब्सिडी या 2.5 लाख रुपये तक की वित्तीय सहायता।",
        eligibility: "आर्थिक रूप से कमजोर वर्ग (EWS), निम्न आय वर्ग (LIG), और मध्यम आय वर्ग (MIG)।",
        applySteps: ["आधिकारिक PMAY पोर्टल पर जाएं", "सिटीजन असेसमेंट पर क्लिक करें", "आधार और आय विवरण के साथ आवेदन भरें", "जमा करें और आवेदन की स्थिति को ट्रैक करें"]
      }
    ]
  },
  mr: {
    chat: {
      response: "हा डेमो सहायकाचा प्रतिसाद आहे. उत्पादनात, हा प्रॉम्प्ट सविस्तर सल्ला देण्यासाठी Google च्या जेमिनी AI द्वारे प्रक्रिया केला जातो. कृपया वैध API की कॉन्फिगर करा.",
      simpleResponse: "हे एक सोपे स्पष्टीकरण आहे: सिस्टम डेमो मोडमध्ये चालू आहे. कृपया सर्व्हर कॉन्फिगरेशनमध्ये तुमची जेमिनी API की जोडा.",
      bulletSummary: ["डेमो मोड सक्रिय आहे", "जेमिनी API की गहाळ किंवा अमान्य असू शकते", "स्थानिक फॉलबॅक संरचनांची चाचणी घेण्यासाठी प्रश्न प्रविष्ट करा"]
    },
    checklist: {
      service: "सामान्य सरकारी अर्ज",
      documents: ["ओळख पुरावा (आधार कार्ड/पॅन कार्ड)", "पत्ता पुरावा (वीज बिल/भाडे करार)", "पासपोर्ट आकाराची छायाचित्रे", "उत्पन्नाचा दाखला (लागू असल्यास)"],
      eligibility: "18 वर्षे आणि त्यावरील भारतीय नागरिक",
      estimated_time: "7 ते 15 कामकाजाचे दिवस",
      important_notes: ["सर्व कागदपत्रांवरील नावे तंतोतंत जुळत असल्याची खात्री करा", "आवश्यक असेल तिथे छायाप्रत स्व-साक्षांकित करा"]
    },
    complaint: {
      department: "महानगरपालिका प्रशासन",
      issue: "सामान्य नागरी समस्या",
      priority: "Medium",
      description: "हा ऑफलाइन/फॉलबॅक मोडमध्ये तयार झालेला संरचित तक्रार अर्ज आहे. वापरकर्त्याने नागरी तक्रार नोंदवली आहे ज्याची तपासणी आणि निराकरण करणे आवश्यक आहे.",
      suggestedSubject: "नागरी समस्यांविषयी तक्रार निवारण अर्ज"
    },
    schemes: [
      {
        schemeTitle: "पंतप्रधान आवास योजना (PMAY)",
        description: "भारत सरकारचा एक उपक्रम ज्यामध्ये शहरी आणि ग्रामीण गरिबांना परवडणारी घरे दिली जातील.",
        benefits: "गृहकर्जावरील व्याज अनुदान किंवा २.५ लाख रुपयांपर्यंतची आर्थिक मदत.",
        eligibility: "आर्थिकदृष्ट्या दुर्बल घटक (EWS), अल्प उत्पन्न गट (LIG), आणि मध्यम उत्पन्न गट (MIG).",
        applySteps: ["अधिकृत PMAY पोर्टलला भेट द्या", "सिटीझन असेसमेंट वर क्लिक करा", "आधार आणि उत्पन्नाच्या तपशीलांसह अर्ज भरा", "सबमिट करा आणि अर्जाची स्थिती ट्रॅक करा"]
      }
    ]
  }
};

/**
 * 1. Civic Assistant Chat
 */
const getChatResponse = async (prompt, language = 'en') => {
  if (!genAI) {
    console.log('Gemini API key not found. Using local fallback.');
    return mockResponses[language]?.chat || mockResponses['en'].chat;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const langName = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';

    const systemPrompt = `You are Seva Setu AI, a trustworthy civic assistant for Indian citizens. 
    Explain government services in simple, accurate, and highly concise language. 
    Never write long-winded paragraphs. Keep your answers brief, structured, and easy to scan. Use bullet points or simple tables where possible.
    If the user asks about a specific scheme or service, give direct details (e.g., eligibility, documents, benefits) instead of telling them to check standard portal links.
    If you mention any official website or portal, you MUST provide it as a fully qualified clickable markdown link, like [Official Passport Seva Portal](https://www.passportindia.gov.in) or [Aadhaar UIDAI Portal](https://uidai.gov.in). Never write plain text URLs like 'visit passportindia.gov.in'.
    Respond in the user's selected language (${langName}). If uncertain, state that the information should be verified on the official government portal and provide its official link. Never invent application fees, deadlines, or legal requirements.
    
    Provide your response as a JSON object with:
    - "response": A structured, bulleted professional explanation in ${langName}. Keep it clear, polite, and concise. Use markdown links.
    - "simpleResponse": A very simplified, easy-to-understand explanation (as if explaining to a 12-year-old or elderly citizen) in ${langName}. Extremely short.
    - "bulletSummary": An array of simple, short bullet points summarizing the steps or key takeaways in ${langName}.`;

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: `User request: ${prompt}\n\nLanguage to use: ${langName}` }] }
      ],
      systemInstruction: systemPrompt
    });

    const text = result.response.text();
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Gemini Chat Error:', error.message);
    return mockResponses[language]?.chat || mockResponses['en'].chat;
  }
};

/**
 * 2. Document Checklist Generator
 */
const getDocumentChecklist = async (serviceName, language = 'en') => {
  if (!genAI) {
    console.log('Gemini API key not found. Using local fallback.');
    const result = { ...(mockResponses[language]?.checklist || mockResponses['en'].checklist) };
    result.service = serviceName || result.service;
    return result;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const langName = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';

    const systemPrompt = `You are a government document expert for Indian civic administration.
    Based on the user's requested service, generate a checklist of required documents, eligible criteria, estimated time, and warnings.
    Translate the responses accurately to the selected language: ${langName}.
    Each document name in the list should include a suffix stating whether it is Required or Optional, e.g., "Aadhaar Card (Required)" or "Electricity Bill (Optional)".
    If there is an official link to download or apply for a document, attach the markdown link in the name, e.g., "PAN Card (Required) - Apply at [PAN Portal](https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html)".
    
    Return a JSON object with the following fields:
    - "service": The name of the government service in ${langName}.
    - "documents": An array of strings listing required documents in ${langName} with suffixes.
    - "eligibility": A brief string explaining who is eligible in ${langName}.
    - "estimated_time": The typical processing duration in ${langName}.
    - "important_notes": An array of strings outlining crucial tips or mistakes to avoid in ${langName}.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Service Requested: ${serviceName}` }] }],
      systemInstruction: systemPrompt
    });

    const text = result.response.text();
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Gemini Checklist Error:', error.message);
    const result = { ...(mockResponses[language]?.checklist || mockResponses['en'].checklist) };
    result.service = serviceName || result.service;
    return result;
  }
};

/**
 * 3. Voice Complaint Summarizer
 */
const getComplaintSummary = async (unstructuredComplaint, language = 'en') => {
  if (!genAI) {
    console.log('Gemini API key not found. Using local fallback.');
    const fallback = mockResponses[language]?.complaint || mockResponses['en'].complaint;
    return {
      ...fallback,
      description: `User transcript: "${unstructuredComplaint}". ${fallback.description}`
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const systemPrompt = `Analyze the unstructured civic complaint from a citizen. Identify the relevant government department, issues, priority level (Low, Medium, High), a structured formal description, and a suggested subject title for a formal complaint.
    Write the subject, department, and description in English (as government portals typically receive complaints in English), but make sure the department, issue, and description match the citizen's intent.
    
    Return a JSON object with the following fields:
    - "department": The municipal or government department responsible (e.g., Waste Management, Road Infrastructure, Water Supply, Electricity, Health & Sanitation, Public Safety).
    - "issue": The core problem.
    - "priority": "Low", "Medium", or "High".
    - "description": A formal, detailed description written in a polite, structured format, ready to be sent to a municipal officer.
    - "suggestedSubject": A formal subject line.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Citizen Grievance Speech/Text: "${unstructuredComplaint}"` }] }],
      systemInstruction: systemPrompt
    });

    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Complaint Error:', error.message);
    const fallback = mockResponses[language]?.complaint || mockResponses['en'].complaint;
    return {
      ...fallback,
      description: `User transcript: "${unstructuredComplaint}". ${fallback.description}`
    };
  }
};

/**
 * 4. Scheme Recommendation Engine
 */
const recommendSchemes = async (profile, language = 'en') => {
  if (!genAI) {
    console.log('Gemini API key not found. Using local fallback.');
    return mockResponses[language]?.schemes || mockResponses['en'].schemes;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const langName = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';

    const systemPrompt = `You are a social welfare scheme advisor for the Government of India.
    Analyze the user profile and recommend 2-3 matching Indian Government Schemes (Central or State).
    Provide actual, direct schemes matching the parameters instead of general portal pages.
    Always provide the official website application URL for each scheme as a markdown link in the description or application steps.
    Translate scheme details, benefits, eligibility, and steps accurately into the selected language: ${langName}.
    
    User Profile:
    - Age: ${profile.age || 'Not specified'}
    - Occupation: ${profile.occupation || 'Not specified'}
    - Annual Income: ${profile.incomeRange || 'Not specified'}
    - Student: ${profile.isStudent ? 'Yes' : 'No'}
    - Senior Citizen: ${profile.isSenior ? 'Yes' : 'No'}
    - Location/State: ${profile.location || 'India'}
    
    Return a JSON array of scheme objects, where each object has:
    - "schemeTitle": The name of the scheme in ${langName}.
    - "description": A brief explanation in ${langName} including the official markdown link of the scheme.
    - "benefits": Key financial or social benefits in ${langName}.
    - "eligibility": Who can apply in ${langName}.
    - "applySteps": An array of strings showing step-by-step how to apply in ${langName}.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Recommend schemes for this profile.` }] }],
      systemInstruction: systemPrompt
    });

    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Schemes Error:', error.message);
    return mockResponses[language]?.schemes || mockResponses['en'].schemes;
  }
};

module.exports = {
  getChatResponse,
  getDocumentChecklist,
  getComplaintSummary,
  recommendSchemes
};
