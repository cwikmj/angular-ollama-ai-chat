import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private requestSubscription?: Subscription;
    private partialResponseSubject = new BehaviorSubject<string>('');
    private isStreamingSubject = new BehaviorSubject<boolean>(false);
    partialResponse$ = this.partialResponseSubject.asObservable();
    isStreaming$ = this.isStreamingSubject.asObservable();
    messages: Message[] = [{ role: 'system', content: 'Youre a helpful knowledge assistant' }]

    constructor(private http: HttpClient) { }

    sendMessage(message: string): void {
        let msg = '';
        this.messages.push({ role: 'user', content: message })
        const requestData = {
            messages: this.messages,
            model: 'gemma3:12b',
            temperature: 0.7,
            max_tokens: -1,
            stream: true,
        };

        const req = new HttpRequest(
            'POST',
            'http://localhost:11434/api/chat',
            requestData,
            {
                responseType: 'text',
                reportProgress: true,
            }
        );
        this.isStreamingSubject.next(true);

        this.requestSubscription = this.http.request(req).subscribe({
            next: (event: any) => {
                if (event.type === 3) {
                    const jsonResponse = this.processOllama(event.partialText);
                    this.partialResponseSubject.next(jsonResponse);
                    msg = jsonResponse
                }
                if (event.type === 4) {
                    this.messages.push({ role: 'assistant', content: msg });
                    this.isStreamingSubject.next(false);
                }
            }, error: error => {
                this.partialResponseSubject.next(`error . . .${error}`);
                this.isStreamingSubject.next(false);
            }
        });
    }

    stopGeneration(): void {
        if (this.requestSubscription) {
            this.requestSubscription.unsubscribe();
            this.isStreamingSubject.next(false);
            this.messages.pop()
            this.messages.pop()
        }
    }

    processOllama(piece: string) {
        const substrings = piece.split('\n');
        const jsonObjects = substrings.map((substr) => {
            if (substr !== '') {
                const chunk = JSON.parse(substr);
                return chunk.message.content;
            }
        });

        return jsonObjects.join('');
    }
}
