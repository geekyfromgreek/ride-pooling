// Nashik Geographic Nodes, Corridors, and Mock Telemetry
export const NASHIK_HUBS = [
  { id: "cbs", name: "CBS Chowk, Nashik", shortName: "CBS Chowk", lat: 19.9977, lon: 73.7803, tag: "Central Terminal" },
  { id: "college_rd", name: "College Road", shortName: "College Rd", lat: 20.0066, lon: 73.7609, tag: "Commercial/Academic" },
  { id: "gangapur_rd", name: "Gangapur Road", shortName: "Gangapur Rd", lat: 20.0116, lon: 73.7595, tag: "Residential/Corridor" },
  { id: "panchavati", name: "Panchavati", shortName: "Panchavati", lat: 20.0069, lon: 73.7930, tag: "Heritage Hub" },
  { id: "dwarka", name: "Dwarka Circle", shortName: "Dwarka", lat: 19.9931, lon: 73.8037, tag: "Transit Junction" },
  { id: "indira_nagar", name: "Indira Nagar", shortName: "Indira Nagar", lat: 19.9742, lon: 73.7819, tag: "South Suburb" },
  { id: "satpur_midc", name: "Satpur MIDC", shortName: "Satpur MIDC", lat: 19.9974, lon: 73.7213, tag: "Industrial Tech" },
  { id: "nashik_road", name: "Nashik Road Station", shortName: "Nashik Rd", lat: 19.9472, lon: 73.8421, tag: "Railway Terminal" },
  { id: "deolali", name: "Deolali Camp", shortName: "Deolali", lat: 19.8901, lon: 73.8265, tag: "Cantonment Zone" },
  { id: "cidco", name: "CIDCO", shortName: "CIDCO", lat: 19.9727, lon: 73.7579, tag: "Urban Sector" },
  { id: "ambad_midc", name: "Ambad MIDC", shortName: "Ambad", lat: 19.9515, lon: 73.7362, tag: "Industrial Belt" },
  { id: "mumbai_naka", name: "Mumbai Naka", shortName: "Mumbai Naka", lat: 19.9878, lon: 73.7825, tag: "Express Link" },
  { id: "ashok_stambh", name: "Ashok Stambh", shortName: "Ashok Stambh", lat: 20.0020, lon: 73.7870, tag: "Civic Center" },
  { id: "navashya", name: "Navashya Ganpati Ghat", shortName: "Navashya", lat: 20.0165, lon: 73.7422, tag: "Riverfront" },
  { id: "kapila", name: "Kapila Sangam Ghat", shortName: "Kapila Sangam", lat: 19.9984, lon: 73.8143, tag: "Riverfront Link" },
  // Newly Added Verified Nashik Urban Landmarks & Arterials
  { id: "govind_nagar", name: "Govind Nagar", shortName: "Govind Nagar", lat: 19.9822, lon: 73.7684, tag: "Residential Hub" },
  { id: "city_centre_mall", name: "City Centre Mall, Untwadi", shortName: "City Centre Mall", lat: 19.9885, lon: 73.7635, tag: "Retail & Transit" },
  { id: "mahatma_nagar", name: "Mahatma Nagar", shortName: "Mahatma Nagar", lat: 20.0035, lon: 73.7485, tag: "Academic & Sports" },
  { id: "parijat_nagar", name: "Parijat Nagar", shortName: "Parijat Nagar", lat: 19.9982, lon: 73.7548, tag: "Midtown Residential" },
  { id: "pathardi_phata", name: "Pathardi Phata", shortName: "Pathardi Phata", lat: 19.9405, lon: 73.7658, tag: "South Highway Junction" },
  { id: "jail_road", name: "Jail Road, Nashik Road", shortName: "Jail Road", lat: 19.9580, lon: 73.8325, tag: "Railway Suburban" },
  { id: "adgaon_naka", name: "Adgaon Naka (Highway Hub)", shortName: "Adgaon Naka", lat: 20.0385, lon: 73.8315, tag: "Highway & Medical Hub" },
  // Verified Academic Campuses & North Nashik Hubs
  { id: "pvg_coe", name: "PVG's College of Engineering (Dindori Rd, Mhasrul)", shortName: "PVG COE (Nashik)", lat: 20.0369, lon: 73.8007, tag: "Academic Campus" },
  { id: "meri_mhasrul", name: "MERI Research Institute, Dindori Rd", shortName: "MERI (Dindori Rd)", lat: 20.0270, lon: 73.7995, tag: "Research & Transit" },
  { id: "kbt_coe", name: "KBT College of Engineering, Gangapur Rd", shortName: "KBT COE", lat: 20.0162, lon: 73.7548, tag: "Academic Hub" },
  { id: "kkwagh", name: "KK Wagh Institute of Engg, Amrutdham", shortName: "KK Wagh COE", lat: 20.0135, lon: 73.8228, tag: "Academic Campus" },
  { id: "met_bhujbal", name: "MET Bhujbal Knowledge City, Adgaon", shortName: "MET Campus", lat: 20.0435, lon: 73.8492, tag: "Academic Campus" }
];

