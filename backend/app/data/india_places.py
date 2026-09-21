"""
A bundled list of major Indian places with known coordinates.

Why this exists: the public Nominatim geocoding server actively rate-limits
and blocks programmatic access (HTTP 403) — this is documented, ongoing
behavior on their end, not something we can reliably work around. Relying
on it for a live national-round demo would be a real risk: it could work
in testing and fail on stage.

This bundled list is the PRIMARY, network-independent path — it covers
every state capital, every major metro, and a set of places especially
relevant to remote-sensing themes (agriculture belts, river basins,
forests, coastal/water bodies). For an Indian hackathon, a judge naming
almost any place will hit this list instantly, with zero network call and
therefore zero risk of failure. An external geocoder is still tried as a
secondary fallback for anything not in this list, but the app's core
reliability does not depend on it.
"""

PLACES = [
    # Major metros
    {"name": "Mumbai, Maharashtra, India", "lat": 19.0760, "lon": 72.8777},
    {"name": "Delhi, India", "lat": 28.7041, "lon": 77.1025},
    {"name": "New Delhi, India", "lat": 28.6139, "lon": 77.2090},
    {"name": "Bangalore, Karnataka, India", "lat": 12.9716, "lon": 77.5946},
    {"name": "Chennai, Tamil Nadu, India", "lat": 13.0827, "lon": 80.2707},
    {"name": "Kolkata, West Bengal, India", "lat": 22.5726, "lon": 88.3639},
    {"name": "Hyderabad, Telangana, India", "lat": 17.3850, "lon": 78.4867},
    {"name": "Pune, Maharashtra, India", "lat": 18.5204, "lon": 73.8567},
    {"name": "Ahmedabad, Gujarat, India", "lat": 23.0225, "lon": 72.5714},
    {"name": "Surat, Gujarat, India", "lat": 21.1702, "lon": 72.8311},
    # State & UT capitals
    {"name": "Amaravati, Andhra Pradesh, India", "lat": 16.5417, "lon": 80.5150},
    {"name": "Itanagar, Arunachal Pradesh, India", "lat": 27.0844, "lon": 93.6053},
    {"name": "Dispur, Assam, India", "lat": 26.1433, "lon": 91.7898},
    {"name": "Patna, Bihar, India", "lat": 25.5941, "lon": 85.1376},
    {"name": "Raipur, Chhattisgarh, India", "lat": 21.2514, "lon": 81.6296},
    {"name": "Panaji, Goa, India", "lat": 15.4909, "lon": 73.8278},
    {"name": "Gandhinagar, Gujarat, India", "lat": 23.2156, "lon": 72.6369},
    {"name": "Chandigarh, India", "lat": 30.7333, "lon": 76.7794},
    {"name": "Shimla, Himachal Pradesh, India", "lat": 31.1048, "lon": 77.1734},
    {"name": "Srinagar, Jammu and Kashmir, India", "lat": 34.0837, "lon": 74.7973},
    {"name": "Jammu, Jammu and Kashmir, India", "lat": 32.7266, "lon": 74.8570},
    {"name": "Ranchi, Jharkhand, India", "lat": 23.3441, "lon": 85.3096},
    {"name": "Thiruvananthapuram, Kerala, India", "lat": 8.5241, "lon": 76.9366},
    {"name": "Bhopal, Madhya Pradesh, India", "lat": 23.2599, "lon": 77.4126},
    {"name": "Imphal, Manipur, India", "lat": 24.8170, "lon": 93.9368},
    {"name": "Shillong, Meghalaya, India", "lat": 25.5788, "lon": 91.8933},
    {"name": "Aizawl, Mizoram, India", "lat": 23.7271, "lon": 92.7176},
    {"name": "Kohima, Nagaland, India", "lat": 25.6751, "lon": 94.1086},
    {"name": "Bhubaneswar, Odisha, India", "lat": 20.2961, "lon": 85.8245},
    {"name": "Puducherry, India", "lat": 11.9416, "lon": 79.8083},
    {"name": "Jaipur, Rajasthan, India", "lat": 26.9124, "lon": 75.7873},
    {"name": "Gangtok, Sikkim, India", "lat": 27.3389, "lon": 88.6065},
    {"name": "Agartala, Tripura, India", "lat": 23.8315, "lon": 91.2868},
    {"name": "Lucknow, Uttar Pradesh, India", "lat": 26.8467, "lon": 80.9462},
    {"name": "Dehradun, Uttarakhand, India", "lat": 30.3165, "lon": 78.0322},
    {"name": "Gandhinagar Sector, Gujarat, India", "lat": 23.2200, "lon": 72.6500},
    # Other major cities & remote-sensing-relevant regions
    {"name": "Nagpur, Maharashtra, India", "lat": 21.1458, "lon": 79.0882},
    {"name": "Nashik, Maharashtra, India", "lat": 19.9975, "lon": 73.7898},
    {"name": "Indore, Madhya Pradesh, India", "lat": 22.7196, "lon": 75.8577},
    {"name": "Coimbatore, Tamil Nadu, India", "lat": 11.0168, "lon": 76.9558},
    {"name": "Madurai, Tamil Nadu, India", "lat": 9.9252, "lon": 78.1198},
    {"name": "Ludhiana, Punjab, India", "lat": 30.9010, "lon": 75.8573},
    {"name": "Amritsar, Punjab, India", "lat": 31.6340, "lon": 74.8723},
    {"name": "Kanpur, Uttar Pradesh, India", "lat": 26.4499, "lon": 80.3319},
    {"name": "Varanasi, Uttar Pradesh, India", "lat": 25.3176, "lon": 82.9739},
    {"name": "Agra, Uttar Pradesh, India", "lat": 27.1767, "lon": 78.0081},
    {"name": "Visakhapatnam, Andhra Pradesh, India", "lat": 17.6868, "lon": 83.2185},
    {"name": "Vijayawada, Andhra Pradesh, India", "lat": 16.5062, "lon": 80.6480},
    {"name": "Guwahati, Assam, India", "lat": 26.1445, "lon": 91.7362},
    {"name": "Jodhpur, Rajasthan, India", "lat": 26.2389, "lon": 73.0243},
    {"name": "Udaipur, Rajasthan, India", "lat": 24.5854, "lon": 73.7125},
    {"name": "Vadodara, Gujarat, India", "lat": 22.3072, "lon": 73.1812},
    {"name": "Rajkot, Gujarat, India", "lat": 22.3039, "lon": 70.8022},
    {"name": "Mysore, Karnataka, India", "lat": 12.2958, "lon": 76.6394},
    {"name": "Mangalore, Karnataka, India", "lat": 12.9141, "lon": 74.8560},
    {"name": "Kochi, Kerala, India", "lat": 9.9312, "lon": 76.2673},
    {"name": "Sundarbans, West Bengal, India", "lat": 21.9497, "lon": 88.9468},
    {"name": "Thar Desert, Rajasthan, India", "lat": 27.0000, "lon": 71.0000},
    {"name": "Western Ghats, India", "lat": 10.5000, "lon": 76.5000},
    {"name": "Chilika Lake, Odisha, India", "lat": 19.7000, "lon": 85.3200},
    {"name": "Rann of Kutch, Gujarat, India", "lat": 23.8500, "lon": 69.8600},
    {"name": "Ganga Basin (Varanasi stretch), Uttar Pradesh, India", "lat": 25.3200, "lon": 83.0100},
    {"name": "Yamuna Floodplain, Delhi, India", "lat": 28.6500, "lon": 77.2800},
    # ISRO facilities — directly relevant to the Space Technology theme
    {"name": "ISRO Headquarters, Bengaluru, Karnataka, India", "lat": 12.9698, "lon": 77.5959},
    {"name": "Satish Dhawan Space Centre, Sriharikota, Andhra Pradesh, India", "lat": 13.7199, "lon": 80.2304},
    {"name": "Vikram Sarabhai Space Centre, Thiruvananthapuram, Kerala, India", "lat": 8.5279, "lon": 76.8697},
    {"name": "Space Applications Centre, Ahmedabad, Gujarat, India", "lat": 23.0339, "lon": 72.5222},
    {"name": "National Remote Sensing Centre, Hyderabad, Telangana, India", "lat": 17.4239, "lon": 78.4738},
    {"name": "ISRO Telemetry Tracking and Command Network, Bengaluru, India", "lat": 13.0358, "lon": 77.5106},
    {"name": "U R Rao Satellite Centre, Bengaluru, Karnataka, India", "lat": 12.9634, "lon": 77.6484},
    {"name": "Liquid Propulsion Systems Centre, Thiruvananthapuram, India", "lat": 8.5450, "lon": 76.8600},
    # Educational institutions
    {"name": "IIT Delhi, New Delhi, India", "lat": 28.5455, "lon": 77.1926},
    {"name": "IIT Bombay, Mumbai, Maharashtra, India", "lat": 19.1334, "lon": 72.9133},
    {"name": "IIT Kanpur, Uttar Pradesh, India", "lat": 26.5123, "lon": 80.2329},
    {"name": "IIT Madras, Chennai, Tamil Nadu, India", "lat": 12.9915, "lon": 80.2336},
    {"name": "IIT Kharagpur, West Bengal, India", "lat": 22.3149, "lon": 87.3105},
    {"name": "IIT Roorkee, Uttarakhand, India", "lat": 29.8654, "lon": 77.8966},
    # Famous landmarks
    {"name": "Taj Mahal, Agra, Uttar Pradesh, India", "lat": 27.1751, "lon": 78.0421},
    {"name": "Red Fort, Delhi, India", "lat": 28.6562, "lon": 77.2410},
    {"name": "Golden Temple, Amritsar, Punjab, India", "lat": 31.6200, "lon": 74.8765},
    {"name": "Hawa Mahal, Jaipur, Rajasthan, India", "lat": 26.9239, "lon": 75.8267},
    {"name": "Gateway of India, Mumbai, Maharashtra, India", "lat": 18.9220, "lon": 72.8347},
    {"name": "Charminar, Hyderabad, Telangana, India", "lat": 17.3616, "lon": 78.4747},
    {"name": "Mysore Palace, Karnataka, India", "lat": 12.3052, "lon": 76.6552},
    {"name": "Konark Sun Temple, Odisha, India", "lat": 19.8876, "lon": 86.0945},
    # National parks & forests (relevant to environmental monitoring pitch)
    {"name": "Jim Corbett National Park, Uttarakhand, India", "lat": 29.5300, "lon": 78.7747},
    {"name": "Kaziranga National Park, Assam, India", "lat": 26.5775, "lon": 93.1714},
    {"name": "Ranthambore National Park, Rajasthan, India", "lat": 26.0173, "lon": 76.5026},
    {"name": "Kanha National Park, Madhya Pradesh, India", "lat": 22.3344, "lon": 80.6119},
    {"name": "Gir National Park, Gujarat, India", "lat": 21.1266, "lon": 70.7913},
    {"name": "Silent Valley National Park, Kerala, India", "lat": 11.0833, "lon": 76.4333},
    # Major dams (water-resource monitoring relevance)
    {"name": "Bhakra Dam, Himachal Pradesh, India", "lat": 31.4166, "lon": 76.4331},
    {"name": "Sardar Sarovar Dam, Gujarat, India", "lat": 21.8300, "lon": 73.7500},
    {"name": "Tehri Dam, Uttarakhand, India", "lat": 30.3776, "lon": 78.4802},
    {"name": "Hirakud Dam, Odisha, India", "lat": 21.5333, "lon": 83.8667},
    {"name": "Nagarjuna Sagar Dam, Telangana, India", "lat": 16.5738, "lon": 79.3117},
    # Agriculture-relevant regions
    {"name": "Punjab Wheat Belt, Punjab, India", "lat": 30.5000, "lon": 75.5000},
    {"name": "Vidarbha Cotton Region, Maharashtra, India", "lat": 20.9000, "lon": 78.5000},
    {"name": "Malwa Plateau, Madhya Pradesh, India", "lat": 22.7000, "lon": 75.8000},
    {"name": "Krishna-Godavari Delta, Andhra Pradesh, India", "lat": 16.5000, "lon": 81.7000},
]


def search_places(query: str, limit: int = 5):
    """Case-insensitive substring match against the bundled gazetteer.
    Returns the query as-typed matches first (startswith), then contains."""
    q = query.strip().lower()
    if not q:
        return []
    starts = [p for p in PLACES if p["name"].lower().startswith(q)]
    contains = [p for p in PLACES if q in p["name"].lower() and p not in starts]
    return (starts + contains)[:limit]
