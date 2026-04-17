/**
 * In-memory database seeded with mock data matching the frontend types.
 * In production, replace with a real DB (PostgreSQL, MongoDB, etc.)
 */

const bcrypt = require('bcryptjs');

// ─── Users ──────────────────────────────────────────────────────────────────
// Passwords are hashed. Default password for all demo accounts: "password"
const HASH = bcrypt.hashSync('password', 10);

const users = [
  {
    id: '1',
    name: 'Flight Lt. Arjun Singh',
    email: 'arjun.singh@iaf.gov.in',
    passwordHash: HASH,
    role: 'trainee',
    rank: 'Flight Lieutenant',
    squadron: 'No. 1 Squadron',
    base: 'Ambala Air Force Station',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
    joinedAt: '2023-06-15',
    lastActive: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Wing Cdr. Vikram Rao',
    email: 'vikram.rao@iaf.gov.in',
    passwordHash: HASH,
    role: 'instructor',
    rank: 'Wing Commander',
    squadron: 'Training Wing',
    base: 'Bangalore AFS',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
    joinedAt: '2018-03-10',
    lastActive: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Gp. Capt. Priya Sharma',
    email: 'priya.sharma@iaf.gov.in',
    passwordHash: HASH,
    role: 'admin',
    rank: 'Group Captain',
    squadron: 'HQ',
    base: 'Delhi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    joinedAt: '2015-01-20',
    lastActive: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Fg. Off. Rahul Kumar',
    email: 'rahul.kumar@iaf.gov.in',
    passwordHash: HASH,
    role: 'trainee',
    rank: 'Flying Officer',
    squadron: 'No. 1 Squadron',
    base: 'Ambala Air Force Station',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
    joinedAt: '2024-01-10',
    lastActive: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Flt. Lt. Neha Gupta',
    email: 'neha.gupta@iaf.gov.in',
    passwordHash: HASH,
    role: 'trainee',
    rank: 'Flight Lieutenant',
    squadron: 'No. 3 Squadron',
    base: 'Ambala Air Force Station',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha',
    joinedAt: '2022-08-01',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'admin-1',
    name: 'System Admin',
    email: 'admin@iaf.gov.in',
    passwordHash: HASH,
    role: 'admin',
    rank: 'Group Captain',
    squadron: 'HQ',
    base: 'Delhi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    joinedAt: '2020-01-01',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'instructor-1',
    name: 'Lead Instructor',
    email: 'instructor@iaf.gov.in',
    passwordHash: HASH,
    role: 'instructor',
    rank: 'Wing Commander',
    squadron: 'Training Wing',
    base: 'Bangalore AFS',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=instructor',
    joinedAt: '2020-01-01',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'trainee-1',
    name: 'Test Trainee',
    email: 'trainee@iaf.gov.in',
    passwordHash: HASH,
    role: 'trainee',
    rank: 'Flying Officer',
    squadron: 'No. 1 Squadron',
    base: 'Ambala Air Force Station',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trainee',
    joinedAt: '2020-01-01',
    lastActive: new Date().toISOString(),
  },
];

