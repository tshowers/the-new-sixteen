import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Blog } from '../../data/interfaces/blog.model';
import { Project } from '../../data/interfaces/project.model';
import { Store } from '../../data/interfaces/store.model';
import { Contact } from '../../data/interfaces/contact.model';
import { Catalog } from '../../data/interfaces/catalog.model';
import { DetailedUser } from '../../data/classes/detailed-user.model';

export interface Crumb {
  name: string;
  link: string;
  active: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  @Input() crumb1?: Crumb;
  @Input() crumb2?: Crumb;
  @Input() crumb3?: Crumb;
  @Input() crumb4?: Crumb;
  @Input() blog?: Blog;
  @Input() project?: Project;
  @Input() store?: Store;
  @Input() contact?: Contact;
  @Input() catalog?: Catalog;
  @Input() edit: boolean = false;
  crumbs: Crumb[] = [];
  @Output() onHelp = new EventEmitter();
  private subscription: Subscription = new Subscription();
  user: DetailedUser;  // Changed type from User to DetailedUser

  constructor() {
    this.user = DetailedUser.createDefault();
    this.crumbs.push({
      name: "home",
      link: "/app",
      active: false
    });
  }

  ngOnInit() {
    // Subscribe to user changes
    // this.subscription.add(this.userService.user$.subscribe(user => {
    //   this.user = user || DetailedUser.createDefault(); // Use the user from the stream or a default user if null
    // }));

    if (this.crumb1)
      this.crumbs.push(this.crumb1);
    if (this.crumb2)
      this.crumbs.push(this.crumb2);
    if (this.crumb3)
      this.crumbs.push(this.crumb3);
    if (this.crumb4)
      this.crumbs.push(this.crumb4);
  }

  toggleHelp(): void {
    // this.user.helpNeeded = !this.user.helpNeeded; // Toggle helpNeeded property
    // this.userService.updateUser(this.user).subscribe({
    //   error: err => console.error('Error updating user:', err)  // Improved error handling
    // });
  }

  onRouteTo(link: string): void {
    // this.router.navigate([link]);
  }

  public help(): void {
    this.onHelp.emit();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Prevent memory leaks
  }
}
