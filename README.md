# Ollama AI Chat with Angular

The Ollama AI Chat project is a web-based chat application built with Angular that enables users to interact with an AI assistant in real-time. The AI assistant streams responses dynamically as the user sends messages, providing an interactive and engaging conversational experience. The app is designed to demonstrate integration with an AI chat backend service, supporting streaming partial responses and user control to stop response generation.

It's ideal for embedding a helpful AI assistant into a larger system or as a standalone knowledge assistant.

## Features

- **Real-time AI chat interaction** - Users can send messages to the AI assistant and receive streamed responses.
- **Streaming response handling** - The app displays partial responses from the AI as they arrive, updating the chat window dynamically.
- **Stop generation control** - Users can interrupt the AI's response generation with a STOP button.
- **Message formatting** - Supports markdown-like syntax for code blocks, inline code, and bold text, rendering them safely as HTML.
- **Auto-scroll** - The chat view scrolls automatically to show the latest messages.
- **Loading indicator** - Shows a spinner animation while the AI is generating a response.
- **Initial prompt** - On app load, it automatically sends a sample prompt ("tell me a joke about coders") to demonstrate functionality and check LLM connection.


## Code Structure & Logic

##### AppComponent

- Manages the chat UI and user interactions.
- Uses Angular lifecycle hooks ```OnInit``` and ```OnDestroy``` to subscribe/unsubscribe from streaming data.
- Maintains a list of chat messages with roles (```user``` or ```assistant```).
- Handles sending messages and stopping AI response generation.
- Formats messages safely for display, converting markdown-like syntax to HTML.
- Uses ```ViewChild``` to reference the chat container for scrolling.

##### ChatService

- Handles communication with the AI backend via HTTP POST requests.
- Sends chat messages including conversation history to the AI API endpoint.
- Manages streaming responses using Angular's HttpClient with ```reportProgress``` to receive partial data.
- Emits partial responses and streaming state via RxJS ```BehaviorSubject``` for real-time UI updates.
- Provides a method to stop ongoing requests and clean up messages.

##### Message Flow

1. User inputs a message and clicks SEND or presses Enter.
2. The message is added to the chat history and sent to the backend via ChatService.
3. The backend streams partial responses, which are processed and emitted by the service.
4. The component subscribes to these partial responses, updating the latest assistant message in the UI.
5. When streaming completes or is stopped, UI updates accordingly.

## How to run locally

##### Prerequisites

- Node.js (v16+ recommended)
- Angular CLI (```npm install -g @angular/cli```)
- Backend Ollama server running on ```localhost:11434```
- ```npm install``` dependencies

##### Steps to Run
```
# 1. Clone the repo
git clone <your-repo-url>
cd <project-directory>

# 2. Install dependencies
npm install

# 3. Start Angular dev server
ng serve

# 4. Visit the app
http://localhost:4200

# 5. Make sure Ollama API is running:
# Example (in separate terminal):
ollama run gemma3:12b --api-port=11434
```

## Security Considerations

- Response content is sanitized using Angular's DomSanitizer before rendering to mitigate XSS risks.
- Only text-based streaming is used; no file or binary transfers.

##  Potential Enhancements

- Add user authentication for persistent history.
- Allow model switching via UI.
- Enhance UI with message timestamps or avatars.
- Support rich input (e.g., voice input, file attachments).
