import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Activity, PieChart, TrendingUp, List } from 'lucide-react';

const AiInsights = () => {
    const [loading, setLoading] = useState(false);
    const [insightData, setInsightData] = useState(null);
    const [activeTab, setActiveTab] = useState(null);

    const fetchInsight = async (endpoint, title) => {
        setLoading(true);
        setActiveTab(title);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/ai/${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setInsightData(res.data.insights);
        } catch (error) {
            console.error(error);
            setInsightData('Failed to load insights. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center space-x-3 text-gray-800">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <h1 className="text-3xl font-bold">Dingal AI Analyzer</h1>
            </div>
            
            <p className="text-gray-600 text-lg">
                Leverage Dingal AI Analyzer to analyze your institute's performance, spending, and bill separation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <button onClick={() => fetchInsight('weekly-review', 'Weekly Bill Review')} className="p-6 bg-white rounded-xl shadow hover:shadow-md transition border-t-4 border-blue-500 flex flex-col items-center justify-center text-center space-y-3 group">
                    <Activity className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-700">Revise Weekly Bills</span>
                </button>
                <button onClick={() => fetchInsight('course-spending', 'Course Spending Analysis')} className="p-6 bg-white rounded-xl shadow hover:shadow-md transition border-t-4 border-green-500 flex flex-col items-center justify-center text-center space-y-3 group">
                    <PieChart className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-700">Check Course Spending</span>
                </button>
                <button onClick={() => fetchInsight('popular-courses', 'Popular Courses')} className="p-6 bg-white rounded-xl shadow hover:shadow-md transition border-t-4 border-yellow-500 flex flex-col items-center justify-center text-center space-y-3 group">
                    <TrendingUp className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-700">Popular Courses List</span>
                </button>
                <button onClick={() => fetchInsight('categorize-bills', 'Smart Bill Separation')} className="p-6 bg-white rounded-xl shadow hover:shadow-md transition border-t-4 border-purple-500 flex flex-col items-center justify-center text-center space-y-3 group">
                    <List className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-700">Separate Bills via AI</span>
                </button>
            </div>

            <div className="mt-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100 min-h-[400px]">
                {activeTab && <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center"><Sparkles className="w-6 h-6 mr-2 text-purple-600"/> {activeTab}</h2>}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
                        <p className="text-gray-500 font-medium">Dingal AI Analyzer is analyzing your data...</p>
                    </div>
                ) : insightData ? (
                    <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-6 rounded-lg text-sm md:text-base leading-relaxed border border-gray-200">
                            {insightData}
                        </pre>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                        Select an AI tool above to generate insights.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiInsights;