export const CORRIDORS = [
  // ─── 1. EXPRESS RADIAL TRUNK HIGHWAYS (Direct, minimal stops) ───
  {
    id: "c-station",
    name: "Nashik Road ➔ Dwarka ➔ CBS Chowk",
    code: "Nashik Road Station Express",
    subtitle: "High-Speed Radial Trunk Road",
    color: "#9d86e9",
    category: "express",
    categoryLabel: "Express Radial",
    isExpress: true,
    matchRate: 94,
    status: "Active",
    stops: ["Nashik Road Station", "Dwarka", "CBS Chowk"],
    liveVehicles: 7,
    avgWait: "1m 30s",
    headwayMin: 2.0,
    capacityTotal: 28,
    capacityOccupied: 22,
    hourlyDemandPax: 165,
    congestionStatus: "Optimal (48 km/h)",
    path: [
      [19.9472, 73.8421],
      [19.9931, 73.8037],
      [19.9977, 73.7803]
    ]
  },
  {
    id: "c-express-south",
    name: "Pathardi Phata ➔ Indira Nagar ➔ Mumbai Naka",
    code: "NH-3 Highway Express Road",
    subtitle: "South Highway Radial Gateway",
    color: "#f59e0b",
    category: "express",
    categoryLabel: "Express Radial",
    isExpress: true,
    matchRate: 91,
    status: "Active",
    stops: ["Pathardi Phata", "Indira Nagar", "Mumbai Naka"],
    liveVehicles: 5,
    avgWait: "2m 10s",
    headwayMin: 2.5,
    capacityTotal: 20,
    capacityOccupied: 15,
    hourlyDemandPax: 130,
    congestionStatus: "Fast Arterial (50 km/h)",
    path: [
      [19.9405, 73.7658],
      [19.9742, 73.7819],
      [19.9878, 73.7825]
    ]
  },
  {
    id: "c-express-retail",
    name: "College Rd ➔ City Centre Mall ➔ Govind Nagar",
    code: "Midtown Commercial Express",
    subtitle: "Direct Retail & Residential Road Link",
    color: "#38bdf8",
    category: "express",
    categoryLabel: "Express Radial",
    isExpress: true,
    matchRate: 95,
    status: "Active",
    stops: ["College Road", "City Centre Mall", "Govind Nagar"],
    liveVehicles: 6,
    avgWait: "1m 40s",
    headwayMin: 2.2,
    capacityTotal: 24,
    capacityOccupied: 19,
    hourlyDemandPax: 148,
    congestionStatus: "Optimal (42 km/h)",
    path: [
      [20.0066, 73.7609],
      [19.9885, 73.7635],
      [19.9822, 73.7684]
    ]
  },
  {
    id: "c-trimbak-express",
    name: "CBS Chowk ➔ Satpur MIDC ➔ Sandip University",
    code: "Trimbak Road Radial Express",
    subtitle: "West University & Industrial Radial Arterial",
    color: "#e11d48",
    category: "express",
    categoryLabel: "Express Radial",
    isExpress: true,
    matchRate: 93,
    status: "Active",
    stops: ["CBS Chowk", "Satpur MIDC", "Sandip University"],
    liveVehicles: 6,
    avgWait: "2m 00s",
    headwayMin: 2.4,
    capacityTotal: 24,
    capacityOccupied: 18,
    hourlyDemandPax: 142,
    congestionStatus: "Arterial Flow (45 km/h)",
    path: [
      [19.9977, 73.7803],
      [19.9974, 73.7213],
      [19.9675, 73.6821]
    ]
  },

  // ─── 2. URBAN ARTERIAL ROADS (Core city multi-stop transit lines) ───
  {
    id: "c-central",
    name: "CBS ➔ College Rd ➔ Gangapur Rd",
    code: "Central City Commercial Spine",
    subtitle: "Core Commercial & Academic Arterial Road",
    color: "#0ED4A8",
    category: "arterial",
    categoryLabel: "Busy Arterial",
    isExpress: false,
    matchRate: 88,
    status: "Active",
    stops: ["CBS Chowk", "College Rd", "Gangapur Road"],
    liveVehicles: 6,
    avgWait: "1m 50s",
    headwayMin: 2.4,
    capacityTotal: 24,
    capacityOccupied: 20,
    hourlyDemandPax: 155,
    congestionStatus: "Moderate Traffic (32 km/h)",
    path: [
      [19.9977, 73.7803],
      [20.0020, 73.7870],
      [20.0066, 73.7609],
      [20.0116, 73.7595]
    ]
  },
  {
    id: "c-tech",
    name: "Satpur MIDC ➔ CIDCO ➔ Indira Nagar",
    code: "Satpur-CIDCO Industrial Road",
    subtitle: "Industrial Commuter Arterial",
    color: "#22d3ee",
    category: "arterial",
    categoryLabel: "Busy Arterial",
    isExpress: false,
    matchRate: 82,
    status: "Active",
    stops: ["Satpur MIDC", "CIDCO", "Indira Nagar"],
    liveVehicles: 5,
    avgWait: "3m 40s",
    headwayMin: 3.5,
    capacityTotal: 20,
    capacityOccupied: 14,
    hourlyDemandPax: 110,
    congestionStatus: "Industrial Corridor (35 km/h)",
    path: [
      [19.9974, 73.7213],
      [19.9727, 73.7579],
      [19.9742, 73.7819]
    ]
  },
  {
    id: "c-south",
    name: "Ambad MIDC ➔ CIDCO ➔ Mumbai Naka",
    code: "Ambad-Mumbai Naka Spine",
    subtitle: "South Manufacturing Arterial Link",
    color: "#fb923c",
    category: "arterial",
    categoryLabel: "Busy Arterial",
    isExpress: false,
    matchRate: 88,
    status: "Active",
    stops: ["Ambad MIDC", "CIDCO", "Mumbai Naka"],
    liveVehicles: 5,
    avgWait: "3m 15s",
    headwayMin: 3.2,
    capacityTotal: 20,
    capacityOccupied: 16,
    hourlyDemandPax: 125,
    congestionStatus: "Arterial Flow (38 km/h)",
    path: [
      [19.9515, 73.7362],
      [19.9727, 73.7579],
      [19.9878, 73.7825]
    ]
  },
  {
    id: "c-panchavati-spine",
    name: "Panchavati ➔ Ashok Stambh ➔ CBS Chowk",
    code: "Old City Civic Spine",
    subtitle: "High-Traffic Heritage Center Arterial",
    color: "#ec4899",
    category: "arterial",
    categoryLabel: "Busy Arterial",
    isExpress: false,
    matchRate: 90,
    status: "Active",
    stops: ["Panchavati", "Ashok Stambh", "CBS Chowk"],
    liveVehicles: 6,
    avgWait: "1m 45s",
    headwayMin: 2.2,
    capacityTotal: 24,
    capacityOccupied: 19,
    hourlyDemandPax: 145,
    congestionStatus: "Dense City Flow (30 km/h)",
    path: [
      [20.0069, 73.7930],
      [20.0020, 73.7870],
      [19.9977, 73.7803]
    ]
  },
  {
    id: "c-dwarka-arterial",
    name: "Dwarka ➔ Mumbai Naka ➔ CBS Chowk",
    code: "Dwarka Highway Arterial",
    subtitle: "High-Demand Central Connecting Road",
    color: "#8b5cf6",
    category: "arterial",
    categoryLabel: "Busy Arterial",
    isExpress: false,
    matchRate: 92,
    status: "Active",
    stops: ["Dwarka", "Mumbai Naka", "CBS Chowk"],
    liveVehicles: 6,
    avgWait: "1m 50s",
    headwayMin: 2.1,
    capacityTotal: 24,
    capacityOccupied: 20,
    hourlyDemandPax: 152,
    congestionStatus: "Heavy Traffic (29 km/h)",
    path: [
      [19.9931, 73.8037],
      [19.9878, 73.7825],
      [19.9977, 73.7803]
    ]
  },

  // ─── 3. CAMPUS & COLLEGE ROADS (Heavy student & commuter transit) ───
  {
    id: "c-dindori-academic",
    name: "PVG COE ➔ MERI Mhasrul ➔ Panchavati",
    code: "Dindori Road College Corridor",
    subtitle: "Heavy Student & Academic Commuter Arterial",
    color: "#10b981",
    category: "campus",
    categoryLabel: "Campus Corridor",
    isExpress: false,
    matchRate: 95,
    status: "Active",
    stops: ["PVG's COE", "MERI Colony", "Panchavati"],
    liveVehicles: 6,
    avgWait: "1m 40s",
    headwayMin: 2.1,
    capacityTotal: 24,
    capacityOccupied: 21,
    hourlyDemandPax: 160,
    congestionStatus: "Campus Flow (38 km/h)",
    path: [
      [20.0369, 73.8007],
      [20.0245, 73.7981],
      [20.0069, 73.7930]
    ]
  },
  {
    id: "c-gangapur-academic",
    name: "Navashya Ganapati ➔ KBT COE ➔ College Rd",
    code: "Gangapur Academic Road",
    subtitle: "Premier West College & Student Belt",
    color: "#06b6d4",
    category: "campus",
    categoryLabel: "Campus Corridor",
    isExpress: false,
    matchRate: 91,
    status: "Active",
    stops: ["Navashya Ganapati", "KBT COE", "College Road"],
    liveVehicles: 5,
    avgWait: "2m 15s",
    headwayMin: 2.6,
    capacityTotal: 20,
    capacityOccupied: 16,
    hourlyDemandPax: 128,
    congestionStatus: "Smooth Academic (40 km/h)",
    path: [
      [20.0152, 73.7381],
      [20.0132, 73.7554],
      [20.0066, 73.7609]
    ]
  },
  {
    id: "c-amrutdham-tech",
    name: "KK Wagh COE ➔ MET Bhujbal Campus ➔ Adgaon Naka",
    code: "Amrutdham Engineering Belt",
    subtitle: "Adgaon Tech & University Hub Road",
    color: "#6366f1",
    category: "campus",
    categoryLabel: "Campus Corridor",
    isExpress: false,
    matchRate: 89,
    status: "Active",
    stops: ["KK Wagh COE", "MET Campus", "Adgaon Naka"],
    liveVehicles: 5,
    avgWait: "2m 20s",
    headwayMin: 2.8,
    capacityTotal: 20,
    capacityOccupied: 15,
    hourlyDemandPax: 122,
    congestionStatus: "Arterial (42 km/h)",
    path: [
      [20.0135, 73.8228],
      [20.0435, 73.8492],
      [20.0289, 73.8345]
    ]
  },
  {
    id: "c-west-academic",
    name: "Mahatma Nagar ➔ Parijat Nagar ➔ College Rd",
    code: "West College Feeder Road",
    subtitle: "Academic & Sports Campus Feeder",
    color: "#84cc16",
    category: "campus",
    categoryLabel: "Campus Corridor",
    isExpress: false,
    matchRate: 89,
    status: "Active",
    stops: ["Mahatma Nagar", "Parijat Nagar", "College Road"],
    liveVehicles: 4,
    avgWait: "2m 00s",
    headwayMin: 3.0,
    capacityTotal: 16,
    capacityOccupied: 11,
    hourlyDemandPax: 95,
    congestionStatus: "Smooth Flow (40 km/h)",
    path: [
      [20.0035, 73.7485],
      [19.9982, 73.7548],
      [20.0066, 73.7609]
    ]
  },
  {
    id: "c-sandip-campus",
    name: "Sandip University ➔ Satpur MIDC ➔ Gangapur Rd",
    code: "Trimbak-Gangapur Academic Cross",
    subtitle: "Cross-City University Transit Road",
    color: "#14b8a6",
    category: "campus",
    categoryLabel: "Campus Corridor",
    isExpress: false,
    matchRate: 86,
    status: "Active",
    stops: ["Sandip University", "Satpur MIDC", "Gangapur Road"],
    liveVehicles: 4,
    avgWait: "2m 50s",
    headwayMin: 3.4,
    capacityTotal: 16,
    capacityOccupied: 12,
    hourlyDemandPax: 105,
    congestionStatus: "Semi-Urban Flow (44 km/h)",
    path: [
      [19.9675, 73.6821],
      [19.9974, 73.7213],
      [20.0116, 73.7595]
    ]
  },

  // ─── 4. SUBURBAN & COMMUTER BELTS (First/last mile & residential links) ───
  {
    id: "c-east-railway",
    name: "Jail Road ➔ Nashik Road Station ➔ Dwarka",
    code: "Jail Road Commuter Link",
    subtitle: "High-Frequency Suburban Station Feeder",
    color: "#a855f7",
    category: "feeder",
    categoryLabel: "Suburban Link",
    isExpress: false,
    matchRate: 94,
    status: "Active",
    stops: ["Jail Road", "Nashik Road Station", "Dwarka"],
    liveVehicles: 5,
    avgWait: "1m 35s",
    headwayMin: 2.5,
    capacityTotal: 20,
    capacityOccupied: 17,
    hourlyDemandPax: 138,
    congestionStatus: "Station Approach (34 km/h)",
    path: [
      [19.9580, 73.8325],
      [19.9472, 73.8421],
      [19.9931, 73.8037]
    ]
  },
  {
    id: "c-deolali-suburban",
    name: "Deolali Camp ➔ Nashik Road ➔ Jail Road",
    code: "Cantonment Commuter Road",
    subtitle: "Military Cantonment & South Station Link",
    color: "#d97706",
    category: "feeder",
    categoryLabel: "Suburban Link",
    isExpress: false,
    matchRate: 87,
    status: "Active",
    stops: ["Deolali Camp", "Nashik Road Station", "Jail Road"],
    liveVehicles: 4,
    avgWait: "2m 30s",
    headwayMin: 3.0,
    capacityTotal: 16,
    capacityOccupied: 12,
    hourlyDemandPax: 98,
    congestionStatus: "Cantonment Flow (38 km/h)",
    path: [
      [19.9142, 73.8315],
      [19.9472, 73.8421],
      [19.9580, 73.8325]
    ]
  },
  {
    id: "c-heritage",
    name: "Panchavati ➔ Kapila Sangam ➔ Ashok Stambh",
    code: "Godavari Riverfront Road",
    subtitle: "Riverfront & Local Market Connector",
    color: "#0d9488",
    category: "feeder",
    categoryLabel: "Suburban Link",
    isExpress: false,
    matchRate: 86,
    status: "Active",
    stops: ["Panchavati", "Kapila Sangam", "Ashok Stambh"],
    liveVehicles: 4,
    avgWait: "2m 30s",
    headwayMin: 3.2,
    capacityTotal: 16,
    capacityOccupied: 10,
    hourlyDemandPax: 88,
    congestionStatus: "Heritage Zone (28 km/h)",
    path: [
      [20.0069, 73.7930],
      [19.9984, 73.8143],
      [20.0020, 73.7870]
    ]
  },
  {
    id: "c-cidco-mall",
    name: "CIDCO ➔ City Centre Mall ➔ Govind Nagar",
    code: "Untwadi Commercial Road",
    subtitle: "Retail Hub & Residential Link Road",
    color: "#0284c7",
    category: "feeder",
    categoryLabel: "Suburban Link",
    isExpress: false,
    matchRate: 90,
    status: "Active",
    stops: ["CIDCO", "City Centre Mall", "Govind Nagar"],
    liveVehicles: 5,
    avgWait: "2m 05s",
    headwayMin: 2.5,
    capacityTotal: 20,
    capacityOccupied: 16,
    hourlyDemandPax: 130,
    congestionStatus: "Midtown Flow (36 km/h)",
    path: [
      [19.9727, 73.7579],
      [19.9885, 73.7635],
      [19.9822, 73.7684]
    ]
  },
  {
    id: "c-adgaon-panchavati",
    name: "Adgaon Naka ➔ KK Wagh COE ➔ Panchavati",
    code: "NH-3 Inbound Commuter Road",
    subtitle: "North-East Arterial Commuter Road",
    color: "#64748b",
    category: "feeder",
    categoryLabel: "Suburban Link",
    isExpress: false,
    matchRate: 88,
    status: "Active",
    stops: ["Adgaon Naka", "KK Wagh COE", "Panchavati"],
    liveVehicles: 4,
    avgWait: "2m 10s",
    headwayMin: 2.8,
    capacityTotal: 16,
    capacityOccupied: 13,
    hourlyDemandPax: 112,
    congestionStatus: "Highway Entry Flow (42 km/h)",
    path: [
      [20.0289, 73.8345],
      [20.0135, 73.8228],
      [20.0069, 73.7930]
    ]
  }
];

