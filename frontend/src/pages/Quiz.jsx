// src/pages/Quiz.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../utils/supabase";

const questions = [
  {
    id: "q1",
    question: "What kind of travel pace do you usually enjoy?",
    type: "scale",
    scale: ["Relaxed", "Balanced", "Fast-paced"],
    hint: "Your preference can change depending on the trip."
  },
  {
    id: "q2",
    question: "What kind of experiences do you enjoy?",
    type: "multi",
    options: [
      "Nature & scenic spots",
      "City exploration",
      "Food & cafes",
      "Cultural & historical places",
      "Adventure activities"
    ],
    hint: "Select all that generally match your interests — it's okay if it varies sometimes."
  },
  {
    id: "q3",
    question: "Who do you usually travel with?",
    type: "multi",
    options: [
      "Solo",
      "With friends",
      "With family",
      "With a partner"
    ],
    hint: "You can select multiple if it depends on the situation."
  },
  {
    id: "q4",
    question: "What matters most to you during trips?",
    type: "multi",
    options: [
      "Budget-friendly options",
      "Comfort & facilities",
      "Unique experiences",
      "Social & lively vibe",
      "Peace & quiet"
    ],
    hint: "Choose what you usually prioritize — not every trip has to be the same."
  },
  {
    id: "q5",
    question: "What kind of destinations excite you?",
    type: "multi",
    options: [
      "Mountains",
      "Beaches",
      "Cities",
      "Hidden gems",
      "Luxury stays"
    ],
    hint: "Pick all that appeal to you overall."
  }
];
const Quiz = () => {
  const navigate = useNavigate();
  const { token } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOptionSelect = (questionId, option, isMulti) => {
    if (isMulti) {
      setAnswers(prev => {
        const current = prev[questionId] || [];
        if (current.includes(option)) {
          return { ...prev, [questionId]: current.filter(item => item !== option) };
        } else {
          return { ...prev, [questionId]: [...current, option] };
        }
      });
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: option }));
      if (currentStep < questions.length - 1) {
        setTimeout(() => setCurrentStep(prev => prev + 1), 300);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit(); // Submit if skipping the last question
    }
  };

  const { user, refreshProfile } = useUser();
  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          quiz_completed: true,
          quiz_data: answers,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      navigate("/chat");
    } catch (err) {
      console.error("Quiz submission error:", err);
      setError("Failed to save your preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-50 to-sky-100 flex flex-col justify-center">
      <div className="px-8 pt-15 pb-20 max-w-2xl mx-auto flex flex-col">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-sky-500 tracking-[0.18em] font-semibold">
              PERSONALITY QUIZ
            </p>
            <p className="text-xs text-slate-500">
              {currentStep + 1} of {questions.length}
            </p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              className="bg-sky-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1"
          >
            <Card className="p-6 mb-6 bg-white/95 shadow-lg rounded-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.hint && (
                  <p className="text-[13px] text-slate-500 mt-2  justify-center items-center font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 inline-block">
                    💡 {currentQuestion.hint}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {(currentQuestion.options || currentQuestion.scale).map((option, index) => {
                  const isMulti = currentQuestion.type === "multi";
                  const isSelected = isMulti
                    ? (answers[currentQuestion.id] || []).includes(option)
                    : answers[currentQuestion.id] === option;

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(currentQuestion.id, option, isMulti)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${isSelected
                        ? "bg-sky-50 border-sky-400 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-sky-50/50 hover:border-sky-200"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isSelected ? "text-sky-700" : "text-slate-700 group-hover:text-sky-700"}`}>
                          {option}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-sky-500 bg-sky-500" : "border-slate-300 group-hover:border-sky-400"
                          }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`text-sm font-bold transition-colors ${currentStep === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-sky-600"
                  }`}
              >
                ← Go Back
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSkip}
                  className="text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors"
                >
                  Skip
                </button>

                {currentQuestion.type === "multi" && !isLastStep && (
                  <Button
                    variant="primary"
                    className="px-8 py-2.5"
                    onClick={handleNext}
                    disabled={!(answers[currentQuestion.id]?.length > 0)}
                  >
                    Next
                  </Button>
                )}

                {isLastStep && (
                  <Button
                    variant="primary"
                    className="px-8 py-2.5"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Complete"}
                  </Button>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center mt-4">
                {error}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;
