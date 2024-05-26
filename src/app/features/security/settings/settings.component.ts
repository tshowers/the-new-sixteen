import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  // Authentication and Security
authenticationSecurityFeatures = [
  {
    icon: 'fa-solid fa-unlock-keyhole',
    enabled: true,
    shortDescription: 'Passwordless Sign-In',
    extendedText: 'Allows users to access the platform without the need for traditional passwords, enhancing security and user convenience.'
  },
  {
    icon: 'fa-solid fa-envelope',
    enabled: false,
    shortDescription: 'Gmail Sign-In',
    extendedText: 'Users can sign in using their Gmail addresses, streamlining the login process.'
  },
  {
    icon: 'fa-solid fa-right-from-bracket',
    enabled: true,
    shortDescription: 'Sign-Out Process',
    extendedText: 'Secure and straightforward mechanism for users to sign out of the platform.'
  }
];

// Communication and Collaboration
communicationCollaborationFeatures = [
  {
    icon: 'fa-solid fa-calendar',
    enabled: false,
    shortDescription: 'Calendar',
    extendedText: 'Manage your calendar settings.'
  },
  {
    icon: 'fa-solid fa-envelope',
    enabled: false,
    shortDescription: 'Email',
    extendedText: 'Configure your email settings.'
  },
  {
    icon: 'fa-solid fa-comments',
    enabled: true,
    shortDescription: 'Messaging and Communication',
    extendedText: 'Integrate a secure messaging system for vendors and contractors to communicate, with NLP suggesting responses and flagging important messages.'
  },
  {
    icon: 'fa-solid fa-handshake-angle',
    enabled: false,
    shortDescription: 'Contract Negotiation Assistant',
    extendedText: 'Offer an NLP-powered assistant to help users navigate contract negotiations, providing suggestions and flagging important elements.'
  },
  {
    icon: 'fa-solid fa-video',
    enabled: false,
    shortDescription: 'Virtual Meeting Scheduler',
    extendedText: 'Include a tool for scheduling and organizing virtual meetings within the platform, with NLP suggesting optimal times.'
  },
  {
    icon: 'fa-solid fa-users',
    enabled: false,
    shortDescription: 'Project Collaboration Workspace',
    extendedText: 'Provide a collaborative workspace for project teams, including document sharing, task assignments, and progress tracking.'
  },
  {
    icon: 'fa-solid fa-handshake',
    enabled: false,
    shortDescription: 'Automated Conflict Resolution',
    extendedText: 'Use NLP to suggest resolutions for common disputes or conflicts based on historical data and industry standards.'
  },
  {
    icon: 'fa-solid fa-code-branch',
    enabled: false,
    shortDescription: 'Smart Contract Integration',
    extendedText: 'Incorporate blockchain-based smart contracts to automate and secure contract agreements and payments.'
  },
  {
    "icon": "fa-solid fa-sticky-note",
    "enabled": true,
    "shortDescription": "Contact Notes",
    "extendedText": "Enable users to attach notes to individual contacts, allowing for detailed record-keeping and personalized follow-ups. Notes can include text, dates, and reminders, helping users to maintain comprehensive contact histories."
  }
];


// Data Management and Analysis
dataManagementFeatures = [
  {
    icon: 'fa-solid fa-database',
    enabled: true,
    shortDescription: 'NLP Query Page',
    extendedText: 'Features a single box where users can type in their natural language queries and submit them, making data retrieval intuitive and efficient.'
  },
  {
    icon: 'fa-solid fa-file-export',
    enabled: true,
    shortDescription: 'Dynamic Query Exporting',
    extendedText: 'Enable users to export their NLP query results into various formats like PDF, CSV, Excel for enhanced reporting and analysis.'
  },
  {
    icon: 'fa-solid fa-filter',
    enabled: false,
    shortDescription: 'Advanced Query Filtering',
    extendedText: 'Introduce sophisticated post-query filtering options to refine results based on multiple criteria like location, project size, or vendor rating.'
  },
  {
    icon: 'fa-solid fa-tags',
    enabled: false,
    shortDescription: 'Data Categorization and Tagging',
    extendedText: 'Allow users to manually categorize and tag profiles and projects, enhancing the NLP system’s ability to make accurate matches based on these tags.'
  },
  {
    icon: 'fa-solid fa-broom',
    enabled: false,
    shortDescription: 'Automated Data Cleansing',
    extendedText: 'Integrate an automated data cleansing process during imports to identify duplicates, correct errors, and standardize formats, maintaining database accuracy.'
  },
  {
    icon: 'fa-solid fa-file-import',
    enabled: true,
    shortDescription: 'Document Parsing/Import',
    extendedText: 'Allow users to upload and extract data from documents like PDFs or Word files using NLP and machine learning, categorizing data automatically into the database.'
  },
  {
    icon: 'fa-solid fa-dashboard',
    enabled: true,
    shortDescription: 'Interactive Import Dashboard',
    extendedText: 'Create an interactive dashboard for data imports, offering real-time feedback on data quality, import progress, and tools to rectify issues immediately.'
  },
  {
    icon: 'fa-solid fa-code',
    enabled: false,
    shortDescription: 'API for External Data',
    extendedText: 'Develop an API to integrate external data feeds, updating the database automatically from partner sites, industry databases, and public records.'
  },
];

