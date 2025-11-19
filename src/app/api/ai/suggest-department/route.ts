import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use a more stable model name
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Given the following escalation description, suggest the most appropriate department. The possible departments are: Technical, Documentation, Finance, Maintenance, and Legal. Only respond with the department name, nothing else.

Description: ${description}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const department = response.text().trim();

    // Validate the response
    const validDepartments = ['Technical', 'Documentation', 'Finance', 'Maintenance', 'Legal'];
    const suggestedDepartment = validDepartments.find(dept => 
      department.toLowerCase().includes(dept.toLowerCase())
    ) || 'Technical'; // Default fallback

    return NextResponse.json({ department: suggestedDepartment });
  } catch (error) {
    console.error('Error in suggest department API:', error);
    
    // Return a more specific error message
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    return NextResponse.json(
      { error: 'Failed to suggest department' },
      { status: 500 }
    );
  }
}
