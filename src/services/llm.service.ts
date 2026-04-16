import { GoogleGenerativeAI } from '@google/generative-ai';
import { isTaskArray } from '../utils/typeguards/isTask';
import { Task } from '../task/task.entity';
import { log } from 'console';

type GeminiResponse = {
  tasks: Task[];
};

const MODEL_NAME = 'gemini-3-flash-preview';

export class LLMService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateOnboardingTasks(prompt: string): Promise<Task[]> {
    const model = this.genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const tasksList: GeminiResponse = JSON.parse(text);

    if (!isTaskArray(tasksList)) {
      throw new Error(
        'Unexpected response structure from Gemini: wrong task array'
      );
    }

    return tasksList;
  }
}
