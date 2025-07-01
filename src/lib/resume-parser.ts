// Resume parsing and analysis service
export interface ParsedResume {
  text: string;
  sections: {
    contact?: string;
    summary?: string;
    experience?: string;
    education?: string;
    skills?: string;
    projects?: string;
  };
  extractedData: {
    name?: string;
    email?: string;
    phone?: string;
    skills: string[];
    experience: string[];
    education: string[];
  };
}

export interface JobDescription {
  text: string;
  keywords: string[];
  requirements: string[];
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  educationLevel: 'high-school' | 'bachelor' | 'master' | 'phd';
  rolePersona?: string; // Optional role persona for enhanced analysis
}

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  score: number;
  suggestions: string[];
  requiredSkillsMatched: number;
  preferredSkillsMatched: number;
  totalRequiredSkills: number;
  totalPreferredSkills: number;
  feedback: string[];
  softSkillsMatched: string[];
  rolePersona: string;
  contextualSkills: { skill: string; weight: number; context: string }[];
}

export interface AnalysisFeedback {
  type: 'missing_skill' | 'experience_mismatch' | 'education_mismatch' | 'format_issue' | 'overqualification' | 'soft_skill_bonus';
  message: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  suggestion: string;
}

export class ResumeParser {
  // Enhanced skill synonyms mapping for better matching
  private static readonly SKILL_SYNONYMS: Record<string, string[]> = {
    // Programming Languages - Enhanced
    'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'vanilla js', 'vanilla javascript'],
    'typescript': ['ts', 'typed javascript', 'typescript 4', 'typescript 5'],
    'python': ['py', 'python3', 'python 3', 'python 3.x', 'python 2.7', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
    'java': ['j2ee', 'j2se', 'jdk', 'java 8', 'java 11', 'java 17', 'spring boot', 'spring framework'],
    'c++': ['cpp', 'c plus plus', 'c++11', 'c++14', 'c++17', 'c++20'],
    'c#': ['csharp', 'dotnet', '.net', '.net core', '.net 5', '.net 6', '.net 7', '.net 8'],
    'php': ['php5', 'php7', 'php8', 'laravel', 'symfony', 'wordpress'],
    'ruby': ['ruby on rails', 'rails', 'ruby 2', 'ruby 3'],
    'go': ['golang', 'go lang'],
    'rust': ['rustlang', 'rust programming'],
    'swift': ['swiftui', 'ios development', 'swift 5', 'swift 4'],
    'kotlin': ['android kotlin', 'kotlin android'],
    'scala': ['scala programming', 'apache spark'],
    'r': ['r programming', 'r language', 'r studio'],
    'matlab': ['matrix laboratory', 'matlab programming'],
    'perl': ['perl scripting', 'perl programming'],
    'bash': ['shell scripting', 'bash scripting', 'shell', 'bash shell'],
    'powershell': ['ps', 'windows powershell', 'powershell core'],
    'sql': ['structured query language', 'mysql', 'postgresql', 'oracle sql', 'sql server', 'sqlite', 'mariadb', 'query optimization', 'database processes', 'data warehousing'],
    'html': ['html5', 'hypertext markup language', 'html 5'],
    'css': ['css3', 'cascading style sheets', 'css 3', 'scss', 'sass', 'less'],
    'sass': ['scss', 'sass css', 'sass preprocessor'],
    'less': ['less css', 'less preprocessor'],
    
    // Frameworks & Libraries - Enhanced
    'react': ['reactjs', 'react.js', 'react native', 'nextjs', 'next.js', 'gatsby', 'create react app', 'cra'],
    'angular': ['angularjs', 'angular 2', 'angular 4', 'angular 5', 'angular 6', 'angular 7', 'angular 8', 'angular 9', 'angular 10', 'angular 11', 'angular 12', 'angular 13', 'angular 14', 'angular 15', 'angular 16', 'angular 17'],
    'vue': ['vuejs', 'vue.js', 'vue 2', 'vue 3', 'nuxt.js', 'nuxtjs', 'vuex', 'pinia'],
    'node.js': ['nodejs', 'node', 'express.js', 'expressjs', 'express framework', 'koa', 'hapi'],
    'express': ['express.js', 'expressjs', 'express framework', 'express middleware'],
    'django': ['django framework', 'python django', 'django rest framework', 'drf'],
    'flask': ['flask framework', 'python flask', 'flask api'],
    'spring': ['spring boot', 'spring framework', 'java spring', 'spring mvc', 'spring data'],
    'laravel': ['php laravel', 'laravel framework', 'laravel eloquent'],
    'rails': ['ruby on rails', 'rails framework', 'ruby rails'],
    'bootstrap': ['twitter bootstrap', 'bootstrap css', 'bootstrap 4', 'bootstrap 5'],
    'tailwind': ['tailwind css', 'tailwindcss', 'tailwind ui'],
    'material-ui': ['mui', 'material ui', 'react material ui', '@mui/material'],
    'antd': ['ant design', 'ant design react', 'ant design vue'],
    'jquery': ['jquery library', 'jquery js', 'jquery ui'],
    'lodash': ['lodash library', 'lodash js', 'underscore'],
    'moment': ['moment.js', 'momentjs', 'date library', 'date-fns'],
    'axios': ['axios library', 'http client', 'fetch api'],
    
    // Artificial Intelligence & Machine Learning - Enhanced
    'artificial intelligence': ['ai', 'machine learning', 'ml', 'deep learning', 'neural networks', 'nlp', 'natural language processing'],
    'machine learning': ['ml', 'artificial intelligence', 'ai', 'deep learning', 'neural networks', 'scikit-learn', 'sklearn'],
    'deep learning': ['neural networks', 'tensorflow', 'pytorch', 'keras', 'cnn', 'rnn', 'lstm'],
    'tensorflow': ['tf', 'tensorflow 2', 'tensorflow.js', 'tensorflow lite'],
    'pytorch': ['torch', 'pytorch framework'],
    'keras': ['keras deep learning', 'keras neural networks'],
    'scikit-learn': ['sklearn', 'scikit learn', 'machine learning library'],
    'opencv': ['computer vision', 'cv', 'image processing'],
    'nltk': ['natural language toolkit', 'nlp library'],
    'spacy': ['spaCy', 'nlp processing', 'natural language processing'],
    
    // Databases - Enhanced
    'mysql': ['mysql database', 'mysql db', 'mariadb', 'percona'],
    'postgresql': ['postgres', 'postgresql database', 'postgres db', 'postgresql 13', 'postgresql 14'],
    'mongodb': ['mongo', 'mongodb database', 'nosql', 'mongo db'],
    'redis': ['redis cache', 'redis database', 'redis cluster'],
    'elasticsearch': ['elastic search', 'elasticsearch engine', 'elk stack'],
    'dynamodb': ['dynamo db', 'aws dynamodb', 'dynamodb nosql'],
    'cassandra': ['apache cassandra', 'cassandra db', 'cassandra nosql'],
    'oracle': ['oracle database', 'oracle db', 'oracle sql', 'oracle pl/sql'],
    'sqlite': ['sqlite database', 'sqlite db', 'sqlite3'],
    'mariadb': ['mariadb database', 'mariadb db', 'mysql fork'],
    'neo4j': ['neo4j database', 'graph database', 'neo4j cypher'],
    'firebase': ['firebase database', 'google firebase', 'firestore', 'realtime database'],
    'supabase': ['supabase database', 'postgres firebase', 'supabase auth'],
    
    // Cloud & DevOps - Enhanced
    'aws': ['amazon web services', 'amazon aws', 'aws cloud', 'ec2', 's3', 'lambda', 'rds', 'dynamodb'],
    'azure': ['microsoft azure', 'azure cloud', 'azure devops', 'azure functions', 'azure sql'],
    'gcp': ['google cloud platform', 'google cloud', 'gcp cloud', 'google cloud functions', 'firebase'],
    'docker': ['docker container', 'dockerization', 'docker compose', 'docker swarm', 'kubernetes'],
    'kubernetes': ['k8s', 'kubernetes cluster', 'kubectl', 'helm', 'minikube'],
    'jenkins': ['jenkins ci', 'jenkins pipeline', 'jenkins automation'],
    'gitlab': ['gitlab ci', 'gitlab pipeline', 'gitlab runner'],
    'github': ['github actions', 'github ci', 'github workflows'],
    'bitbucket': ['bitbucket pipeline', 'bitbucket ci', 'bitbucket server'],
    'terraform': ['terraform iac', 'infrastructure as code', 'terraform cloud'],
    'ansible': ['ansible automation', 'ansible playbook', 'ansible tower'],
    'chef': ['chef automation', 'chef cookbook', 'chef server'],
    'puppet': ['puppet automation', 'puppet manifest', 'puppet enterprise'],
    'nginx': ['nginx server', 'nginx web server', 'nginx reverse proxy'],
    'apache': ['apache server', 'apache web server', 'httpd'],
    'linux': ['linux system', 'linux administration', 'ubuntu', 'centos', 'redhat'],
    'ubuntu': ['ubuntu linux', 'ubuntu server', 'ubuntu desktop'],
    'centos': ['centos linux', 'centos server', 'red hat enterprise'],
    
    // Tools & Platforms - Enhanced
    'git': ['git version control', 'git scm', 'github', 'gitlab', 'bitbucket'],
    'svn': ['subversion', 'svn version control', 'apache subversion'],
    'jira': ['atlassian jira', 'jira project management', 'jira agile', 'jira kanban'],
    'confluence': ['atlassian confluence', 'confluence wiki', 'confluence documentation'],
    'slack': ['slack communication', 'slack messaging', 'slack workspace'],
    'teams': ['microsoft teams', 'teams collaboration', 'teams chat'],
    'zoom': ['zoom video', 'zoom meeting', 'zoom webinar'],
    'figma': ['figma design', 'figma ui', 'figma prototyping'],
    'sketch': ['sketch design', 'sketch ui', 'sketch app'],
    'adobe': ['adobe creative suite', 'adobe photoshop', 'adobe illustrator', 'adobe xd'],
    'postman': ['postman api', 'postman testing', 'postman collections'],
    'swagger': ['swagger api', 'openapi', 'swagger ui', 'swagger documentation'],
    'graphql': ['graphql api', 'graphql query', 'apollo graphql', 'relay'],
    'rest': ['rest api', 'restful api', 'restful services', 'http api'],
    'soap': ['soap api', 'soap web service', 'soap protocol'],
    'microservices': ['microservice', 'micro service', 'microservice architecture'],
    'api': ['application programming interface', 'apis', 'web api', 'rest api'],
    'webpack': ['webpack bundler', 'webpack build', 'webpack 5', 'webpack 4'],
    'babel': ['babel transpiler', 'babel js', 'babel 7'],
    
    // Methodologies - Enhanced
    'agile': ['agile methodology', 'agile development', 'scrum', 'kanban', 'sprint'],
    'scrum': ['scrum methodology', 'scrum framework', 'sprint planning', 'daily standup'],
    'kanban': ['kanban board', 'kanban methodology', 'kanban flow'],
    'waterfall': ['waterfall methodology', 'waterfall model', 'traditional development'],
    'devops': ['devops culture', 'devops practices', 'devops pipeline', 'ci/cd'],
    'ci/cd': ['continuous integration', 'continuous deployment', 'cicd', 'continuous delivery'],
    'tdd': ['test driven development', 'test first development', 'test first'],
    'bdd': ['behavior driven development', 'behavioral testing', 'cucumber'],
    'pair programming': ['pair coding', 'paired programming', 'pair development'],
    'code review': ['peer review', 'code inspection', 'pull request review'],
    'version control': ['source control', 'revision control', 'git', 'svn'],
    'git flow': ['gitflow', 'git workflow', 'feature branches', 'release branches'],
    'trunk based development': ['trunk development', 'mainline development'],
    
    // Soft Skills - Enhanced
    'leadership': ['lead', 'leading', 'leader', 'team lead', 'technical lead', 'project lead'],
    'communication': ['communicate', 'communicating', 'verbal communication', 'written communication', 'presentation', 'public speaking'],
    'teamwork': ['team work', 'collaboration', 'collaborative', 'team player', 'cross-functional'],
    'problem solving': ['problem-solving', 'analytical thinking', 'critical thinking', 'troubleshooting', 'debugging'],
    'critical thinking': ['analytical thinking', 'logical thinking', 'problem analysis'],
    'analytical': ['analysis', 'analytical skills', 'data analysis', 'business analysis'],
    'project management': ['project manager', 'pm', 'project planning', 'agile project management'],
    'stakeholder management': ['stakeholder', 'stakeholders', 'client management', 'vendor management'],
    'mentoring': ['mentor', 'mentoring others', 'coaching', 'knowledge sharing'],
    'presentation': ['presenting', 'public speaking', 'presentation skills', 'demo'],
    'negotiation': ['negotiating', 'negotiation skills', 'contract negotiation'],
    'time management': ['time planning', 'scheduling', 'deadline management', 'prioritization'],
    'organization': ['organizational skills', 'organized', 'planning', 'coordination'],
    'adaptability': ['adaptive', 'flexible', 'adapting', 'change management'],
    'creativity': ['creative', 'creative thinking', 'innovation', 'design thinking'],
    'innovation': ['innovative', 'innovating', 'creative', 'new ideas'],
    
    // Business & Domain - Enhanced
    'e-commerce': ['ecommerce', 'online retail', 'digital commerce', 'online shopping', 'b2c'],
    'fintech': ['financial technology', 'fintech industry', 'payments', 'banking', 'insurance'],
    'healthcare': ['health care', 'medical', 'healthcare industry', 'hipaa', 'medical software'],
    'education': ['educational', 'learning', 'academic', 'edtech', 'learning management'],
    'retail': ['retail industry', 'retail business', 'point of sale', 'pos'],
    'logistics': ['supply chain', 'logistics management', 'warehouse management', 'inventory'],
    'manufacturing': ['manufacturing industry', 'production', 'industrial', 'automation'],
    'marketing': ['digital marketing', 'marketing strategy', 'seo', 'sem', 'social media'],
    'sales': ['sales strategy', 'sales management', 'crm', 'lead generation'],
    'customer service': ['customer support', 'customer care', 'help desk', 'support'],
    'data analysis': ['data analytics', 'analytics', 'data science', 'business intelligence', 'predictive modeling', 'statistical analysis'],
    'business intelligence': ['bi', 'business analytics', 'data insights', 'reporting'],
    'erp': ['enterprise resource planning', 'erp system', 'sap', 'oracle erp'],
    'crm': ['customer relationship management', 'crm system', 'salesforce', 'hubspot'],
    'hr': ['human resources', 'hr management', 'human resource', 'recruitment', 'talent management'],
    'accounting': ['accounting software', 'financial accounting', 'bookkeeping', 'quickbooks'],
    'finance': ['financial', 'financial management', 'financial analysis', 'budgeting'],
    'legal': ['legal compliance', 'legal requirements', 'regulatory', 'compliance'],
    'compliance': ['regulatory compliance', 'compliance management', 'gdpr', 'sox'],
    'security': ['cybersecurity', 'information security', 'it security', 'network security'],
    'privacy': ['data privacy', 'privacy protection', 'gdpr', 'ccpa', 'data protection'],
    
    // User Experience & Design - Enhanced
    'user experience': ['ux', 'user experience design', 'ux design', 'usability', 'user centered design'],
    'user interface': ['ui', 'user interface design', 'ui design', 'interface design'],
    'user research': ['ux research', 'user testing', 'usability testing', 'user interviews'],
    'wireframing': ['wireframes', 'prototyping', 'mockups', 'sketching'],
    'visual design': ['graphic design', 'visual communication', 'brand design', 'typography'],
    'interaction design': ['ixd', 'interaction design', 'micro-interactions', 'animations'],
    
    // Search & SEO - Enhanced
    'search engine optimization': ['seo', 'search optimization', 'organic search', 'keyword optimization'],
    'search engine marketing': ['sem', 'paid search', 'google ads', 'ppc'],
    'content marketing': ['content strategy', 'content creation', 'blogging', 'copywriting'],
    'social media marketing': ['social media', 'social marketing', 'facebook ads', 'instagram ads'],
    
    // Version Control & Collaboration - Enhanced
    'git flow': ['gitflow', 'git workflow', 'feature branches', 'release branches'],
    'trunk based development': ['trunk development', 'mainline development'],
    'code review': ['peer review', 'code inspection', 'pull request review', 'pr review'],
    'pair programming': ['pair coding', 'paired programming', 'pair development', 'mob programming'],
    
    // Testing & Quality Assurance - Enhanced
    'unit testing': ['unit tests', 'junit', 'jest', 'mocha', 'pytest'],
    'integration testing': ['integration tests', 'api testing', 'end-to-end testing'],
    'test automation': ['automated testing', 'selenium', 'cypress', 'playwright'],
    'manual testing': ['manual qa', 'quality assurance', 'bug testing'],
    'performance testing': ['load testing', 'stress testing', 'jmeter', 'k6'],
    'security testing': ['penetration testing', 'vulnerability assessment', 'owasp'],
    
    // Mobile Development - Enhanced
    'ios development': ['ios', 'iphone development', 'swift', 'objective-c', 'xcode'],
    'android development': ['android', 'kotlin', 'java android', 'android studio'],
    'react native': ['react native', 'mobile development', 'cross-platform'],
    'flutter': ['flutter development', 'dart', 'google flutter'],
    'xamarin': ['xamarin forms', 'c# mobile', 'microsoft xamarin'],
    
    // Blockchain & Web3 - Enhanced
    'blockchain': ['blockchain development', 'ethereum', 'bitcoin', 'smart contracts'],
    'web3': ['web 3.0', 'decentralized', 'defi', 'nft', 'cryptocurrency'],
    'solidity': ['ethereum smart contracts', 'blockchain programming'],
    'ethereum': ['eth', 'ethereum development', 'smart contracts'],
    
    // Emerging Technologies - Enhanced
    'internet of things': ['iot', 'connected devices', 'smart devices', 'sensors'],
    'augmented reality': ['ar', 'augmented reality', 'arkit', 'arcore'],
    'virtual reality': ['vr', 'virtual reality', 'oculus', 'htc vive'],
    'robotics': ['robotics programming', 'automation', 'industrial robots'],
    'quantum computing': ['quantum', 'quantum algorithms', 'quantum programming'],
    
    // Data & Analytics Tools - Enhanced
    'tableau': ['tableau desktop', 'tableau server', 'tableau specialist', 'tableau public', 'tableau prep'],
    'excel': ['data entry', 'spreadsheets', 'pivot tables', 'microsoft excel', 'excel vba', 'excel macros'],
    'power bi': ['powerbi', 'microsoft power bi', 'business intelligence', 'data visualization'],
    'sas': ['sas programming', 'statistical analysis system', 'sas enterprise miner'],
    'spss': ['ibm spss', 'statistical package', 'statistical analysis'],
    'r studio': ['rstudio', 'r programming', 'statistical computing'],
    'matplotlib': ['python plotting', 'data visualization', 'scientific plotting'],
    'seaborn': ['python visualization', 'statistical graphics', 'matplotlib wrapper'],
    'plotly': ['interactive plots', 'dash', 'python visualization'],
    'd3.js': ['d3', 'data visualization', 'javascript charts'],
    
    // Additional Business Tools
    'salesforce': ['crm', 'salesforce crm', 'salesforce admin', 'apex', 'soql'],
    'hubspot': ['inbound marketing', 'crm platform', 'marketing automation'],
    'zendesk': ['customer support', 'help desk', 'ticket system'],
    'trello': ['project management', 'kanban boards', 'task management'],
    'asana': ['project management', 'team collaboration', 'work management'],
    'notion': ['workspace', 'documentation', 'knowledge management'],
    'confluence': ['documentation', 'knowledge base', 'team collaboration'],
    'jira': ['project management', 'issue tracking', 'agile development'],
    'monday.com': ['work management', 'project tracking', 'team collaboration']
  };

  // Industry context multipliers for different sectors
  private static readonly INDUSTRY_MULTIPLIERS: Record<string, Record<string, number>> = {
    'fintech': { 
      'security': 1.5, 'compliance': 1.3, 'testing': 1.2, 'blockchain': 1.4, 
      'payments': 1.4, 'risk management': 1.3, 'regulatory': 1.3, 'audit': 1.2 
    },
    'healthcare': { 
      'hipaa': 2.0, 'security': 1.4, 'privacy': 1.3, 'compliance': 1.3, 
      'medical software': 1.4, 'clinical systems': 1.3, 'telemedicine': 1.2 
    },
    'e-commerce': { 
      'scalability': 1.3, 'payments': 1.4, 'analytics': 1.2, 'user experience': 1.3,
      'inventory management': 1.2, 'order processing': 1.2, 'customer service': 1.2 
    },
    'startup': { 
      'full-stack': 1.3, 'adaptability': 1.2, 'mvp': 1.2, 'rapid prototyping': 1.2,
      'lean development': 1.2, 'agile': 1.2, 'scalability': 1.3 
    },
    'enterprise': { 
      'enterprise architecture': 1.4, 'integration': 1.3, 'legacy systems': 1.2,
      'compliance': 1.3, 'security': 1.3, 'scalability': 1.3, 'documentation': 1.2 
    },
    'gaming': { 
      'game development': 1.5, 'unity': 1.4, 'unreal engine': 1.4, '3d graphics': 1.3,
      'game design': 1.3, 'performance optimization': 1.3, 'user experience': 1.2 
    },
    'education': { 
      'learning management systems': 1.4, 'edtech': 1.3, 'accessibility': 1.3,
      'user experience': 1.2, 'analytics': 1.2, 'content management': 1.2 
    },
    'automotive': { 
      'embedded systems': 1.4, 'iot': 1.3, 'safety systems': 1.4, 'real-time': 1.3,
      'automotive software': 1.3, 'testing': 1.3, 'compliance': 1.2 
    }
  };

  // Skill weights for granular scoring
  private static readonly SKILL_WEIGHTS: Record<string, number> = {
    // High-value skills (weight: 3)
    'kubernetes': 3, 'docker': 3, 'terraform': 3, 'aws': 3, 'azure': 3, 'gcp': 3,
    'machine learning': 3, 'ai': 3, 'data science': 3, 'cybersecurity': 3,
    'microservices': 3, 'graphql': 3, 'elasticsearch': 3, 'redis': 3,
    
    // Medium-value skills (weight: 2)
    'react': 2, 'angular': 2, 'vue': 2, 'node.js': 2, 'python': 2, 'java': 2,
    'typescript': 2, 'mongodb': 2, 'postgresql': 2, 'mysql': 2, 'git': 2,
    'jenkins': 2, 'devops': 2, 'ci/cd': 2, 'agile': 2, 'scrum': 2,
    'leadership': 2, 'project management': 2, 'data analysis': 2,
    
    // Standard skills (weight: 1)
    'javascript': 1, 'css': 1, 'html': 1, 'jquery': 1, 'bootstrap': 1,
    'tailwind': 1, 'express': 1, 'django': 1, 'flask': 1, 'spring': 1,
    'laravel': 1, 'rails': 1, 'sql': 1, 'gitlab': 1, 'github': 1,
    'nginx': 1, 'apache': 1, 'linux': 1, 'ubuntu': 1, 'centos': 1,
    'jira': 1, 'confluence': 1, 'slack': 1, 'teams': 1, 'figma': 1,
    'postman': 1, 'swagger': 1, 'rest': 1, 'api': 1, 'webpack': 1,
    'babel': 1, 'tdd': 1, 'bdd': 1, 'code review': 1, 'version control': 1,
    'communication': 1, 'teamwork': 1, 'problem solving': 1, 'analytical': 1,
    'time management': 1, 'organization': 1, 'adaptability': 1, 'creativity': 1,
    'innovation': 1, 'e-commerce': 1, 'fintech': 1, 'healthcare': 1,
    'education': 1, 'retail': 1, 'logistics': 1, 'manufacturing': 1,
    'marketing': 1, 'sales': 1, 'customer service': 1, 'business intelligence': 1,
    'erp': 1, 'crm': 1, 'hr': 1, 'accounting': 1, 'finance': 1,
    'legal': 1, 'compliance': 1, 'security': 1, 'privacy': 1
  };

  // Soft skills for role fit bonus
  private static readonly SOFT_SKILLS = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
    'analytical', 'project management', 'stakeholder management', 'mentoring',
    'presentation', 'negotiation', 'time management', 'organization', 'adaptability',
    'creativity', 'innovation', 'initiative', 'collaboration', 'interpersonal',
    'emotional intelligence', 'conflict resolution', 'decision making', 'strategic thinking'
  ];