export const FLEET_VEHICLES = [
  {
    id: "V1",
    model: "Tata Tigor EV",
    license: "IN-MH15-8821",
    status: "transit",
    statusLabel: "IN TRANSIT",
    routeVector: "CBS Chowk ➔ College Rd",
    speed: "36 km/h",
    soc: "84%",
    driver: "Sunil Shinde",
    driverBadge: "Verified Pilot",
    driverGender: "male",
    seatsTotal: 4,
    seatsOccupied: 3,
    lat: 19.9977,
    lon: 73.7803
  },
  {
    id: "V2",
    model: "Tata Tiago EV",
    license: "IN-MH15-4109",
    status: "transit",
    statusLabel: "IN TRANSIT",
    routeVector: "Satpur MIDC ➔ CIDCO",
    speed: "38 km/h",
    soc: "78%",
    driver: "Pooja Deshmukh",
    driverBadge: "Women-Verified Pilot",
    driverGender: "female",
    seatsTotal: 4,
    seatsOccupied: 2,
    lat: 19.9850,
    lon: 73.7396
  },
  {
    id: "V3",
    model: "Tata Nexon EV",
    license: "IN-MH15-9944",
    status: "terminal",
    statusLabel: "AT TERMINAL",
    routeVector: "Staged at CBS Terminal Bay 2",
    speed: "0 km/h",
    soc: "95%",
    driver: "Anjali Patil",
    driverBadge: "Women-Verified Pilot",
    driverGender: "female",
    seatsTotal: 4,
    seatsOccupied: 0,
    lat: 20.0012,
    lon: 73.7715
  },
  {
    id: "V4",
    model: "MG ZS EV",
    license: "IN-MH15-6218",
    status: "transit",
    statusLabel: "IN TRANSIT",
    routeVector: "Dwarka Circle ➔ Nashik Road",
    speed: "48 km/h",
    soc: "74%",
    driver: "Vikram Kulkarni",
    driverBadge: "Verified Pilot",
    driverGender: "male",
    seatsTotal: 4,
    seatsOccupied: 4,
    lat: 19.9701,
    lon: 73.8229
  },
  {
    id: "V5",
    model: "Hyundai Kona EV",
    license: "IN-MH15-3390",
    status: "terminal",
    statusLabel: "AT TERMINAL",
    routeVector: "Staged at Nashik Road Depot",
    speed: "0 km/h",
    soc: "88%",
    driver: "Sunita Shinde",
    driverBadge: "Women-Verified Pilot",
    driverGender: "female",
    seatsTotal: 4,
    seatsOccupied: 0,
    lat: 19.9472,
    lon: 73.8421
  },
  {
    id: "V6",
    model: "Tata Tigor EV",
    license: "IN-MH15-1123",
    status: "maintenance",
    statusLabel: "MAINTENANCE",
    routeVector: "Ambad Depot DC Fast Charging",
    speed: "0 km/h",
    soc: "32%",
    driver: "Depot Technical Crew",
    driverBadge: "Technical Ops",
    driverGender: "neutral",
    seatsTotal: 4,
    seatsOccupied: 0,
    lat: 19.9515,
    lon: 73.7362
  }
];

