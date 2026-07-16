from locust import HttpUser, task, between

class TravstoryUser(HttpUser):
    # Simulate users taking 1 to 5 seconds between actions
    wait_time = between(1, 5)

    @task(1)
    def hit_backend_health(self):
        # Directly pings the backend health check
        self.client.get("/")
