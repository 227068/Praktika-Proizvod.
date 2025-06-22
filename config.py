
from logging.config import listen
from pydantic import BaseSettings

server { # type: ignore
    listen 443 ssl; # type: ignore
    server_name api.lab-fa.ru; # type: ignore

    ssl_certificate /path/to/cert.pem; # type: ignore
    ssl_certificate_key /path/to/key.pem; # type: ignore

    location / { # type: ignore
        proxy_pass http://backend:8000; # type: ignore
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}


class Settings(BaseSettings):
    database_hostname: str
    database_port: str
    database_password: str
    database_name: str
    database_username: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    class Config:
        env_file = ".env"

settings = Settings()