// ─── Courses ─────────────────────────────────────────────────────────────────
const courses = [
  { id: '1', title: 'Su-30MKI Engine Systems', category: 'Jet Engine Systems', description: 'Comprehensive training on AL-31FP turbofan engine systems, including startup procedures, monitoring, and troubleshooting.', moduleCount: 12, completedModules: 8, progress: 67, duration: '24 hours', difficulty: 'advanced', status: 'in-progress', thumbnail: 'https://picsum.photos/400/250?random=1' },
  { id: '2', title: 'Hydraulic Systems Fundamentals', category: 'Hydraulics', description: 'Understanding aircraft hydraulic systems, components, maintenance procedures, and safety protocols.', moduleCount: 8, completedModules: 8, progress: 100, duration: '16 hours', difficulty: 'intermediate', status: 'completed', thumbnail: 'https://picsum.photos/400/250?random=2' },
  { id: '3', title: 'Avionics Suite Overview', category: 'Avionics', description: 'Modern avionics systems including radar, navigation, communication, and electronic warfare suites.', moduleCount: 15, completedModules: 3, progress: 20, duration: '30 hours', difficulty: 'advanced', status: 'in-progress', thumbnail: 'https://picsum.photos/400/250?random=3' },
  { id: '4', title: 'Flight Control Systems', category: 'Flight Control', description: 'Fly-by-wire systems, control surfaces, actuators, and flight envelope protection.', moduleCount: 10, completedModules: 0, progress: 0, duration: '20 hours', difficulty: 'advanced', status: 'not-started', thumbnail: 'https://picsum.photos/400/250?random=4' },
  { id: '5', title: 'Weapons Integration', category: 'Weapons Systems', description: 'Air-to-air and air-to-ground weapon systems, targeting, and firing procedures.', moduleCount: 14, completedModules: 0, progress: 0, duration: '28 hours', difficulty: 'advanced', status: 'not-started', thumbnail: 'https://picsum.photos/400/250?random=5' },
  { id: '6', title: 'Electrical Systems', category: 'Electrical Systems', description: 'Aircraft electrical power generation, distribution, and emergency systems.', moduleCount: 9, completedModules: 5, progress: 56, duration: '18 hours', difficulty: 'intermediate', status: 'in-progress', thumbnail: 'https://picsum.photos/400/250?random=6' },
  { id: '7', title: 'Landing Gear Systems', category: 'Landing Gear', description: 'Retraction/extension mechanisms, brakes, steering, and emergency extension.', moduleCount: 7, completedModules: 7, progress: 100, duration: '14 hours', difficulty: 'intermediate', status: 'completed', thumbnail: 'https://picsum.photos/400/250?random=7' },
  { id: '8', title: 'Fuel Systems Management', category: 'Fuel Systems', description: 'Fuel storage, transfer, refueling procedures, and fuel system indications.', moduleCount: 6, completedModules: 2, progress: 33, duration: '12 hours', difficulty: 'beginner', status: 'in-progress', thumbnail: 'https://picsum.photos/400/250?random=8' },
];

// ─── Modules ─────────────────────────────────────────────────────────────────
const modules = [
  {
    id: 'm1', courseId: '1', title: 'AL-31FP Engine Overview', description: 'Introduction to the AL-31FP turbofan engine architecture and specifications.', documentation: 'The AL-31FP is a twin-spool, axial-flow turbofan engine with a thrust vectoring nozzle. Maximum thrust: 12,500 kgf with afterburner.',
    procedures: [
      { id: 'p1', step: 1, title: 'Pre-start Check', description: 'Verify all engine parameters are within normal range.' },
      { id: 'p2', step: 2, title: 'Fuel System Check', description: 'Ensure fuel pumps are operational and fuel pressure is nominal.' },
    ],
    diagrams: [{ id: 'd1', title: 'Engine Cross-section', imageUrl: 'https://picsum.photos/600/400?random=10', description: 'Complete cross-sectional view of AL-31FP' }],
    duration: '45 min', order: 1, isCompleted: true,
  },
  {
    id: 'm2', courseId: '1', title: 'Engine Start Procedures', description: 'Detailed startup sequence and monitoring parameters.', documentation: 'Standard engine start procedure involves APU start, followed by engine crank and light-off sequence.',
    procedures: [
      { id: 'p3', step: 1, title: 'APU Start', description: 'Start APU and verify bleed air pressure.' },
      { id: 'p4', step: 2, title: 'Engine Crank', description: 'Engage starter and monitor N2 rotation.' },
      { id: 'p5', step: 3, title: 'Fuel Introduction', description: 'Introduce fuel at 15% N2 and monitor EGT.' },
    ],
    diagrams: [{ id: 'd2', title: 'Start Sequence Flowchart', imageUrl: 'https://picsum.photos/600/400?random=11', description: 'Flowchart of engine start sequence' }],
    duration: '60 min', order: 2, isCompleted: true,
  },
  {
    id: 'm3', courseId: '1', title: 'In-flight Monitoring', description: 'Engine parameter monitoring during flight operations.', documentation: 'Critical parameters: N1, N2, EGT, fuel flow, oil pressure, and vibration levels.',
    procedures: [
      { id: 'p6', step: 1, title: 'Parameter Scan', description: 'Scan all engine instruments every 5 minutes.' },
      { id: 'p7', step: 2, title: 'Abnormal Indication Response', description: 'Follow emergency procedures for any abnormal readings.' },
    ],
    diagrams: [{ id: 'd3', title: 'Engine Instrument Panel', imageUrl: 'https://picsum.photos/600/400?random=12', description: 'Layout of engine instruments on MFD' }],
    duration: '50 min', order: 3, isCompleted: false,
  },
];