  // Role personas for better matching
  private static readonly ROLE_PERSONAS = {
    'developer': ['programming', 'coding', 'development', 'software engineer', 'full stack', 'frontend', 'backend'],
    'analyst': ['analysis', 'analytics', 'data analysis', 'business analyst', 'data analyst', 'reporting'],
    'manager': ['management', 'leadership', 'project manager', 'team lead', 'supervisor', 'director'],
    'designer': ['design', 'ui', 'ux', 'user interface', 'user experience', 'visual design', 'graphic design'],
    'devops': ['devops', 'infrastructure', 'deployment', 'ci/cd', 'automation', 'cloud', 'kubernetes', 'docker'],
    'qa': ['testing', 'quality assurance', 'test automation', 'manual testing', 'qa engineer'],
    'data': ['data science', 'machine learning', 'ai', 'data engineering', 'data analyst', 'bi']
  };

  private static readonly SKILL_KEYWORDS = [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    'scala', 'r', 'matlab', 'perl', 'bash', 'powershell', 'sql', 'html', 'css', 'sass', 'less',
    
    // Frameworks & Libraries
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'rails',
    'bootstrap', 'tailwind', 'material-ui', 'antd', 'jquery', 'lodash', 'moment', 'axios',
    
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'oracle',
    'sqlite', 'mariadb', 'neo4j', 'firebase', 'supabase',
    
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'bitbucket',
    'terraform', 'ansible', 'chef', 'puppet', 'nginx', 'apache', 'linux', 'ubuntu', 'centos',
    
    // Tools & Platforms
    'git', 'svn', 'jira', 'confluence', 'slack', 'teams', 'zoom', 'figma', 'sketch', 'adobe',
    'postman', 'swagger', 'graphql', 'rest', 'soap', 'microservices', 'api', 'webpack', 'babel',
    
    // Methodologies
    'agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd', 'tdd', 'bdd', 'pair programming',
    'code review', 'version control', 'git flow', 'trunk based development',
    
    // Soft Skills
    'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking', 'analytical',
    'project management', 'stakeholder management', 'mentoring', 'presentation', 'negotiation',
    'time management', 'organization', 'adaptability', 'creativity', 'innovation',
    
    // Business & Domain
    'e-commerce', 'fintech', 'healthcare', 'education', 'retail', 'logistics', 'manufacturing',
    'marketing', 'sales', 'customer service', 'data analysis', 'business intelligence', 'erp',
    'crm', 'hr', 'accounting', 'finance', 'legal', 'compliance', 'security', 'privacy'
  ];

