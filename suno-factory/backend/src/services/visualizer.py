from src.schemas.suno import VisualPrompt


def build_visual_prompts(subject: str, mood: str) -> VisualPrompt:
    midjourney = (
        f"/imagine prompt: {subject} + {mood} + cinematic lighting --ar 16:9 --v 6"
    )
    stable_diffusion = f"{subject}, {mood}, cinematic lighting, high detail"
    return VisualPrompt(midjourney=midjourney, stable_diffusion=stable_diffusion)
