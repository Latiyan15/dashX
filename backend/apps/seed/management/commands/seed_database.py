"""
Custom Django management command to seed the database with realistic Indian automotive service operations data.
Generates:
- 65+ Customers with Indian names, +91 phone numbers, and cities
- 130+ Vehicles with authentic Indian license plates (KA, MH, DL, TS, TN, HR)
- 25 Mechanics with profile avatars, ratings, job stats, and specializations
- 6 Service Categories & 18 Standard Services in INR (₹)
- 650+ Bookings spanning historical and live dates with full BookingStatusHistory audit trails
"""

import random
from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker

from apps.customers.models import Customer, Vehicle
from apps.mechanics.models import Mechanic
from apps.services.models import ServiceCategory, Service
from apps.bookings.models import Booking, BookingStatusHistory

fake = Faker('en_IN')

INDIAN_FIRST_NAMES_MALE = [
    "Aarav", "Aditya", "Amit", "Anand", "Arjun", "Ashwin", "Ayush", "Bhavin",
    "Chetan", "Deepak", "Devendra", "Dinesh", "Gaurav", "Harish", "Hemant",
    "Ishaan", "Jagdish", "Karan", "Kunal", "Manish", "Manoj", "Naveen",
    "Nikhil", "Pankaj", "Pranav", "Prateek", "Rahul", "Rajesh", "Rakesh",
    "Ravi", "Rishabh", "Rohan", "Sachin", "Sameer", "Sanjay", "Santosh",
    "Satish", "Siddharth", "Suresh", "Tanmay", "Utkarsh", "Varun", "Vikas",
    "Vikram", "Vinay", "Vinod", "Vishal", "Yash"
]

INDIAN_FIRST_NAMES_FEMALE = [
    "Aadhya", "Aakanksha", "Aditi", "Ananya", "Ankita", "Anushka", "Aparna",
    "Archana", "Bhavna", "Deepika", "Divya", "Gayatri", "Harini", "Ishita",
    "Kavita", "Khushi", "Kiran", "Madhavi", "Manasi", "Meera", "Neha",
    "Nidhi", "Pallavi", "Pooja", "Prerna", "Priya", "Priyanka", "Rani",
    "Rashmi", "Rhea", "Ritu", "Rupal", "Sakshi", "Sangeeta", "Shalini",
    "Shreya", "Shruti", "Sneha", "Sonali", "Sunita", "Swati", "Tanvi",
    "Trisha", "Vaishnavi", "Varsha", "Vidya", "Yamini"
]

INDIAN_LAST_NAMES = [
    "Agarwal", "Banerjee", "Bhat", "Bhattacharya", "Chauhan", "Chawla",
    "Choudhury", "Deshmukh", "Dutta", "Fernandes", "Gowda", "Gupta", "Hegde",
    "Iyer", "Jadhav", "Jain", "Jha", "Joshi", "Kapoor", "Khan", "Kothari",
    "Kulkarni", "Kumar", "Mahajan", "Malhotra", "Mehta", "Menon", "Mishra",
    "Mukherjee", "Nair", "Pandey", "Patel", "Patil", "Pawar", "Pillai",
    "Radhakrishnan", "Rao", "Reddy", "Roy", "Sengupta", "Shah", "Sharma",
    "Shinde", "Singh", "Srinivasan", "Sutar", "Trivedi", "Varma", "Verma", "Yadav"
]

INDIAN_CITIES = [
    ("Gurugram", "122001", "HR"),
    ("Gurugram", "122002", "HR"),
    ("Gurugram", "122018", "HR"),
    ("Mumbai", "400001", "MH"),
    ("Mumbai", "400050", "MH"),
    ("Pune", "411001", "MH"),
    ("Delhi", "110001", "DL"),
    ("Gurugram", "122001", "HR"),
    ("Noida", "201301", "UP"),
    ("Hyderabad", "500081", "TS"),
    ("Chennai", "600001", "TN"),
]