  private static readonly EXPERIENCE_KEYWORDS = [
    'years', 'experience', 'senior', 'junior', 'lead', 'manager', 'director', 'vp', 'cto', 'ceo',
    'architect', 'engineer', 'developer', 'analyst', 'consultant', 'specialist', 'coordinator',
    'supervisor', 'team lead', 'project manager', 'product manager', 'scrum master', 'agile coach'
  ];

  private static readonly EDUCATION_KEYWORDS = [
    'bachelor', 'master', 'phd', 'degree', 'diploma', 'certificate', 'certification', 'course',
    'university', 'college', 'institute', 'school', 'academy', 'bootcamp', 'training'
  ];

  // Market demand multipliers for high-demand and emerging skills
  private static readonly MARKET_DEMAND_MULTIPLIERS: Record<string, number> = {
    // High-demand skills (1.2x multiplier)
    'kubernetes': 1.2, 'terraform': 1.2, 'react': 1.2, 'python': 1.2, 'aws': 1.2,
    'typescript': 1.2, 'node.js': 1.2, 'docker': 1.2, 'mongodb': 1.2, 'postgresql': 1.2,
    'machine learning': 1.2, 'ai': 1.2, 'data science': 1.2, 'cybersecurity': 1.2,
    'devops': 1.2, 'ci/cd': 1.2, 'microservices': 1.2, 'graphql': 1.2,
    
    // Emerging skills (1.1x multiplier)
    'blockchain': 1.1, 'web3': 1.1, 'solidity': 1.1, 'ethereum': 1.1,
    'flutter': 1.1, 'react native': 1.1, 'vue': 1.1, 'next.js': 1.1,
    'elasticsearch': 1.1, 'redis': 1.1, 'kafka': 1.1, 'apache spark': 1.1,
    'tensorflow': 1.1, 'pytorch': 1.1, 'opencv': 1.1, 'nlp': 1.1,
    'iot': 1.1, 'ar': 1.1, 'vr': 1.1, 'quantum computing': 1.1
  };

  // Job title hierarchy for seniority matching
  private static readonly TITLE_HIERARCHY: Record<string, number> = {
    'intern': 0, 'junior': 1, 'entry': 1, 'associate': 2, 'mid': 3, 'intermediate': 3,
    'senior': 4, 'lead': 5, 'principal': 6, 'staff': 6, 'architect': 7, 'director': 8,
    'vp': 9, 'vice president': 9, 'cto': 10, 'chief technology officer': 10
  };

