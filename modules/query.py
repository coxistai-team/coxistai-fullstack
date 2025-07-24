import os
from typing import Optional
from openai import OpenAI
from datetime import datetime
import httpx
from functools import lru_cache

class SmartDeepSeek:
    _instance = None
    _is_initialized = False

    def __new__(cls, api_key: Optional[str] = None):
        if cls._instance is None:
            cls._instance = super(SmartDeepSeek, cls).__new__(cls)
        return cls._instance

    def __init__(self, api_key: Optional[str] = None):
        # Skip initialization if already done
        if self._is_initialized:
            return

        if api_key is None:
            api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable is not set. Please add it to your .env file.")
        
        # Configure OpenAI client with timeout and limits
        self.client = OpenAI(
            api_key=api_key,
            http_client=httpx.Client(
                timeout=20.0,  # 20 seconds timeout
                limits=httpx.Limits(
                    max_keepalive_connections=5,
                    max_connections=10,
                    keepalive_expiry=5
                )
            )
        )

        # Model tiers with timeouts
        self.models = {
            'free': {
                'name': "gpt-3.5-turbo",
                'timeout': 15
            },
            'paid': {
                'name': "gpt-4o",
                'timeout': 20
            },
            'reason': {
                'name': "gpt-4-turbo",
                'timeout': 20
            }
        }

        self.complexity_threshold = 15
        self.dissatisfaction_triggers = [
            "not satisfied", "explain better",
            "more detail", "incomplete answer"
        ]

        # Mark as initialized
        self._is_initialized = True
        print("SmartDeepSeek instance initialized")

    @lru_cache(maxsize=100)
    def get_cached_response(self, question: str, model_name: str) -> Optional[str]:
        """Cache responses for identical questions using the same model"""
        try:
            response = self.client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "user", "content": question}
                ],
                temperature=0.5,
                max_tokens=500,
                timeout=self.models.get(model_name, self.models['free']['name'])['timeout']
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"API Error for model '{model_name}': {e}")
            return None

    def query_model(self, model: str, question: str) -> Optional[str]:
        """Queries the specified model with improved error handling and timeouts."""
        prompts = {
            self.models['free']['name']: f"Provide a helpful response to: {question}",
            self.models['paid']['name']: f"As an expert, analyze this in depth:\n{question}\nInclude examples and practical applications.",
            self.models['reason']['name']: f"Perform rigorous step-by-step analysis:\n1. Problem: {question}\n2. Key components\n3. Logical relationships\n4. Final synthesized answer"
        }

        prompt_content = prompts.get(model, question)
        
        try:
            # Try to get cached response first
            return self.get_cached_response(prompt_content, model)
        except Exception as e:
            print(f"Cache miss or error for model '{model}': {e}")
            return None

    def needs_paid_model(self, question: str, previous_response: str = "") -> bool:
        """Determines if a question requires a more advanced model."""
        question_lower = question.lower()

        # Trigger if the user is dissatisfied with a previous response
        if any(trigger in previous_response.lower() for trigger in self.dissatisfaction_triggers):
            return True

        # Trigger for long, complex questions
        if len(question.split()) > self.complexity_threshold:
            return True

        # Trigger for questions that ask for detailed analysis
        technical_terms = [
            "explain in detail", "step-by-step",
            "prove that", "compare and contrast"
        ]
        if any(term in question_lower for term in technical_terms):
            return True

        return False

    def get_response(self, question: str, previous_response: str = "") -> str:
        """Get response with improved error handling."""
        try:
            model_key = 'free'
            if self.needs_paid_model(question, previous_response):
                print("--> Complex query detected. Using paid model.")
                model_key = 'paid'
            else:
                print("--> Simple query detected. Using free model.")

            response = self.query_model(self.models[model_key]['name'], question)

            if not response and model_key == 'paid':
                print("--> Fallback: Trying the reason_model...")
                response = self.query_model(self.models['reason']['name'], question)

            return response or "I couldn't generate a response for this question."
        except Exception as e:
            print(f"Error in get_response: {e}")
            return "I encountered an error while processing your request. Please try again."

# Create a global instance that will be reused
assistant = SmartDeepSeek()
print("Global SmartDeepSeek instance created")


# --- Example Usage ---
if __name__ == "__main__":
    # Best practice: Load the API key from an environment variable
    API_KEY = os.getenv("OPENROUTER_API_KEY")

    if not API_KEY:
        print("Error: Please set your OPENROUTER_API_KEY in the environment variables.")
    else:
        # The global assistant instance is now directly accessible
        # assistant = SmartDeepSeek(api_key=API_KEY) # This line is no longer needed

        # --- Test Case 1: Simple Question ---
        print("\n--- Query 1: Simple Question ---")
        q1 = "Who is the current Chief Minister of Telangana?"
        response1 = assistant.get_response(q1)
        print(f"Q: {q1}\nA: {response1}")

        # --- Test Case 2: Complex Question triggering the paid model ---
        print("\n--- Query 2: Complex Question ---")
        q2 = "Explain in detail the key differences between nuclear fission and fusion."
        response2 = assistant.get_response(q2)
        print(f"Q: {q2}\nA: {response2}")

        # --- Test Case 3: Dissatisfaction triggering the paid model ---
        print("\n--- Query 3: Follow-up with Dissatisfaction ---")
        previous_simple_response = "Photosynthesis is how plants make food."
        q3 = "That's an incomplete answer, I need more detail about the two main stages."
        response3 = assistant.get_response(q3, previous_response=previous_simple_response)
        print(f"Q: {q3}\nA: {response3}")