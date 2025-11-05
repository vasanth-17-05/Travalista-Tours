CREATE DATABASE tb;
USE tb;

-- ==============================
-- 1️⃣ Users Table
-- ==============================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  otp VARCHAR(6)
);

-- ==============================
-- 2️⃣ Packages Table
-- ==============================
CREATE TABLE packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  duration VARCHAR(50),
  location VARCHAR(100),
  highlights TEXT,
  image1 VARCHAR(255),
  image2 VARCHAR(255),
  image3 VARCHAR(255),
  image4 VARCHAR(255),
  image5 VARCHAR(255)
);

-- ==============================
-- 3️⃣ Bookings Table
-- ==============================
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  package_id INT,
  booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_status VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (package_id) REFERENCES packages(id)
);

-- ==============================
-- 4️⃣ Insert 15 Detailed Packages
-- ==============================
INSERT INTO packages 
(title, description, price, duration, location, highlights, image1, image2, image3, image4, image5)
VALUES
('Paris Getaway',
'Experience the charm of the City of Love with a 5-night stay in central Paris.
Visit the Eiffel Tower, Louvre Museum, and romantic Seine River cruises.
Enjoy authentic French cuisine and evening strolls through Montmartre.
Includes guided tours and local transport for easy exploration.
Perfect for couples and first-time visitors.
Create memories that last a lifetime in Paris!',
200000.00,
'5 Nights / 6 Days',
'Paris, France',
'Eiffel Tower, Louvre Museum, Seine Cruise, Montmartre Walk, French Cuisine',
'paris1.webp','paris2.webp','paris3.webp','paris4.webp','paris5.webp'),

('Maldives Luxury',
'Stay in an overwater villa surrounded by turquoise lagoons.
Relax on white sandy beaches with crystal-clear waters.
Enjoy all-inclusive dining and world-class spa treatments.
Go snorkeling or diving among vibrant coral reefs.
Private sunset dinners and water sports available.
A paradise escape for those seeking peace and beauty.',
58000.00,
'3 Nights / 4 Days',
'Maldives',
'Private villa, snorkeling, candlelight dinner, spa, water sports',
'maldives1.jpg','maldives2.jpg','maldives3.jpg','maldives4.jpg','maldives5.jpg'),

('Singapore Tour',
'Discover the futuristic skyline and cultural diversity of Singapore.
Visit Gardens by the Bay, Sentosa Island, and Marina Bay Sands.
Explore Chinatown, Little India, and Orchard Road shopping.
Enjoy the famous Singapore Flyer and river cruise views.
Stay in luxury hotels with world-class amenities.
A blend of nature, innovation, and tradition awaits!',
21900.00,
'4 Days / 3 Nights',
'Singapore',
'Marina Bay Sands, Gardens by the Bay, Sentosa, Night Safari',
'singapore1.jpg','singapore2.jpg','singapore3.jpg','singapore4.jpg','singapore5.jpg'),

('Bali Paradise',
'Immerse yourself in Bali’s beaches, temples, and tropical vibes.
Stay in private villas surrounded by lush greenery.
Visit Ubud’s rice terraces and Uluwatu’s cliff temples.
Relax with traditional Balinese massages and yoga sessions.
Surf, snorkel, or explore hidden waterfalls nearby.
Your gateway to serenity and adventure in Bali.',
17000.00,
'5 Nights / 6 Days',
'Bali, Indonesia',
'Ubud, Uluwatu, Rice Terraces, Yoga, Spa',
'bali1.jpg','bali2.jpg','bali3.jpg','bali4.jpg','bali5.jpg'),

('Swiss Alps Adventure',
'Explore the breathtaking beauty of the Swiss mountains.
Ride scenic trains through snow-capped landscapes.
Stay in cozy alpine lodges with stunning valley views.
Enjoy skiing, hiking, and cable car rides.
Taste authentic Swiss chocolate and cheese.
Perfect for nature lovers and thrill seekers alike!',
57000.00,
'7 Days / 6 Nights',
'Switzerland',
'Jungfrau, Interlaken, Lake Lucerne, Skiing, Swiss Chocolate',
'swiss1.jpg','swiss2.jpg','swiss3.jpg','swiss4.jpg','swiss5.jpg'),

('Dubai Explorer',
'Discover luxury and innovation in the city of dreams.
Visit the Burj Khalifa, Palm Jumeirah, and Dubai Mall.
Take a desert safari with camel rides and dune bashing.
Enjoy fine dining, shopping, and beachside relaxation.
Stay in premium hotels with skyline views.
A fusion of modern glamor and Arabian culture.',
89000.00,
'4 Nights / 5 Days',
'Dubai, UAE',
'Burj Khalifa, Desert Safari, Dubai Mall, Palm Jumeirah',
'dubai1.jpg','dubai2.jpg','dubai3.jpg','dubai4.jpg','dubai5.jpg'),

('Tokyo Highlights',
'Experience the electric energy of Japan’s capital city.
Visit Shibuya Crossing, Tokyo Tower, and Asakusa temples.
Taste sushi, ramen, and Japanese street food delights.
Explore anime districts and cherry blossom parks.
Stay in modern hotels near top attractions.
A perfect mix of tradition, tech, and culture.',
170800.00,
'6 Days / 5 Nights',
'Tokyo, Japan',
'Tokyo Tower, Shibuya, Disneyland, Mt. Fuji Trip',
'tokyo1.jpg','tokyo2.jpg','tokyo3.jpg','tokyo4.jpg','tokyo5.jpg'),