export const DRIVER_POOL = [
  // ─── 1. AUTO RICKSHAWS (3 Riders Max, Center Driver with Khaki Uniform) ───
  {
    name: 'Ganesh Borde',
    initials: 'GB',
    model: 'Bajaj RE Auto',
    vehicleType: 'auto',
    maxSeats: 3,
    plate: 'MH 15 TA 3140',
    rating: '4.88',
    trips: '4,120',
    gender: 'male',
    verifiedBadge: 'Verified Auto Pilot'
  },
  {
    name: 'Sunita Jadhav',
    initials: 'SJ',
    model: 'Piaggio Ape E-City Auto',
    vehicleType: 'auto',
    maxSeats: 3,
    plate: 'MH 15 TB 8820',
    rating: '4.95',
    trips: '2,890',
    gender: 'female',
    verifiedBadge: 'Women-Verified Auto Pilot'
  },
  {
    name: 'Dnyaneshwar Shinde',
    initials: 'DS',
    model: 'Mahindra Treo EV Auto',
    vehicleType: 'auto',
    maxSeats: 3,
    plate: 'MH 15 TC 1904',
    rating: '4.91',
    trips: '3,450',
    gender: 'male',
    verifiedBadge: 'EV Auto Pilot'
  },
  {
    name: 'Santosh Kadam',
    initials: 'SK',
    model: 'Bajaj Compact Auto',
    vehicleType: 'auto',
    maxSeats: 3,
    plate: 'MH 15 TD 6215',
    rating: '4.86',
    trips: '2,310',
    gender: 'male',
    verifiedBadge: 'Verified Auto Pilot'
  },

  // ─── 2. EXECUTIVE SEDANS (Formal Chauffeur Uniform) ───
  {
    name: 'Rajesh Gaikwad',
    initials: 'RG',
    model: 'Maruti Suzuki Dzire Sedan',
    vehicleType: 'sedan',
    maxSeats: 4,
    plate: 'MH 15 CZ 9912',
    rating: '4.92',
    trips: '2,640',
    gender: 'male',
    verifiedBadge: 'Executive Chauffeur'
  },
  {
    name: 'Priya Sharma',
    initials: 'PS',
    model: 'Hyundai Aura Sedan',
    vehicleType: 'sedan',
    maxSeats: 4,
    plate: 'MH 15 DF 4310',
    rating: '4.96',
    trips: '3,100',
    gender: 'female',
    verifiedBadge: 'Women-Verified Chauffeur'
  },
  {
    name: 'Sachin Bhalerao',
    initials: 'SB',
    model: 'Honda Amaze Sedan',
    vehicleType: 'sedan',
    maxSeats: 4,
    plate: 'MH 15 EG 7780',
    rating: '4.90',
    trips: '1,980',
    gender: 'male',
    verifiedBadge: 'Executive Chauffeur'
  },

  // ─── 3. SMALL CARS / HATCHBACKS (City Fleet) ───
  {
    name: 'Ramesh Patil',
    initials: 'RP',
    model: 'Maruti WagonR',
    vehicleType: 'small_car',
    maxSeats: 4,
    plate: 'MH 15 AB 4821',
    rating: '4.89',
    trips: '2,140',
    gender: 'male',
    verifiedBadge: 'City Cab Pilot'
  },
  {
    name: 'Vinay Joshi',
    initials: 'VJ',
    model: 'Tata Tiago Hatchback',
    vehicleType: 'small_car',
    maxSeats: 4,
    plate: 'MH 15 PQ 2045',
    rating: '4.87',
    trips: '1,120',
    gender: 'male',
    verifiedBadge: 'City Cab Pilot'
  },
  {
    name: 'Kavita Jadhav',
    initials: 'KJ',
    model: 'Maruti Swift ZXi',
    vehicleType: 'small_car',
    maxSeats: 4,
    plate: 'MH 15 LM 8832',
    rating: '4.93',
    trips: '2,190',
    gender: 'female',
    verifiedBadge: 'Women-Verified Pilot'
  },

  // ─── 4. ELECTRIC VEHICLES (EV Fleet) ───
  {
    name: 'Pooja Deshmukh',
    initials: 'PD',
    model: 'Tata Nexon EV Max',
    vehicleType: 'ev',
    maxSeats: 4,
    plate: 'MH 15 BK 7714',
    rating: '4.95',
    trips: '3,210',
    gender: 'female',
    verifiedBadge: 'Women-Verified EV Pilot'
  },
  {
    name: 'Vikram Kulkarni',
    initials: 'VK',
    model: 'Tata Tigor EV',
    vehicleType: 'ev',
    maxSeats: 4,
    plate: 'MH 15 EV 9021',
    rating: '4.91',
    trips: '1,720',
    gender: 'male',
    verifiedBadge: 'EV Green Pilot'
  },
  {
    name: 'Deepak Pawar',
    initials: 'DP',
    model: 'BYD Atto 3 EV',
    vehicleType: 'ev',
    maxSeats: 4,
    plate: 'MH 15 JK 6701',
    rating: '4.89',
    trips: '1,650',
    gender: 'male',
    verifiedBadge: 'EV Fleet Pilot'
  },
  {
    name: 'Anjali Patil',
    initials: 'AP',
    model: 'Mahindra XUV400 EV',
    vehicleType: 'ev',
    maxSeats: 4,
    plate: 'MH 15 EV 5560',
    rating: '4.94',
    trips: '2,750',
    gender: 'female',
    verifiedBadge: 'Women-Verified EV Pilot'
  }
];

