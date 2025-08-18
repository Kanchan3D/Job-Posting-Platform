const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Job = require('./src/models/Job');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobposting');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      email: 'admin@example.com',
      password: 'password',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create regular user
    const regularUser = new User({
      email: 'user@example.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user'
    });
    await regularUser.save();
    console.log('Created regular user');

    // Create sample jobs
    const sampleJobs = [
      {
        title: 'Senior Frontend Developer',
        company: 'Tech Solutions Inc.',
        location: 'New York, NY',
        salary: { min: 80000, max: 120000, currency: 'USD' },
        description: 'We are looking for a Senior Frontend Developer to join our team. You will be responsible for developing user-facing web applications using React.js and modern web technologies.',
        requirements: ['5+ years of React.js experience', 'Strong JavaScript skills', 'Experience with TypeScript', 'Knowledge of modern build tools'],
        benefits: ['Health insurance', '401(k) matching', 'Flexible work hours', 'Remote work options'],
        jobType: 'full-time',
        experienceLevel: 'senior',
        postedBy: adminUser._id
      },
      {
        title: 'Backend Developer',
        company: 'StartupXYZ',
        location: 'San Francisco, CA',
        salary: { min: 70000, max: 100000, currency: 'USD' },
        description: 'Join our growing startup as a Backend Developer. You will work on building scalable APIs and backend services using Node.js and MongoDB.',
        requirements: ['3+ years of Node.js experience', 'MongoDB expertise', 'RESTful API development', 'Docker knowledge'],
        benefits: ['Equity package', 'Health insurance', 'Catered meals', 'Learning budget'],
        jobType: 'full-time',
        experienceLevel: 'mid',
        postedBy: adminUser._id
      },
      {
        title: 'UI/UX Designer',
        company: 'Design Studio Pro',
        location: 'Remote',
        salary: { min: 60000, max: 85000, currency: 'USD' },
        description: 'We are seeking a creative UI/UX Designer to design intuitive and engaging user experiences for our web and mobile applications.',
        requirements: ['3+ years of UI/UX design experience', 'Proficiency in Figma/Sketch', 'User research experience', 'Portfolio required'],
        benefits: ['Remote work', 'Health insurance', 'Design conference budget', 'Flexible schedule'],
        jobType: 'full-time',
        experienceLevel: 'mid',
        postedBy: adminUser._id
      },
      {
        title: 'DevOps Engineer',
        company: 'Cloud Innovations',
        location: 'Austin, TX',
        salary: { min: 90000, max: 130000, currency: 'USD' },
        description: 'Looking for a DevOps Engineer to help build and maintain our cloud infrastructure using AWS, Docker, and Kubernetes.',
        requirements: ['AWS certification preferred', 'Docker and Kubernetes experience', 'CI/CD pipeline experience', 'Infrastructure as Code'],
        benefits: ['Health insurance', '401(k)', 'Paid conferences', 'Stock options'],
        jobType: 'full-time',
        experienceLevel: 'senior',
        postedBy: adminUser._id
      },
      {
        title: 'Frontend Developer Intern',
        company: 'Learning Labs',
        location: 'Boston, MA',
        salary: { min: 15, max: 20, currency: 'USD' },
        description: 'Great opportunity for students to gain hands-on experience in frontend development. You will work with our team to build user interfaces using React.',
        requirements: ['Currently enrolled in CS program', 'Basic knowledge of HTML/CSS/JS', 'React fundamentals', 'Eagerness to learn'],
        benefits: ['Mentorship program', 'Learning opportunities', 'Potential full-time offer', 'Flexible hours'],
        jobType: 'internship',
        experienceLevel: 'entry',
        postedBy: adminUser._id
      }
    ];

    const createdJobs = await Job.insertMany(sampleJobs);
    console.log(`Created ${createdJobs.length} sample jobs`);

    console.log('\n=== DEMO CREDENTIALS ===');
    console.log('Admin: admin@example.com / password');
    console.log('User: user@example.com / password');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