('London Heritage',
'Step into history with a royal journey through London.
Visit Buckingham Palace, Big Ben, and the Tower Bridge.
Explore world-class museums and the River Thames.
Shop at Oxford Street and enjoy London’s nightlife.
Stay in elegant hotels near iconic landmarks.
A timeless blend of culture, art, and royalty.',
99000.00,
'5 Nights / 6 Days',
'London, UK',
'Buckingham Palace, Big Ben, Museums, Thames Cruise',
'london1.jpg','london2.jpg','london3.jpg','london4.jpg','london5.jpg'),

('Thailand Escape',
'Relax in Thailand’s tropical beaches and vibrant cities.
Visit Bangkok’s temples and floating markets.
Enjoy the nightlife of Phuket and serenity of Krabi.
Try authentic Thai food and spa experiences.
Snorkel or island-hop in crystal-clear waters.
A colorful escape for every kind of traveler.',
75950.00,
'4 Nights / 5 Days',
'Bangkok & Phuket, Thailand',
'Floating Market, Phi Phi Islands, Grand Palace, Thai Spa',
'thailand1.jpg','thailand2.jpg','thailand3.jpg','thailand4.jpg','thailand5.jpg'),

('New York Dream',
'Feel the pulse of the city that never sleeps.
Visit Times Square, Central Park, and the Statue of Liberty.
Enjoy Broadway shows and iconic New York pizza.
Explore art museums and skyscraper views.
Stay in stylish Manhattan hotels.
A dream destination full of energy and excitement!',
201700.00,
'5 Days / 4 Nights',
'New York, USA',
'Times Square, Statue of Liberty, Broadway, Central Park',
'ny1.jpg','ny2.jpg','ny3.jpg','ny4.jpg','ny5.jpg'),

('Kerala Backwaters',
'Sail through peaceful lagoons and coconut groves.
Stay in luxury houseboats on calm backwaters.
Enjoy traditional Kerala cuisine and Ayurvedic treatments.
Explore villages and wildlife sanctuaries nearby.
Witness sunset reflections on tranquil waters.
A soulful journey into God’s Own Country.',
5800.00,
'3 Nights / 4 Days',
'Alleppey, Kerala, India',
'Houseboat, Village Walk, Ayurveda, Local Cuisine',
'kerala1.jpg','kerala2.jpg','kerala3.jpg','kerala4.jpg','kerala5.jpg'),

('Goa Beach Fun',
'Unwind on sunny beaches with golden sand and blue waves.
Party at beach shacks and enjoy Goan seafood delights.
Explore forts, waterfalls, and Portuguese heritage.
Try water sports like parasailing and jet skiing.
Stay in seaside resorts with tropical vibes.
Perfect mix of relaxation and excitement!',
8600.00,
'3 Nights / 4 Days',
'Goa, India',
'Beaches, Water Sports, Nightlife, Forts',
'goa1.jpg','goa2.jpg','goa3.jpg','goa4.jpg','goa5.jpg'),

('Australia Discovery',
'Discover the wonders of Australia’s natural beauty.
Visit Sydney Opera House, Great Barrier Reef, and Gold Coast.
Meet kangaroos and koalas in wildlife sanctuaries.
Enjoy adventure sports and scenic road trips.
Stay in modern hotels with ocean views.
A thrilling blend of nature, city, and culture.',
102200.00,
'7 Days / 6 Nights',
'Sydney & Gold Coast, Australia',
'Sydney Opera House, Reef, Surfing, Wildlife',
'australia1.jpg','australia2.jpg','australia3.jpg','australia4.jpg','australia5.jpg'),

('Bora Bora Bliss',
'Experience the ultimate tropical luxury in Bora Bora.
Stay in overwater bungalows surrounded by turquoise lagoons.
Enjoy snorkeling, kayaking, and private island picnics.
Savor gourmet meals with oceanfront dining.
Relax with sunset views and gentle sea breezes.
Romantic paradise for honeymooners and dreamers.',
63000.00,
'5 Nights / 6 Days',
'Bora Bora, French Polynesia',
'Overwater Villa, Snorkeling, Lagoon Cruise, Fine Dining',
'borabora1.jpg','borabora2.jpg','borabora3.jpg','borabora4.jpg','borabora5.jpg'),

(
'Pride Of The Tamil Nadu',
'Get ready for an epic adventure across Tamil Nadu! 
Start at the buzzing city of Chennai with beaches and nightlife, 
then dive into history at Thanjavur’s Brihadeeswarar Temple and 
the grand Gangaikonda Cholapuram Temple. 
Enjoy long road trips, traditional Tamil cuisine, magnificent temple architecture, 
and chill evenings with your friends. 
A journey filled with culture, pride, and unforgettable memories!',
15999.00,
'5 Nights / 6 Days',
'Chennai, Thanjavur, Gangaikonda Cholapuram and more...',
'Heritage, Road Trips, Friendship, Culture, Exploration, Pride',
'boys_tn1.jpg','boys_tn2.jpg','boys_tn3.jpg','boys_tn4.jpg','boys_tn5.jpg');