// Project and Vendor Management
projectVendorManagementFeatures = [
  {
    icon: 'fa-solid fa-tasks',
    enabled: false,
    shortDescription: 'Task Management',
    extendedText: 'Manage and track project tasks, ensuring timely completion and efficient workflow.'
  },
  {
    icon: 'fa-solid fa-browser',
    enabled: false,
    shortDescription: 'Project Summary Page',
    extendedText: 'Provides a detailed summary of projects, facilitating clear and accessible web-based communication between vendors and contractors.'
  },
  {
    icon: 'fa-solid fa-user-plus',
    enabled: false,
    shortDescription: 'Vendor Profile Management',
    extendedText: 'Allow minority vendors to create and manage detailed profiles showcasing their services, past projects, certifications, and areas of expertise using NLP for accurate matching.'
  },
  {
    icon: 'fa-solid fa-bullhorn',
    enabled: false,
    shortDescription: 'Contractor Project Posting',
    extendedText: 'Enable prime contractors to post upcoming projects with detailed requirements and use NLP to match them with relevant vendor profiles.'
  },
  {
    icon: 'fa-solid fa-hand-holding-dollar',
    enabled: false,
    shortDescription: 'Bid Submission and Management',
    extendedText: 'Allow vendors to submit bids on projects with NLP assisting in interpreting content for relevancy and completeness before submission.'
  },
  {
    icon: 'fa-solid fa-people-arrows-left-right',
    enabled: false,
    shortDescription: 'Automated Matching Recommendations',
    extendedText: 'Automatically suggest matches between vendors and contractors based on NLP analysis of profiles, project needs, and historical success rates.'
  }
];

// User Interface and Personalization
userInterfacePersonalizationFeatures = [
  {
    icon: 'fa-solid fa-bell',
    enabled: false,
    shortDescription: 'Notifications',
    extendedText: 'Receive alerts and notifications about important updates, ensuring you stay informed about project progress and critical actions.'
  },
  {
    icon: 'fa-solid fa-desktop',
    enabled: false,
    shortDescription: 'Customizable Dashboard',
    extendedText: 'Allow both vendors and contractors to customize their dashboards, highlighting information and metrics most relevant to them.'
  },
  {
    icon: 'fa-solid fa-bell-concierge',
    enabled: false,
    shortDescription: 'Personalized Project Alerts',
    extendedText: 'Send personalized project alerts to vendors based on their profile preferences and past search queries, ensuring relevancy with NLP.'
  },
  {
    icon: 'fa-solid fa-lightbulb',
    enabled: false,
    shortDescription: 'Smart Data Entry Suggestions',
    extendedText: 'Implement smart suggestions during data entry, autofilling fields based on user input and historical data to speed up new entries and ensure data consistency.'
  },
  {
    icon: 'fa-brands fa-facebook',
    enabled: false,
    shortDescription: 'Social Media Data Integration',
    extendedText: 'Enable linking social media profiles to extract relevant data about projects and expertise using NLP, enhancing profiles with data from online presence.'
  },
  {
    icon: 'fa-solid fa-users',
    enabled: false,
    shortDescription: 'Crowdsourced Data Verification',
    extendedText: 'Encourage community edits and updates to database entries with a review system to vet changes, ensuring data reliability and accuracy.'
  }
];

// Regulatory and Compliance
regulatoryComplianceFeatures = [
  {
    icon: 'fa-solid fa-balance-scale',
    enabled: false,
    shortDescription: 'Regulatory Compliance Checker',
    extendedText: 'Include a feature that uses NLP to check vendor profiles, project descriptions, and bids for compliance with relevant regulations and standards.'
  },
  {
    icon: 'fa-solid fa-file-signature',
    enabled: false,
    shortDescription: 'Compliance Doc Generator',
    extendedText: 'Offer a feature that generates necessary compliance and regulatory documentation based on project specifics, utilizing NLP for customization.'
  },
  {
    icon: 'fa-solid fa-exclamation-triangle',
    enabled: false,
    shortDescription: 'Risk Assessment Tools',
    extendedText: 'Integrate risk assessment tools that analyze project proposals and vendor histories to highlight potential risks.'
  }
];

// Educational and Resource Management
educationalResourceManagementFeatures = [
  {
    icon: 'fa-solid fa-book-open-reader',
    enabled: false,
    shortDescription: 'Educational Resources',
    extendedText: 'Offer resources and guides on best practices for bidding and project management, tailored for minority vendors based on NLP analysis of user profiles.'
  },
  {
    icon: 'fa-solid fa-chart-line',
    enabled: false,
    shortDescription: 'Market Trends and Insights',
    extendedText: 'Provide insights and analytics on market trends and demand fluctuations, derived from NLP analysis of platform data.'
  },
  {
    icon: 'fa-solid fa-store',
    enabled: false,
    shortDescription: 'Marketplace for Tools and Resources',
    extendedText: 'Create a marketplace within the platform where vendors can find and purchase tools, materials, and services needed for projects.'
  },
  {
    icon: 'fa-solid fa-certificate',
    enabled: false,
    shortDescription: 'Skill Certification Verification',
    extendedText: 'Implement a verification system for vendor skills and certifications, using NLP to parse and verify documentation against official databases.'
  }
];

// Accessibility and Language Support
accessibilityLanguageSupportFeatures = [
  {
    icon: 'fa-solid fa-language',
    enabled: false,
    shortDescription: 'Real-time Language Translation',
    extendedText: 'Support real-time translation of communications and documents between vendors and contractors, removing language barriers.'
  },
  {
    icon: 'fa-solid fa-microphone',
    enabled: false,
    shortDescription: 'Voice-to-Text for Queries',
    extendedText: 'Integrate voice-to-text capabilities, allowing users to perform searches and send messages using voice commands.'
  },
  {
    icon: 'fa-solid fa-leaf',
    enabled: false,
    shortDescription: 'Eco-Friendly Matching',
    extendedText: 'Match vendors and contractors based on sustainability goals and eco-friendly practices.'
  }
];

  
  ngOnInit() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  shouldStartNewSection(index: number): boolean {
    return index % 5 === 0 && index !== 0;
  }
  

  
  
  

}
