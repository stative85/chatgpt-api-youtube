from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL_NAME: str = "gpt-4o"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
