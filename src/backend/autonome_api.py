import requests
import json
import os

# Set up Autonome API credentials
BASE_URL = "https://autonome.alt.technology"
AUTH_HEADER = {
    "Authorization": "Basic bWlhbWNoZWY6bVhWUVhhUmRFdA==",
    "Content-Type": "application/json"
}

def get_agent():
    """Fetch agent ID and name"""
    response = requests.get(f"{BASE_URL}/miamchef-mnwgcb/agents", headers=AUTH_HEADER)
    if response.status_code == 200:
        data = response.json()
        return data.get("id"), data.get("name")
    else:
        return None, None

def send_message(agent_id, user_input):
    """Send a message to the AI agent and return the response"""
    url = f"{BASE_URL}/miamchef-mnwgcb/{agent_id}/message"
    payload = json.dumps({"text": user_input})
    
    response = requests.post(url, headers=AUTH_HEADER, data=payload)
    if response.status_code == 200:
        return response.json().get("text")
    return None