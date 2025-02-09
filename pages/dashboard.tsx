import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import axios from "axios";

// Constants
const AUTH_HEADER = "Basic bWlhbWNoZWY6bVhWUVhhUmRFdA=="; 
const AGENT_URL = "https://autonome.alt.technology/miamchef-mnwgcb";
const AGENT_ID = "3fe8a9f4-55eb-01ff-91aa-85e32429fc67"; // Hardcoded Agent ID

// Dashboard Page
export default function DashboardPage() {
  const router = useRouter();
  const {
    ready,
    authenticated,
    user,
    logout,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkDiscord,
    unlinkDiscord,
  } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  return (
    <>
      <Head>
        <title>Miam Miam Chef AI - Your personal AI Chef</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-orange">
        {ready && authenticated && (
          <>
            <div className="flex flex-row justify-between mb-4">
              <h1 className="text-2xl font-semibold">
                Miam Miam Chef AI - Your personal AI Chef
              </h1>
              <button
                onClick={logout}
                className="text-sm bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded-md text-white"
              >
                Logout
              </button>
            </div>

            {/* Account Management Above Chat */}
            <details className="mb-6">
              <summary className="text-lg font-semibold cursor-pointer">
                Account Management
              </summary>
              <div className="mt-4 flex gap-4 flex-wrap">
                {user?.google?.subject ? (
                  <button
                  onClick={() => unlinkGoogle(user.google?.subject || "")}
                    className="text-sm border border-orange-500 hover:border-orange-600 py-2 px-4 rounded-md text-orange-500 hover:text-orange-600"
                  >
                    Unlink Google
                  </button>
                ) : (
                  <button
                    onClick={linkGoogle}
                    className="text-sm bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded-md text-white"
                  >
                    Link Google
                  </button>
                )}

                {user?.twitter?.subject ? (
                  <button
                  onClick={() => unlinkTwitter(user.twitter?.subject || "")}
                    className="text-sm border border-orange-500 hover:border-orange-600 py-2 px-4 rounded-md text-orange-500 hover:text-orange-600"
                  >
                    Unlink X/Twitter
                  </button>
                ) : (
                  <button
                    className="text-sm bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded-md text-white"
                    onClick={linkTwitter}
                  >
                    Link X/Twitter
                  </button>
                )}

                {user?.discord?.subject ? (
                  <button
                  onClick={() => unlinkDiscord(user.discord?.subject || "")}
                    className="text-sm border border-orange-500 hover:border-orange-600 py-2 px-4 rounded-md text-orange-500 hover:text-orange-600"
                  >
                    Unlink Discord
                  </button>
                ) : (
                  <button
                    className="text-sm bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded-md text-white"
                    onClick={linkDiscord}
                  >
                    Link Discord
                  </button>
                )}
              </div>
            </details>

            {/* Chatbox Fills Almost Whole Page */}
            <div className="flex-grow">
              <Chat />
            </div>
          </>
        )}
      </main>
    </>
  );
}

// Chat Component
function Chat() {
  const [messages, setMessages] = useState<{ role: string; text: string; timestamp: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Send user message to AI
  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
  
    const timestamp = new Date().toLocaleString();
    const userMessage = { role: "user", text: input, timestamp };
    
    // Display user message
    setMessages((prev) => [...prev, userMessage]);

    // Show "Thinking..." message while AI responds
    setMessages((prev) => [...prev, { role: "agent", text: "Thinking...", timestamp }]);

    setInput("");

    try {
      const response = await axios.post(
        `${AGENT_URL}/${AGENT_ID}/message`,
        { text: input },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_HEADER,
          },
        }
      );

      console.log("Full AI Response:", response.data);

      // Extract AI response
      const aiText = response.data?.[0]?.text || "No response received.";

      const botMessage = { role: "agent", text: aiText, timestamp: new Date().toLocaleString() };

      // Remove "Thinking..." and replace with AI response
      setMessages((prev) => [...prev.slice(0, -1), botMessage]);
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setMessages((prev) => [...prev.slice(0, -1), { role: "agent", text: "Error processing request.", timestamp: new Date().toLocaleString() }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col flex-grow h-[85vh] w-full bg-white rounded-lg shadow-lg p-4">
      {/* Chat Box - Takes Up Most of the Space */}
      <div className="flex-grow overflow-y-auto border-b pb-2">
        {messages.length === 0 ? (
          <p className="text-gray-500">Start a conversation with Miam Miam Chef AI.</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`p-2 my-1 rounded-md ${msg.role === "user" ? "bg-orange-100 text-right" : "bg-orange-200 text-left"}`}>
              <strong>{msg.role === "user" ? "You" : "Miam Miam Chef AI"}:</strong> {msg.text}
              <div className="text-xs text-gray-500">{msg.timestamp}</div>
            </div>
          ))
        )}
      </div>

      {/* Input & Send Button */}
      <div className="flex mt-3">
        <input
          type="text"
          className="flex-1 border p-2 rounded-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
          placeholder="Type your message..."
        />
        <button
          className="ml-2 px-4 py-2 bg-orange-500 text-white rounded-md"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}