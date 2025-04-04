
import { teamQuestions } from '@/utils/team-questions';

export function getDefaultQuestions(stepNumber: number, questionnaireId: string): any[] {
  // If it's step 1 (Team), use our predefined team questions
  if (stepNumber === 1) {
    return teamQuestions.map(q => ({
      ...q,
      questionnaire_id: questionnaireId
    }));
  }
  
  // For other steps, return example questions based on step number
  const stepPrefix = `${stepNumber}.`;
  
  switch (stepNumber) {
    case 2: // Product
      return [
        {
          question: "What is your product or service?",
          question_number: `${stepPrefix}1`,
          response_type: "text",
          questionnaire_id: questionnaireId
        },
        {
          question: "What problem does your product solve?",
          question_number: `${stepPrefix}2`,
          response_type: "text",
          questionnaire_id: questionnaireId
        }
      ];
    case 3: // Market
      return [
        {
          question: "What is your target market size?",
          question_number: `${stepPrefix}1`,
          response_type: "text",
          questionnaire_id: questionnaireId
        },
        {
          question: "What is your market growth rate?",
          question_number: `${stepPrefix}2`,
          response_type: "number",
          questionnaire_id: questionnaireId
        }
      ];
    case 4: // Business Model
      return [
        {
          question: "How do you make money?",
          question_number: `${stepPrefix}1`,
          response_type: "text",
          questionnaire_id: questionnaireId
        },
        {
          question: "What is your pricing strategy?",
          question_number: `${stepPrefix}2`,
          response_type: "text",
          questionnaire_id: questionnaireId
        }
      ];
    case 5: // Competition
      return [
        {
          question: "Who are your main competitors?",
          question_number: `${stepPrefix}1`,
          response_type: "text",
          questionnaire_id: questionnaireId
        },
        {
          question: "What is your competitive advantage?",
          question_number: `${stepPrefix}2`,
          response_type: "text",
          questionnaire_id: questionnaireId
        }
      ];
    case 6: // Financials
      return [
        {
          question: "What is your current revenue?",
          question_number: `${stepPrefix}1`,
          response_type: "number",
          questionnaire_id: questionnaireId
        },
        {
          question: "What are your projections for next year?",
          question_number: `${stepPrefix}2`,
          response_type: "number",
          questionnaire_id: questionnaireId
        }
      ];
    case 7: // Future
      return [
        {
          question: "What are your growth plans?",
          question_number: `${stepPrefix}1`,
          response_type: "text",
          questionnaire_id: questionnaireId
        },
        {
          question: "What funding do you seek?",
          question_number: `${stepPrefix}2`,
          response_type: "number",
          questionnaire_id: questionnaireId
        }
      ];
    default:
      return [];
  }
}
