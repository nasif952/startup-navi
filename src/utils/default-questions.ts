
export function getDefaultQuestions(step: number, questionnaireId: string) {
  const questions: any[] = [];
  
  switch (step) {
    case 1: // Team
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '1.1',
          question: 'How many years of experience do the founders have in this industry?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '1.2',
          question: 'Has any member of your team previously founded a successful company?',
          response_type: 'boolean'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '1.3',
          question: 'How many full-time employees do you currently have?',
          response_type: 'number'
        }
      );
      break;
    case 2: // Product
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '2.1',
          question: 'What stage is your product currently in?',
          response_type: 'text'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '2.2',
          question: 'Do you have any patents or proprietary technology?',
          response_type: 'boolean'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '2.3',
          question: 'What is your product development timeline for the next 12 months?',
          response_type: 'text'
        }
      );
      break;
    case 3: // Market
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '3.1',
          question: 'What is your total addressable market size in dollars?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '3.2',
          question: 'What is the annual growth rate of your target market?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '3.3',
          question: 'Have you validated market demand through customer research?',
          response_type: 'boolean'
        }
      );
      break;
    case 4: // Business Model
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '4.1',
          question: 'What is your primary revenue model?',
          response_type: 'text'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '4.2',
          question: 'What is your average customer acquisition cost (CAC)?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '4.3',
          question: 'What is your estimated customer lifetime value (LTV)?',
          response_type: 'number'
        }
      );
      break;
    case 5: // Competition
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '5.1',
          question: 'Who are your top 3 competitors?',
          response_type: 'text'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '5.2',
          question: 'What is your unique competitive advantage?',
          response_type: 'text'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '5.3',
          question: 'Are there significant barriers to entry in your market?',
          response_type: 'boolean'
        }
      );
      break;
    case 6: // Financials
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '6.1',
          question: 'What is your current monthly revenue?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '6.2',
          question: 'What is your projected annual revenue for the next fiscal year?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '6.3',
          question: 'What is your current burn rate per month?',
          response_type: 'number'
        }
      );
      break;
    case 7: // Future
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '7.1',
          question: 'How much funding are you seeking in this round?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '7.2',
          question: 'What milestone will this funding help you achieve?',
          response_type: 'text'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '7.3',
          question: 'When do you expect to reach profitability?',
          response_type: 'text'
        }
      );
      break;
  }
  
  return questions;
}