// ─── Aircraft Systems (Digital Twin) ─────────────────────────────────────────
const aircraftSystems = [
  {
    id: 'sys1', name: 'AL-31FP Engine', category: 'engine', status: 'operational', health: 94,
    components: [
      { id: 'c1', name: 'Low Pressure Compressor', partNumber: 'LPC-31FP-001', description: '4-stage low pressure compressor', status: 'operational', health: 96, lastMaintenance: '2023-12-01', nextMaintenance: '2024-03-01', specifications: { Stages: '4', 'Pressure Ratio': '3.6:1' } },
      { id: 'c2', name: 'High Pressure Compressor', partNumber: 'HPC-31FP-001', description: '9-stage high pressure compressor', status: 'operational', health: 92, lastMaintenance: '2023-11-15', nextMaintenance: '2024-02-15', specifications: { Stages: '9', 'Pressure Ratio': '6.2:1' } },
      { id: 'c3', name: 'Combustion Chamber', partNumber: 'CC-31FP-001', description: 'Annular combustion chamber', status: 'operational', health: 95, lastMaintenance: '2023-10-20', nextMaintenance: '2024-01-20', specifications: { Type: 'Annular', 'Fuel Nozzles': '24' } },
    ],
  },
  {
    id: 'sys2', name: 'Hydraulic System', category: 'hydraulics', status: 'operational', health: 88,
    components: [
      { id: 'c4', name: 'Hydraulic Pump 1', partNumber: 'HP-SYS1-001', description: 'Engine-driven hydraulic pump', status: 'operational', health: 90, lastMaintenance: '2023-12-10', nextMaintenance: '2024-03-10', specifications: { Pressure: '3000 PSI', Flow: '20 GPM' } },
      { id: 'c5', name: 'Hydraulic Pump 2', partNumber: 'HP-SYS2-001', description: 'Electric hydraulic pump', status: 'maintenance', health: 75, lastMaintenance: '2023-09-15', nextMaintenance: '2024-01-15', specifications: { Pressure: '3000 PSI', Flow: '15 GPM' } },
    ],
  },
  {
    id: 'sys3', name: 'Primary Electrical', category: 'electrical', status: 'operational', health: 91,
    components: [
      { id: 'c6', name: 'Main Generator', partNumber: 'GEN-MAIN-001', description: 'Engine-driven AC generator', status: 'operational', health: 93, lastMaintenance: '2023-11-01', nextMaintenance: '2024-02-01', specifications: { Power: '40 KVA', Voltage: '115/200V' } },
    ],
  },
  {
    id: 'sys4', name: 'Radar System', category: 'avionics', status: 'operational', health: 97,
    components: [
      { id: 'c7', name: 'N011M Bars', partNumber: 'RAD-N011M-001', description: 'Passive electronically scanned array radar', status: 'operational', health: 97, lastMaintenance: '2023-12-20', nextMaintenance: '2024-03-20', specifications: { Range: '400 km', Tracks: '20 targets' } },
    ],
  },
  {
    id: 'sys5', name: 'Main Landing Gear', category: 'landing-gear', status: 'operational', health: 89,
    components: [
      { id: 'c8', name: 'Left Main Gear', partNumber: 'LG-LEFT-001', description: 'Left main landing gear assembly', status: 'operational', health: 89, lastMaintenance: '2023-10-01', nextMaintenance: '2024-01-01', specifications: { Stroke: '450 mm', 'Max Load': '8000 kg' } },
    ],
  },
  {
    id: 'sys6', name: 'Fuel System', category: 'fuel-system', status: 'operational', health: 92,
    components: [
      { id: 'c9', name: 'Main Fuel Pump', partNumber: 'FP-MAIN-001', description: 'Engine fuel pump', status: 'operational', health: 92, lastMaintenance: '2023-11-20', nextMaintenance: '2024-02-20', specifications: { Flow: '10000 kg/hr', Pressure: '50 bar' } },
    ],
  },
  {
    id: 'sys7', name: 'Weapons Pylon', category: 'weapons-integration', status: 'operational', health: 95,
    components: [
      { id: 'c10', name: 'Pylon Interface', partNumber: 'WP-INT-001', description: 'Weapons pylon interface unit', status: 'operational', health: 95, lastMaintenance: '2023-12-05', nextMaintenance: '2024-03-05', specifications: { 'Max Load': '1500 kg', Interfaces: 'MIL-STD-1760' } },
    ],
  },
];