INDIAN_LOCALITIES = [
    "Indiranagar 100ft Road", "Koramangala 4th Block", "HSR Layout Sector 2",
    "Whitefield ITPL Main Road", "Jayanagar 4th Block", "Bandra West",
    "Andheri East MIDC", "Powai Hiranandani", "Kothrud", "Viman Nagar",
    "Connaught Place", "Cyber City Phase 2", "Sector 62 Noida",
    "Madhapur Cyber Towers", "Gachibowli Financial District", "Anna Nagar West",
    "T. Nagar", "Electronic City Phase 1", "JP Nagar 7th Phase", "Marathahalli"
]

VEHICLE_CATALOG = [
    ("Maruti Suzuki", "Swift", Vehicle.FuelType.PETROL),
    ("Maruti Suzuki", "Baleno", Vehicle.FuelType.PETROL),
    ("Maruti Suzuki", "Brezza", Vehicle.FuelType.PETROL),
    ("Maruti Suzuki", "Grand Vitara", Vehicle.FuelType.HYBRID),
    ("Maruti Suzuki", "Ertiga", Vehicle.FuelType.CNG),
    ("Hyundai", "Creta", Vehicle.FuelType.DIESEL),
    ("Hyundai", "i20", Vehicle.FuelType.PETROL),
    ("Hyundai", "Venue", Vehicle.FuelType.PETROL),
    ("Hyundai", "Verna", Vehicle.FuelType.PETROL),
    ("Tata", "Nexon", Vehicle.FuelType.PETROL),
    ("Tata", "Nexon EV", Vehicle.FuelType.ELECTRIC),
    ("Tata", "Punch", Vehicle.FuelType.PETROL),
    ("Tata", "Harrier", Vehicle.FuelType.DIESEL),
    ("Tata", "Safari", Vehicle.FuelType.DIESEL),
    ("Mahindra", "Thar 4x4", Vehicle.FuelType.DIESEL),
    ("Mahindra", "Scorpio-N", Vehicle.FuelType.DIESEL),
    ("Mahindra", "XUV700", Vehicle.FuelType.DIESEL),
    ("Honda", "City", Vehicle.FuelType.PETROL),
    ("Honda", "Elevate", Vehicle.FuelType.PETROL),
    ("Toyota", "Innova Hycross", Vehicle.FuelType.HYBRID),
    ("Toyota", "Fortuner", Vehicle.FuelType.DIESEL),
    ("Toyota", "Urban Cruiser", Vehicle.FuelType.PETROL),
    ("Kia", "Seltos", Vehicle.FuelType.DIESEL),
    ("Kia", "Sonet", Vehicle.FuelType.PETROL),
    ("Volkswagen", "Taigun", Vehicle.FuelType.PETROL),
    ("Volkswagen", "Virtus", Vehicle.FuelType.PETROL),
    ("MG", "ZS EV", Vehicle.FuelType.ELECTRIC),
]

