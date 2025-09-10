FROM python:3.10-slim

WORKDIR /app
COPY HealthInsurrectionCodex.py .
COPY mandala.html .
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8000
CMD ["uvicorn", "HealthInsurrectionCodex:app", "--host", "0.0.0.0", "--port", "8000"]
