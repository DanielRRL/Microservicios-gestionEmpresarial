import ChatInterface from "../../components/ai/ChatInterface";

export default function AIView() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="h-full max-w-5xl mx-auto">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
