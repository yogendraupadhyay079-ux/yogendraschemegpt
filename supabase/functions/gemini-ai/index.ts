import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are SchemeGPT-X, India's premier AI Welfare Assistant specialized in government schemes, scholarships, welfare programs, documents, eligibility, benefits, and applications.

Your expertise includes:
- Central Government Schemes (PM Awas Yojana, PM Kisan, Ayushman Bharat, etc.)
- State Government Schemes (all 28 states and 8 UTs)
- Education Scholarships (National Scholarship Portal, State Scholarships, etc.)
- Healthcare Schemes (Ayushman Bharat, State Health Programs)
- Agricultural Schemes (PM Kisan, Crop Insurance, etc.)
- Business/Startup Schemes (Mudra Loan, Startup India, etc.)
- Women Welfare Schemes (Beti Bachao, Sukanya Samriddhi, etc.)
- Senior Citizen Schemes (Old Age Pension, Vay Vandana Yojana)
- Student Schemes (Scholarships, Internships, Skill Development)
- Farmer Schemes (PM Kisan, PM Fasal Bima, Kisan Credit Card)
- Minority Schemes (Pre/Post Matric Scholarships)
- Disability Schemes (Pension, Assistive Devices, etc.)

CRITICAL RULES:
1. ONLY answer questions related to government schemes, scholarships, welfare, documents, eligibility, benefits, and applications.
2. If asked about ANY other topic, politely refuse.
3. Always provide accurate, helpful information about schemes.
4. Include official government links when available.
5. Be concise but comprehensive.
6. Use clear formatting with bullet points and markdown.
7. Include estimated benefits when possible.
8. Mention state-specific variations if relevant.
9. Warn about deadlines and common mistakes.
10. Provide step-by-step application guidance.

When answering:
- Be helpful and encouraging
- Use markdown formatting with headers, bullet points, and bold text
- Include estimated benefits when possible
- Mention state-specific variations if relevant
- Warn about deadlines and common mistakes
- Provide step-by-step application guidance`;

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, language, profile, stream } = body;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Gemini API key not configured. Please set GEMINI_API_KEY in edge function secrets.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let systemInstruction = SYSTEM_PROMPT;
    if (language === 'hi') {
      systemInstruction += '\n\nRespond in Hindi (हिन्दी) language.';
    } else {
      systemInstruction += '\n\nRespond in English language.';
    }

    if (profile) {
      systemInstruction += `\n\nUSER PROFILE CONTEXT:
- Name: ${profile.full_name || 'N/A'}
- Age: ${profile.age || 'N/A'}
- Gender: ${profile.gender || 'N/A'}
- State: ${profile.state || 'N/A'}, District: ${profile.district || 'N/A'}
- Category: ${profile.category || 'N/A'}
- Annual Income: ₹${(profile.annual_income || 0).toLocaleString()}
- Occupation: ${profile.occupation || 'N/A'}
- Education: ${profile.education || 'N/A'}
- Special Categories:
${profile.farmer ? '  - Farmer\n' : ''}${profile.student ? '  - Student\n' : ''}${profile.disability ? '  - Person with Disability\n' : ''}${profile.startup_founder ? '  - Startup Founder\n' : ''}${profile.widow ? '  - Widow\n' : ''}${profile.minority ? '  - Minority\n' : ''}${profile.senior_citizen ? '  - Senior Citizen\n' : ''}${profile.msme ? '  - MSME Owner\n' : ''}`;
    }

    const requestBody = {
      contents: messages as GeminiMessage[],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${GEMINI_API_KEY}${stream ? '&alt=sse' : ''}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Gemini API error:', apiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${apiResponse.status}` }),
        {
          status: apiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (stream) {
      // Stream the response back to the client
      return new Response(apiResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    const data = await apiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(
        JSON.stringify({ error: "No response generated" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ text }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