  // Red flags patterns for negative scoring
  private static readonly RED_FLAGS = [
    { pattern: /\bgap.{0,20}(year|month|employment)\b/i, penalty: -5, reason: 'Employment gap mentioned' },
    { pattern: /\b(fired|terminated|laid.off|dismissed)\b/i, penalty: -10, reason: 'Negative employment language' },
    { pattern: /\b(too many jobs|job hopping|frequent changes)\b/i, penalty: -8, reason: 'Job hopping pattern' },
    { pattern: /\bovertime.{0,10}expected\b/i, penalty: -3, reason: 'Work-life balance concerns' },
    { pattern: /\b(conflict|dispute|disagreement).{0,20}(employer|manager|team)\b/i, penalty: -7, reason: 'Workplace conflict mentioned' },
    { pattern: /\b(forced|involuntary|unwilling).{0,20}(resign|leave|quit)\b/i, penalty: -9, reason: 'Involuntary departure' },
    { pattern: /\b(performance issues|underperformed|struggled)\b/i, penalty: -6, reason: 'Performance concerns' },
    { pattern: /\b(overqualified|too experienced|bored)\b/i, penalty: -4, reason: 'Overqualification concerns' }
  ];

  // Enhanced soft skills indicators with quantified achievements
  private static readonly SOFT_SKILLS_INDICATORS = {
    leadership: [
      'led team of', 'managed', 'supervised', 'mentored', 'directed',
      'increased team productivity', 'cross-functional collaboration',
      'team lead', 'technical lead', 'project lead', 'scrum master'
    ],
    problemSolving: [
      'solved', 'optimized', 'improved', 'reduced costs', 'enhanced',
      'troubleshot', 'debugged', 'enhanced performance', 'streamlined',
      'automated', 'eliminated', 'resolved', 'fixed'
    ],
    communication: [
      'presented to', 'collaborated with', 'liaised with', 'coordinated',
      'documented', 'trained', 'public speaking', 'presentation',
      'client communication', 'stakeholder management', 'cross-team'
    ],
    analytical: [
      'analyzed', 'researched', 'investigated', 'evaluated', 'assessed',
      'data analysis', 'market research', 'performance analysis',
      'root cause analysis', 'trend analysis'
    ],
    innovation: [
      'innovated', 'created', 'developed', 'designed', 'architected',
      'pioneered', 'introduced', 'implemented', 'launched', 'built'
    ],
    adaptability: [
      'adapted', 'learned', 'transitioned', 'migrated', 'upgraded',
      'quick learner', 'fast learner', 'new technology', 'new framework'
    ]
  };

  // Skill transferability mapping for better matching
  private static readonly SKILL_TRANSFERABILITY: Record<string, string[]> = {
    // Programming languages transferability
    'javascript': ['typescript', 'coffeescript', 'dart'],
    'typescript': ['javascript', 'coffeescript', 'dart'],
    'python': ['ruby', 'perl', 'php', 'go'],
    'java': ['c#', 'kotlin', 'scala', 'groovy'],
    'c#': ['java', 'vb.net', 'f#'],
    'c++': ['c', 'rust', 'go'],
    'php': ['python', 'ruby', 'perl'],
    'ruby': ['python', 'php', 'perl'],
    'go': ['rust', 'c++', 'python'],
    'rust': ['c++', 'go', 'c'],
    
    // Framework transferability
    'react': ['vue', 'angular', 'svelte'],
    'vue': ['react', 'angular', 'svelte'],
    'angular': ['react', 'vue', 'svelte'],
    'node.js': ['python', 'ruby', 'php'],
    'express': ['fastify', 'koa', 'hapi'],
    'django': ['flask', 'fastapi', 'rails'],
    'flask': ['django', 'fastapi', 'express'],
    'spring': ['laravel', 'rails', 'django'],
    'laravel': ['spring', 'rails', 'django'],
    'rails': ['django', 'laravel', 'spring'],
    
    // Database transferability
    'mysql': ['postgresql', 'mariadb', 'sqlite'],
    'postgresql': ['mysql', 'mariadb', 'oracle'],
    'mongodb': ['couchdb', 'dynamodb', 'firebase'],
    'redis': ['memcached', 'hazelcast', 'couchbase'],
    'elasticsearch': ['solr', 'opensearch', 'meilisearch'],
    
    // Cloud platform transferability
    'aws': ['azure', 'gcp', 'digitalocean'],
    'azure': ['aws', 'gcp', 'digitalocean'],
    'gcp': ['aws', 'azure', 'digitalocean'],
    'docker': ['podman', 'containerd', 'lxc'],
    'kubernetes': ['docker swarm', 'nomad', 'rancher'],
    
    // Tool transferability
    'git': ['svn', 'mercurial', 'fossil'],
    'jenkins': ['gitlab ci', 'github actions', 'circleci'],
    'jira': ['asana', 'trello', 'monday.com'],
    'figma': ['sketch', 'adobe xd', 'invision'],
    'postman': ['insomnia', 'thunder client', 'rest client'],
    
    // Methodology transferability
    'agile': ['scrum', 'kanban', 'lean'],
    'scrum': ['agile', 'kanban', 'xp'],
    'kanban': ['agile', 'scrum', 'lean'],
    'devops': ['sre', 'platform engineering', 'gitops'],
    'tdd': ['bdd', 'atdd', 'test first'],
    'bdd': ['tdd', 'atdd', 'specification by example']
  };

  /**
   * Parse resume file and extract structured data
   */
  static async parseResume(file: File): Promise<ParsedResume> {
    const text = await this.extractText(file);
    const sections = this.extractSections(text);
    const extractedData = this.extractStructuredData(text, sections);

    return {
      text,
      sections,
      extractedData
    };
  }

  /**
   * Extract text from different file formats
   */
  private static async extractText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let text = '';
          