CATEGORIES_DATA = [
    {
        "name": "Periodic Maintenance",
        "slug": "periodic-maintenance",
        "icon": "Wrench",
        "description": "Scheduled logbook service, fluid replacements, and 40-point safety health checks.",
        "services": [
            ("Standard Engine Oil & Filter Service", "Includes 100% synthetic engine oil replacement, OEM oil filter, and air filter cleaning.", 2499.00, 60),
            ("Comprehensive 10,000 km Service", "Full engine flush, spark plug check, coolant top-up, brake inspection, and wheel rotation.", 4899.00, 120),
            ("Major 40,000 km Service Overhaul", "Transmission fluid change, brake fluid replacement, throttle body cleaning, and suspension check.", 8499.00, 180),
        ]
    },
    {
        "name": "Brake & Wheel Care",
        "slug": "brake-wheel-care",
        "icon": "Disc",
        "description": "Brake pads, rotor resurfacing, 3D wheel alignment, and computerized balancing.",
        "services": [
            ("Front Ceramic Brake Pad Replacement", "Premium OEM-spec front ceramic pads installation with anti-squeal lubrication.", 2899.00, 60),
            ("Complete 4-Wheel Brake Disc & Drum Service", "Brake caliper greasing, disc lathe resurfacing, and DOT4 fluid bleeding.", 4199.00, 90),
            ("3D Laser Wheel Alignment & Balancing", "Computerized 4-wheel alignment with rim balancing and tire pressure optimization.", 1499.00, 45),
        ]
    },
    {
        "name": "Engine & Diagnostics",
        "slug": "engine-diagnostics",
        "icon": "Activity",
        "description": "OBD-II computer diagnostics, ignition system, fuel injector ultrasonic cleaning.",
        "services": [
            ("Full OBD-II Electronic Scan & Report", "Comprehensive ECU fault code readout, sensor live-data analysis, and health audit.", 1199.00, 30),
            ("Ultrasonic Fuel Injector & Throttle Cleaning", "Improves throttle response, mileage, and eliminates rough engine idling.", 3299.00, 90),
            ("Engine Decarbonization & Intake Care", "Chemical decarbonization restoring optimal cylinder compression and emissions.", 2799.00, 75),
        ]
    },
    {
        "name": "AC & Climate Control",
        "slug": "ac-climate-control",
        "icon": "Wind",
        "description": "R134a refrigerant gas charging, condenser cleaning, and cabin air purification.",
        "services": [
            ("Complete Car AC Gas Refill & Leak Test", "Vacuum pressure leak test and high-purity R134a refrigerant gas recharge.", 1999.00, 45),
            ("Anti-Bacterial AC Evaporator Deep Clean", "Removes foul odor, mold, and bacteria with disinfectant foam treatment.", 1499.00, 40),
            ("Comprehensive AC Compressor & Cooling Coil Service", "Full cooling coil removal, ultrasonic wash, and compressor valve overhaul.", 5499.00, 150),
        ]
    },
    {
        "name": "Electrical & Battery",
        "slug": "electrical-battery",
        "icon": "BatteryCharging",
        "description": "Battery load testing, alternator testing, wiring harness and lighting repairs.",
        "services": [
            ("Car Battery Health Test & Jumpstart Service", "Digital CCA load testing, terminal de-oxidation, and alternator charging inspection.", 699.00, 30),
            ("Starter Motor & Alternator Refurbishment", "Field coil inspection, carbon brush replacement, and bench testing.", 3799.00, 120),
            ("Headlight LED Conversion & Relay Harness", "High-power 6000K LED installation with ceramic sockets and safety relays.", 3499.00, 60),
        ]
    },
    {
        "name": "Detailing & Ceramic Care",
        "slug": "detailing-ceramic-care",
        "icon": "Sparkles",
        "description": "Foam washing, 3-step paint polishing, interior steam sterilization, and ceramic coating.",
        "services": [
            ("Deep Interior Steam Spa & Upholstery Clean", "High-temperature steam treatment of seats, roof liner, carpets, and dashboard dressing.", 2299.00, 90),
            ("3-Step Machine Paint Correction & Wax", "Swirl removal with compound polishing and carnauba paste wax protective coat.", 3999.00, 150),
            ("9H Ceramic Coating Protection Package", "Dual layer 9H nano-ceramic coating with 2-year warranty and hydrophobic shine.", 12499.00, 240),
        ]
    }
]

