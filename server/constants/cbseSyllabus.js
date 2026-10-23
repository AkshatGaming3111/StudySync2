// Server-side Official CBSE Curriculum Map

const CBSE_SYLLABUS = {
  "Grade 10": {
    "Maths": [
      "Real Numbers (Fundamental Theorem of Arithmetic, Proofs of Irrationality)",
      "Polynomials (Zeroes of Quadratic Polynomials & Coefficients)",
      "Pair of Linear Equations in Two Variables (Substitution & Elimination)",
      "Quadratic Equations (Factorization, Quadratic Formula, Discriminant D)",
      "Arithmetic Progressions (nth Term an and Sum Sn)",
      "Triangles (Basic Proportionality / Thales Theorem, Similarity)",
      "Coordinate Geometry (Distance & Section Formula)",
      "Introduction to Trigonometry (Trigonometric Ratios & Identities sin²θ+cos²θ=1)",
      "Some Applications of Trigonometry (Heights and Distances)",
      "Circles (Tangents to Circle Theorems)",
      "Areas Related to Circles (Sector & Segment Areas)",
      "Surface Areas and Volumes (Combinations of Solids & Frustums)",
      "Statistics (Mean, Median, Mode of Grouped Data)",
      "Probability (Classical Probability Definition)"
    ],
    "Science (Physics)": [
      "Light - Reflection and Refraction (Mirror & Lens Formula, Snell's Law)",
      "The Human Eye and the Colourful World (Prism Dispersion, Atmospheric Refraction, Tyndall Effect)",
      "Electricity (Ohm's Law V=IR, Series/Parallel Resistors, Joule's Heating H=I²Rt, Power)",
      "Magnetic Effects of Electric Current (Right-Hand Thumb Rule, Solenoids, Fleming's Left-Hand Rule)",
      "Our Environment (Ecosystem, 10% Energy Law, Ozone Layer Depletion)"
    ],
    "Science (Chemistry)": [
      "Chemical Reactions and Equations (Balancing, Types: Combination, Decomposition, Displacement, Redox)",
      "Acids, Bases and Salts (pH Scale, Bleaching Powder, Baking Soda, Plaster of Paris)",
      "Metals and Non-Metals (Reactivity Series, Ionic Bonds, Metallurgy Basics)",
      "Carbon and its Compounds (Covalent Bonds, Homologous Series, Functional Groups, Saponification)"
    ],
    "Science (Biology)": [
      "Life Processes (Nutrition, Respiration, Circulation Heart System, Excretion Nephron)",
      "Control and Coordination (Nervous System, Reflex Arc, Plant Phytohormones, Endocrine Glands)",
      "How do Organisms Reproduce? (Asexual & Sexual Reproduction, Human Reproductive Health)",
      "Heredity (Mendel's Laws, Monohybrid/Dihybrid 9:3:3:1 Cross, Sex Determination XX/XY)"
    ],
    "Social Studies (History)": [
      "The Rise of Nationalism in Europe (French Revolution, Nation-State Idea)",
      "Nationalism in India (Non-Cooperation, Civil Disobedience Movement, Salt March, Poona Pact)",
      "The Making of a Global World (Pre-modern Silk Routes, 1929 Great Depression)",
      "Print Culture and the Modern World (Print Revolution, Impact in India)"
    ],
    "Social Studies (Civics)": [
      "Power Sharing (Belgium & Sri Lanka Models, Horizontal/Vertical Power Sharing)",
      "Federalism (Union/State/Concurrent Lists, Decentralization in India)",
      "Gender, Religion and Caste (Feminist Movements, Communalism, Secular State)",
      "Political Parties (National & Regional Parties, Multi-Party System, Reforms)",
      "Outcomes of Democracy (Accountability, Legitimacy, Equality & Freedom)"
    ],
    "Social Studies (Geography)": [
      "Resources and Development (Soil Classification: Alluvial, Black, Laterite, Sustainable Development)",
      "Forest and Wildlife Resources (Conservation, Community Forestry)",
      "Water Resources (Dams, Rainwater Harvesting)",
      "Agriculture (Kharif/Rabi, Major Crops: Rice, Wheat, Cotton, Jute)",
      "Minerals and Energy Resources (Metallic/Non-metallic, Solar/Wind Non-Conventional)",
      "Manufacturing Industries (Agro & Mineral Based, Industrial Pollution)",
      "Lifelines of National Economy (Transport, Seaports, Communication)"
    ],
    "Social Studies (Economics)": [
      "Development (Per Capita Income, Human Development Index / HDI)",
      "Sectors of the Indian Economy (Primary, Secondary, Tertiary, MGNREGA)",
      "Money and Credit (Formal vs Informal Sources, Self Help Groups, RBI Role)",
      "Globalisation and the Indian Economy (MNCs, WTO, Liberalisation, Foreign Trade)"
    ],
    "English": [
      "Grammar: Tenses, Modals, Subject-Verb Concord, Reported Speech, Determiners",
      "Writing: Formal Letters (Editor, Inquiries, Complaints) & Analytical Paragraphs",
      "Literature: First Flight (A Letter to God, Nelson Mandela, Anne Frank, Poetry)",
      "Literature: Footprints Without Feet (A Triumph of Surgery, The Thief's Story, Bholi)"
    ],
    "Hindi": [
      "रचना के आधार पर वाक्य भेद (सरल, संयुक्त, मिश्र वाक्य)",
      "वाच्य (कर्तृवाच्य, कर्मवाच्य, भाववाच्य)",
      "पद परिचय (संज्ञा, सर्वनाम, विशेषण, क्रिया, अव्यय)",
      "अलंकार (अनुप्रास, यमक, श्लेष, उपमा, रूपक, उत्प्रेक्षा, अतिशयोक्ति, मानवीकरण)",
      "समास (अव्ययीभाव, तत्पुरुष, कर्मधारय, द्विगु, द्वंद्व, बहुव्रीहि)",
      "पाठ्यपुस्तक: सूरदास के पद, राम-लक्ष्मण-परशुराम संवाद, नेताजी का चश्मा, बालगोबिन भगत, माता का अँचल"
    ],
    "IT (Information Technology)": [
      "Digital Documentation (Advanced) - LibreOffice Styles, Images, Mail Merge",
      "Electronic Spreadsheet (Advanced) - Consolidate, Subtotals, Goal Seek, Macros",
      "Database Management System (RDBMS) - Primary Key, Foreign Key, SQL SELECT/WHERE/ORDER BY Queries",
      "Web Applications and Security - Networking, Cybersecurity, Ergonomics"
    ],
    "PE (Physical Education)": [
      "Human Anatomy & Exercise Physiology in Sports",
      "Physical Fitness & Motor Ability Components (Speed, Strength, Endurance)",
      "Yoga & Wellness Asanas (Pranayama, Tadasana, Bhujangasana)",
      "Team Sports Rules & Measurement of Courts (Cricket, Football, Basketball, Kho-Kho)",
      "First Aid (PRICER Protocol), Sports Injuries & Balanced Nutrition"
    ]
  }
};

module.exports = { CBSE_SYLLABUS };
