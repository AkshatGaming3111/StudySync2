// Standardized Curriculum Subject Taxonomy for StudySync AI Classroom

export const SUBJECT_CATEGORIES = [
  {
    category: 'Main Subjects',
    subjects: [
      {
        id: 'maths',
        name: 'Maths (Mathematics)',
        shortName: 'Maths',
        icon: 'Sigma',
        color: 'from-blue-500 to-indigo-600',
        subtopics: [
          'Algebra',
          'Geometry',
          'Trigonometry',
          'Mensuration',
          'Coordinate Geometry',
          'Calculus',
          'Statistics & Probability'
        ]
      },
      {
        id: 'science',
        name: 'Science',
        shortName: 'Science',
        icon: 'Atom',
        color: 'from-teal-500 to-emerald-600',
        subtopics: [
          'Physics (Mechanics, Optics, Electricity, Magnetism)',
          'Chemistry (Organic, Inorganic, Physical, Periodic Table)',
          'Biology (Cell Biology, Genetics, Human Physiology, Ecology)'
        ]
      },
      {
        id: 'social_studies',
        name: 'Social Studies (SST)',
        shortName: 'Social Studies',
        icon: 'Globe',
        color: 'from-amber-500 to-orange-600',
        subtopics: [
          'History (Ancient, Medieval, Modern World History)',
          'Civics (Democracy, Constitution, Political Systems, Governance)',
          'Geography (Physical, Climate, Resources, Maps)',
          'Economics (Development, Money & Credit, Sectors of Economy)'
        ]
      }
    ]
  },
  {
    category: 'Language Subjects',
    subjects: [
      {
        id: 'english',
        name: 'English',
        shortName: 'English',
        icon: 'BookOpen',
        color: 'from-violet-500 to-purple-600',
        subtopics: [
          'English Literature (Prose, Poetry, Drama Analysis)',
          'English Grammar & Syntax (Tenses, Modals, Active/Passive)',
          'Reading Comprehension & Critical Analysis',
          'Creative Writing (Essays, Articles, Formal Letters)'
        ]
      },
      {
        id: 'hindi',
        name: 'Hindi',
        shortName: 'Hindi',
        icon: 'Languages',
        color: 'from-rose-500 to-pink-600',
        subtopics: [
          'Hindi Vyakaran (Alankar, Samas, Sandhi, Karak, Muhavare)',
          'Hindi Sahitya (Kavita, Kahani, Natak Analysis)',
          'Gadyansh (Comprehension & Vocabulary)',
          'Rachnatmak Lekhan (Nibandh, Patra, Anuchhed)'
        ]
      }
    ]
  },
  {
    category: 'Extra Subjects',
    subjects: [
      {
        id: 'it',
        name: 'IT (Information Technology)',
        shortName: 'IT',
        icon: 'Code',
        color: 'from-cyan-500 to-blue-600',
        subtopics: [
          'Programming & Algorithms (Python, JavaScript, Java, C++)',
          'Web Technologies (HTML, CSS, React, Full-Stack)',
          'Database Management (SQL, Relational Modeling, JSON)',
          'Cybersecurity, Networks & Digital Literacy'
        ]
      },
      {
        id: 'pe',
        name: 'PE (Physical Education)',
        shortName: 'PE',
        icon: 'Activity',
        color: 'from-emerald-500 to-teal-700',
        subtopics: [
          'Human Anatomy, Physiology & Kinesiology in Sports',
          'Physical Fitness, Athletics & Team Sports Rules',
          'Yoga, Meditation & Mental Wellness',
          'Sports Nutrition, First Aid & Injury Management'
        ]
      }
    ]
  }
];

// Flat array of all subject display names
export const ALL_SUBJECTS = [
  'Maths (Algebra, Geometry, Trigonometry, Mensuration)',
  'Science (Physics)',
  'Science (Chemistry)',
  'Science (Biology)',
  'Social Studies (History)',
  'Social Studies (Civics)',
  'Social Studies (Geography)',
  'Social Studies (Economics)',
  'English (Literature & Grammar)',
  'Hindi (Vyakaran & Sahitya)',
  'IT (Information Technology)',
  'PE (Physical Education)'
];
