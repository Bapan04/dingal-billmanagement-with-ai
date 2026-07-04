import { GoogleGenerativeAI } from '@google/generative-ai';
import supabase from '../config/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini API
// Adding fallback to the provided key in case .env is not loaded
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => {
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using flash for faster responses
}

export const getWeeklyReview = async (req, res) => {
    try {
        // Fetch last 7 days payments
        const { data: payments, error } = await supabase
            .from('payments')
            .select(`*, students(name, courses(name))`)
            .gte('payment_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        const prompt = `You are a financial analyst. Review the following payment records from the last 7 days.
Output STRICTLY and EXCLUSIVELY as a Markdown table (no conversational filler, no extra text). Use the following tabular schema:
| Metric/Category | Value / Details | Trend / Note |
Provide 3-5 rows summarizing total revenue, average payment, daily trends, and EMI vs Full payment breakdown.
Data: ${JSON.stringify(payments)}`;
        
        const model = getModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```(?:markdown)?/gi, '').replace(/```/g, '').trim();

        res.json({ insights: text });
    } catch (error) {
        console.error('Error generating weekly review:', error);
        res.status(500).json({ error: 'Failed to generate AI insights', details: error.message });
    }
};

export const getCourseSpending = async (req, res) => {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('*, courses(name, fee)');

        if (error) throw error;

        const prompt = `You are a business consultant. Analyze the following student and course enrollment data.
Output STRICTLY and EXCLUSIVELY as a Markdown table (no conversational filler). Use the following tabular schema:
| Course Name | Total Enrollments | Total Revenue | Avg Revenue per Student | Key Insight |
Group by each course and summarize the financials.
Data: ${JSON.stringify(students)}`;

        const model = getModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```(?:markdown)?/gi, '').replace(/```/g, '').trim();

        res.json({ insights: text });
    } catch (error) {
        console.error('Error generating course spending:', error);
        res.status(500).json({ error: 'Failed to generate AI insights', details: error.message });
    }
};

export const getPopularCourses = async (req, res) => {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('courses(name)');

        if (error) throw error;

        const prompt = `Based on the following student enrollment data, identify the most popular courses. 
Output STRICTLY and EXCLUSIVELY as a Markdown table (no conversational filler). Use the following tabular schema:
| Rank | Course Name | Total Students | Reason for Popularity | Recommended Marketing Action |
Rank the top courses accordingly.
Data: ${JSON.stringify(students)}`;

        const model = getModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```(?:markdown)?/gi, '').replace(/```/g, '').trim();

        res.json({ insights: text });
    } catch (error) {
        console.error('Error generating popular courses:', error);
        res.status(500).json({ error: 'Failed to generate AI insights', details: error.message });
    }
};

export const categorizeBills = async (req, res) => {
    try {
        const { data: payments, error } = await supabase
            .from('payments')
            .select(`*, students(name, payment_type, courses(name))`);

        if (error) throw error;

        const prompt = `You are an intelligent billing categorization system. Take the following raw payment records and separate/categorize them logically. 
Output STRICTLY and EXCLUSIVELY as a Markdown table (no conversational filler). Use the following tabular schema:
| Course Name | Student ID/Name | Payment Type (FULL/EMI) | Amount Paid | Highlight / Status |
Group the rows by Course Name, then by Payment Type. Mark high-value or unusual transactions in the Highlight column.
Data: ${JSON.stringify(payments)}`;

        const model = getModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```(?:markdown)?/gi, '').replace(/```/g, '').trim();

        res.json({ insights: text });
    } catch (error) {
        console.error('Error categorizing bills:', error);
        res.status(500).json({ error: 'Failed to generate AI insights', details: error.message });
    }
};
