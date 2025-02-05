from flask import Flask, request, jsonify
from autonome_api import get_agent, send_message

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("text")

    agent_id, agent_name = get_agent()
    if not agent_id:
        return jsonify({"error": "Failed to retrieve agent"}), 500

    agent_response = send_message(agent_id, user_message)
    if not agent_response:
        return jsonify({"error": "Failed to get AI response"}), 500

    return jsonify({"agent_name": agent_name, "response": agent_response})

if __name__ == '__main__':
    app.run(debug=True)