          if (file.type === 'text/plain') {
            text = e.target?.result as string;
          } else if (file.type === 'application/pdf') {
            // For PDF files, we'd need a PDF parsing library
            // For now, return a mock response
            text = this.getMockResumeText();
          } else if (file.type === 'application/msword' || 
                     file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // For Word documents, we'd need a DOC parsing library
            // For now, return a mock response
            text = this.getMockResumeText();
          } else {
            text = e.target?.result as string;
          }
          
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Extract sections from resume text
   */
  private static extractSections(text: string): ParsedResume['sections'] {
    const sections: ParsedResume['sections'] = {};
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentSection = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Detect section headers
      if (lowerLine.includes('contact') || lowerLine.includes('personal')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof ParsedResume['sections']] = currentContent.join('\n');
        }
        currentSection = 'contact';
        currentContent = [];
      } else if (lowerLine.includes('summary') || lowerLine.includes('objective') || lowerLine.includes('profile')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof ParsedResume['sections']] = currentContent.join('\n');
        }
        currentSection = 'summary';
        currentContent = [];
      } else if (lowerLine.includes('experience') || lowerLine.includes('work history')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof ParsedResume['sections']] = currentContent.join('\n');
        }
        currentSection = 'experience';
        currentContent = [];
      } else if (lowerLine.includes('education') || lowerLine.includes('academic')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof ParsedResume['sections']] = currentContent.join('\n');
        }
        currentSection = 'education';
        currentContent = [];
      } else if (lowerLine.includes('skills') || lowerLine.includes('technologies')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof ParsedResume['sections']] = currentContent.join('\n');
        }
        currentSection = 'skills';
        currentContent = [];
      } else if (lowerLine.includes('projects') || lowerLine.includes('portfolio')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof ParsedResume['sections']] = currentContent.join('\n');
        }
        currentSection = 'projects';
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    
    // Add the last section
    if (currentSection && currentContent.length > 0) {
      sections[currentSection as keyof ParsedResume['sections']] = currentContent.join('\n');
    }
    
    return sections;
  }

  /**
   * Extract structured data from resume
   */
  private static extractStructuredData(text: string, sections: ParsedResume['sections']): ParsedResume['extractedData'] {
    const extractedData: ParsedResume['extractedData'] = {
      skills: [],
      experience: [],
      education: []
    };

    // Extract skills
    const skillsText = sections.skills || text;
    extractedData.skills = this.extractKeywords(skillsText, this.SKILL_KEYWORDS);

    // Extract experience keywords
    const experienceText = sections.experience || text;
    extractedData.experience = this.extractKeywords(experienceText, this.EXPERIENCE_KEYWORDS);

    // Extract education keywords
    const educationText = sections.education || text;
    extractedData.education = this.extractKeywords(educationText, this.EDUCATION_KEYWORDS);

    // Extract contact information
    const contactText = sections.contact || text;
    extractedData.name = this.extractName(contactText);
    extractedData.email = this.extractEmail(contactText);
    extractedData.phone = this.extractPhone(contactText);

    return extractedData;
  }

  /**
   * Extract keywords from text with fuzzy matching and synonym support
   */
  private static extractKeywords(text: string, keywordList: string[]): string[] {
    const textLower = text.toLowerCase();
    const foundKeywords = new Set<string>();
    
    // First pass: exact matches
    for (const keyword of keywordList) {
      if (textLower.includes(keyword.toLowerCase())) {
        foundKeywords.add(keyword);
      }
    }
    
    // Second pass: synonym matches
    for (const [mainSkill, synonyms] of Object.entries(this.SKILL_SYNONYMS)) {
      if (foundKeywords.has(mainSkill)) continue; // Already found
      
      for (const synonym of synonyms) {
        if (textLower.includes(synonym.toLowerCase())) {
          foundKeywords.add(mainSkill);
          break;
        }
      }
    }
    
    // Third pass: fuzzy matching for close matches
    for (const keyword of keywordList) {
      if (foundKeywords.has(keyword)) continue; // Already found
      
      const similarity = this.calculateSimilarity(textLower, keyword.toLowerCase());
      if (similarity > 0.8) { // 80% similarity threshold
        foundKeywords.add(keyword);
      }
    }
    
    return Array.from(foundKeywords);
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
  }

  /**
   * Extract name from contact section
   */
  private static extractName(text: string): string | undefined {
    // Simple name extraction - in a real app, use NLP libraries
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.match(/^[A-Z][a-z]+ [A-Z][a-z]+/)) {
        return line.trim();
      }
    }
    return undefined;
  }

  /**
   * Extract email from contact section
   */
  private static extractEmail(text: string): string | undefined {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0] : undefined;
  }

  /**
   * Extract phone from contact section
   */
  private static extractPhone(text: string): string | undefined {
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const match = text.match(phoneRegex);
    return match ? match[0] : undefined;
  }

  /**
   * Parse job description and extract keywords with requirements analysis
   */
  static parseJobDescription(text: string): JobDescription {
    const keywords = this.extractKeywords(text, this.SKILL_KEYWORDS);
    const requirements = this.extractRequirements(text);
    const responsibilities = this.extractResponsibilities(text);
    
    // Analyze required vs preferred skills
    const { requiredSkills, preferredSkills } = this.categorizeSkills(text, keywords);
    
    // Determine experience level
    const experienceLevel = this.determineExperienceLevel(text);
    
    // Determine education level
    const educationLevel = this.determineEducationLevel(text);

    return {
      text,
      keywords,
      requirements,
      responsibilities,
      requiredSkills,
      preferredSkills,
      experienceLevel,
      educationLevel
    };
  }

  /**
   * Categorize skills as required vs preferred based on job description language
   */
  private static categorizeSkills(text: string, keywords: string[]): { requiredSkills: string[], preferredSkills: string[] } {
    const textLower = text.toLowerCase();
    const requiredSkills: string[] = [];
    const preferredSkills: string[] = [];

    const requiredPhrases = [
      'required', 'must have', 'must possess', 'essential', 'mandatory', 'prerequisite',
      'minimum requirements', 'required skills', 'must know', 'required experience'
    ];

    const preferredPhrases = [
      'preferred', 'nice to have', 'bonus', 'plus', 'advantageous', 'desired',
      'would be great', 'helpful', 'beneficial', 'ideal'
    ];

    for (const keyword of keywords) {
      // Check if keyword appears near required phrases
      const keywordIndex = textLower.indexOf(keyword);
      if (keywordIndex !== -1) {
        const surroundingText = textLower.substring(Math.max(0, keywordIndex - 100), keywordIndex + 100);
        
        const isRequired = requiredPhrases.some(phrase => surroundingText.includes(phrase));
        const isPreferred = preferredPhrases.some(phrase => surroundingText.includes(phrase));
        
        if (isRequired) {
          requiredSkills.push(keyword);
        } else if (isPreferred) {
          preferredSkills.push(keyword);
        } else {
          // Default to required if no clear indication
          requiredSkills.push(keyword);
        }
      }
    }

    return { requiredSkills, preferredSkills };
  }

  /**
   * Determine experience level from job description
   */
  private static determineExperienceLevel(text: string): 'entry' | 'mid' | 'senior' | 'lead' {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('senior') || textLower.includes('lead') || textLower.includes('principal')) {
      return 'senior';
    } else if (textLower.includes('mid') || textLower.includes('intermediate') || textLower.includes('3+ years')) {
      return 'mid';
    } else if (textLower.includes('entry') || textLower.includes('junior') || textLower.includes('0-2 years')) {
      return 'entry';
    } else {
      return 'mid'; // Default
    }
  }

  /**
   * Determine education level from job description
   */
  private static determineEducationLevel(text: string): 'high-school' | 'bachelor' | 'master' | 'phd' {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('phd') || textLower.includes('doctorate')) {
      return 'phd';
    } else if (textLower.includes('master') || textLower.includes('ms') || textLower.includes('mba')) {
      return 'master';
    } else if (textLower.includes('bachelor') || textLower.includes('bs') || textLower.includes('ba')) {
      return 'bachelor';
    } else {
      return 'bachelor'; // Default
    }
  }

  /**
   * Extract requirements from job description
   */
  private static extractRequirements(text: string): string[] {
    const requirements: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('requirements') || lowerLine.includes('qualifications') || 
          lowerLine.includes('must have') || lowerLine.includes('should have')) {
        requirements.push(line.trim());
      }
    }
    
    return requirements;
  }

  /**
   * Extract responsibilities from job description
   */
  private static extractResponsibilities(text: string): string[] {
    const responsibilities: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('responsibilities') || lowerLine.includes('duties') || 
          lowerLine.includes('will') || lowerLine.includes('develop') || lowerLine.includes('design')) {
        responsibilities.push(line.trim());
      }
    }
    
    return responsibilities;
  }

  /**
   * Analyze keyword matching between resume and job description with enhanced features
   */
  static analyzeKeywords(resume: ParsedResume, jobDescription: JobDescription): KeywordAnalysis {
    const resumeText = resume.text.toLowerCase();
    const jobText = jobDescription.text.toLowerCase();
    
    // Extract all skills from resume
    const resumeSkills = this.extractKeywords(resumeText, this.SKILL_KEYWORDS);
    
    // Extract required and preferred skills from job description
    const requiredSkills = jobDescription.requiredSkills.map(skill => skill.toLowerCase());
    const preferredSkills = jobDescription.preferredSkills.map(skill => skill.toLowerCase());
    
    // Enhanced matching with transferable skills
    const matchedRequired: string[] = [];
    const matchedPreferred: string[] = [];
    const missingRequired: string[] = [];
    const missingPreferred: string[] = [];
    
    // Check required skills with transferable skills support
    requiredSkills.forEach(skill => {
      let matchFound = false;
      let matchScore = 0;
      
      // Direct match
      if (resumeSkills.some(resumeSkill => resumeSkill.toLowerCase() === skill)) {
        matchedRequired.push(skill);
        matchFound = true;
        matchScore = 1.0;
      } else {
        // Check transferable skills
        const transferableScore = this.hasTransferableSkill(resumeSkills, skill);
        if (transferableScore > 0) {
          matchedRequired.push(`${skill} (transferable)`);
          matchFound = true;
          matchScore = transferableScore;
        }
      }
      
      if (!matchFound) {
        missingRequired.push(skill);
      }
    });
    
    // Check preferred skills with transferable skills support
    preferredSkills.forEach(skill => {
      let matchFound = false;
      
      // Direct match
      if (resumeSkills.some(resumeSkill => resumeSkill.toLowerCase() === skill)) {
        matchedPreferred.push(skill);
        matchFound = true;
      } else {
        // Check transferable skills
        const transferableScore = this.hasTransferableSkill(resumeSkills, skill);
        if (transferableScore > 0) {
          matchedPreferred.push(`${skill} (transferable)`);
          matchFound = true;
        }
      }
      
      if (!matchFound) {
        missingPreferred.push(skill);
      }
    });
    
    // Calculate scores with transferable skills consideration
    const requiredSkillsScore = requiredSkills.length > 0 
      ? (matchedRequired.length / requiredSkills.length) * 100 
      : 100;
    
    const preferredSkillsScore = preferredSkills.length > 0 
      ? (matchedPreferred.length / preferredSkills.length) * 100 
      : 100;
    
    // Enhanced suggestions with transferable skills
    const suggestions = this.generateStrictSuggestions(
      [...missingRequired, ...missingPreferred], 
      resumeSkills, 
      jobDescription
    );
    
    // Extract soft skills and role persona
    const softSkillsMatched = this.extractSoftSkills(resume);
    const rolePersona = this.determineRolePersona(resume);
    const contextualSkills = this.extractSkillsWithContext(resume);
    
    // Generate comprehensive feedback
    const feedback: string[] = [];
    
    if (missingRequired.length > 0) {
      feedback.push(`Missing ${missingRequired.length} required skills: ${missingRequired.join(', ')}`);
    }
    
    if (matchedRequired.length > 0) {
      feedback.push(`Matched ${matchedRequired.length} required skills: ${matchedRequired.join(', ')}`);
    }
    
    if (missingPreferred.length > 0) {
      feedback.push(`Missing ${missingPreferred.length} preferred skills: ${missingPreferred.join(', ')}`);
    }
    
    if (matchedPreferred.length > 0) {
      feedback.push(`Matched ${matchedPreferred.length} preferred skills: ${matchedPreferred.join(', ')}`);
    }
    
    // Add transferable skills feedback
    const transferableMatches = [...matchedRequired, ...matchedPreferred].filter(skill => skill.includes('(transferable)'));
    if (transferableMatches.length > 0) {
      feedback.push(`Transferable skills detected: ${transferableMatches.length} skills can be adapted`);
    }
    
    // Add soft skills feedback
    if (softSkillsMatched.length > 0) {
      feedback.push(`Soft skills identified: ${softSkillsMatched.join(', ')}`);
    }
    
    // Add role persona feedback
    feedback.push(`Role persona: ${rolePersona}`);
    
    return {
      matched: [...matchedRequired, ...matchedPreferred],
      missing: [...missingRequired, ...missingPreferred],
      score: Math.round((requiredSkillsScore * 0.7) + (preferredSkillsScore * 0.3)),
      suggestions,
      requiredSkillsMatched: matchedRequired.length,
      preferredSkillsMatched: matchedPreferred.length,
      totalRequiredSkills: requiredSkills.length,
      totalPreferredSkills: preferredSkills.length,
      feedback,
      softSkillsMatched,
      rolePersona,
      contextualSkills
    };
  }

  /**
   * Generate strict improvement suggestions
   */
  private static generateStrictSuggestions(missingKeywords: string[], currentSkills: string[], jobDescription: JobDescription): string[] {
    const suggestions: string[] = [];
    
    // Check required skills gap
    const missingRequired = jobDescription.requiredSkills.filter(skill => !currentSkills.includes(skill));
    if (missingRequired.length > 0) {
      suggestions.push(`CRITICAL: Add these required skills: ${missingRequired.slice(0, 3).join(', ')}`);
    }
    
    // Check preferred skills gap
    const missingPreferred = jobDescription.preferredSkills.filter(skill => !currentSkills.includes(skill));
    if (missingPreferred.length > 0) {
      suggestions.push(`Add these preferred skills: ${missingPreferred.slice(0, 3).join(', ')}`);
    }
    
    // Experience level mismatch
    if (jobDescription.experienceLevel === 'senior' && currentSkills.length < 15) {
      suggestions.push('Resume lacks senior-level skills and experience depth');
    }
    
    if (jobDescription.experienceLevel === 'entry' && currentSkills.length > 20) {
      suggestions.push('Resume may be overqualified for entry-level position');
    }
    
    // General improvements
    if (currentSkills.length < 8) {
      suggestions.push('Add more technical skills to your resume');
    }
    
    suggestions.push('Include quantifiable achievements and metrics');
    suggestions.push('Highlight relevant project experience');
    
    return suggestions;
  }

  /**
   * Calculate comprehensive ATS score with enhanced features and soft skills bonus
   */
  static calculateATSScore(resume: ParsedResume, jobDescription: JobDescription): number {
    const keywordAnalysis = this.analyzeKeywords(resume, jobDescription);
    
    // REBALANCED scoring algorithm based on modern hiring practices
    let totalScore = 0;
    const feedback: string[] = [];
    
    // 1. Required Skills Check (35% weight) - Reduced from 45%
    const requiredSkillsScore = this.calculateRequiredSkillsScore(keywordAnalysis);
    totalScore += requiredSkillsScore * 0.35;
    
    // 2. Experience Level Match (30% weight) - Increased from 25%
    const experienceScore = this.calculateExperienceMatchScore(resume, jobDescription);
    totalScore += experienceScore * 0.30;
    
    // 3. NEW: Skills Context & Quality (15% weight)
    const skillsContextScore = this.calculateSkillsContextScore(keywordAnalysis, resume);
    totalScore += skillsContextScore * 0.15;
    
    // 4. Education Level Match (8% weight) - Reduced from 10%
    const educationScore = this.calculateEducationMatchScore(resume, jobDescription);
    totalScore += educationScore * 0.08;
    
    // 5. Resume Format Quality (7% weight) - Reduced from 10%
    const formatScore = this.calculateFormatScore(resume);
    totalScore += formatScore * 0.07;
    
    // 6. Soft Skills & Role Fit Bonus (5% weight) - Reduced from 10%
    const softSkillsBonus = this.calculateSoftSkillsBonus(keywordAnalysis, resume, jobDescription);
    totalScore += softSkillsBonus * 0.05;
    
    // NEW: Apply market demand multipliers
    totalScore = this.applyMarketDemandMultipliers(totalScore, keywordAnalysis);
    
    // NEW: Apply red flags penalties
    const redFlagsResult = this.checkRedFlags(resume.text);
    totalScore += redFlagsResult.penalty;
    
    // NEW: Job title alignment bonus
    const titleAlignmentScore = this.analyzeJobTitleAlignment(resume.text, jobDescription.text);
    const titleBonus = (titleAlignmentScore - 50) * 0.1; // Convert to bonus/penalty
    totalScore += titleBonus;
    
    // NEW: Achievement bonus for quantified accomplishments
    const achievementBonus = this.getAchievementBonus(resume.text);
    totalScore += achievementBonus;
    
    // Apply strict penalties (but NOT harsh overqualification penalty)
    totalScore = this.applyStrictPenalties(totalScore, keywordAnalysis, resume, jobDescription);
    
    // Add comprehensive feedback
    feedback.push(...keywordAnalysis.feedback);
    
    // Add experience feedback
    if (experienceScore < 60) {
      feedback.push(`Experience level mismatch: ${jobDescription.experienceLevel} role requires more experience`);
    }
    
    // Add education feedback
    if (educationScore < 60) {
      feedback.push(`Education level mismatch: ${jobDescription.educationLevel} degree required`);
    }
    
    // Add format feedback
    if (formatScore < 80) {
      feedback.push("Resume format issues: Missing key sections or contact information");
    }
    
    // Add soft skills feedback
    if (softSkillsBonus > 0) {
      feedback.push(`Soft skills bonus: +${Math.round(softSkillsBonus)}% for role fit`);
    }
    
    // Add red flags feedback
    if (redFlagsResult.flags.length > 0) {
      feedback.push(`Red flags detected: ${redFlagsResult.flags.join(', ')} (${redFlagsResult.penalty}% penalty)`);
    }
    
    // Add title alignment feedback
    if (titleAlignmentScore < 70) {
      feedback.push(`Job title alignment: Consider roles more aligned with your experience level`);
    }
    
    // Add achievement feedback
    if (achievementBonus > 0) {
      feedback.push(`Achievement bonus: +${achievementBonus}% for quantified accomplishments`);
    }
    
    return Math.round(Math.max(0, Math.min(totalScore, 100)));
  }

  /**
   * Apply market demand multipliers to skills
   */
  private static applyMarketDemandMultipliers(baseScore: number, keywordAnalysis: KeywordAnalysis): number {
    let adjustedScore = baseScore;
    
    // Apply multipliers to matched skills
    for (const skill of keywordAnalysis.matched) {
      const multiplier = this.getMarketDemandMultiplier(skill);
      if (multiplier > 1.0) {
        // Add bonus for high-demand skills
        adjustedScore += 2; // Small bonus per high-demand skill
      }
    }
    
    return adjustedScore;
  }

  /**
   * NEW: Calculate skills context and quality score
   */
  private static calculateSkillsContextScore(keywordAnalysis: KeywordAnalysis, resume: ParsedResume): number {
    let score = 0;
    
    // Skills placement quality (40% of context score)
    const skillsInSkillsSection = keywordAnalysis.contextualSkills.filter(s => s.context === 'skills_section').length;
    const totalSkills = keywordAnalysis.contextualSkills.length;
    if (totalSkills > 0) {
      const placementRatio = skillsInSkillsSection / totalSkills;
      score += placementRatio * 40; // Up to 40 points for proper placement
    }
    
    // Skills depth and recency analysis (30% of context score)
    const depthScore = this.analyzeSkillsDepthAndRecency(resume);
    score += depthScore * 0.3;
    
    // Skills variety and relevance (30% of context score)
    const varietyScore = this.analyzeSkillsVariety(keywordAnalysis);
    score += varietyScore * 0.3;
    
    return Math.min(score, 100);
  }

  /**
   * Analyze skills depth and recency
   */
  private static analyzeSkillsDepthAndRecency(resume: ParsedResume): number {
    let score = 0;
    
    // Look for depth indicators in experience section
    if (resume.sections.experience) {
      const experienceText = resume.sections.experience.toLowerCase();
      
      // Depth indicators
      const depthIndicators = {
        'expert': ['expert', 'specialist', 'advanced', 'proficient', 'mastered'],
        'proficient': ['proficient', 'experienced', 'skilled', 'competent', 'developed'],
        'used': ['used', 'implemented', 'worked with', 'utilized', 'applied'],
        'mentioned': ['familiar', 'basic', 'introductory', 'aware of', 'knowledge of']
      };
      
      // Count depth indicators
      let maxDepth = 0;
      for (const [depth, indicators] of Object.entries(depthIndicators)) {
        const count = indicators.filter(indicator => experienceText.includes(indicator)).length;
        if (count > 0) {
          const depthScore = depth === 'expert' ? 4 : depth === 'proficient' ? 3 : depth === 'used' ? 2 : 1;
          maxDepth = Math.max(maxDepth, depthScore);
        }
      }
      
      score += maxDepth * 20; // Up to 80 points for depth
    }
    
    // Recency analysis (simplified - look for recent years)
    const currentYear = new Date().getFullYear();
    const yearPattern = /\b(20[12]\d)\b/g;
    const years = [...(resume.text.match(yearPattern) || [])].map(y => parseInt(y));
    
    if (years.length > 0) {
      const mostRecentYear = Math.max(...years);
      const yearsSinceRecent = currentYear - mostRecentYear;
      
      if (yearsSinceRecent <= 1) score += 20; // Very recent
      else if (yearsSinceRecent <= 3) score += 15; // Recent
      else if (yearsSinceRecent <= 5) score += 10; // Somewhat recent
      else score += 5; // Older experience
    }
    
    return Math.min(score, 100);
  }

  /**
   * Analyze skills variety and relevance
   */
  private static analyzeSkillsVariety(keywordAnalysis: KeywordAnalysis): number {
    let score = 0;
    
    // Skills variety (different categories)
    const skillCategories = {
      'languages': ['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
      'frameworks': ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel'],
      'databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite'],
      'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'],
      'tools': ['git', 'jenkins', 'jira', 'figma', 'postman', 'swagger']
    };
    
    const matchedSkills = keywordAnalysis.matched;
    const categoryCounts = Object.values(skillCategories).map(category => 
      category.filter(skill => matchedSkills.includes(skill)).length
    );
    
    const varietyScore = categoryCounts.filter(count => count > 0).length * 20; // 20 points per category
    score += Math.min(varietyScore, 60); // Cap at 60 points
    
    // Relevance score (how well skills match job requirements)
    const relevanceRatio = matchedSkills.length / Math.max(keywordAnalysis.missing.length + matchedSkills.length, 1);
    score += relevanceRatio * 40; // Up to 40 points for relevance
    
    return Math.min(score, 100);
  }

  /**
   * Calculate soft skills and role fit bonus
   */
  private static calculateSoftSkillsBonus(keywordAnalysis: KeywordAnalysis, resume: ParsedResume, jobDescription: JobDescription): number {
    let bonus = 0;
    
    // Soft skills matching bonus (up to 5%)
    const jobSoftSkills = this.extractSoftSkills({ text: jobDescription.text, sections: {}, extractedData: { skills: [], experience: [], education: [] } });
    const matchedSoftSkills = keywordAnalysis.softSkillsMatched.filter(skill => jobSoftSkills.includes(skill));
    
    if (matchedSoftSkills.length > 0) {
      bonus += Math.min(matchedSoftSkills.length * 2, 5); // 2% per matched soft skill, max 5%
    }
    
    // Role persona matching bonus (up to 3%)
    const jobPersona = this.determineRolePersona({ text: jobDescription.text, sections: {}, extractedData: { skills: [], experience: [], education: [] } });
    if (keywordAnalysis.rolePersona === jobPersona) {
      bonus += 3; // Perfect role fit
    } else if (this.arePersonasCompatible(keywordAnalysis.rolePersona, jobPersona)) {
      bonus += 1.5; // Compatible roles
    }
    
    // Contextual skill placement bonus (up to 2%)
    const skillsInSkillsSection = keywordAnalysis.contextualSkills.filter(s => s.context === 'skills_section').length;
    const totalSkills = keywordAnalysis.contextualSkills.length;
    if (totalSkills > 0) {
      const skillsSectionRatio = skillsInSkillsSection / totalSkills;
      bonus += skillsSectionRatio * 2; // Up to 2% for proper skill placement
    }
    
    return Math.min(bonus, 10); // Cap at 10%
  }

  /**
   * Check if two role personas are compatible
   */
  private static arePersonasCompatible(persona1: string, persona2: string): boolean {
    const compatiblePairs = [
      ['developer', 'devops'],
      ['developer', 'qa'],
      ['analyst', 'data'],
      ['manager', 'analyst'],
      ['designer', 'developer'],
      ['data', 'analyst']
    ];
    
    return compatiblePairs.some(pair => 
      (pair[0] === persona1 && pair[1] === persona2) || 
      (pair[0] === persona2 && pair[1] === persona1)
    );
  }

  /**
   * Calculate required skills score with strict criteria
   */
  private static calculateRequiredSkillsScore(keywordAnalysis: KeywordAnalysis): number {
    if (keywordAnalysis.totalRequiredSkills === 0) {
      return 60; // Base score if no required skills identified
    }
    
    const requiredMatchRate = keywordAnalysis.requiredSkillsMatched / keywordAnalysis.totalRequiredSkills;
    
    // Strict scoring: Missing required skills heavily penalized
    if (requiredMatchRate < 0.5) {
      return requiredMatchRate * 40; // Max 40% if missing more than half
    } else if (requiredMatchRate < 0.8) {
      return 40 + (requiredMatchRate - 0.5) * 40; // 40-60% range
    } else {
      return 60 + (requiredMatchRate - 0.8) * 40; // 60-100% range
    }
  }

  /**
   * Calculate experience match score with improved logic
   */
  private static calculateExperienceMatchScore(resume: ParsedResume, jobDescription: JobDescription): number {
    const resumeText = resume.text.toLowerCase();
    
    // Extract years of experience from resume
    const candidateYears = this.extractYearsOfExperience(resumeText);
    
    // Map job description experience levels to years
    const requiredYears = this.mapExperienceLevelToYears(jobDescription.experienceLevel);
    
    // Improved experience matching with more nuanced logic
    return this.calculateExperienceMatch(candidateYears, requiredYears);
  }

  /**
   * NEW: Improved experience matching logic with reduced overqualification penalties
   */
  private static calculateExperienceMatch(candidateYears: number, requiredYears: number): number {
    const difference = candidateYears - requiredYears;
    
    // Perfect range: -1 to +2 years difference
    if (difference >= -1 && difference <= 2) return 100;
    
    // Good range: -2 to +4 years difference
    if (difference >= -2 && difference <= 4) return 85;
    
    // Acceptable range: -3 to +6 years difference
    if (difference >= -3 && difference <= 6) return 70;
    
    // Overqualified but not disqualified: +7 to +10 years
    if (difference > 6 && difference <= 10) return 50;
    
    // Severely overqualified: +11+ years
    if (difference > 10) return 30;
    
    // Underqualified gradient: -4 to -10 years
    if (difference >= -4 && difference <= -10) {
      return Math.max(20, 60 + (difference * 5)); // Gradual penalty
    }
    
    // Severely underqualified: -11+ years
    return Math.max(10, 20 + (difference * 2));
  }

  /**
   * Extract years of experience from resume text
   */
  private static extractYearsOfExperience(resumeText: string): number {
    // Look for explicit year mentions
    const yearPatterns = [
      /(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience/gi,
      /experience[:\s]*(\d+)\s*(?:years?|yrs?)/gi,
      /(\d+)\s*(?:years?|yrs?)\s*(?:in\s*)?(?:software|development|programming|engineering)/gi
    ];
    
    for (const pattern of yearPatterns) {
      const match = resumeText.match(pattern);
      if (match) {
        const years = parseInt(match[1]);
        if (years >= 0 && years <= 50) return years; // Sanity check
      }
    }
    
    // Fallback: estimate from job history
    return this.estimateExperienceFromJobHistory(resumeText);
  }

  /**
   * Estimate experience from job history dates
   */
  private static estimateExperienceFromJobHistory(resumeText: string): number {
    const yearPattern = /\b(20[12]\d)\b/g;
    const years = [...resumeText.match(yearPattern) || []].map(y => parseInt(y));
    
    if (years.length < 2) return 0;
    
    const sortedYears = years.sort((a, b) => a - b);
    const earliestYear = sortedYears[0];
    const latestYear = sortedYears[sortedYears.length - 1];
    
    // Assume continuous employment (simplified)
    return Math.min(latestYear - earliestYear + 1, 20); // Cap at 20 years
  }

  /**
   * Map experience level to approximate years
   */
  private static mapExperienceLevelToYears(level: string): number {
    const levelMap: Record<string, number> = {
      'entry': 0,
      'junior': 1,
      'mid': 3,
      'senior': 5,
      'lead': 7,
      'principal': 10,
      'staff': 10,
      'architect': 12,
      'director': 15
    };
    
    return levelMap[level.toLowerCase()] || 3; // Default to mid-level
  }

  /**
   * Calculate education match score
   */
  private static calculateEducationMatchScore(resume: ParsedResume, jobDescription: JobDescription): number {
    const educationText = resume.sections.education || '';
    const educationKeywords = this.extractKeywords(educationText, this.EDUCATION_KEYWORDS);
    
    const hasBachelor = educationText.toLowerCase().includes('bachelor');
    const hasMaster = educationText.toLowerCase().includes('master');
    const hasPhd = educationText.toLowerCase().includes('phd');
    
    let score = 0;
    
    switch (jobDescription.educationLevel) {
      case 'high-school':
        score = 100; // Any education level meets this
        break;
      case 'bachelor':
        score = hasBachelor || hasMaster || hasPhd ? 100 : 40;
        break;
      case 'master':
        score = hasMaster || hasPhd ? 100 : hasBachelor ? 60 : 20;
        break;
      case 'phd':
        score = hasPhd ? 100 : hasMaster ? 70 : hasBachelor ? 40 : 10;
        break;
    }
    
    return score;
  }

  /**
   * Calculate resume format score
   */
  private static calculateFormatScore(resume: ParsedResume): number {
    let score = 0;
    
    // Check if all major sections are present
    if (resume.sections.contact) score += 15;
    if (resume.sections.summary) score += 15;
    if (resume.sections.experience) score += 30;
    if (resume.sections.education) score += 20;
    if (resume.sections.skills) score += 20;
    
    return score;
  }

  /**
   * Apply strict penalties for various issues
   */
  private static applyStrictPenalties(baseScore: number, keywordAnalysis: KeywordAnalysis, resume: ParsedResume, jobDescription: JobDescription): number {
    let finalScore = baseScore;
    
    // Penalty for missing required skills
    if (keywordAnalysis.totalRequiredSkills > 0) {
      const missingRequiredRate = (keywordAnalysis.totalRequiredSkills - keywordAnalysis.requiredSkillsMatched) / keywordAnalysis.totalRequiredSkills;
      if (missingRequiredRate > 0.3) {
        finalScore *= 0.7; // 30% penalty for missing more than 30% of required skills
      }
    }
    
    // Penalty for too few skills overall
    if (resume.extractedData.skills.length < 5) {
      finalScore *= 0.8; // 20% penalty
    }
    
    // Penalty for missing contact information
    if (!resume.extractedData.email || !resume.extractedData.phone) {
      finalScore *= 0.9; // 10% penalty
    }
    
    // Penalty for experience level mismatch
    const experienceText = resume.sections.experience || '';
    const yearsMatch = experienceText.match(/(\d+)\+?\s*years?/i);
    const yearsOfExperience = yearsMatch ? parseInt(yearsMatch[1]) : 0;
    
    if (jobDescription.experienceLevel === 'senior' && yearsOfExperience < 5) {
      finalScore *= 0.6; // 40% penalty for senior role with insufficient experience
    }
    
    if (jobDescription.experienceLevel === 'entry' && yearsOfExperience > 5) {
      finalScore *= 0.8; // 20% penalty for overqualification
    }
    
    return finalScore;
  }

  /**
   * Mock resume text for demonstration
   */
  private static getMockResumeText(): string {
    return `John Doe
Software Engineer
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe

SUMMARY
Experienced software developer with 5+ years in React, Node.js, and Python development. Strong background in full-stack development, cloud technologies, and agile methodologies. Led multiple teams and delivered scalable applications.

EXPERIENCE
Senior Software Engineer | Tech Company | 2020-2023
- Developed and maintained React applications with TypeScript
- Implemented REST APIs using Node.js and Express
- Worked with AWS services including EC2, S3, and Lambda
- Led a team of 4 developers in agile environment
- Improved application performance by 40%

Software Developer | Startup Inc | 2018-2020
- Built full-stack applications using React and Python
- Integrated third-party APIs and payment systems
- Used Git for version control and CI/CD pipelines
- Collaborated with cross-functional teams

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2014-2018
- GPA: 3.8/4.0
- Relevant coursework: Data Structures, Algorithms, Database Systems

SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java, SQL
Frameworks & Libraries: React, Node.js, Express, Django, Bootstrap
Databases: MySQL, PostgreSQL, MongoDB, Redis
Cloud & DevOps: AWS, Docker, Git, Jenkins, Linux
Tools: Jira, Postman, VS Code, Figma
Methodologies: Agile, Scrum, CI/CD, TDD

PROJECTS
E-commerce Platform | React, Node.js, MongoDB
- Built a full-stack e-commerce application
- Implemented user authentication and payment processing
- Deployed on AWS with Docker containers`;
  }

  /**
   * Extract skills with contextual weighting
   */
  private static extractSkillsWithContext(resume: ParsedResume): { skill: string; weight: number; context: string }[] {
    const skillsWithContext: { skill: string; weight: number; context: string }[] = [];
    
    // Extract from skills section (highest weight)
    if (resume.sections.skills) {
      const skillsText = resume.sections.skills.toLowerCase();
      for (const skill of this.SKILL_KEYWORDS) {
        if (skillsText.includes(skill.toLowerCase())) {
          skillsWithContext.push({
            skill,
            weight: this.SKILL_WEIGHTS[skill] || 1,
            context: 'skills_section'
          });
        }
      }
    }
    
    // Extract from experience section (medium weight)
    if (resume.sections.experience) {
      const experienceText = resume.sections.experience.toLowerCase();
      for (const skill of this.SKILL_KEYWORDS) {
        if (experienceText.includes(skill.toLowerCase()) && 
            !skillsWithContext.some(s => s.skill === skill)) {
          skillsWithContext.push({
            skill,
            weight: (this.SKILL_WEIGHTS[skill] || 1) * 0.8, // 80% weight in experience
            context: 'experience_section'
          });
        }
      }
    }
    
    // Extract from projects section (medium weight)
    if (resume.sections.projects) {
      const projectsText = resume.sections.projects.toLowerCase();
      for (const skill of this.SKILL_KEYWORDS) {
        if (projectsText.includes(skill.toLowerCase()) && 
            !skillsWithContext.some(s => s.skill === skill)) {
          skillsWithContext.push({
            skill,
            weight: (this.SKILL_WEIGHTS[skill] || 1) * 0.7, // 70% weight in projects
            context: 'projects_section'
          });
        }
      }
    }
    
    // Extract from summary section (lower weight)
    if (resume.sections.summary) {
      const summaryText = resume.sections.summary.toLowerCase();
      for (const skill of this.SKILL_KEYWORDS) {
        if (summaryText.includes(skill.toLowerCase()) && 
            !skillsWithContext.some(s => s.skill === skill)) {
          skillsWithContext.push({
            skill,
            weight: (this.SKILL_WEIGHTS[skill] || 1) * 0.5, // 50% weight in summary
            context: 'summary_section'
          });
        }
      }
    }
    
    return skillsWithContext;
  }

  /**
   * Extract soft skills for role fit bonus
   */
  private static extractSoftSkills(resume: ParsedResume): string[] {
    const resumeText = resume.text.toLowerCase();
    const foundSoftSkills: string[] = [];
    
    for (const softSkill of this.SOFT_SKILLS) {
      if (resumeText.includes(softSkill.toLowerCase())) {
        foundSoftSkills.push(softSkill);
      }
    }
    
    return foundSoftSkills;
  }

  /**
   * Determine role persona from resume content
   */
  private static determineRolePersona(resume: ParsedResume): string {
    const resumeText = resume.text.toLowerCase();
    const personaScores: Record<string, number> = {};
    
    for (const [persona, keywords] of Object.entries(this.ROLE_PERSONAS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (resumeText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      personaScores[persona] = score;
    }
    
    // Return the persona with the highest score
    const maxScore = Math.max(...Object.values(personaScores));
    const topPersonas = Object.entries(personaScores)
      .filter(([_, score]) => score === maxScore)
      .map(([persona, _]) => persona);
    
    return topPersonas.length > 0 ? topPersonas[0] : 'general';
  }

  /**
   * Check for red flags in resume text
   */
  private static checkRedFlags(resumeText: string): { penalty: number; flags: string[] } {
    const flags: string[] = [];
    let totalPenalty = 0;
    
    for (const flag of this.RED_FLAGS) {
      if (resumeText.match(flag.pattern)) {
        flags.push(flag.reason);
        totalPenalty += flag.penalty;
      }
    }
    
    return { penalty: totalPenalty, flags };
  }

  /**
   * Enhanced soft skills analysis with quantified achievements
   */
  private static analyzeSoftSkills(resumeText: string): { score: number; skills: string[]; achievements: number } {
    const resumeLower = resumeText.toLowerCase();
    const detectedSkills: string[] = [];
    let totalScore = 0;
    
    // Analyze soft skills indicators
    for (const [skill, indicators] of Object.entries(this.SOFT_SKILLS_INDICATORS)) {
      const matches = indicators.filter(indicator => resumeLower.includes(indicator.toLowerCase()));
      if (matches.length > 0) {
        detectedSkills.push(skill);
        totalScore += matches.length * 5; // 5 points per indicator match
      }
    }
    
    // Look for quantified achievements
    const quantifiedPatterns = [
      /\d+%/g, // Percentages
      /\$\d+/g, // Dollar amounts
      /saved \d+/gi, // Cost savings
      /increased \d+/gi, // Improvements
      /reduced \d+/gi, // Reductions
      /improved \d+/gi // Improvements
    ];
    
    const achievements = quantifiedPatterns.reduce((count, pattern) => {
      const matches = resumeText.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    const achievementBonus = Math.min(20, achievements * 3); // Up to 20 points for achievements
    totalScore += achievementBonus;
    
    return {
      score: Math.min(totalScore, 100),
      skills: detectedSkills,
      achievements
    };
  }

  /**
   * Get market demand multiplier for a skill
   */
  private static getMarketDemandMultiplier(skill: string): number {
    return this.MARKET_DEMAND_MULTIPLIERS[skill.toLowerCase()] || 1.0;
  }

  /**
   * Analyze job title alignment
   */
  private static analyzeJobTitleAlignment(resumeText: string, jobTitle: string): number {
    const resumeLower = resumeText.toLowerCase();
    const jobTitleLower = jobTitle.toLowerCase();
    
    // Extract seniority levels from resume
    const resumeLevels: number[] = [];
    for (const [title, level] of Object.entries(this.TITLE_HIERARCHY)) {
      if (resumeLower.includes(title)) {
        resumeLevels.push(level);
      }
    }
    
    // Extract seniority level from job title
    const jobLevels: number[] = [];
    for (const [title, level] of Object.entries(this.TITLE_HIERARCHY)) {
      if (jobTitleLower.includes(title)) {
        jobLevels.push(level);
      }
    }
    
    if (resumeLevels.length === 0 || jobLevels.length === 0) {
      return 50; // Neutral score if can't determine levels
    }
    
    const candidateLevel = Math.max(...resumeLevels);
    const requiredLevel = Math.max(...jobLevels);
    const difference = candidateLevel - requiredLevel;
    
    // Calculate alignment score
    if (difference >= -1 && difference <= 1) return 100; // Perfect match
    if (difference >= -2 && difference <= 2) return 85;  // Good match
    if (difference >= -3 && difference <= 3) return 70;  // Acceptable
    if (difference > 3) return 40; // Overqualified
    return Math.max(20, 60 + (difference * 10)); // Underqualified gradient
  }

  /**
   * Calculate confidence level for the analysis
   */
  private static calculateConfidence(keywordAnalysis: KeywordAnalysis, resume: ParsedResume): 'high' | 'medium' | 'low' {
    let confidence = 100;
    const uncertainties: string[] = [];
    
    // Penalize for missing required skills
    if (keywordAnalysis.totalRequiredSkills > 0) {
      const missingRatio = keywordAnalysis.totalRequiredSkills - keywordAnalysis.requiredSkillsMatched;
      if (missingRatio > 2) {
        confidence -= 20;
        uncertainties.push(`Missing ${missingRatio} required skills`);
      }
    }
    
    // Penalize for ambiguous skills (found in summary only)
    const ambiguousSkills = keywordAnalysis.contextualSkills.filter(s => s.context === 'summary_section');
    if (ambiguousSkills.length > 0) {
      confidence -= 10;
      uncertainties.push(`${ambiguousSkills.length} skills only mentioned in summary`);
    }
    
    // Penalize for format issues
    const formatIssues = this.checkFormatIssues(resume);
    if (formatIssues.length > 0) {
      confidence -= 15;
      uncertainties.push(`${formatIssues.length} format issues detected`);
    }
    
    // Penalize for red flags
    const redFlags = this.checkRedFlags(resume.text);
    if (redFlags.flags.length > 0) {
      confidence -= 10;
      uncertainties.push(`${redFlags.flags.length} red flags detected`);
    }
    
    return confidence > 80 ? 'high' : confidence > 60 ? 'medium' : 'low';
  }

  /**
   * Check for format issues in resume
   */
  private static checkFormatIssues(resume: ParsedResume): string[] {
    const issues: string[] = [];
    
    // Check for missing contact information
    if (!resume.extractedData.email && !resume.extractedData.phone) {
      issues.push('Missing contact information');
    }
    
    // Check for missing key sections
    if (!resume.sections.experience) {
      issues.push('Missing experience section');
    }
    
    if (!resume.sections.education) {
      issues.push('Missing education section');
    }
    
    if (!resume.sections.skills) {
      issues.push('Missing skills section');
    }
    
    // Check for very short sections
    if (resume.sections.experience && resume.sections.experience.length < 50) {
      issues.push('Experience section too brief');
    }
    
    if (resume.sections.skills && resume.sections.skills.length < 20) {
      issues.push('Skills section too brief');
    }
    
    return issues;
  }

  /**
   * Check if candidate has transferable skills for required skills
   */
  private static hasTransferableSkill(candidateSkills: string[], requiredSkill: string): number {
    // Direct match first
    if (candidateSkills.some(skill => skill.toLowerCase() === requiredSkill.toLowerCase())) {
      return 1.0;
    }
    
    // Check transferable skills
    for (const candidateSkill of candidateSkills) {
      const transferable = this.SKILL_TRANSFERABILITY[candidateSkill.toLowerCase()] || [];
      if (transferable.includes(requiredSkill.toLowerCase())) {
        return 0.85; // 85% match for transferable skills
      }
    }
    return 0;
  }

  /**
   * Get achievement bonus for quantified accomplishments
   */
  private static getAchievementBonus(resumeText: string): number {
    const patterns = [
      /(\d+)%/g,           // "increased by 15%"
      /\$[\d,]+/g,         // "$100,000"
      /\d+\s+(?:people|staff|members)/g,  // "50 staff members"
      /saved \d+/gi,       // "saved 20%"
      /reduced \d+/gi,     // "reduced costs by 30%"
      /improved \d+/gi,    // "improved performance by 25%"
      /increased \d+/gi    // "increased efficiency by 40%"
    ];
    
    let count = 0;
    patterns.forEach(pattern => {
      count += (resumeText.match(pattern) || []).length;
    });
    
    return Math.min(15, count * 2); // Max 15% bonus
  }
} 