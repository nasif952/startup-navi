
import { Input } from '@/components/ui/input';

interface QuestionItemProps {
  questionId: string;
  number: string;
  question: string;
  responseType: string;
  currentResponse: string;
  onResponseChange: (questionId: string, value: string | number | boolean) => void;
}

export function QuestionItem({ questionId, number, question, responseType, currentResponse, onResponseChange }: QuestionItemProps) {
  const renderInput = () => {
    switch (responseType) {
      case 'number':
        return (
          <Input 
            type="number" 
            value={currentResponse || ''} 
            onChange={(e) => onResponseChange(questionId, e.target.value)} 
            className="w-full border border-border rounded-md p-2"
          />
        );
      case 'boolean':
        return (
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                name={`q-${questionId}`} 
                className="h-4 w-4 text-primary border-border" 
                checked={currentResponse === 'true'} 
                onChange={() => onResponseChange(questionId, true)} 
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name={`q-${questionId}`} 
                className="h-4 w-4 text-primary border-border" 
                checked={currentResponse === 'false'} 
                onChange={() => onResponseChange(questionId, false)} 
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        );
      default:
        return (
          <Input 
            type="text" 
            value={currentResponse || ''} 
            onChange={(e) => onResponseChange(questionId, e.target.value)} 
            className="w-full border border-border rounded-md p-2" 
          />
        );
    }
  };

  return (
    <div className="flex gap-6">
      <div className="w-14 h-14 flex-shrink-0 rounded-full bg-secondary text-primary flex items-center justify-center font-medium">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-medium mb-2">{question}</h3>
        {renderInput()}
      </div>
    </div>
  );
}
