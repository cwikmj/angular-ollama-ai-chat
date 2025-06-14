import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Message } from './models/message.model';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  standalone: true
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  partialResponseSubscription!: Subscription;
  isStreamingSubscription!: Subscription;
  newMessage = '';
  messages: Message[] = [];
  loading = false;
  isStreaming = false;

  constructor(
    private chatService: ChatService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.isStreamingSubscription = this.chatService.isStreaming$.subscribe(state => {
      this.isStreaming = this.loading = state;
    });

    this.partialResponseSubscription = this.chatService.partialResponse$.subscribe((response) => {
      if (this.messages.length > 0 && this.messages[this.messages.length - 1].role === 'assistant') {
        this.scrollToBottom();
        this.messages[this.messages.length - 1].content = response;
      } else {
        this.loading = false;
        this.messages.push({ content: response, role: 'assistant' });
      }
    });

    this.messages.pop();
  }

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.messages.push({ content: this.newMessage, role: 'user' });
      this.chatService.sendMessage(this.newMessage.trim());
      this.newMessage = '';
    }
  }

  stopGeneration(): void {
    this.chatService.stopGeneration();
  }

  formatMessage(content: string): SafeHtml {
    if (!content) return '';
    const rawHtml = (text: string) => text.replace(/[&<>"']/g, (match) => {
      const htmlMap: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return htmlMap[match];
    });

    let mapped = rawHtml(content);
    mapped = mapped.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);
    mapped = mapped.replace(/`([^`\n]+)`/g, (_, code) => `<code>${code}</code>`);
    mapped = mapped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    mapped = mapped.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(mapped);
  }

  scrollToBottom(): void {
    const scrollContainer = this.scrollContainer.nativeElement;
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }

  ngOnDestroy(): void {
    this.partialResponseSubscription?.unsubscribe();
    this.isStreamingSubscription?.unsubscribe();
  }
}
