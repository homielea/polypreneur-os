
export interface PhaseTemplate {
  name: string;
  description: string;
  subtasks: string[];
  automationTrigger?: string;
}

export const PHASES: PhaseTemplate[] = [
  {
    name: "Ideation",
    description: "Generate and refine product concepts",
    subtasks: [
      "Brainstorm product ideas based on personal pain points",
      "Research existing solutions and identify gaps",
      "Define core problem statement",
      "Validate idea with target audience feedback"
    ]
  },
  {
    name: "Problem & User Discovery",
    description: "Deep dive into user problems and market research",
    subtasks: [
      "Conduct user interviews (5-10 potential users)",
      "Create user personas and journey maps",
      "Analyze competitor landscape and positioning",
      "Document pain points and user stories"
    ]
  },
  {
    name: "Validation & Positioning",
    description: "Validate market demand and positioning strategy",
    subtasks: [
      "Create landing page or MVP concept",
      "Run validation experiments (surveys, pre-sales)",
      "Define unique value proposition",
      "Test messaging with target audience"
    ]
  },
  {
    name: "Product Strategy",
    description: "Define product roadmap and business model",
    subtasks: [
      "Define MVP feature set and scope",
      "Create product roadmap for 6 months",
      "Determine pricing and business model",
      "Set success metrics and KPIs"
    ]
  },
  {
    name: "Design & UX",
    description: "Create user interface and experience design",
    subtasks: [
      "Create wireframes and user flow diagrams",
      "Design UI mockups and prototypes",
      "Conduct usability testing sessions",
      "Finalize design system and components"
    ]
  },
  {
    name: "Build & Integrate",
    description: "Develop the product and integrate systems",
    subtasks: [
      "Set up development environment and tools",
      "Build core functionality and features",
      "Integrate third-party services and APIs",
      "Implement analytics and tracking"
    ]
  },
  {
    name: "Final QA + Founder Review",
    description: "Quality assurance and final review process",
    subtasks: [
      "Conduct comprehensive testing (functionality, UX, performance)",
      "Fix critical bugs and polish user experience",
      "Founder final review and approval",
      "Prepare launch assets and documentation"
    ]
  },
  {
    name: "Launch Setup & Execution",
    description: "Execute product launch strategy",
    subtasks: [
      "Set up analytics and monitoring tools",
      "Create launch announcement content",
      "Submit to relevant platforms (App Store, Chrome Web Store, etc.)",
      "Execute launch day communications"
    ],
    automationTrigger: "launch-announcement"
  },
  {
    name: "Automated Marketing & Sales",
    description: "Implement marketing automation and sales processes",
    subtasks: [
      "Set up email marketing sequences",
      "Create social media content calendar",
      "Implement conversion tracking and optimization",
      "Launch paid acquisition campaigns"
    ],
    automationTrigger: "content-automation"
  },
  {
    name: "SOP Creation + Systemization",
    description: "Document processes and create standard operating procedures",
    subtasks: [
      "Document all processes and workflows",
      "Create templates for future products",
      "Set up delegation frameworks",
      "Build knowledge base and documentation"
    ]
  },
  {
    name: "Post-Launch Feedback Loop",
    description: "Analyze usage, testimonials, and support tickets",
    subtasks: [
      "Collect and analyze user feedback",
      "Monitor usage analytics and user behavior",
      "Review support tickets and common issues",
      "Plan improvements for version 2"
    ]
  },
  {
    name: "Growth Experiments",
    description: "Run weekly growth sprints (SEO, affiliates, collaborations)",
    subtasks: [
      "Implement SEO optimization strategies",
      "Set up affiliate and referral programs",
      "Execute partnership and collaboration outreach",
      "Run conversion rate optimization experiments"
    ]
  },
  {
    name: "Founder Reflection & Energy Reset",
    description: "Track mood, burnout, energy. Celebrate wins.",
    subtasks: [
      "Conduct founder energy and burnout assessment",
      "Celebrate wins and document lessons learned",
      "Plan next product or improvement cycle",
      "Reset and prepare for next iteration"
    ]
  }
];
