import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { LinkifyPipe } from '../../filters/linkify-pipe';

interface Message {
  user: string;
  displayName?: string;
  content: string;
  imageUrl: string;
  category: string;
  timestamp: Date;
  linkPreview?: { title: string; description: string; url: string; image: string };
}


@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, LinkifyPipe],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent implements OnInit {
  messages$!: Observable<Message[]>;
  userSubscription!: Subscription

  constructor(private router: Router, private messageService: MessageService, private authService: AuthService) {}

  ngOnInit() {
    this.authService.getUserId().subscribe(userId => {
      this.messages$ = this.messageService.getRealtimeData('POSTS');
    })

  }
}
