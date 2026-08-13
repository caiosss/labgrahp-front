from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    jwt_access_secret: str
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:1.5b-instruct"
    ollama_timeout_seconds: float = 120
    ollama_keep_alive: str = "10m"
    max_concurrent_analyses: int = 1

    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
