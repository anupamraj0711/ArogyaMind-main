import React, { useState, useContext } from 'react';
import { LoadingSpinner } from '../components/shared';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SymptomSubmission() {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const normalizeProbability = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    if (num <= 1) return Math.round(num * 100);
    if (num > 100) return 100;
    return Math.round(num);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await api.post('/symptoms/analyze', {
        symptoms,
        patientId: user?._id || null
      });
      const analysis = res.data.record.aiAnalysis;
      const defaultAdvice = 'Stay hydrated, get rest, and avoid heavy or greasy meals. Seek urgent care if symptoms are severe or worsening.';
      const defaultImmediate = 'If you feel severe pain, shortness of breath, or dizziness, seek emergency care immediately.';
      setResults({
        conditions: (analysis.conditions || []).map((item) => ({
          ...item,
          probability: normalizeProbability(item.probability)
        })),
        recommendedSpecialist: analysis.recommendedSpecialistType,
        severity: analysis.severity,
        immediateAction: analysis.immediateAction || defaultImmediate,
        dietAndLifestyle: analysis.dietAndLifestyle || defaultAdvice
      });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isValid = symptoms.length >= 5;

  const getScoreColor = (score) => {
    if (score > 70) return 'bg-[#00C896]';
    if (score >= 40) return 'bg-[#F5A623]'; // yellow/orange
    return 'bg-[#E84040]'; // red
  };

  const suggestionTags = ["Gastritis", "IBS", "Acid Reflux", "Migraine", "Fatigue"];

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-normal text-[#1C2B3A]">Symptom Analysis</h1>
        <p className="text-sm text-[#7A8FA6] mt-1">Describe your symptoms for AI-powered health insights</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm mb-8">
        <h2 className="text-[#1C2B3A] font-medium mb-4">Describe Your Symptoms</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {suggestionTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSymptoms(prev => prev ? prev + ', ' + tag : tag)}
              className="px-3 py-1 bg-[#F4F7FB] border border-[#E2E8F0] rounded-full text-xs text-[#7A8FA6] hover:text-[#1A6FB5] hover:border-[#1A6FB5] transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>

        <textarea
          className="w-full h-32 rounded-xl border border-[#E2E8F0] p-4 text-[#1C2B3A] text-sm focus:outline-none focus:border-[#1A6FB5] resize-none mb-2"
          placeholder="Please describe your symptoms in detail. Include when they started, how severe they are, and any other relevant information..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        ></textarea>

        <div className="mb-6 text-sm">
          <span className={isValid ? "text-[#7A8FA6]" : "text-[#E84040]"}>
            {symptoms.length} characters (minimum 5 required)
          </span>
        </div>

        {error && <p className="text-[#E84040] text-sm mb-4">{error}</p>}

        <button
          onClick={handleAnalyze}
          disabled={!isValid || isAnalyzing}
          className={`w-full py-3 rounded-full font-medium transition-colors ${isValid && !isAnalyzing
            ? 'bg-[#1A6FB5] text-white hover:bg-[#155A96]'
            : 'bg-[#EEF2F6] text-[#7A8FA6] cursor-not-allowed'
            }`}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>
      </div>

      {isAnalyzing && (
        <div className="flex justify-center my-12">
          <LoadingSpinner text="AI is analyzing your symptoms..." />
        </div>
      )}

      {results && !isAnalyzing && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#1C2B3A] font-medium text-lg">Analysis Results</h2>
            <div className="flex items-center gap-2">
              {results.severity && (
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full text-white ${results.severity === 'Critical' ? 'bg-[#E84040]' :
                  results.severity === 'High' ? 'bg-[#E84040]/80' :
                    results.severity === 'Medium' ? 'bg-[#F5A623]' : 'bg-[#00C896]'
                  }`}>
                  {results.severity} Risk
                </span>
              )}
              <span className="text-xs font-bold text-[#00C896] bg-[#00C896]/10 px-3 py-1.5 rounded-full">AI-Powered</span>
            </div>
          </div>

          <div className="space-y-5 mb-8">
            {results.conditions && results.conditions.map((r, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-[#1C2B3A]">{r.name}</span>
                  <span className="font-bold text-[#1C2B3A]">{r.probability}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                  <div className={`${getScoreColor(r.probability)} h-2 rounded-full transition-all duration-1000`} style={{ width: `${r.probability}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          {(results.immediateAction || results.dietAndLifestyle) && (
            <div className="space-y-5 mb-8 border-t border-b border-[#E2E8F0] py-6">
              {results.immediateAction && (
                <div>
                  <h3 className="font-semibold text-[#1C2B3A] text-sm mb-2 flex items-center gap-2">
                    Immediate Action Recommended
                  </h3>
                  <p className="text-[#7A8FA6] text-sm leading-relaxed bg-[#F4F7FB] p-3 rounded-lg border border-[#E2E8F0]">{results.immediateAction}</p>
                </div>
              )}
              {results.dietAndLifestyle && (
                <div>
                  <h3 className="font-semibold text-[#1C2B3A] text-sm mb-2 flex items-center gap-2">
                    Diet & Lifestyle Advice
                  </h3>
                  <p className="text-[#7A8FA6] text-sm leading-relaxed bg-[#F4F7FB] p-3 rounded-lg border border-[#E2E8F0]">{results.dietAndLifestyle}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-4 mb-8 flex gap-3 text-[#B78103]">
            <p className="text-sm leading-relaxed font-medium">
              These suggestions are AI-generated and advisory only. They do not constitute a medical diagnosis. Please consult a licensed physician.
            </p>
          </div>

          {results.recommendedSpecialist && (
            <div className="pt-6 border-t border-[#E2E8F0]">
              <p className="text-sm text-[#7A8FA6] mb-4 text-center">Based on these symptoms, we recommend consulting a:</p>
              <button
                onClick={() => navigate(`/specialists?specialty=${results.recommendedSpecialist}`)}
                className="w-full py-4 rounded-full font-medium text-white bg-[#00C896] hover:bg-[#00B386] shadow-md hover:shadow-lg transition-all"
              >
                View Recommended Specialists ({results.recommendedSpecialist})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