// ─── Simulations ──────────────────────────────────────────────────────────────
const simulations = [
  { id: 'sim1', title: 'Engine Fire Emergency', type: 'maintenance', description: 'Respond to an in-flight engine fire emergency procedure.', duration: '15 min', difficulty: 'advanced', aircraft: 'Su-30MKI', objectives: ['Identify fire indication', 'Execute fire suppression', 'Perform emergency shutdown'], briefing: 'During routine flight, you experience an engine fire warning. Follow emergency procedures to handle the situation.', status: 'available' },
  { id: 'sim2', title: 'Pre-flight Inspection', type: 'flight-readiness', description: 'Complete walk-around and systems check before flight.', duration: '20 min', difficulty: 'beginner', aircraft: 'Su-30MKI', objectives: ['Complete exterior inspection', 'Verify fluid levels', 'Check control surfaces'], briefing: 'Perform a complete pre-flight inspection following the checklist.', status: 'completed' },
  { id: 'sim3', title: 'Combat Air Patrol', type: 'mission-rehearsal', description: 'Execute a combat air patrol mission with multiple engagements.', duration: '45 min', difficulty: 'advanced', aircraft: 'Su-30MKI', objectives: ['Maintain patrol pattern', 'Identify threats', 'Execute intercepts'], briefing: 'You are tasked with CAP over strategic location. Maintain vigilance and respond to hostile contacts.', status: 'in-progress' },
  { id: 'sim4', title: 'Hydraulic Leak Response', type: 'maintenance', description: 'Diagnose and respond to hydraulic system leak.', duration: '25 min', difficulty: 'intermediate', aircraft: 'Su-30MKI', objectives: ['Identify leak source', 'Isolate affected system', 'Execute backup procedures'], briefing: 'Hydraulic pressure dropping in System 1. Identify and respond to the emergency.', status: 'available' },
  { id: 'sim5', title: 'Night Landing', type: 'flight-readiness', description: 'Perform landing operations at night with limited visibility.', duration: '30 min', difficulty: 'intermediate', aircraft: 'Su-30MKI', objectives: ['Navigate to airfield', 'Execute approach', 'Safe landing'], briefing: 'Night operations with minimal lighting. Use NVG and instrument references.', status: 'available' },
];

