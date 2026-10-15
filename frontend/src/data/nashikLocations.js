// Nashik Geographic Nodes, Corridors, and Mock Telemetry
export const NASHIK_HUBS = [
  // ─── CENTRAL TERMINALS & CIVIC HUBS ───
  { id: "cbs", name: "CBS Chowk (Central Bus Stand)", shortName: "CBS Chowk", lat: 19.9977, lon: 73.7803, tag: "Central Terminal" },
  { id: "ashok_stambh", name: "Ashok Stambh Central Square", shortName: "Ashok Stambh", lat: 20.0020, lon: 73.7870, tag: "Civic Center" },
  { id: "mumbai_naka", name: "Mumbai Naka Gateway", shortName: "Mumbai Naka", lat: 19.9878, lon: 73.7825, tag: "Express Link" },
  { id: "dwarka", name: "Dwarka Circle Transit Junction", shortName: "Dwarka Circle", lat: 19.9931, lon: 73.8037, tag: "Transit Junction" },
  { id: "shalimar_chowk", name: "Shalimar Chowk Market Point", shortName: "Shalimar Chowk", lat: 19.9942, lon: 73.7852, tag: "Civic & Retail" },
  { id: "mahamarg_bus_stand", name: "Mahamarg Bus Stand, Mumbai Naka", shortName: "Mahamarg Stand", lat: 19.9865, lon: 73.7832, tag: "Intercity Transit" },
  { id: "thakkar_bazaar", name: "Thakkar Bazaar Bus Terminal", shortName: "Thakkar Bazaar", lat: 19.9958, lon: 73.7785, tag: "Bus Terminal" },
  { id: "nimani_bus_stand", name: "Nimani Bus Stand, Panchavati", shortName: "Nimani Stand", lat: 20.0045, lon: 73.7995, tag: "Panchavati Terminal" },
  { id: "canada_corner", name: "Canada Corner Junction", shortName: "Canada Corner", lat: 20.0015, lon: 73.7745, tag: "Civic Junction" },
  { id: "sharanpur_road", name: "Sharanpur Road Circle", shortName: "Sharanpur Rd", lat: 19.9985, lon: 73.7725, tag: "Central Corridor" },

  // ─── MIDTOWN, COLLEGE ROAD & GANGAPUR ROAD ───
  { id: "college_rd", name: "College Road Commercial Hub", shortName: "College Rd", lat: 20.0066, lon: 73.7609, tag: "Commercial/Academic" },
  { id: "gangapur_rd", name: "Gangapur Road Junction", shortName: "Gangapur Rd", lat: 20.0116, lon: 73.7595, tag: "Residential/Corridor" },
  { id: "parijat_nagar", name: "Parijat Nagar Circle", shortName: "Parijat Nagar", lat: 19.9982, lon: 73.7548, tag: "Midtown Residential" },
  { id: "mahatma_nagar", name: "Mahatma Nagar Sports Complex", shortName: "Mahatma Nagar", lat: 20.0035, lon: 73.7485, tag: "Academic & Sports" },
  { id: "thatte_nagar", name: "Thatte Nagar Cross Point", shortName: "Thatte Nagar", lat: 20.0035, lon: 73.7682, tag: "Midtown Junction" },
  { id: "bhonsala_circle", name: "Bhonsala Military Circle", shortName: "Bhonsala Circle", lat: 20.0028, lon: 73.7552, tag: "Academic Hub" },
  { id: "jehan_circle", name: "Jehan Circle, Gangapur Road", shortName: "Jehan Circle", lat: 20.0145, lon: 73.7525, tag: "Retail Junction" },
  { id: "serene_meadows", name: "Serene Meadows Approach", shortName: "Serene Meadows", lat: 20.0165, lon: 73.7482, tag: "Upscale Residential" },
  { id: "anandwalli", name: "Anandwalli Village Square", shortName: "Anandwalli Sq", lat: 20.0125, lon: 73.7428, tag: "West River Belt" },
  { id: "savarkar_nagar", name: "Savarkar Nagar, Gangapur Rd", shortName: "Savarkar Nagar", lat: 20.0185, lon: 73.7452, tag: "Residential Sector" },

  // ─── HERITAGE, TEMPLES & GODAVARI RIVERFRONT ───
  { id: "panchavati", name: "Panchavati Heritage Zone", shortName: "Panchavati", lat: 20.0069, lon: 73.7930, tag: "Heritage Hub" },
  { id: "ramkund", name: "Ramkund Sacred Ghat", shortName: "Ramkund Ghat", lat: 20.0055, lon: 73.7915, tag: "Spiritual Landmark" },
  { id: "kalaram_ मंदिर", name: "Kalaram Temple Gate", shortName: "Kalaram Temple", lat: 20.0082, lon: 73.7965, tag: "Spiritual Landmark" },
  { id: "sita_gufa", name: "Sita Gufa Historical Complex", shortName: "Sita Gufa", lat: 20.0088, lon: 73.7972, tag: "Heritage Landmark" },
  { id: "kapaleshwar", name: "Kapaleshwar Temple Ghat", shortName: "Kapaleshwar", lat: 20.0062, lon: 73.7928, tag: "Spiritual Landmark" },
  { id: "kapila", name: "Kapila Sangam Ghat", shortName: "Kapila Sangam", lat: 19.9984, lon: 73.8143, tag: "Riverfront Link" },
  { id: "navashya", name: "Navashya Ganpati Ghat, Anandwalli", shortName: "Navashya Ganpati", lat: 20.0165, lon: 73.7422, tag: "Riverfront Landmark" },
  { id: "someshwar_temple", name: "Someshwar Waterfall & Temple", shortName: "Someshwar Temple", lat: 20.0245, lon: 73.7312, tag: "Scenic & Spiritual" },
  { id: "tapovan", name: "Tapovan Tree Park & Ghat", shortName: "Tapovan Park", lat: 20.0012, lon: 73.8125, tag: "Ecological Heritage" },
  { id: "saptashrungi_trust", name: "Saptashrungi Nivas Trust Office", shortName: "Saptashrungi Office", lat: 20.0042, lon: 73.7895, tag: "Pilgrim Services" },

  // ─── ACADEMIC CAMPUSES & UNIVERSITIES ───
  { id: "pvg_coe", name: "PVG's College of Engineering (Dindori Rd, Mhasrul)", shortName: "PVG COE (Nashik)", lat: 20.0369, lon: 73.8007, tag: "Academic Campus" },
  { id: "kbt_coe", name: "NDMVP KBT College of Engineering, Gangapur Rd", shortName: "KBT COE", lat: 20.0162, lon: 73.7548, tag: "Academic Hub" },
  { id: "kkwagh", name: "KK Wagh Institute of Engineering, Amrutdham", shortName: "KK Wagh COE", lat: 20.0135, lon: 73.8228, tag: "Academic Campus" },
  { id: "met_bhujbal", name: "MET Bhujbal Knowledge City, Adgaon", shortName: "MET Campus", lat: 20.0435, lon: 73.8492, tag: "Academic Campus" },
  { id: "sandip_university", name: "Sandip University Campus, Mahiravani", shortName: "Sandip Univ", lat: 19.9675, lon: 73.6821, tag: "University Campus" },
  { id: "meri_mhasrul", name: "MERI Research Institute, Dindori Rd", shortName: "MERI (Dindori Rd)", lat: 20.0270, lon: 73.7995, tag: "Research & Transit" },
  { id: "byk_college", name: "BYK College of Commerce", shortName: "BYK College", lat: 20.0085, lon: 73.7645, tag: "Academic Hub" },
  { id: "hpt_ryk", name: "HPT Arts & RYK Science College", shortName: "HPT RYK College", lat: 20.0072, lon: 73.7630, tag: "Academic Campus" },
  { id: "gokhale_edu", name: "Gokhale Education Society Campus", shortName: "GES Campus", lat: 20.0062, lon: 73.7620, tag: "Academic Belt" },
  { id: "ycmou", name: "YCMOU Open University Campus, Gangapur Dam", shortName: "YCMOU Univ", lat: 20.0285, lon: 73.7025, tag: "University Campus" },
  { id: "ndmvp_medical", name: "NDMVP Medical College & Hospital, Adgaon", shortName: "NDMVP Medical", lat: 20.0345, lon: 73.8385, tag: "Medical Campus" },
  { id: "matoshri_engg", name: "Matoshri College of Engineering, Eklahare", shortName: "Matoshri COE", lat: 19.9812, lon: 73.8752, tag: "Academic Campus" },
  { id: "guru_gobind", name: "Guru Gobind Singh College, Indira Nagar", shortName: "GGS College", lat: 19.9682, lon: 73.7745, tag: "Academic Campus" },
  { id: "ashoka_universal", name: "Ashoka Universal School, Chandsi", shortName: "Ashoka School", lat: 20.0382, lon: 73.7682, tag: "School Campus" },
  { id: "symbiosis_nashik", name: "Symbiosis Institute, Pathardi", shortName: "Symbiosis Nashik", lat: 19.9325, lon: 73.7582, tag: "University Campus" },

  // ─── SOUTH NASHIK, UNTWADI & SHOPPING MALLS ───
  { id: "city_centre_mall", name: "City Centre Mall, Untwadi", shortName: "City Centre Mall", lat: 19.9885, lon: 73.7635, tag: "Retail & Transit" },
  { id: "govind_nagar", name: "Govind Nagar Circle", shortName: "Govind Nagar", lat: 19.9822, lon: 73.7684, tag: "Residential Hub" },
  { id: "pinnacle_mall", name: "Pinnacle Mall Circle, Trimbak Rd", shortName: "Pinnacle Mall", lat: 19.9928, lon: 73.7742, tag: "Commercial Mall" },
  { id: "reliance_mall_untwadi", name: "Reliance Mall, Untwadi Road", shortName: "Reliance Mall", lat: 19.9842, lon: 73.7615, tag: "Retail Hub" },
  { id: "tidke_colony", name: "Tidke Colony Central Road", shortName: "Tidke Colony", lat: 19.9895, lon: 73.7758, tag: "Residential Sector" },
  { id: "kamatwade", name: "Kamatwade Feeder Point", shortName: "Kamatwade", lat: 19.9625, lon: 73.7482, tag: "Suburban Belt" },
  { id: "patil_nagar", name: "Patil Nagar, CIDCO", shortName: "Patil Nagar", lat: 19.9685, lon: 73.7512, tag: "Urban Suburb" },

  // ─── CIDCO, AMBAD & INDUSTRIAL BELTS ───
  { id: "cidco", name: "CIDCO Bus Station Sector 4", shortName: "CIDCO Station", lat: 19.9727, lon: 73.7579, tag: "Urban Sector" },
  { id: "trimurti_chowk", name: "Trimurti Chowk Sector 4, CIDCO", shortName: "Trimurti Chowk", lat: 19.9685, lon: 73.7545, tag: "Commercial Circle" },
  { id: "pavan_nagar", name: "Pavan Nagar Stadium, CIDCO", shortName: "Pavan Nagar", lat: 19.9765, lon: 73.7535, tag: "Residential Hub" },
  { id: "uttam_nagar", name: "Uttam Nagar Cross, CIDCO", shortName: "Uttam Nagar", lat: 19.9755, lon: 73.7645, tag: "Residential Belt" },
  { id: "lekha_nagar", name: "Lekha Nagar Junction", shortName: "Lekha Nagar", lat: 19.9675, lon: 73.7625, tag: "Highway Junction" },
  { id: "khutwad_nagar", name: "Khutwad Nagar Ring Road", shortName: "Khutwad Nagar", lat: 19.9585, lon: 73.7582, tag: "Residential Sector" },
  { id: "ambad_midc", name: "Ambad MIDC Industrial Belt", shortName: "Ambad MIDC", lat: 19.9515, lon: 73.7362, tag: "Industrial Belt" },
  { id: "siemens_circle", name: "Siemens Point Circle, Ambad", shortName: "Siemens Circle", lat: 19.9555, lon: 73.7325, tag: "Industrial Hub" },
  { id: "garware_point", name: "Garware Point Gate, Ambad", shortName: "Garware Point", lat: 19.9475, lon: 73.7395, tag: "Industrial Landmark" },
  { id: "xlo_point", name: "XLO Point Junction, Ambad", shortName: "XLO Point", lat: 19.9585, lon: 73.7415, tag: "Industrial Junction" },
  { id: "abb_circle", name: "ABB Circle, Trimbak Road", shortName: "ABB Circle", lat: 19.9882, lon: 73.7612, tag: "Industrial/Arterial" },

  // ─── SATPUR MIDC & TRIMBAK ROAD ───
  { id: "satpur_midc", name: "Satpur MIDC Tech Hub", shortName: "Satpur MIDC", lat: 19.9974, lon: 73.7213, tag: "Industrial Tech" },
  { id: "iti_circle", name: "Trimbak Road ITI Circle", shortName: "ITI Circle Satpur", lat: 19.9925, lon: 73.7265, tag: "Academic/Industrial" },
  { id: "nice_area", name: "NICE Industrial Area, Satpur", shortName: "NICE Satpur", lat: 20.0025, lon: 73.7185, tag: "Tech Industrial" },
  { id: "carbon_naka", name: "Carbon Naka Junction, Satpur", shortName: "Carbon Naka", lat: 19.9895, lon: 73.7315, tag: "Industrial Hub" },
  { id: "vip_industries", name: "VIP Industries Gate, Satpur", shortName: "VIP Satpur", lat: 19.9962, lon: 73.7145, tag: "Industrial Hub" },
  { id: "mahindra_gate", name: "Mahindra & Mahindra Plant Gate", shortName: "Mahindra Gate", lat: 19.9912, lon: 73.7385, tag: "Automotive Hub" },
  { id: "trimbak_phata", name: "Trimbak Phata Bypass Point", shortName: "Trimbak Phata", lat: 19.9852, lon: 73.7285, tag: "Highway Junction" },

  // ─── INDIRA NAGAR, PATHARDI & SOUTH HIGHWAY ───
  { id: "indira_nagar", name: "Indira Nagar Central Circle", shortName: "Indira Nagar", lat: 19.9742, lon: 73.7819, tag: "South Suburb" },
  { id: "jogging_track_indira", name: "Indira Nagar Jogging Track", shortName: "Jogging Track", lat: 19.9785, lon: 73.7775, tag: "Residential Landmark" },
  { id: "rane_nagar", name: "Rane Nagar Cross Link", shortName: "Rane Nagar", lat: 19.9695, lon: 73.7785, tag: "Highway Suburban" },
  { id: "pathardi_phata", name: "Pathardi Phata NH-3 Junction", shortName: "Pathardi Phata", lat: 19.9405, lon: 73.7658, tag: "South Highway Junction" },
  { id: "pathardi_gaon", name: "Pathardi Village Square", shortName: "Pathardi Gaon", lat: 19.9325, lon: 73.7712, tag: "Suburban Hub" },
  { id: "wadala_road", name: "Wadala Gaon Road Junction", shortName: "Wadala Road", lat: 19.9815, lon: 73.7865, tag: "Suburban Link" },
  { id: "kathe_galli", name: "Kathe Galli Junction, Dwarka", shortName: "Kathe Galli", lat: 19.9882, lon: 73.8005, tag: "Arterial Link" },

  // ─── EAST NASHIK, RAILWAY STATION & DEOLALI ───
  { id: "nashik_road", name: "Nashik Road Railway Terminal", shortName: "Nashik Rd Station", lat: 19.9472, lon: 73.8421, tag: "Railway Terminal" },
  { id: "bitco_point", name: "Bitco Point Junction, Nashik Road", shortName: "Bitco Point", lat: 19.9515, lon: 73.8375, tag: "Station Commercial" },
  { id: "jail_road", name: "Jail Road Suburban Circle", shortName: "Jail Road", lat: 19.9580, lon: 73.8325, tag: "Railway Suburban" },
  { id: "dasak_corner", name: "Jail Road Dasak Corner", shortName: "Dasak Corner", lat: 19.9625, lon: 73.8285, tag: "Suburban Junction" },
  { id: "datta_mandir", name: "Datta Mandir Road, Nashik Road", shortName: "Datta Mandir", lat: 19.9432, lon: 73.8385, tag: "Residential/Commercial" },
  { id: "muktidham", name: "Muktidham Temple Gate", shortName: "Muktidham Temple", lat: 19.9455, lon: 73.8475, tag: "Spiritual Landmark" },
  { id: "upanagar", name: "Upanagar Signal, Nashik Road", shortName: "Upanagar", lat: 19.9652, lon: 73.8215, tag: "Suburban Highway" },
  { id: "deolali", name: "Deolali Camp Cantonment Zone", shortName: "Deolali Camp", lat: 19.8901, lon: 73.8265, tag: "Cantonment Zone" },
  { id: "deolali_bazaar", name: "Deolali Cantonment Market", shortName: "Deolali Bazaar", lat: 19.8852, lon: 73.8295, tag: "Cantonment Retail" },
  { id: "artillery_centre", name: "Artillery Centre Gate, Deolali", shortName: "Artillery Centre", lat: 19.9052, lon: 73.8382, tag: "Military Zone" },
  { id: "chehdi_phata", name: "Chehdi Phata, Pune Highway", shortName: "Chehdi Phata", lat: 19.9252, lon: 73.8512, tag: "Highway Junction" },

  // ─── NORTH NASHIK, MHASRUL, ADGAON & HIGHWAY ───
  { id: "mhasrul_gaon", name: "Mhasrul Gaon Gate, Dindori Rd", shortName: "Mhasrul Gaon", lat: 20.0335, lon: 73.8042, tag: "North Suburb" },
  { id: "rto_dindori", name: "RTO Office Approach, Dindori Rd", shortName: "RTO Dindori Rd", lat: 20.0298, lon: 73.8015, tag: "Civic Transit" },
  { id: "kasturi_nagar", name: "Kasturi Nagar Cross, Mhasrul", shortName: "Kasturi Nagar", lat: 20.0315, lon: 73.7958, tag: "Residential Suburb" },
  { id: "makhmalabad", name: "Makhmalabad Link Road Junction", shortName: "Makhmalabad Link", lat: 20.0275, lon: 73.7845, tag: "North Link" },
  { id: "adgaon_naka", name: "Adgaon Naka Highway Hub", shortName: "Adgaon Naka", lat: 20.0385, lon: 73.8315, tag: "Highway & Medical Hub" },
  { id: "amrutdham", name: "Amrutdham Shani Mandir Circle", shortName: "Amrutdham", lat: 20.0185, lon: 73.8185, tag: "Academic Corridor" },
  { id: "rasbihari_school", name: "Rasbihari School Road, Ojhar Link", shortName: "Rasbihari Rd", lat: 20.0215, lon: 73.8265, tag: "Academic Road" },
  { id: "adgaon_village", name: "Adgaon Village Square", shortName: "Adgaon Gaon", lat: 20.0482, lon: 73.8525, tag: "North-East Suburb" },

  // ─── HOSPITALS & MEDICAL CENTRES ───
  { id: "wockhardt_hospital", name: "Wockhardt Super Speciality Hospital", shortName: "Wockhardt Hosp", lat: 19.9862, lon: 73.7812, tag: "Super Speciality Medical" },
  { id: "apollo_hospital", name: "Apollo Hospital, Swaminarayan Nagar", shortName: "Apollo Hospital", lat: 20.0112, lon: 73.8195, tag: "Medical Center" },
  { id: "sahyadri_hospital", name: "Sahyadri Hospital, Mumbai Naka", shortName: "Sahyadri Hosp", lat: 19.9882, lon: 73.7845, tag: "Super Speciality Medical" },
  { id: "ashoka_medicover", name: "Ashoka Medicover Hospital, Indira Nagar", shortName: "Medicover Hosp", lat: 19.9725, lon: 73.7795, tag: "Medical Center" },
  { id: "civil_hospital", name: "Civil Hospital, CBS Chowk", shortName: "Civil Hospital", lat: 19.9995, lon: 73.7822, tag: "Public Health Hub" },
  { id: "lotus_hospital", name: "Lotus Hospital, Govind Nagar", shortName: "Lotus Hospital", lat: 19.9815, lon: 73.7662, tag: "Medical Center" },
  { id: "magnum_hospital", name: "Magnum Hospital, Patil Nagar", shortName: "Magnum Hosp", lat: 19.9712, lon: 73.7532, tag: "Medical Hub" },
  { id: "shatabdi_hospital", name: "Shatabdi Hospital, Seven Heaven", shortName: "Shatabdi Hosp", lat: 19.9652, lon: 73.7712, tag: "Medical Center" },
  { id: "sujata_birla", name: "Sujata Birla Hospital, Bytco Point", shortName: "Birla Hospital", lat: 19.9532, lon: 73.8392, tag: "Medical Center" },

  // ─── TOURISM, RECREATION & WINERIES ───
  { id: "sula_vineyards", name: "Sula Vineyards Resort, Govardhan", shortName: "Sula Vineyards", lat: 20.0058, lon: 73.6882, tag: "Tourism & Resort" },
  { id: "york_winery", name: "York Winery & Tasting Room", shortName: "York Winery", lat: 20.0085, lon: 73.6825, tag: "Tourism & Leisure" },
  { id: "gangapur_dam", name: "Gangapur Dam Promenade", shortName: "Gangapur Dam", lat: 20.0385, lon: 73.6752, tag: "Scenic & Recreation" },
  { id: "pandavleni_caves", name: "Pandavleni Caves & Buddha Smarak", shortName: "Pandavleni Caves", lat: 19.9452, lon: 73.7512, tag: "Heritage Landmark" },
  { id: "phalke_smarak", name: "Dadasaheb Phalke Smarak Park", shortName: "Phalke Smarak", lat: 19.9432, lon: 73.7542, tag: "Cultural Park" },
  { id: "golf_club_ground", name: "Golf Club Ground, Trimbak Road", shortName: "Golf Club Ground", lat: 19.9942, lon: 73.7682, tag: "Sports & Recreation" },
  { id: "chambhar_leni", name: "Chambhar Leni Heritage Site, Mhasrul", shortName: "Chambhar Leni", lat: 20.0525, lon: 73.8112, tag: "Heritage Site" },
  { id: "coin_museum", name: "Indian Institute of Research in Numismatics (Coin Museum)", shortName: "Coin Museum", lat: 19.9582, lon: 73.6685, tag: "Museum & Heritage" },

  // ─── SUBURBAN TOWNS & AIRPORT TERMINAL ───
  { id: "ozar_airport", name: "Ozar Airport Terminal (HAL Nashik)", shortName: "Ozar Airport", lat: 20.1185, lon: 73.9125, tag: "Airport Terminal" },
  { id: "hal_township", name: "HAL Township, Ozar", shortName: "HAL Ozar", lat: 20.1012, lon: 73.9225, tag: "Aerospace Township" },
  { id: "peth_phata", name: "Peth Phata Highway Junction", shortName: "Peth Phata", lat: 20.0212, lon: 73.7812, tag: "Highway Junction" },
  { id: "dindori_naka", name: "Dindori Naka, Panchavati", shortName: "Dindori Naka", lat: 20.0142, lon: 73.7925, tag: "Highway Entry" },
  { id: "chandsi_phata", name: "Chandsi Village Phata", shortName: "Chandsi Phata", lat: 20.0412, lon: 73.7552, tag: "Suburban Belt" }
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
