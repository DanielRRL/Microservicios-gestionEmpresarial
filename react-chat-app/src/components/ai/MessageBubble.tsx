import { ChatMessage } from "../../services/AIAPI";

type MessageBubbleProps = {
  message: ChatMessage;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <div className="flex items-start gap-2">
          {!isUser && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              IA
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
            <span className={`text-xs mt-1 block ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