// ─── Trainee Progress ─────────────────────────────────────────────────────────
const traineeProgress = {
  '1': { traineeId: '1', overallProgress: 58, readinessScore: 78, simulationHours: 42, completedCourses: 2, totalCourses: 8, completedModules: 25, totalModules: 81, recentActivity: [
    { id: 'a1', type: 'module-completed', title: 'Hydraulic Systems - Module 8', timestamp: '2024-01-15T09:30:00Z', details: 'Completed final assessment with 92%' },
    { id: 'a2', type: 'course-completed', title: 'Hydraulic Systems Fundamentals', timestamp: '2024-01-15T09:35:00Z' },
    { id: 'a3', type: 'simulation-completed', title: 'Pre-flight Inspection', timestamp: '2024-01-14T14:20:00Z', details: 'Score: 95%' },
    { id: 'a4', type: 'module-completed', title: 'Engine Systems - Module 8', timestamp: '2024-01-13T11:00:00Z' },
  ], skills: [
    { name: 'Engine Systems', level: 7, maxLevel: 10, category: 'Technical' },
    { name: 'Hydraulics', level: 9, maxLevel: 10, category: 'Technical' },
    { name: 'Avionics', level: 4, maxLevel: 10, category: 'Technical' },
    { name: 'Emergency Procedures', level: 6, maxLevel: 10, category: 'Operational' },
    { name: 'Flight Controls', level: 3, maxLevel: 10, category: 'Technical' },
    { name: 'Weapons Systems', level: 2, maxLevel: 10, category: 'Combat' },
  ] },
  '4': { traineeId: '4', overallProgress: 42, readinessScore: 65, simulationHours: 28, completedCourses: 1, totalCourses: 8, completedModules: 15, totalModules: 81, recentActivity: [], skills: [
    { name: 'Engine Systems', level: 4, maxLevel: 10, category: 'Technical' },
    { name: 'Hydraulics', level: 5, maxLevel: 10, category: 'Technical' },
    { name: 'Avionics', level: 3, maxLevel: 10, category: 'Technical' },
  ] },
  '5': { traineeId: '5', overallProgress: 72, readinessScore: 88, simulationHours: 56, completedCourses: 4, totalCourses: 8, completedModules: 45, totalModules: 81, recentActivity: [], skills: [
    { name: 'Engine Systems', level: 8, maxLevel: 10, category: 'Technical' },
    { name: 'Hydraulics', level: 9, maxLevel: 10, category: 'Technical' },
    { name: 'Avionics', level: 7, maxLevel: 10, category: 'Technical' },
  ] },
  'trainee-1': { traineeId: 'trainee-1', overallProgress: 0, readinessScore: 0, simulationHours: 0, completedCourses: 0, totalCourses: 8, completedModules: 0, totalModules: 81, recentActivity: [], skills: [
    { name: 'Engine Systems', level: 0, maxLevel: 10, category: 'Technical' },
    { name: 'Hydraulics', level: 0, maxLevel: 10, category: 'Technical' },
    { name: 'Avionics', level: 0, maxLevel: 10, category: 'Technical' },
  ] },
};

// ─── Training Sessions ────────────────────────────────────────────────────────
const trainingSessions = [
  { id: 'ts1', title: 'Engine Systems Review', instructorId: '2', date: '2024-01-16T09:00:00Z', duration: '2 hours', participants: ['1', '4'], type: 'classroom', status: 'scheduled' },
  { id: 'ts2', title: 'Emergency Procedures Drill', instructorId: '2', date: '2024-01-15T14:00:00Z', duration: '3 hours', participants: ['1', '4', '5'], type: 'simulation', status: 'completed' },
  { id: 'ts3', title: 'Hydraulic System Practical', instructorId: '2', date: '2024-01-17T10:00:00Z', duration: '4 hours', participants: ['5'], type: 'practical', status: 'scheduled' },
];

