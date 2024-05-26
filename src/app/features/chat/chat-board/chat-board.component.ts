import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LinkPreviewService } from '../../../services/link-preview.service';
import { DataService } from '../../../services/data.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { MessageService } from '../../../services/message.service';
import { NotificationService } from '../../../services/notification.service';
import { Observable } from 'rxjs';
import { LoggerService } from '../../../services/logger.service';
import { LinkifyPipe } from '../../../shared/filters/linkify-pipe';
import { formatDistanceToNow, format } from 'date-fns';

interface Post {
  user: string;
  displayName?: string;
  content: string;
  imageUrl: string;
  category: string;
  timestamp: Date;
  linkPreview?: { title: string; description: string; url: string; image: string };
}

@Component({
  selector: 'app-chat-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LinkifyPipe],
  templateUrl: './chat-board.component.html',
  styleUrl: './chat-board.component.css'
})
export class ChatBoardComponent implements OnInit {

  posts$!: Observable<Post[]>;
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  newMessage: string = '';
  selectedCategory: string = 'all';
  pageSize: number = 25;


  displayName!: string;
  userImage!: string;
  userId!: string;
  userSubscription!: Subscription;
  public diagDisplay = "none";
  public toggleDisplay = false;
  production = environment.production;


  constructor(private logger: LoggerService, private router: Router, private authService: AuthService, private messageService: MessageService, private linkPreviewService: LinkPreviewService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.getUserId().subscribe(async userId => {
      this.userId = userId;
      await this.loadMessages();
      this.filterByCategory(this.selectedCategory);
      })


  }

  async loadMessages() {
    this.authService.getUser().subscribe(user => {
      this.logger.info("user", user);
      this.displayName = (user && user.displayName) ? user.displayName : this.userId;
      this.userImage = (user && user.photoURL) ? user.photoURL : '/assets/images/user-placeholder.jpg'
    })

    this.posts$ = this.messageService.getRealtimeData('POSTS');
    this.posts$.subscribe(posts => {
      this.posts = posts;
      this.filterByCategory(this.selectedCategory);
    });
  }

  async loadMore() {
    const morePosts = await this.messageService.fetchMoreData('POSTS', this.pageSize);
    this.posts = [...this.posts, ...morePosts];
    this.filterByCategory(this.selectedCategory);
  }

  resetPagination() {
    this.messageService.resetPagination();
    this.loadMessages();
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredPosts = this.posts;
    } else {
      this.filteredPosts = this.posts.filter(post => post.category === category);
    }
  }


  async postMessage() {
    if (this.newMessage.trim()) {
      let linkPreview;
    const urlPattern = /(https?:\/\/[^\s]+)/g; // Regular expression to match URLs
    const urls = this.newMessage.match(urlPattern);

    if (urls && urls.length > 0) {
      try {
        linkPreview = await this.linkPreviewService.fetchLinkPreview(urls[0]).toPromise();
      } catch (error) {
        console.error("Error fetching link preview: ", error);
      }
    }
  
      const newPost: any = {
        user: this.userId,
        displayName: this.displayName,
        content: this.newMessage,
        imageUrl: this.userImage,
        category: this.selectedCategory,
        timestamp: new Date(),
      };
  
      // Add linkPreview if it is defined
      if (linkPreview) {
        newPost.linkPreview = {
          title: linkPreview.title,
          description: linkPreview.description,
          url: linkPreview.url,
          image: linkPreview.image
        };
      }
  
      try {
        await this.messageService.addMessage('POSTS', newPost);
        this.newMessage = '';
  
        if (this.router.url !== '/chat-board') {
          this.notificationService.notifyNewMessage();
        }
      } catch (error) {
        console.error("Error adding message: ", error);
      }
    }
  }
  

  public toggleDiagnostic(): void {
    this.diagDisplay = (this.diagDisplay == "none") ? "" : "none";
    this.toggleDisplay = (this.toggleDisplay) ? false : true;
  }

  getRelativeTime(timestamp: Date): string {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  }

  getExactTime(timestamp: Date): string {
    return format(new Date(timestamp), 'PPpp');
  }


}
