import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TermsAndConditions = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [lastModified, setLastModified] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                setLoading(true);
                // Try fetching from the endpoint. 
                // Note: If this endpoint requires admin auth, this might fail for unauthenticated users.
                // Ideally, there should be a public endpoint like '/api/terms-and-condition' or '/api/public/terms'
                // For now, we try the one provided, or fallback to a hardcoded placeholder if 401/403 occurs 
                // to prevent a broken page during development/demo.
                const response = await axios.get('/admin/terms-and-condition');
                setContent(response.data.content);
                setLastModified(response.data.lastModified);
            } catch (err) {
                console.error("Failed to fetch terms:", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    // Fallback for public access if the API is restricted (Temporary measure until public API is verified)
                    setError("Unable to load terms. Please contact support.");
                } else {
                    setError("Failed to load Terms and Conditions. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTerms();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#2d7a63]" />
                        <h1 className="font-bold text-lg">Terms and Conditions</h1>
                    </div>
                    <div className="w-10"></div> {/* Spacer for center alignment */}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#2d7a63] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading terms...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md">{error}</p>
                    </div>
                ) : (
                    <div className="prose dark:prose-invert max-w-none">
                        {lastModified && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
                                <Calendar className="w-4 h-4" />
                                <span>Last Updated: {formatDate(lastModified)}</span>
                            </div>
                        )}

                        <div className="whitespace-pre-wrap font-sans text-base leading-relaxed text-gray-700 dark:text-gray-300">
                            {content || "No terms and conditions available."}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-auto bg-gray-50 dark:bg-[#1f1f1f]">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} Zuum. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default TermsAndConditions;
