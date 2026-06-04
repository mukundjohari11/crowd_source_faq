import { FAQItem } from './types';

export const INITIAL_FAQ_ITEMS: FAQItem[] = [
  {
    id: 'lit-review-structure',
    category: 'RESEARCH',
    title: 'How do I structure a literature review for a technical stipend application?',
    timestamp: '2 days ago',
    author: {
      name: 'Senior Research Advisor',
      title: 'Senior Research Mentor',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXVdRpHujspqWvsdBn2cv0mB_rw8dFS88mRZOLNTolN3vpRS5nguVCJcGMrzHNaKuh7973IFekAozQUR9_mM1Wqe2Eb3r8rNObz-kevX5xwz25cwJ5FJcbinVGiTnHDakUPD_Ny1DMSiKWBOjE_i5rIpXL4njOPkY76EwXWc_xiUcYuQ54ErAcDrOhBlN_kVV54IPSZNkI0uYF1aW-fywJd51dvkV5LQfZKtdEScyA40Bv-T2BL4ujxM54G8RBsFtBkfrFgjIkbSI'
    },
    intro: 'The literature review is more than just a list of references. It serves as the intellectual foundation of your entire proposal, signaling to reviewers that you are addressing a real gap in current state-of-the-art methodology.',
    structuredApproach: {
      title: 'The Structured Approach',
      description: "When applying for a technical stipend at Vicharanashala, the literature review isn't just a list of books you've read. It's a strategic demonstration of your understanding of the current technological gap. Here's the recommended breakdown:",
      bullets: [
        {
          title: 'The Landscape Survey',
          content: "Identify the 5-7 core papers or projects that define your field of interest. Don't just summarize; contrast their methodologies."
        },
        {
          title: 'The Critical Gap',
          content: 'This is the most important part. Explicitly state what is `missing` or `suboptimal` in the current body of work.'
        },
        {
          title: 'Alignment',
          content: 'Explain how your proposed project directly addresses this gap.'
        }
      ],
      proTip: 'Use a `thematic` organization rather than a chronological one. This shows you have synthesized information rather than just recorded it. Focus on performance metrics, scalability issues, and theoretical bottlenecks.'
    },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuKMRuhWvcPk6hHljhg7zXG49zzVM9BInHhl7lCG93ECQ7YuyJ4xrGVkWe1e9ugqofgCLURg-SC3FNQ84nmfPkOjly66cLwwmoeVSZJYcoz8YflcZ0rllQT5SsyqzDTItVAIIOjE6Jc-uBoGF48f8Tdo5xUopWx7UHaLA70jOpVYyPCYJFb7UW8-VEub3RDeSH0QIPI52VTo7hcoCnl2ud3s6fqO__pS3efG8Uee7r_0Y4wqqlNsTvJle-wbDeD8Ik1r76WdcN0EQ',
    imageAlt: 'A clean, minimalist high-tech workspace in a high-fidelity dark mode aesthetic featuring a sleek ultrawide monitor with data graphics.',
    upvotes: 1240,
    voted: null,
    views: '4.5k',
    commentsCount: 42,
    comments: [
      {
        id: 'c1',
        authorName: 'Riya Sharma',
        authorTitle: 'Undergraduate Fellow',
        authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuxoK0RZ4qPQ8XB4MrQm_MAQKTzvxTaI8pdbrudwhWCD9rkH_55kUD5YRY2FRcvaDgAT7Od61HNbwn1cOfUAcCW98VoZp2cgAJRIxiWPHk7YZq6QhM9ESsy62g-cJEetg5qdyRMSovBfbjWgzsK87_O4ksasGaohSfahqJ65Bihawmq1ZfQN73A2kFSok5fd26fQxV5zRiAvpHa_802MLcwHFc8aF4XxeH3B42Lo5e6lGxbJDpSlh_SXZfuO-vKhnXyLKsdH2p0K4',
        content: "This is exactly what I needed. I was struggling with the 'Critical Gap' section. Does this apply to PhD stipends as well?",
        timestamp: '5h ago',
        likes: 24,
        replies: [
          {
            id: 'c1-r1',
            authorName: 'Senior Research Advisor',
            authorTitle: 'Senior Research Mentor',
            authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXVdRpHujspqWvsdBn2cv0mB_rw8dFS88mRZOLNTolN3vpRS5nguVCJcGMrzHNaKuh7973IFekAozQUR9_mM1Wqe2Eb3r8rNObz-kevX5xwz25cwJ5FJcbinVGiTnHDakUPD_Ny1DMSiKWBOjE_i5rIpXL4njOPkY76EwXWc_xiUcYuQ54ErAcDrOhBlN_kVV54IPSZNkI0uYF1aW-fywJd51dvkV5LQfZKtdEScyA40Bv-T2BL4ujxM54G8RBsFtBkfrFgjIkbSI',
            content: 'Yes, Riya. In fact, for PhD levels, the gap should be even more granular. You should ideally cite a specific limitation in a recent top-tier conference paper (e.g., CVPR or NeurIPS).',
            timestamp: '3h ago',
            likes: 12
          }
        ]
      },
      {
        id: 'c2',
        authorName: 'Amit Patel',
        authorTitle: 'M.Tech Candidate',
        authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQO3Y053QXw6v4OznuC6JIFFWo1EXUsptr92ekOWHuKN27LjFBcZ9ijWwwTUWDRpzFJ9u2KUd_dTssfi228IeFE-U-Cui0Rd8zKjXACExflESmRcClu_TSi8x1mj1FaXWrVXXyNenk0kToJzYHr2itUphqeckd3ty6rYYERd_XW6r1xgI-8EI_FtguKOCZzNqYvbzhq4PL9j1FjSkPIkHGkdl69jPCeVVhC1g1oGV2w5ER-uzoBR2GztnBGQPAk6JFsGH-RK_zS4I',
        content: 'Should we prioritize peer-reviewed journals over open-source GitHub repositories that have high star counts but are not formally published?',
        timestamp: '1 day ago',
        likes: 8,
        replies: []
      }
    ],
    relatedQuestions: ['cgpa-requirements', 'find-mentor', 'sop-sample']
  },
  {
    id: 'cgpa-requirements',
    category: 'STIPENDS',
    title: 'Minimum CGPA required for the Research Excellence Stipend?',
    timestamp: '4 days ago',
    author: {
      name: 'Academic Office',
      title: 'Registrar & Funding Cell',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQO3Y053QXw6v4OznuC6JIFFWo1EXUsptr92ekOWHuKN27LjFBcZ9ijWwwTUWDRpzFJ9u2KUd_dTssfi228IeFE-U-Cui0Rd8zKjXACExflESmRcClu_TSi8x1mj1FaXWrVXXyNenk0kToJzYHr2itUphqeckd3ty6rYYERd_XW6r1xgI-8EI_FtguKOCZzNqYvbzhq4PL9j1FjSkPIkHGkdl69jPCeVVhC1g1oGV2w5ER-uzoBR2GztnBGQPAk6JFsGH-RK_zS4I'
    },
    intro: 'The Research Excellence Stipend targets top academic achievers who are also working on high-impact engineering projects.',
    structuredApproach: {
      title: 'The Eligibility Matrix',
      description: 'Review the minimum academic benchmarks and flexible waivers that are considered for application selection:',
      bullets: [
        {
          title: 'Primary Cutoff',
          content: 'A minimum CGPA of 8.5/10 is generally expected for undergraduate students, and 8.0/10 for postgraduate candidates.'
        },
        {
          title: 'Special Waivers',
          content: 'If you have an accepted paper at a Tier-1 conference or a significant contribution to a major open source library, the CGPA threshold is waived to 7.5.'
        },
        {
          title: 'Academic Discipline',
          content: 'No active backlogs or disciplinary records are permitted at the time of application submission.'
        }
      ],
      proTip: 'If your CGPA is between 7.5 and 8.5, ensure your letters of recommendation and repository codebase links are prominent and highlight your engineering capabilities.'
    },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuKMRuhWvcPk6hHljhg7zXG49zzVM9BInHhl7lCG93ECQ7YuyJ4xrGVkWe1e9ugqofgCLURg-SC3FNQ84nmfPkOjly66cLwwmoeVSZJYcoz8YflcZ0rllQT5SsyqzDTItVAIIOjE6Jc-uBoGF48f8Tdo5xUopWx7UHaLA70jOpVYyPCYJFb7UW8-VEub3RDeSH0QIPI52VTo7hcoCnl2ud3s6fqO__pS3efG8Uee7r_0Y4wqqlNsTvJle-wbDeD8Ik1r76WdcN0EQ',
    imageAlt: 'Data science dashboard and performance charts.',
    upvotes: 412,
    voted: null,
    views: '1.1k',
    commentsCount: 142,
    comments: [],
    relatedQuestions: ['lit-review-structure', 'find-mentor']
  },
  {
    id: 'find-mentor',
    category: 'MENTORSHIP',
    title: 'How to find a mentor for AI/ML projects in Vicharanashala?',
    timestamp: '1 week ago',
    author: {
      name: 'Prof. Devendra Joshi',
      title: 'AI Lab Lead',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXVdRpHujspqWvsdBn2cv0mB_rw8dFS88mRZOLNTolN3vpRS5nguVCJcGMrzHNaKuh7973IFekAozQUR9_mM1Wqe2Eb3r8rNObz-kevX5xwz25cwJ5FJcbinVGiTnHDakUPD_Ny1DMSiKWBOjE_i5rIpXL4njOPkY76EwXWc_xiUcYuQ54ErAcDrOhBlN_kVV54IPSZNkI0uYF1aW-fywJd51dvkV5LQfZKtdEScyA40Bv-T2BL4ujxM54G8RBsFtBkfrFgjIkbSI'
    },
    intro: 'Finding the right mentor can dramatically accelerate your research. Our matching system is based on shared research and developmental interests.',
    structuredApproach: {
      title: 'Mentorship Outreach Strategy',
      description: 'The best way to secure research mentorship is through structural, high-intent preparation before formal outreach:',
      bullets: [
        {
          title: 'Review Lab Repositories',
          content: "Explore the department's open Github profiles and ongoing project summaries. Map their research field to your specific objectives."
        },
        {
          title: 'Prepare a 1-Pager Draft',
          content: 'Do not send generic cold emails. Attach a concise 1-page design proposal summarizing your project goals and tech stack choices.'
        },
        {
          title: 'Vicharanashala Portal matching',
          content: 'Submit your profile inside the Mentorship Hub. Our internal matchmaking algorithm highlights prospective mentors with aligned tags.'
        }
      ],
      proTip: 'Highlight what active value you contribute to the mentors group—whether as a software implementer, mathematician, or compiler optimization writer.'
    },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuKMRuhWvcPk6hHljhg7zXG49zzVM9BInHhl7lCG93ECQ7YuyJ4xrGVkWe1e9ugqofgCLURg-SC3FNQ84nmfPkOjly66cLwwmoeVSZJYcoz8YflcZ0rllQT5SsyqzDTItVAIIOjE6Jc-uBoGF48f8Tdo5xUopWx7UHaLA70jOpVYyPCYJFb7UW8-VEub3RDeSH0QIPI52VTo7hcoCnl2ud3s6fqO__pS3efG8Uee7r_0Y4wqqlNsTvJle-wbDeD8Ik1r76WdcN0EQ',
    imageAlt: 'Collaborative development space diagrams.',
    upvotes: 289,
    voted: null,
    views: '800',
    commentsCount: 89,
    comments: [],
    relatedQuestions: ['lit-review-structure', 'sop-sample']
  },
  {
    id: 'sop-sample',
    category: 'CAREERS',
    title: 'Sample Statement of Purpose for Engineering students.',
    timestamp: '2 weeks ago',
    author: {
      name: 'Careers Advisory',
      title: 'Industry & Alumni Liaison',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuxoK0RZ4qPQ8XB4MrQm_MAQKTzvxTaI8pdbrudwhWCD9rkH_55kUD5YRY2FRcvaDgAT7Od61HNbwn1cOfUAcCW98VoZp2cgAJRIxiWPHk7YZq6QhM9ESsy62g-cJEetg5qdyRMSovBfbjWgzsK87_O4ksasGaohSfahqJ65Bihawmq1ZfQN73A2kFSok5fd26fQxV5zRiAvpHa_802MLcwHFc8aF4XxeH3B42Lo5e6lGxbJDpSlh_SXZfuO-vKhnXyLKsdH2p0K4'
    },
    intro: 'A Statement of Purpose must convey not just your interest, but your capability. Technical panels respond positively to highly precise engineering descriptions.',
    structuredApproach: {
      title: 'SOP Component Guide',
      description: 'Your SOP must tell a technical story with a solid beginning, experimental body, and targeted career objectives:',
      bullets: [
        {
          title: 'The Narrative Hook',
          content: 'Begin with a specific, hard engineering problem you resolved. Avoid high-level quotes or childhood stories.'
        },
        {
          title: 'The System Design',
          content: 'Devote two key paragraphs to detailing the systems you built, technologies used (e.g., Rust, Go, CUDA), and measured performance metrics.'
        },
        {
          title: 'Future Vision',
          content: 'Conclude with how our fellowship directly empowers your targeted research in distributed system architectures.'
        }
      ],
      proTip: 'Ditch the generic fluff. Write clearly, reference concrete research papers of the lab, and let your engineering code portfolios do the talking.'
    },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuKMRuhWvcPk6hHljhg7zXG49zzVM9BInHhl7lCG93ECQ7YuyJ4xrGVkWe1e9ugqofgCLURg-SC3FNQ84nmfPkOjly66cLwwmoeVSZJYcoz8YflcZ0rllQT5SsyqzDTItVAIIOjE6Jc-uBoGF48f8Tdo5xUopWx7UHaLA70jOpVYyPCYJFb7UW8-VEub3RDeSH0QIPI52VTo7hcoCnl2ud3s6fqO__pS3efG8Uee7r_0Y4wqqlNsTvJle-wbDeD8Ik1r76WdcN0EQ',
    imageAlt: 'Workspace with system designs.',
    upvotes: 387,
    voted: null,
    views: '3k',
    commentsCount: 210,
    comments: [],
    relatedQuestions: ['find-mentor', 'cgpa-requirements']
  }
];

export const TOP_CATEGORIES = ['Stipends', 'Open Source', 'Mentorship', 'Research', 'Careers'];
