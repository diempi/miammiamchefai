import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";

// Verify token function
async function verifyToken() {
  const url = "/api/verify";
  const accessToken = await getAccessToken();
  const result = await fetch(url, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
    },
  });

  return await result.json();
}

// Dashboard Page
export default function DashboardPage() {
  const [verifyResult, setVerifyResult] = useState();
  const router = useRouter();
  const {
    ready,
    authenticated,
    user,
    logout,
    linkEmail,
    linkWallet,
    unlinkEmail,
    unlinkWallet,
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

  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const email = user?.email;
  const wallet = user?.wallet;

  const googleSubject = user?.google?.subject || null;
  const twitterSubject = user?.twitter?.subject || null;
  const discordSubject = user?.discord?.subject || null;

  return (
    <>
      <Head>
        <title>Miam Miam Chef AI - Your personal AI Chef</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-orange">
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">
                Miam Miam Chef AI - Your personal AI Chef
              </h1>
              <button
                onClick={logout}
                className="text-sm bg-orange-400 hover:bg-orange-500 py-2 px-4 rounded-md text-white"
              >
                Logout
              </button>
            </div>

            {/* Chatbox Section Below Social Links */}
            <div className="mt-8">
              <Chat />
            </div>

            <details className="mt-8">
              <summary className="text-lg font-semibold cursor-pointer">
                Account Management
              </summary>
              <div className="mt-4 flex gap-4 flex-wrap">
                {googleSubject ? (
                  <button
                    onClick={() => unlinkGoogle(googleSubject)}
                    className="text-sm border border-orange-400 hover:border-orange-500 py-2 px-4 rounded-md text-orange-400 hover:text-orange-500"
                    disabled={!canRemoveAccount}
                  >
                    Unlink Google
                  </button>
                ) : (
                  <button
                    onClick={linkGoogle}
                    className="text-sm bg-orange-400 hover:bg-orange-500 py-2 px-4 rounded-md text-white"
                  >
                    Link Google
                  </button>
                )}

                {twitterSubject ? (
                  <button
                    onClick={() => unlinkTwitter(twitterSubject)}
                    className="text-sm border border-orange-400 hover:border-orange-500 py-2 px-4 rounded-md text-orange-400 hover:text-orange-500"
                    disabled={!canRemoveAccount}
                  >
                    Unlink X/Twitter
                  </button>
                ) : (
                  <button
                    className="text-sm bg-orange-400 hover:bg-orange-500 py-2 px-4 rounded-md text-white"
                    onClick={linkTwitter}
                  >
                    Link X/Twitter
                  </button>
                )}

                {discordSubject ? (
                  <button
                    onClick={() => unlinkDiscord(discordSubject)}
                    className="text-sm border border-orange-400 hover:border-orange-500 py-2 px-4 rounded-md text-orange-400 hover:text-orange-500"
                    disabled={!canRemoveAccount}
                  >
                    Unlink Discord
                  </button>
                ) : (
                  <button
                    className="text-sm bg-orange-400 hover:bg-orange-500 py-2 px-4 rounded-md text-white"
                    onClick={linkDiscord}
                  >
                    Link Discord
                  </button>
                )}
              </div>
            </details>
          </>
        ) : null}
      </main>
    </>
  );
}

// Chat Component
function Chat() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const agentId = "3fe8a9f4-55eb-01ff-91aa-85e32429fc67"; // Hardcoded Agent ID

  useEffect(() => {
    wakeUpAgent();
  }, []);

  const wakeUpAgent = async () => {
    try {
      await fetch("https://autonome.alt.technology/miamchef-mnwgcb/agents", {
        method: "GET",
        headers: { Authorization: "Basic bWlhbWNoZWY6bVhWUVhhUmRFdA==" },
      });
    } catch (error) {
      console.error("Error waking up agent:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://autonome.alt.technology/miamchef-mnwgcb/${agentId}/message`,
        {
          method: "POST",
          headers: {
            "Authorization": "Basic bWlhbWNoZWY6bVhWUVhhUmRFdA==",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: input }),
        }
      );

      const data = await response.json();
      const aiText = data?.[0]?.text || "No response received.";
      setMessages((prev) => [...prev, { role: "agent", text: aiText }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { role: "agent", text: "Error processing request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-white rounded-lg shadow-lg p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === "user" ? "bg-orange-100 ml-auto max-w-[80%]" : "bg-gray-100 mr-auto max-w-[80%]"
            }`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && <div className="bg-gray-100 p-4 rounded-lg mr-auto">Thinking...</div>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
          className="flex-1 p-2 border border-gray-300 rounded-lg"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}