// ─── Scenarios ────────────────────────────────────────────────────────────────
const scenarios = [
  { id: 'sc1', title: 'Single Engine Failure', description: 'Simulate single engine failure during takeoff roll.', type: 'flight-readiness', difficulty: 'advanced', parameters: { altitude: '0 ft', speed: '120 kts', phase: 'takeoff' }, createdAt: '2024-01-01', updatedAt: '2024-01-10' },
  { id: 'sc2', title: 'Complete Electrical Failure', description: 'Total electrical system failure in IMC conditions.', type: 'maintenance', difficulty: 'advanced', parameters: { weather: 'IMC', altitude: '25000 ft', backup: 'battery-only' }, createdAt: '2023-12-15', updatedAt: '2024-01-05' },
  { id: 'sc3', title: 'Basic Navigation Exercise', description: 'Visual navigation exercise for beginners.', type: 'mission-rehearsal', difficulty: 'beginner', parameters: { weather: 'VMC', route: 'training-area-alpha' }, createdAt: '2024-01-08', updatedAt: '2024-01-08' },
];

// ─── Roles ────────────────────────────────────────────────────────────────────
const roles = [
  { id: 'r1', name: 'Trainee', permissions: [
    { id: 'p1', name: 'view_courses', description: 'View training courses', module: 'Training' },
    { id: 'p2', name: 'take_modules', description: 'Access training modules', module: 'Training' },
    { id: 'p3', name: 'view_progress', description: 'View own progress', module: 'Analytics' },
    { id: 'p4', name: 'run_simulations', description: 'Run simulations', module: 'Simulation' },
  ], userCount: 156, createdAt: '2023-01-01' },
  { id: 'r2', name: 'Instructor', permissions: [
    { id: 'p5', name: 'manage_trainees', description: 'Manage trainee progress', module: 'Training' },
    { id: 'p6', name: 'create_content', description: 'Create training content', module: 'Content' },
    { id: 'p7', name: 'view_analytics', description: 'View training analytics', module: 'Analytics' },
    { id: 'p8', name: 'manage_sessions', description: 'Schedule training sessions', module: 'Training' },
  ], userCount: 24, createdAt: '2023-01-01' },
  { id: 'r3', name: 'Administrator', permissions: [
    { id: 'p9', name: 'manage_users', description: 'Manage system users', module: 'Admin' },
    { id: 'p10', name: 'manage_roles', description: 'Configure roles', module: 'Admin' },
    { id: 'p11', name: 'view_audit_logs', description: 'View audit logs', module: 'Security' },
    { id: 'p12', name: 'system_config', description: 'Configure system settings', module: 'System' },
  ], userCount: 8, createdAt: '2023-01-01' },
];

// ─── Audit Logs ───────────────────────────────────────────────────────────────
const auditLogs = [
  { id: 'al1', userId: '3', userName: 'Gp. Capt. Priya Sharma', action: 'User Created', module: 'Admin', details: 'Created new user: Fg. Off. Rahul Kumar', timestamp: '2024-01-15T08:00:00Z', ipAddress: '10.0.1.100' },
  { id: 'al2', userId: '2', userName: 'Wing Cdr. Vikram Rao', action: 'Course Updated', module: 'Content', details: 'Updated module: Engine Start Procedures', timestamp: '2024-01-14T16:30:00Z', ipAddress: '10.0.1.105' },
  { id: 'al3', userId: '1', userName: 'Flt. Lt. Arjun Singh', action: 'Simulation Completed', module: 'Simulation', details: 'Completed: Pre-flight Inspection (Score: 95%)', timestamp: '2024-01-14T14:20:00Z', ipAddress: '10.0.1.110' },
  { id: 'al4', userId: '3', userName: 'Gp. Capt. Priya Sharma', action: 'Role Modified', module: 'Admin', details: 'Updated permissions for role: Instructor', timestamp: '2024-01-13T11:15:00Z', ipAddress: '10.0.1.100' },
  { id: 'al5', userId: '2', userName: 'Wing Cdr. Vikram Rao', action: 'Session Scheduled', module: 'Training', details: 'Scheduled: Engine Systems Review for 2024-01-16', timestamp: '2024-01-12T09:45:00Z', ipAddress: '10.0.1.105' },
];

