import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-basic-help',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './basic-help.component.html',
  styleUrl: './basic-help.component.css'
})
export class BasicHelpComponent implements OnInit {

  constructor(private route: ActivatedRoute, private location: Location) {}

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.scrollToElement(fragment);
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const sections = document.querySelectorAll('.help-section');
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    let currentSectionId = '';

    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY - 50;
      if (scrollPosition >= sectionTop) {
        currentSectionId = section.id;
      }
    });

    this.highlightTOC(currentSectionId);
    this.toggleBackToTopButton(scrollPosition);
  }

  scrollToElement(fragment: string) {
    document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.highlightTOC(fragment);
  }

  highlightTOC(id: string) {
    const links = document.querySelectorAll('#toc .nav-link');
    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('fragment') === id) {
        link.classList.add('active');
      }
    });
  }

  toggleBackToTopButton(scrollPosition: number) {
    const backToTopButton: HTMLElement | null = document.getElementById('back-to-top');
    if (backToTopButton) {
      if (scrollPosition > 300) {
        backToTopButton.style.display = 'block';
      } else {
        backToTopButton.style.display = 'none';
      }
    }
  }

  backToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