MECHANICS_DATA = [
    ("Ramesh", "Kumar", "Engine & Periodic Maintenance", 4.92, 142, 7),
    ("Suresh", "Yadav", "Brake & Suspension Specialist", 4.88, 118, 6),
    ("Abdul", "Khan", "Engine Diagnostics & ECU Tuning", 4.95, 168, 8),
    ("Manoj", "Patil", "AC & Climate Control Systems", 4.81, 95, 5),
    ("Jagdish", "Sutar", "Electrical & Hybrid Powertrains", 4.89, 110, 6),
    ("Vinod", "Shinde", "Periodic Maintenance & Quick Bay", 4.78, 88, 4),
    ("Harish", "Gowda", "Brake & Wheel Alignment", 4.85, 102, 5),
    ("Dinesh", "Sharma", "Engine Decarbonization & Turbo", 4.91, 134, 7),
    ("Sunil", "Chawla", "Transmission & Clutch Specialist", 4.87, 125, 6),
    ("Deepak", "Verma", "Detailing & Ceramic Coating", 4.94, 155, 8),
    ("Rajesh", "Gupta", "Periodic Maintenance", 4.76, 74, 3),
    ("Praveen", "Nair", "Electrical Systems & Lighting", 4.83, 91, 5),
    ("Santosh", "Jadhav", "Brake Care & Hydraulics", 4.86, 109, 5),
    ("Vikram", "Singh", "Engine Diagnostics & Sensors", 4.90, 130, 7),
    ("Gaurav", "Mishra", "AC Systems & Compressors", 4.79, 82, 4),
    ("Manish", "Reddy", "General Mechanical Service", 4.84, 98, 5),
    ("Anand", "Deshmukh", "Hybrid & EV Battery Systems", 4.93, 115, 6),
    ("Karan", "Malhotra", "Detailing & Body Care", 4.88, 104, 5),
    ("Sachin", "Kulkarni", "Transmission & Steering", 4.82, 87, 4),
    ("Ravi", "Pawar", "Quick Lube & Periodic Service", 4.75, 69, 3),
    ("Naveen", "Hegde", "Engine Tuning & Overhauls", 4.96, 180, 9),
    ("Amit", "Chauhan", "Electrical Wiring & Sensors", 4.80, 78, 4),
    ("Pankaj", "Jha", "Brake & Suspension Specialist", 4.85, 96, 5),
    ("Bhavin", "Patel", "AC Maintenance & Gas Recharge", 4.89, 112, 6),
    ("Chetan", "Bhatt", "Periodic Maintenance Lead", 4.92, 140, 7),
]

AVATAR_URLS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
]