export function getRandomDriver(womenVerifiedOnly = false, seed = null) {
  let list = DRIVER_POOL;
  if (womenVerifiedOnly) {
    const womenList = DRIVER_POOL.filter((d) => d.gender === 'female');
    if (womenList.length > 0) list = womenList;
  }
  const idx = typeof seed === 'number'
    ? Math.abs(seed) % list.length
    : Math.floor(Math.random() * list.length);
  return list[idx];
}

/**
 * Returns a realistic, dynamic shared ride upstream origin where the vehicle is coming from,
 * representing an existing co-rider's pickup point along the transit network.
 * Strictly constrained within a diameter of MIN 0 KM and MAX 1.5 KM from the pickup location.
 * Dynamic and random each time.
 */
export function getSharedRideOrigin(originHub, destHub, seed = null) {
  if (!originHub) return NASHIK_HUBS[0];

  const MAX_RADIUS_KM = 1.46; // Strictly <= 1.5 km maximum constraint
  const MIN_RADIUS_KM = 0.38; // Minimum distance to ensure visible upstream journey

  // Comprehensive Nashik micro-feeder landmarks database across all key city sectors
  const nashikLandmarkCatalog = [
    // North / Mhasrul / Dindori
    { name: "Mhasrul Gaon Gate", shortName: "Mhasrul Gate", lat: 20.0335, lon: 73.8042 },
    { name: "RTO Approach Point", shortName: "RTO Approach", lat: 20.0298, lon: 73.8015 },
    { name: "Dindori Road Feeder Bay", shortName: "Dindori Rd Bay", lat: 20.0412, lon: 73.8031 },
    { name: "Kasturi Nagar Cross", shortName: "Kasturi Nagar", lat: 20.0315, lon: 73.7958 },
    { name: "MERI Colony Feeder", shortName: "MERI Colony", lat: 20.0245, lon: 73.7981 },
    { name: "Makhmalabad Link Road", shortName: "Makhmalabad Link", lat: 20.0275, lon: 73.7845 },
    // West / Gangapur / Anandwalli
    { name: "Anandwalli Village Square", shortName: "Anandwalli Sq", lat: 20.0125, lon: 73.7428 },
    { name: "Navashya Riverfront Cross", shortName: "Riverfront Cross", lat: 20.0185, lon: 73.7352 },
    { name: "Gangapur Naka Link", shortName: "Gangapur Naka", lat: 20.0142, lon: 73.7475 },
    { name: "NDMVP KBT College Gate", shortName: "KBT College", lat: 20.0132, lon: 73.7554 },
    { name: "Dhruv Nagar Entry Point", shortName: "Dhruv Nagar", lat: 20.0182, lon: 73.7545 },
    { name: "Serene Meadows Approach", shortName: "Serene Meadows", lat: 20.0165, lon: 73.7482 },
    { name: "Gangapur Road Junction", shortName: "Gangapur Rd", lat: 20.0116, lon: 73.7595 },
    // Midtown / College Road
    { name: "Bhonsala Military Gate", shortName: "Bhonsala Gate", lat: 20.0028, lon: 73.7552 },
    { name: "BYK College Campus Corner", shortName: "BYK Corner", lat: 20.0085, lon: 73.7645 },
    { name: "Parijat Nagar Circle", shortName: "Parijat Nagar", lat: 19.9982, lon: 73.7548 },
    { name: "Thatte Nagar Cross Point", shortName: "Thatte Nagar", lat: 20.0035, lon: 73.7682 },
    { name: "Canada Corner Approach", shortName: "Canada Corner", lat: 20.0015, lon: 73.7745 },
    { name: "Sharanpur Road Junction", shortName: "Sharanpur Rd", lat: 19.9985, lon: 73.7725 },
    // Central / CBS / Old City
    { name: "Shalimar Chowk Point", shortName: "Shalimar Point", lat: 19.9942, lon: 73.7852 },
    { name: "Ashok Stambh Central Square", shortName: "Ashok Stambh", lat: 20.0020, lon: 73.7870 },
    { name: "Mumbai Naka Gateway", shortName: "Mumbai Naka", lat: 19.9878, lon: 73.7825 },
    { name: "Kalaram Mandir Gate", shortName: "Kalaram Gate", lat: 20.0082, lon: 73.7965 },
    { name: "Nimani Bus Stand Point", shortName: "Nimani Stand", lat: 20.0045, lon: 73.7995 },
    { name: "Ramkund River Ghat", shortName: "Ramkund Ghat", lat: 20.0055, lon: 73.7915 },
    // South / Tidke / Govind / CIDCO
    { name: "City Centre Mall Point", shortName: "City Centre", lat: 19.9885, lon: 73.7635 },
    { name: "Govind Nagar Circle", shortName: "Govind Nagar", lat: 19.9822, lon: 73.7684 },
    { name: "Trimurti Chowk Sector 4", shortName: "Trimurti Sq", lat: 19.9685, lon: 73.7545 },
    { name: "Pavan Nagar Stadium Point", shortName: "Pavan Nagar", lat: 19.9765, lon: 73.7535 },
    { name: "Uttam Nagar Cross", shortName: "Uttam Nagar", lat: 19.9755, lon: 73.7645 },
    { name: "Lekha Nagar Junction", shortName: "Lekha Nagar", lat: 19.9675, lon: 73.7625 },
    // South-East / Indira Nagar / Dwarka
    { name: "Indira Nagar Jogging Track", shortName: "Jogging Track", lat: 19.9785, lon: 73.7775 },
    { name: "Rane Nagar Cross Link", shortName: "Rane Nagar", lat: 19.9695, lon: 73.7785 },
    { name: "Wadala Gaon Road Point", shortName: "Wadala Road", lat: 19.9815, lon: 73.7865 },
    { name: "Kathe Galli Junction", shortName: "Kathe Galli", lat: 19.9882, lon: 73.8005 },
    { name: "Dwarka Highway Underpass", shortName: "Dwarka Pass", lat: 19.9962, lon: 73.8078 },
    { name: "Kapila Teerth Point", shortName: "Kapila Sangam", lat: 19.9984, lon: 73.8143 },
    // Industrial Satpur & Ambad
    { name: "Trimbak Road ITI Circle", shortName: "ITI Circle", lat: 19.9925, lon: 73.7265 },
    { name: "NICE Industrial Area", shortName: "NICE Area", lat: 20.0025, lon: 73.7185 },
    { name: "Carbon Naka Junction", shortName: "Carbon Naka", lat: 19.9895, lon: 73.7315 },
    { name: "Siemens Point Circle", shortName: "Siemens Point", lat: 19.9555, lon: 73.7325 },
    { name: "Garware Point Gate", shortName: "Garware Point", lat: 19.9475, lon: 73.7395 },
    { name: "XLO Point Junction", shortName: "XLO Point", lat: 19.9585, lon: 73.7415 },
    // East / KK Wagh / Nashik Road
    { name: "Amrutdham Shani Mandir", shortName: "Shani Mandir", lat: 20.0185, lon: 73.8185 },
    { name: "Rasbihari School Road", shortName: "Rasbihari Road", lat: 20.0215, lon: 73.8265 },
    { name: "Bitco Point Junction", shortName: "Bitco Point", lat: 19.9515, lon: 73.8375 },
    { name: "Datta Mandir Road Point", shortName: "Datta Mandir", lat: 19.9432, lon: 73.8385 },
    { name: "Muktidham Temple Gate", shortName: "Muktidham Gate", lat: 19.9455, lon: 73.8475 },
    { name: "Jail Road Dasak Corner", shortName: "Dasak Corner", lat: 19.9625, lon: 73.8285 }
  ];

  // Pseudo-random generator function (seeded or pure random)
  let rng = Math.random;
  if (typeof seed === 'number' && !isNaN(seed)) {
    let s = Math.abs(seed);
    if (s === 0) s = 12345;
    rng = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  // 1. Calculate dynamic random distance strictly within [MIN_RADIUS_KM, MAX_RADIUS_KM]
  const distKm = Number((MIN_RADIUS_KM + rng() * (MAX_RADIUS_KM - MIN_RADIUS_KM)).toFixed(2));

  // 2. Calculate dynamic random angle (0 to 360 degrees)
  const angle = rng() * 2 * Math.PI;

  // 3. Compute coordinates offset (1 deg lat ~= 111 km, 1 deg lon ~= 104 km in Nashik)
  const rawLat = originHub.lat + (distKm / 111.0) * Math.cos(angle);
  const rawLon = originHub.lon + (distKm / 104.0) * Math.sin(angle);
  const lat = Number(rawLat.toFixed(6));
  const lon = Number(rawLon.toFixed(6));

  // Verify distance
  const verifiedDist = Number(Math.hypot((lat - originHub.lat) * 111.0, (lon - originHub.lon) * 104.0).toFixed(2));

  // 4. Determine compass direction for intuitive human naming
  let deg = (angle * 180 / Math.PI + 360) % 360;
  // Convert mathematical angle to compass bearing (0 = North, 90 = East, 180 = South, 270 = West)
  // In math: cos(angle) is dLat (North/South), sin(angle) is dLon (East/West)
  const bearing = (Math.atan2(Math.sin(angle), Math.cos(angle)) * 180 / Math.PI + 360) % 360;
  
  let dirName = "North-West";
  if (bearing >= 337.5 || bearing < 22.5) dirName = "North";
  else if (bearing >= 22.5 && bearing < 67.5) dirName = "North-East";
  else if (bearing >= 67.5 && bearing < 112.5) dirName = "East";
  else if (bearing >= 112.5 && bearing < 157.5) dirName = "South-East";
  else if (bearing >= 157.5 && bearing < 202.5) dirName = "South";
  else if (bearing >= 202.5 && bearing < 247.5) dirName = "South-West";
  else if (bearing >= 247.5 && bearing < 292.5) dirName = "West";
  else dirName = "North-West";

  // 5. Check if any authentic landmark is within 400m of this generated point
  let closestLandmark = null;
  let minLandmarkDist = 999;
  for (const lm of nashikLandmarkCatalog) {
    if (originHub.id && lm.name.toLowerCase().includes(originHub.id.toLowerCase())) continue;
    const d = Math.hypot((lm.lat - lat) * 111.0, (lm.lon - lon) * 104.0);
    if (d < 0.45 && d < minLandmarkDist) {
      minLandmarkDist = d;
      closestLandmark = lm;
    }
  }

  const uniqueId = `shared_feeder_${Math.abs(Math.floor(lat * 10000))}_${Math.abs(Math.floor(lon * 10000))}`;
  const hubBaseName = originHub.shortName || originHub.name || "Pickup";

  if (closestLandmark) {
    return {
      id: uniqueId,
      name: `${closestLandmark.name} (${verifiedDist} km away)`,
      shortName: `${closestLandmark.shortName} (${verifiedDist} km)`,
      lat,
      lon,
      distanceToPickupKm: verifiedDist,
      isDynamicRandom: true
    };
  }

  return {
    id: uniqueId,
    name: `${hubBaseName} ${dirName} Approach Bay (${verifiedDist} km away)`,
    shortName: `${hubBaseName} ${dirName} (${verifiedDist} km)`,
    lat,
    lon,
    distanceToPickupKm: verifiedDist,
    isDynamicRandom: true
  };
}
