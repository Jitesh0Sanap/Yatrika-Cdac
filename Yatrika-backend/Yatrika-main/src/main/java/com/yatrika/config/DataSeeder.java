package com.yatrika.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.yatrika.entity.*;
import com.yatrika.enums.*;
import com.yatrika.repository.*;
import jakarta.persistence.PersistenceContext;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(UserRepository userRepository, HotelRepository hotelRepository,
            RoomCategoryRepository roomCategoryRepository, RoomRepository roomRepository,
            AddOnRepository addOnRepository, HotelAddOnRepository hotelAddOnRepository,
            BookingRepository bookingRepository, ReviewRepository reviewRepository,
            PasswordEncoder passwordEncoder, DataCleaner dataCleaner, HotelAggregateUpdater hotelAggregateUpdater) {
        return args -> {
            List<Hotel> existingHotels = hotelRepository.findAll();
            // New database wipe condition: if size is less than 100, or an old hotel is found.
            boolean needsRebuild = existingHotels.size() < 100 
                    || existingHotels.stream().anyMatch(h -> h.getName().equals("Aurelia Seaside Retreat Goa"));
            
            if (!needsRebuild) {
                System.out.println("Yatrika Indian Luxury Collection (100+ Hotels) already exists. Skipping data seeding.");
                return;
            }

            System.out.println("Purging old dataset and rebuilding Yatrika Indian Luxury Collection...");
            dataCleaner.clearAll();

            User admin = upsertUser(userRepository, "System Administrator", "admin@yatrika.com", "9000000000", "Admin@123", Role.ADMIN, passwordEncoder);
            List<User> owners = generateOwners(userRepository, passwordEncoder);
            List<User> customers = generateCustomers(userRepository, passwordEncoder);
            Map<String, AddOn> globalAddOns = generateAddOns(addOnRepository);

            List<HotelData> hotelDataList = new ArrayList<>();
            List<CityConfig> cities = getCityConfigs();

            int hotelCounter = 1;
            for (CityConfig city : cities) {
                for (int i = 0; i < city.hotelCount(); i++) {
                    Hotel hotel = generateHotel(hotelCounter++, city, owners, hotelRepository);
                    List<RoomCategory> categories = generateRoomCategories(hotel, roomCategoryRepository);
                    List<Room> rooms = generateInventory(hotel, categories, roomRepository);
                    generateHotelAddOns(hotel, globalAddOns, hotelAddOnRepository);
                    hotelDataList.add(new HotelData(hotel, categories, rooms));
                }
            }

            generateBookingsAndReviews(bookingRepository, reviewRepository, hotelDataList, customers, globalAddOns, hotelAggregateUpdater);
            
            System.out.printf("Indian Luxury Collection Seeded Successfully: %d Hotels, %d Rooms, %d Reviews.%n", 
                hotelRepository.count(), roomRepository.count(), reviewRepository.count());
        };
    }

    // --- Core Entity Generators ---

    private Hotel generateHotel(int index, CityConfig city, List<User> owners, HotelRepository hotelRepository) {
        Random rand = new Random(index * 31L + city.name().hashCode());
        User owner = owners.get(rand.nextInt(owners.size()));
        
        String[] brands = {"Taj", "Oberoi", "Leela", "ITC", "JW Marriott", "Hyatt Regency", "Radisson Blu", "Novotel", "The Lalit", "Trident", "Vivanta", "Welcomhotel", "Holiday Inn", "Lemon Tree Premier", "Fortune", "Fairmont"};
        String[] suffixes = {"Resort", "Retreat", "Palace", "Villas", "Heights", "Oasis", "Boutique", "Lodge", "Resort & Spa", "Grand"};
        
        String brand = brands[rand.nextInt(brands.length)];
        String suffix = suffixes[rand.nextInt(suffixes.length)];
        String name = brand + " " + city.name() + " " + suffix;
        
        HotelCategory category = getCategoryForCityType(city.type(), rand);
        double basePrice = 5000 + rand.nextInt(15000);
        
        Set<Amenities> amenities = generateHotelAmenities(category, rand);
        
        String heroImg = ImagePools.getHotelImage(category, name + "hero");
        
        return hotelRepository.save(Hotel.builder()
                .name(name)
                .location("Central " + city.name())
                .city(city.name())
                .category(category)
                .pricePerNight(basePrice)
                .avgRating(0.0) // calculated later
                .reviewCount(0) // calculated later
                .imageUrl(heroImg)
                .amenities(amenities)
                .owner(owner)
                .tagline("Experience the true essence of luxury in " + city.name())
                .about("Welcome to " + name + ", a signature property that redefines comfort and elegance. Nestled in the heart of " + city.name() + ", our establishment offers bespoke services tailored for the discerning traveler. Relish in our award-winning culinary delights, unwind at our state-of-the-art spa, and enjoy seamless connectivity to major attractions. Built on a legacy of impeccable hospitality, we promise a stay that is both memorable and enchanting.")
                .distanceFromAirport(10.0 + rand.nextDouble() * 20.0)
                .distanceFromCityCenter(1.0 + rand.nextDouble() * 15.0)
                .establishedYear(1990 + rand.nextInt(30))
                .build());
    }

    private List<RoomCategory> generateRoomCategories(Hotel hotel, RoomCategoryRepository repository) {
        Random rand = new Random(hotel.getName().hashCode());
        List<RoomCategory> cats = new ArrayList<>();
        double base = hotel.getPricePerNight();
        
        cats.add(createRoomCat(repository, hotel, RoomType.DELUXE, base, 2, "Spacious deluxe room with premium fittings.", ImagePools.getRoomImage("deluxe", hotel.getName())));
        cats.add(createRoomCat(repository, hotel, RoomType.DOUBLE, base * 1.5, 3, "Premium room with stunning views and exclusive lounge access.", ImagePools.getRoomImage("premium", hotel.getName())));
        cats.add(createRoomCat(repository, hotel, RoomType.SUITE, base * 2.5, 4, "Luxurious suite featuring a separate living area and lavish bathroom.", ImagePools.getRoomImage("suite", hotel.getName())));
        
        if (rand.nextBoolean()) {
            cats.add(createRoomCat(repository, hotel, RoomType.SUITE, base * 4.0, 4, "The ultimate presidential suite offering unparalleled luxury and panoramic views.", ImagePools.getRoomImage("presidential", hotel.getName())));
        }
        return cats;
    }

    private RoomCategory createRoomCat(RoomCategoryRepository repo, Hotel h, RoomType t, double p, int c, String d, String img) {
        Random rand = new Random((h.getName() + t.name()).hashCode());
        String[] beds = {"King Size Bed", "Queen Size Bed", "Twin Beds"};
        String[] views = {"City View", "Pool View", "Garden View", "Ocean View", "Mountain View"};
        
        return repo.save(RoomCategory.builder()
                .hotel(h)
                .roomType(t)
                .pricePerNight(p)
                .capacity(c)
                .description(d)
                .imageUrl(img)
                .roomSize(c == 2 ? "350 sq.ft" : (c == 3 ? "500 sq.ft" : "800 sq.ft"))
                .bedType(beds[rand.nextInt(beds.length)])
                .viewType(views[rand.nextInt(views.length)])
                .roomHighlights("Free Wi-Fi, Smart TV, Mini Bar, Rain Shower")
                .build());
    }

    private List<Room> generateInventory(Hotel hotel, List<RoomCategory> cats, RoomRepository repo) {
        List<Room> rooms = new ArrayList<>();
        int floor = 1;
        for (RoomCategory cat : cats) {
            for (int i = 1; i <= 2; i++) {
                rooms.add(repo.save(Room.builder().hotel(hotel).roomCategory(cat).roomNumber(floor + "0" + i).bookingStatus(BookingStatus.AVAILABLE).build()));
            }
            floor++;
        }
        return rooms;
    }

    private void generateBookingsAndReviews(BookingRepository bookingRepo, ReviewRepository reviewRepo, List<HotelData> hotels, List<User> customers, Map<String, AddOn> addOns, HotelAggregateUpdater updater) {
        LocalDate today = LocalDate.now();
        List<String> reviewTitles = List.of("Exceptional hospitality", "A memorable stay", "Comfortable and well located", "Absolute luxury", "Perfect weekend getaway", "Unparalleled service", "Stunning property", "Highly recommended");
        List<String> reviewComments = List.of(
            "The welcome was warm, the room was spotless, and the team handled every request with care.",
            "Excellent location for exploring the city. Breakfast had good variety and the bed was very comfortable.",
            "A truly luxurious experience. The spa treatments were divine and the holistic approach to luxury is unmatched.",
            "From the airport transfer to the fine dining, every moment was orchestrated perfectly. Highly recommend.",
            "The architecture, the bespoke excursions, and the warm hospitality were beyond incredible.",
            "Perfect balance of luxury and efficiency. The executive lounge access made my business trip seamless.",
            "Waking up to the spectacular views and having our private plunge pool was magical."
        );
        
        Map<Long, Integer> countMap = new HashMap<>();
        Map<Long, Integer> sumMap = new HashMap<>();

        int bookingCounter = 1;
        for (HotelData hData : hotels) {
            Random rand = new Random(hData.hotel().getHotelId());
            int numReviews = 5 + rand.nextInt(6); // 5 to 10 reviews per hotel to reduce DB size and load times
            
            for (int i = 0; i < numReviews; i++) {
                User customer = customers.get(rand.nextInt(customers.size()));
                RoomCategory cat = hData.categories().get(rand.nextInt(hData.categories().size()));
                Room room = hData.rooms().stream().filter(r -> r.getRoomCategory().equals(cat)).findFirst().orElse(hData.rooms().get(0));
                
                int daysAgo = 5 + rand.nextInt(300);
                LocalDate checkIn = today.minusDays(daysAgo);
                LocalDate checkOut = checkIn.plusDays(1 + rand.nextInt(4));
                LocalDateTime createdAt = checkIn.minusDays(10).atStartOfDay();
                
                double roomTotal = cat.getPricePerNight() * (checkOut.toEpochDay() - checkIn.toEpochDay());
                double taxes = roomTotal * 0.12;
                
                Booking b = bookingRepo.save(Booking.builder()
                        .user(customer).hotel(hData.hotel()).room(room).roomCategory(cat)
                        .checkInDate(checkIn).checkOutDate(checkOut).numberOfGuests(Math.min(2, cat.getCapacity()))
                        .bookingState(BookingState.COMPLETED).totalPrice(roomTotal + taxes).taxes(taxes).discount(0.0)
                        .bookingReference("YAT-26-" + String.format("%06d", bookingCounter++))
                        .specialRequests("").bookingTimestamp(createdAt).confirmedAt(createdAt.plusHours(1))
                        .checkedInAt(checkIn.atTime(14, 0)).checkedOutAt(checkOut.atTime(11, 0)).completedAt(checkOut.atTime(11,30))
                        .bookingAddOns(new ArrayList<>()).build());
                
                // Add review
                int rating = rand.nextInt(100) < 85 ? (4 + rand.nextInt(2)) : (3 + rand.nextInt(2)); // mostly 4 or 5
                Review r = new Review();
                r.setBooking(b);
                r.setHotel(hData.hotel());
                r.setCustomer(customer);
                r.setRating(rating);
                r.setTitle(reviewTitles.get(rand.nextInt(reviewTitles.size())));
                r.setComment(reviewComments.get(rand.nextInt(reviewComments.size())));
                r.setCreatedAt(checkOut.atTime(12, 0).plusDays(rand.nextInt(3)));
                reviewRepo.save(r);
                
                Long hid = hData.hotel().getHotelId();
                countMap.put(hid, countMap.getOrDefault(hid, 0) + 1);
                sumMap.put(hid, sumMap.getOrDefault(hid, 0) + rating);
            }
            
            // Add a few upcoming bookings for availability testing
            for(int i=0; i<3; i++) {
                User customer = customers.get(rand.nextInt(customers.size()));
                RoomCategory cat = hData.categories().get(rand.nextInt(hData.categories().size()));
                Room room = hData.rooms().get(rand.nextInt(hData.rooms().size()));
                LocalDate checkIn = today.plusDays(2 + rand.nextInt(30));
                LocalDate checkOut = checkIn.plusDays(2);
                bookingRepo.save(Booking.builder()
                        .user(customer).hotel(hData.hotel()).room(room).roomCategory(cat)
                        .checkInDate(checkIn).checkOutDate(checkOut).numberOfGuests(2)
                        .bookingState(BookingState.CONFIRMED).totalPrice(cat.getPricePerNight()*2).taxes(0.0).discount(0.0)
                        .bookingReference("YAT-26-UPC-" + bookingCounter++)
                        .bookingTimestamp(LocalDateTime.now().minusDays(1))
                        .bookingAddOns(new ArrayList<>()).build());
            }
        }
        
        updater.updateAggregates(countMap, sumMap);
    }

    // --- Helpers ---

    private User upsertUser(UserRepository repo, String name, String email, String phone, String password, Role role, PasswordEncoder enc) {
        return repo.findByEmail(email).orElseGet(() -> repo.save(User.builder().name(name).email(email).phone(phone).password(enc.encode(password)).role(role).build()));
    }

    private List<User> generateOwners(UserRepository repo, PasswordEncoder enc) {
        List<User> owners = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            owners.add(upsertUser(repo, "Owner " + i, "owner" + i + "@yatrika.in", "900000" + String.format("%04d", i), "Owner@2026", Role.HOTEL_OWNER, enc));
        }
        return owners;
    }

    private List<User> generateCustomers(UserRepository repo, PasswordEncoder enc) {
        String[] firsts = {"Aditi", "Aman", "Anika", "Arnav", "Bhavna", "Chirag", "Diya", "Eshan", "Farah", "Gaurav", "Harini", "Ishaan", "Jaya", "Kunal", "Lakshmi", "Manav", "Naina", "Omkar", "Pallavi", "Pranav", "Rhea", "Rishabh", "Saanvi", "Samar", "Sneha", "Tanvi", "Tara", "Uday", "Vaishnavi", "Varun", "Vedika", "Vivek", "Yash", "Zoya"};
        String[] lasts = {"Sharma", "Verma", "Bose", "Kulkarni", "Desai", "Jain", "Kapoor", "Gupta", "Khan", "Nair", "Iyer", "Roy", "Menon", "Bansal", "Pillai", "Arora", "Joshi", "Patil", "Shah", "Reddy"};
        List<User> customers = new ArrayList<>();
        for (int i = 0; i < 150; i++) {
            String name = firsts[i % firsts.length] + " " + lasts[i % lasts.length];
            String email = name.toLowerCase().replace(" ", ".") + i + "@mail.yatrika.in";
            customers.add(upsertUser(repo, name, email, "9100000" + String.format("%03d", i), "Guest@2026", Role.CUSTOMER, enc));
        }
        return customers;
    }

    private Map<String, AddOn> generateAddOns(AddOnRepository repo) {
        Map<String, AddOn> addOns = new LinkedHashMap<>();
        addOns.put("Breakfast", repo.save(AddOn.builder().name("Buffet Breakfast").description("Fresh regional and international breakfast.").price(800.0).pricingType(PricingType.PER_PERSON).build()));
        addOns.put("Airport Transfer", repo.save(AddOn.builder().name("Airport Transfer").description("Private airport transfer.").price(2500.0).pricingType(PricingType.PER_BOOKING).build()));
        return addOns;
    }
    
    private void generateHotelAddOns(Hotel hotel, Map<String, AddOn> addOns, HotelAddOnRepository repo) {
        repo.save(HotelAddOn.builder().hotel(hotel).addOn(addOns.get("Breakfast")).price(800.0).pricingType(PricingType.PER_PERSON).enabled(true).included(hotel.getCategory() == HotelCategory.LUXURY).build());
        repo.save(HotelAddOn.builder().hotel(hotel).addOn(addOns.get("Airport Transfer")).price(2500.0).pricingType(PricingType.PER_BOOKING).enabled(true).included(false).build());
    }

    private Set<Amenities> generateHotelAmenities(HotelCategory category, Random rand) {
        Set<Amenities> set = new HashSet<>(Set.of(Amenities.WIFI, Amenities.RESTAURANT, Amenities.AIR_CONDITIONING, Amenities.ROOM_SERVICE));
        if (category == HotelCategory.RESORT || category == HotelCategory.LUXURY) {
            set.addAll(Set.of(Amenities.SWIMMING_POOL, Amenities.SPA, Amenities.BAR, Amenities.VALET_PARKING, Amenities.GYM));
        }
        if (category == HotelCategory.BUSINESS) {
            set.addAll(Set.of(Amenities.BUSINESS_CENTER, Amenities.CONFERENCE_ROOM, Amenities.GYM));
        }
        return set;
    }

    private HotelCategory getCategoryForCityType(String type, Random rand) {
        if (type.equals("BEACH")) return rand.nextBoolean() ? HotelCategory.RESORT : HotelCategory.LUXURY;
        if (type.equals("MOUNTAIN")) return rand.nextBoolean() ? HotelCategory.RESORT : HotelCategory.BUDGET;
        if (type.equals("WILDLIFE")) return rand.nextBoolean() ? HotelCategory.RESORT : HotelCategory.BUDGET;
        if (type.equals("METRO")) return rand.nextBoolean() ? HotelCategory.BUSINESS : HotelCategory.LUXURY;
        return HotelCategory.LUXURY;
    }

    // --- City Config ---
    record CityConfig(String name, int hotelCount, String type) {}
    
    private List<CityConfig> getCityConfigs() {
        return List.of(
            // Tier 1
            new CityConfig("Mumbai", 5, "METRO"),
            new CityConfig("Delhi", 4, "METRO"),
            new CityConfig("Bengaluru", 4, "METRO"),
            new CityConfig("Hyderabad", 3, "METRO"),
            new CityConfig("Chennai", 3, "METRO"),
            new CityConfig("Kolkata", 3, "METRO"),
            new CityConfig("Pune", 2, "METRO"),
            new CityConfig("Ahmedabad", 2, "METRO"),
            
            // Tourism / Heritage
            new CityConfig("Goa", 6, "BEACH"),
            new CityConfig("Jaipur", 4, "HERITAGE"),
            new CityConfig("Udaipur", 4, "HERITAGE"),
            new CityConfig("Jodhpur", 3, "HERITAGE"),
            new CityConfig("Jaisalmer", 2, "HERITAGE"),
            new CityConfig("Agra", 2, "HERITAGE"),
            new CityConfig("Varanasi", 2, "HERITAGE"),
            new CityConfig("Amritsar", 2, "HERITAGE"),
            new CityConfig("Rishikesh", 2, "MOUNTAIN"),
            new CityConfig("Haridwar", 1, "HERITAGE"),
            
            // Mountains
            new CityConfig("Shimla", 3, "MOUNTAIN"),
            new CityConfig("Manali", 3, "MOUNTAIN"),
            new CityConfig("Leh", 2, "MOUNTAIN"),
            new CityConfig("Srinagar", 2, "MOUNTAIN"),
            new CityConfig("Gulmarg", 2, "MOUNTAIN"),
            new CityConfig("Auli", 1, "MOUNTAIN"),
            new CityConfig("Mussoorie", 2, "MOUNTAIN"),
            new CityConfig("Nainital", 2, "MOUNTAIN"),
            new CityConfig("Dalhousie", 1, "MOUNTAIN"),
            new CityConfig("Dharamshala", 2, "MOUNTAIN"),
            
            // South / Hill Stations
            new CityConfig("Munnar", 3, "MOUNTAIN"),
            new CityConfig("Ooty", 2, "MOUNTAIN"),
            new CityConfig("Coorg", 2, "MOUNTAIN"),
            new CityConfig("Kodaikanal", 2, "MOUNTAIN"),
            new CityConfig("Wayanad", 2, "MOUNTAIN"),
            new CityConfig("Kochi", 3, "BEACH"),
            new CityConfig("Alleppey", 2, "BEACH"),
            new CityConfig("Kovalam", 2, "BEACH"),
            new CityConfig("Varkala", 1, "BEACH"),
            new CityConfig("Mysore", 2, "HERITAGE"),
            
            // Wildlife & Others
            new CityConfig("Ranthambore", 2, "WILDLIFE"),
            new CityConfig("Jim Corbett", 2, "WILDLIFE"),
            new CityConfig("Kaziranga", 1, "WILDLIFE"),
            new CityConfig("Bandhavgarh", 1, "WILDLIFE"),
            new CityConfig("Kanha", 1, "WILDLIFE"),
            new CityConfig("Mahabalipuram", 2, "BEACH"),
            new CityConfig("Pondicherry", 2, "BEACH"),
            new CityConfig("Gokarna", 2, "BEACH"),
            new CityConfig("Hampi", 1, "HERITAGE")
        );
    }

    // --- Image Pools ---
    static class ImagePools {
        static final String[] LUXURY_EXT = {
            "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
        };
        static final String[] BEACH_EXT = {
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80"
        };
        static final String[] MOUNTAIN_EXT = {
            "https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1531315630201-bb15abeb1653?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80"
        };
        static final String[] BUSINESS_EXT = {
            "https://images.unsplash.com/photo-1505691723518-36d6b4b7ca6a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1545020978-7c0f5b2c3c28?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1551882547-ff40c0d805f1?auto=format&fit=crop&w=1200&q=80"
        };
        static final String[] ROOMS = {
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719478173-0b7f3a2b0b9f?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
        };
        
        static String getHotelImage(HotelCategory cat, String seed) {
            String[] pool = LUXURY_EXT;
            if(cat == HotelCategory.RESORT) pool = BEACH_EXT;
            else if(cat == HotelCategory.BUSINESS) pool = BUSINESS_EXT;
            else if(cat == HotelCategory.BUDGET) pool = MOUNTAIN_EXT;
            
            return pool[Math.abs(seed.hashCode()) % pool.length];
        }
        
        static String getRoomImage(String type, String seed) {
            return ROOMS[Math.abs((seed+type).hashCode()) % ROOMS.length];
        }
    }

    private record HotelData(Hotel hotel, List<RoomCategory> categories, List<Room> rooms) {}

    @Component
    public static class HotelAggregateUpdater {
        @PersistenceContext
        private jakarta.persistence.EntityManager em;

        @Transactional
        public void updateAggregates(Map<Long, Integer> countMap, Map<Long, Integer> sumMap) {
            for (var entry : countMap.entrySet()) {
                Long hid = entry.getKey();
                int cnt = entry.getValue();
                int sum = sumMap.getOrDefault(hid, 0);
                double avg = cnt > 0 ? (double) sum / cnt : 0.0;
                em.createQuery("UPDATE Hotel h SET h.reviewCount = :cnt, h.avgRating = :avg WHERE h.hotelId = :hid")
                        .setParameter("cnt", cnt)
                        .setParameter("avg", Math.round(avg * 10.0) / 10.0)
                        .setParameter("hid", hid)
                        .executeUpdate();
            }
        }
    }

    @Component
    public static class DataCleaner {
        @PersistenceContext
        private jakarta.persistence.EntityManager em;

        @Transactional
        public void clearAll() {
            em.createQuery("DELETE FROM Review r").executeUpdate();
            em.createQuery("DELETE FROM Payment p").executeUpdate();
            em.createQuery("DELETE FROM BookingAddOn bao").executeUpdate();
            em.createQuery("DELETE FROM Booking b").executeUpdate();
            em.createQuery("DELETE FROM HotelAddOn hao").executeUpdate();
            em.createQuery("DELETE FROM Room r").executeUpdate();
            em.createQuery("DELETE FROM RoomCategory rc").executeUpdate();
            em.createQuery("DELETE FROM Hotel h").executeUpdate();
            em.createQuery("DELETE FROM AddOn ao").executeUpdate();
            em.createQuery("DELETE FROM PasswordResetToken prt").executeUpdate();
            em.createQuery("DELETE FROM User u").executeUpdate();
        }
    }
}
