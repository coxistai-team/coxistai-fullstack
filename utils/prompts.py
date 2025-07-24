"""Prompt handling utilities for the chatbot."""

def improve_question_prompt(text: str) -> str:
    """Enhance the text with better prompting for clean, well-formatted responses"""
    if not text or not isinstance(text, str):
        return "Please provide more information to help you better."
    
    text_lower = text.lower()
    
    base_format = """Please provide a clean, well-structured response following these guidelines:
- Use bold text for important terms and key points
- Organize information with bullet points or numbered lists when appropriate
- No extra spaces or line breaks between sections
- Direct answers without repeating the question
- No special symbols or unnecessary formatting
- Clear and concise explanations
- Professional and readable format

"""
    
    if any(word in text_lower for word in ['what is', 'define', 'definition']):
        return f"""{base_format}Provide a comprehensive definition for: {text}

Include:
1. Clear, concise definition
2. Key characteristics or properties
3. Examples if applicable
4. Context or background information"""
        
    elif any(word in text_lower for word in ['explain', 'how does', 'why does', 'how to']):
        return f"""{base_format}Explain in detail: {text}

Include:
1. Step-by-step explanation
2. Key concepts involved
3. Examples to illustrate the concept
4. Practical applications if relevant"""
        
    elif any(word in text_lower for word in ['compare', 'difference', 'vs', 'versus']):
        return f"""{base_format}Compare and contrast: {text}

Include:
1. Key similarities
2. Main differences
3. Advantages and disadvantages of each
4. When to use which option"""
        
    elif any(word in text_lower for word in ['solve', 'calculate', 'find', 'determine']):
        return f"""{base_format}Solve and explain: {text}

Include:
1. Step-by-step solution process
2. Clear mathematical steps if applicable
3. Explanation of methods used
4. Final answer clearly highlighted"""
        
    elif any(word in text_lower for word in ['analyze', 'analysis', 'examine']):
        return f"""{base_format}Analyze: {text}

Include:
1. Overview of the topic
2. Key points of analysis
3. Evidence or supporting details
4. Conclusions or implications"""
        
    elif any(word in text_lower for word in ['who is', 'who was', 'chief minister', 'president', 'minister']):
        return f"""{base_format}Provide information about: {text}

Include:
1. Name and current position
2. Party affiliation
3. Key background information
4. Recent achievements or notable facts
5. Timeline if relevant"""
        
    else:
        return f"""{base_format}Provide a detailed response about: {text}

Include relevant examples, context, and well-structured information.""" 