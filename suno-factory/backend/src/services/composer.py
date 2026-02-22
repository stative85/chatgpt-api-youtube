import uuid
from typing import Optional

from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from src.config import settings
from src.schemas.suno import SongPackage


class ComposerService:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(
            model=settings.OPENAI_MODEL_NAME,
            api_key=settings.OPENAI_API_KEY,
            temperature=0.7,
        )
        self.parser = PydanticOutputParser(pydantic_object=SongPackage)

    async def transform_text_to_song(
        self, raw_text: str, user_instructions: Optional[str] = None
    ) -> SongPackage:
        safe_text = raw_text[:20000]

        system_prompt = """
You are a master Music Producer and AI Prompt Engineer specializing in Suno AI.
Your goal is to transform raw text (stories, poems, notes) into a production-ready song package.

### CRITICAL INSTRUCTIONS
1. **Structural Integrity**: You MUST divide the text into sections: [Verse], [Chorus], [Bridge], [Outro].
   - The [Chorus] should contain the core message and be catchy.
   - Ensure the flow makes musical sense.

2. **Suno Tagging**:
   - Use tags from this list: [Intro], [Verse], [Chorus], [Bridge], [Outro], [Instrumental], [Hook].
   - Add performance tags inside the lyrics like [Female Vocals], [Choir], [Whisper].
   - Adhere to the research: Suno handles tags best when they are on their own lines.

3. **Style Generation**:
   - Generate a specific style string (e.g., "Dark Synthwave, 80s, Female Vocals, Slow Tempo").
   - Do not use generic terms like "Good music".

4. **Visual Prompts**:
   - Create a Midjourney prompt using the syntax: "/imagine prompt: <Subject> + <Style> + <Context> --ar 16:9 --v 6"
   - Extract visual imagery from the lyrics for this prompt.

5. **Constraints**:
   - Total formatted lyrics must be under 3000 characters.
   - Title must be under 100 characters.

### INPUT DATA
Raw Text: {raw_text}
User Override Instructions: {user_instructions}

### OUTPUT FORMAT
{format_instructions}
"""

        prompt = ChatPromptTemplate.from_template(system_prompt)
        chain = prompt | self.llm | self.parser

        result = await chain.ainvoke(
            {
                "raw_text": safe_text,
                "user_instructions": user_instructions
                or "Optimize for emotional impact and clarity.",
                "format_instructions": self.parser.get_format_instructions(),
            }
        )
        result.id = str(uuid.uuid4())
        return result