class Command(BaseCommand):
    help = "Seeds database with realistic Indian automotive service operations data."

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Wipe existing operational data before seeding',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("--- Starting DashX Database Seeding ---"))

        if options['clean']:
            self.stdout.write("Cleaning existing database records...")
            BookingStatusHistory.objects.all().delete()
            Booking.objects.all().delete()
            Vehicle.objects.all().delete()
            Customer.objects.all().delete()
            Mechanic.objects.all().delete()
            Service.objects.all().delete()
            ServiceCategory.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Existing records cleaned."))

        # 1. Seed Service Categories & Services
        self.stdout.write("1/5 Seeding Service Categories and Services...")
        services_pool = []
        for cat_data in CATEGORIES_DATA:
            category, _ = ServiceCategory.objects.get_or_create(
                slug=cat_data["slug"],
                defaults={
                    "name": cat_data["name"],
                    "icon": cat_data["icon"],
                    "description": cat_data["description"],
                    "is_active": True
                }
            )
            for svc_name, svc_desc, price, duration in cat_data["services"]:
                service, _ = Service.objects.get_or_create(
                    category=category,
                    name=svc_name,
                    defaults={
                        "description": svc_desc,
                        "base_price": Decimal(str(price)),
                        "estimated_duration_minutes": duration,
                        "is_active": True
                    }
                )
                services_pool.append(service)

        self.stdout.write(
            self.style.SUCCESS(f"  Created {ServiceCategory.objects.count()} Categories and {Service.objects.count()} Services.")
        )

        # 2. Seed Mechanics
        self.stdout.write("2/5 Seeding Mechanics...")
        mechanics_pool = []
        for idx, (first_name, last_name, spec, rating, jobs, exp) in enumerate(MECHANICS_DATA):
            email = f"{first_name.lower()}.{last_name.lower()}{idx+1}@instantmechanic.in"
            phone = f"+91 {random.choice(['98', '99', '88', '77', '94'])}{random.randint(1000, 9999)} {random.randint(1000, 9999)}"
            avatar = AVATAR_URLS[idx % len(AVATAR_URLS)]

            mechanic, _ = Mechanic.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "phone": phone,
                    "status": random.choice([
                        Mechanic.Status.AVAILABLE,
                        Mechanic.Status.AVAILABLE,
                        Mechanic.Status.BUSY,
                        Mechanic.Status.ON_TRIP,
                        Mechanic.Status.OFFLINE
                    ]),
                    "rating": Decimal(str(rating)),
                    "total_jobs_completed": jobs,
                    "specialization": spec,
                    "avatar_url": avatar,
                    "experience_years": exp,
                    "current_latitude": Decimal(str(round(12.9716 + random.uniform(-0.08, 0.08), 6))),
                    "current_longitude": Decimal(str(round(77.5946 + random.uniform(-0.08, 0.08), 6))),
                }
            )
            mechanics_pool.append(mechanic)

        self.stdout.write(self.style.SUCCESS(f"  Created {Mechanic.objects.count()} Mechanics."))

        # 3. Seed Customers
        self.stdout.write("3/5 Seeding Customers...")
        customers_pool = []
        for i in range(70):
            is_male = random.choice([True, False])
            first_name = random.choice(INDIAN_FIRST_NAMES_MALE if is_male else INDIAN_FIRST_NAMES_FEMALE)
            last_name = random.choice(INDIAN_LAST_NAMES)
            email = f"{first_name.lower()}.{last_name.lower()}{random.randint(10, 999)}@{random.choice(['gmail.com', 'outlook.com', 'yahoo.co.in', 'icloud.com'])}"
            phone = f"+91 {random.choice(['98', '97', '96', '91', '89', '88', '70'])}{random.randint(1000, 9999)} {random.randint(1000, 9999)}"
            city, pincode, state_code = random.choice(INDIAN_CITIES)
            address = f"#{random.randint(12, 450)}, {random.choice(INDIAN_LOCALITIES)}"

            customer, _ = Customer.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "phone": phone,
                    "address": address,
                    "city": city,
                    "postal_code": pincode,
                }
            )
            customers_pool.append(customer)

        self.stdout.write(self.style.SUCCESS(f"  Created {Customer.objects.count()} Customers."))

        # 4. Seed Vehicles (1-3 vehicles per customer)
        self.stdout.write("4/5 Seeding Vehicles...")
        vehicles_pool = []
        used_plates = set()

        for customer in customers_pool:
            num_vehicles = random.choices([1, 2, 3], weights=[0.40, 0.40, 0.20])[0]
            for _ in range(num_vehicles):
                make, model, fuel = random.choice(VEHICLE_CATALOG)
                year = random.randint(2016, 2024)
                
                # Generate realistic Indian registration plate
                state = random.choice(["KA", "MH", "DL", "HR", "TS", "TN"])
                rto = f"{random.randint(1, 14):02d}"
                series = f"{random.choice(['AB', 'CD', 'EF', 'GH', 'JK', 'MJ', 'MZ', 'NA', 'NB', 'ZG']) }"
                num = f"{random.randint(1000, 9999)}"
                plate = f"{state} {rto} {series.strip()} {num}"
                
                while plate in used_plates:
                    num = f"{random.randint(1000, 9999)}"
                    plate = f"{state} {rto} {series.strip()} {num}"
                used_plates.add(plate)

                mileage = random.randint(5000, 120000)

                vehicle = Vehicle.objects.create(
                    customer=customer,
                    make=make,
                    model=model,
                    year=year,
                    license_plate=plate,
                    fuel_type=fuel,
                    mileage=mileage,
                )
                vehicles_pool.append(vehicle)

        self.stdout.write(self.style.SUCCESS(f"  Created {Vehicle.objects.count()} Vehicles."))

        # 5. Seed Bookings (650+ realistic bookings across past 180 days to future 7 days)
        self.stdout.write("5/5 Seeding 650+ Bookings with Full Status History...")
        now = timezone.now()
        booking_counter = 10001
        
        statuses_weights = [
            (Booking.Status.COMPLETED, 0.68),
            (Booking.Status.IN_PROGRESS, 0.08),
            (Booking.Status.ON_THE_WAY, 0.06),
            (Booking.Status.ASSIGNED, 0.07),
            (Booking.Status.PENDING, 0.05),
            (Booking.Status.CANCELLED, 0.06),
        ]
        statuses, weights = zip(*statuses_weights)

        bookings_to_create = []
        histories_to_create = []
        booking_counter = 101

        for i in range(650):
            booking_counter += 1

            vehicle = random.choice(vehicles_pool)
            customer = vehicle.customer
            service = random.choice(services_pool)
            
            # Select target status
            status = random.choices(statuses, weights=weights)[0]
            
            # Additional charges (extra filter, engine oil flush, AC top up, etc.)
            has_extras = random.choice([True, False, False])
            additional_charges = Decimal(str(random.choice([0, 350, 650, 1200, 1850, 2400]))) if has_extras else Decimal('0.00')
            base_price = service.base_price
            total_amount = base_price + additional_charges

            # Time distribution
            if status == Booking.Status.COMPLETED:
                days_ago = random.randint(1, 180)
                scheduled_at = now - timedelta(days=days_ago, hours=random.randint(1, 10), minutes=random.randint(0, 59))
                completed_at = scheduled_at + timedelta(minutes=service.estimated_duration_minutes + random.randint(10, 45))
                mechanic = random.choice(mechanics_pool)
            elif status in [Booking.Status.IN_PROGRESS, Booking.Status.ON_THE_WAY, Booking.Status.ASSIGNED]:
                # Scheduled today or yesterday
                scheduled_at = now - timedelta(hours=random.randint(1, 6), minutes=random.randint(0, 59))
                completed_at = None
                mechanic = random.choice(mechanics_pool)
            elif status == Booking.Status.PENDING:
                # Scheduled today or upcoming next few days
                scheduled_at = now + timedelta(days=random.randint(0, 6), hours=random.randint(1, 8))
                completed_at = None
                mechanic = None
            else:  # CANCELLED
                days_ago = random.randint(0, 120)
                scheduled_at = now - timedelta(days=days_ago, hours=random.randint(2, 8))
                completed_at = None
                mechanic = random.choice([None, random.choice(mechanics_pool)])

            # Dynamic date-encoded reference code: IM-YYMMDD-XXXXX (e.g. IM-260901-00140)
            ref_code = f"IM-{scheduled_at.strftime('%y%m%d')}-{booking_counter:05d}"
            service_loc = f"{customer.address}, {customer.city}"

            booking = Booking(
                reference_code=ref_code,
                customer=customer,
                vehicle=vehicle,
                service=service,
                mechanic=mechanic,
                status=status,
                scheduled_at=scheduled_at,
                completed_at=completed_at,
                base_price=base_price,
                additional_charges=additional_charges,
                total_amount=total_amount,
                service_location=service_loc,
                customer_notes=random.choice([
                    "", "",
                    "Please check front brake squeaking noise.",
                    "AC cooling drops when idling in traffic.",
                    "Slight vibration at 80 km/h.",
                    "Request morning slot if possible.",
                    "Engine oil was last changed 9 months ago.",
                ]),
                mechanic_notes=random.choice([
                    "", "",
                    "Inspection completed. All torque specs verified.",
                    "Customer informed regarding brake pad wear level (3mm remaining).",
                    "Coolant level was low, topped up with OEM pre-mix.",
                    "Tire pressures adjusted to 33 PSI all round.",
                ]) if status == Booking.Status.COMPLETED else ""
            )
            # Set created_at to approximate scheduled_at
            booking.created_at = scheduled_at - timedelta(hours=random.randint(2, 24))
            bookings_to_create.append(booking)

        # Bulk create bookings
        Booking.objects.bulk_create(bookings_to_create)

        # Refresh created bookings to attach foreign keys and build history trails
        all_created_bookings = Booking.objects.select_related('mechanic', 'customer').all()

        for b in all_created_bookings:
            t0 = b.created_at

            if b.status == Booking.Status.PENDING:
                histories_to_create.append(
                    BookingStatusHistory(
                        booking=b,
                        from_status=None,
                        to_status=Booking.Status.PENDING,
                        changed_by="Customer App / Web",
                        notes="Service request placed successfully.",
                        created_at=t0
                    )
                )
            elif b.status == Booking.Status.ASSIGNED:
                t1 = t0 + timedelta(minutes=random.randint(5, 20))
                histories_to_create.extend([
                    BookingStatusHistory(
                        booking=b,
                        from_status=None,
                        to_status=Booking.Status.PENDING,
                        changed_by="Customer App",
                        notes="Service request placed.",
                        created_at=t0
                    ),
                    BookingStatusHistory(
                        booking=b,
                        from_status=Booking.Status.PENDING,
                        to_status=Booking.Status.ASSIGNED,
                        changed_by="Operations Auto-Dispatch",
                        notes=f"Assigned to {b.mechanic.full_name if b.mechanic else 'Field Engineer'}.",
                        created_at=t1
                    ),
                ])
            elif b.status == Booking.Status.ON_THE_WAY:
                t1 = t0 + timedelta(minutes=15)
                t2 = t1 + timedelta(minutes=25)
                histories_to_create.extend([
                    BookingStatusHistory(booking=b, from_status=None, to_status=Booking.Status.PENDING, changed_by="Customer App", created_at=t0),
                    BookingStatusHistory(booking=b, from_status=Booking.Status.PENDING, to_status=Booking.Status.ASSIGNED, changed_by="Operations Desk", created_at=t1),
                    BookingStatusHistory(booking=b, from_status=Booking.Status.ASSIGNED, to_status=Booking.Status.ON_THE_WAY, changed_by=b.mechanic.full_name if b.mechanic else "Mechanic", notes="Dispatched to service address.", created_at=t2),
                ])
            elif b.status == Booking.Status.IN_PROGRESS:
                t1 = t0 + timedelta(minutes=10)
                t2 = t1 + timedelta(minutes=20)
                t3 = t2 + timedelta(minutes=15)
                histories_to_create.extend([
                    BookingStatusHistory(booking=b, from_status=None, to_status=Booking.Status.PENDING, changed_by="Customer App", created_at=t0),
                    BookingStatusHistory(booking=b, from_status=Booking.Status.PENDING, to_status=Booking.Status.ASSIGNED, changed_by="Operations Desk", created_at=t1),
                    BookingStatusHistory(booking=b, from_status=Booking.Status.ASSIGNED, to_status=Booking.Status.ON_THE_WAY, changed_by="Mechanic App", created_at=t2),
                    BookingStatusHistory(booking=b, from_status=Booking.Status.ON_THE_WAY, to_status=Booking.Status.IN_PROGRESS, changed_by="Mechanic App", notes="Vehicle inspection started on bay.", created_at=t3),
                ])
            elif b.status == Booking.Status.COMPLETED:
                t1 = t0 + timedelta(minutes=10)
                t2 = t1 + timedelta(minutes=25)
                t3 = t2 + timedelta(minutes=15)
                t4 = b.completed_at or (t3 + timedelta(minutes=b.service.estimated_duration_minutes))
                histories_to_create.extend([
                    BookingStatusHistory(booking=b, from_status=None, to_status=Booking.Status.PENDING, changed_by="Customer App", created_at=t0),
                    BookingStatusHistory(booking=b, from_status=Booking.Status.PENDING, to_status=Booking.Status.ASSIGNED, changed_by="Operations Desk", created_at=t1),
                    BookingStatusHistory(booking=b, from_status=Booking.Status.ASSIGNED, to_status=Booking.Status.ON_THE_WAY, changed_by="Mechanic App", created_at=t2),
                    BookingStatusHistory(booking=b, from_status=Booking.Status.ON_THE_WAY, to_status=Booking.Status.IN_PROGRESS, changed_by="Mechanic App", created_at=t3),
                    BookingStatusHistory(booking=b, from_status=Booking.Status.IN_PROGRESS, to_status=Booking.Status.COMPLETED, changed_by="Mechanic App", notes="Job completed and road-tested successfully.", created_at=t4),
                ])
            elif b.status == Booking.Status.CANCELLED:
                t1 = t0 + timedelta(minutes=random.randint(15, 60))
                histories_to_create.extend([
                    BookingStatusHistory(booking=b, from_status=None, to_status=Booking.Status.PENDING, changed_by="Customer App", created_at=t0),
                    BookingStatusHistory(booking=b, from_status=Booking.Status.PENDING, to_status=Booking.Status.CANCELLED, changed_by="Customer Request", notes="Customer rescheduled trip.", created_at=t1),
                ])

        BookingStatusHistory.objects.bulk_create(histories_to_create)

        self.stdout.write(
            self.style.SUCCESS(
                f"  Created {Booking.objects.count()} Bookings and {BookingStatusHistory.objects.count()} Status History audit trails."
            )
        )

        self.stdout.write(self.style.SUCCESS("=== Database Seeding Completed Successfully! ==="))
