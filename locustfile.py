from locust import HttpUser, task, between

class TravstoryUser(HttpUser):
    wait_time = between(1, 5)

    @task(1)
    def hammer_ai_endpoint(self):
        # Fire a heavy payload directly at the Groq/Mistral API route
        payload = {
            "content": "Plan a detailed 5-day luxury trip to Tokyo, Japan. Include hotels, restaurants, and daily activities.",
            "destination": "Tokyo, Japan",
            "history": []
        }
        self.client.post("/api/messages", json=payload)