// ─── System Status ────────────────────────────────────────────────────────────
const systemStatus = [
  { service: 'Authentication Service', status: 'operational', uptime: '99.9%', lastChecked: new Date().toISOString() },
  { service: 'Training Platform', status: 'operational', uptime: '99.5%', lastChecked: new Date().toISOString() },
  { service: 'Simulation Engine', status: 'operational', uptime: '98.8%', lastChecked: new Date().toISOString() },
  { service: 'Digital Twin Service', status: 'degraded', uptime: '95.2%', lastChecked: new Date().toISOString() },
  { service: 'AI Assistant', status: 'operational', uptime: '99.1%', lastChecked: new Date().toISOString() },
  { service: 'Analytics Engine', status: 'operational', uptime: '99.7%', lastChecked: new Date().toISOString() },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────
const alerts = [
  { id: 'alert1', type: 'critical', title: 'System Maintenance', message: 'Digital Twin Service experiencing degraded performance. Maintenance scheduled for 0200 hours.', timestamp: '2024-01-15T11:00:00Z', isRead: false },
  { id: 'alert2', type: 'warning', title: 'Training Deadline', message: 'Avionics Suite Overview course deadline approaching in 3 days.', timestamp: '2024-01-15T09:00:00Z', isRead: false },
  { id: 'alert3', type: 'info', title: 'New Simulation Available', message: 'New mission rehearsal simulation "Combat Air Patrol" is now available.', timestamp: '2024-01-14T15:00:00Z', isRead: true },
];

// ─── Analytics ────────────────────────────────────────────────────────────────
const analyticsData = {
  trainingCompletion: [
    { label: 'Week 1', value: 12 },
    { label: 'Week 2', value: 18 },
    { label: 'Week 3', value: 25 },
    { label: 'Week 4', value: 32 },
  ],
  readinessTrend: [
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 68 },
    { label: 'Mar', value: 72 },
    { label: 'Apr', value: 75 },
    { label: 'May', value: 78 },
    { label: 'Jun', value: 82 },
  ],
  simulationUsage: [
    { label: 'Maintenance', value: 45 },
    { label: 'Flight Readiness', value: 62 },
    { label: 'Mission Rehearsal', value: 38 },
  ],
  skillDistribution: [
    { label: 'Engine Systems', value: 78 },
    { label: 'Hydraulics', value: 85 },
    { label: 'Avionics', value: 62 },
    { label: 'Flight Controls', value: 70 },
    { label: 'Weapons', value: 55 },
  ],
};

// ─── Security Settings ────────────────────────────────────────────────────────
const securitySettings = {
  mfaEnabled: true,
  passwordPolicy: {
    minLength: 12,
    requireSpecialChar: true,
    requireNumbers: true,
    passwordHistory: 5,
  },
  sessionTimeout: 30, // minutes
  ipRangeRestriction: {
    enabled: false,
    allowedRanges: ['10.0.0.0/8'],
  },
  lastUpdated: new Date().toISOString(),
};

// ─── Chat History (per user) ──────────────────────────────────────────────────
const chatHistory = {
  '1': [
    { id: 'cm1', role: 'assistant', content: 'Welcome to the IAF Training Intelligence Platform. I am your AI training assistant. How can I help you today?', timestamp: '2024-01-15T10:00:00Z' },
  ],
  'trainee-1': [
    { id: 'cm-t1', role: 'assistant', content: 'Welcome to the IAF Training Intelligence Platform, Test Trainee. I am your AI training assistant. How can I help you today?', timestamp: new Date().toISOString() },
  ],
};

module.exports = {
  users,
  courses,
  modules,
  aircraftSystems,
  simulations,
  traineeProgress,
  trainingSessions,
  scenarios,
  roles,
  auditLogs,
  systemStatus,
  alerts,
  analyticsData,
  chatHistory,
  securitySettings,
};
