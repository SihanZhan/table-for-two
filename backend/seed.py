"""Run once to create tables and insert seed restaurants: python seed.py"""
import asyncio
from dotenv import find_dotenv, load_dotenv
load_dotenv(find_dotenv())

from sqlalchemy import func, select

from app.database import AsyncSessionLocal, Base, engine
from app.models import Restaurant

RESTAURANTS = [
    Restaurant(name="The Italian Table", cuisine="Italian", price_range=3, rating=4.6,
               neighborhood="Downtown",
               description="Handmade pasta and wood-fired pizza in a candlelit trattoria. The carbonara alone is worth the trip."),
    Restaurant(name="Sakura Ramen & Sushi", cuisine="Japanese", price_range=2, rating=4.4,
               neighborhood="Midtown",
               description="Pillow-soft tonkotsu broth and crisp omakase rolls. Casual enough for a weeknight but special enough to feel like a date."),
    Restaurant(name="El Patrón Taqueria", cuisine="Mexican", price_range=1, rating=4.5,
               neighborhood="East Side",
               description="Street-style tacos with house-made salsas. Loud, fun, and absurdly good for the price."),
    Restaurant(name="Spice Garden", cuisine="Indian", price_range=2, rating=4.3,
               neighborhood="Little India",
               description="Slow-cooked curries and freshly baked naan. The butter chicken is a crowd-pleaser without being boring."),
    Restaurant(name="Bangkok Street", cuisine="Thai", price_range=2, rating=4.2,
               neighborhood="Westside",
               description="Authentic pad see ew and green papaya salad with real heat. BYO wine and enjoy the no-frills vibe."),
    Restaurant(name="Le Petit Bistro", cuisine="French", price_range=4, rating=4.8,
               neighborhood="Uptown",
               description="Classic French technique — duck confit, soufflé, a wine list curated with actual care. Save it for a special occasion."),
    Restaurant(name="Seoul Kitchen", cuisine="Korean", price_range=2, rating=4.5,
               neighborhood="Koreatown",
               description="Table BBQ grills and banchan that keep coming. The galbi short ribs are worth the wait."),
    Restaurant(name="Pho Saigon", cuisine="Vietnamese", price_range=1, rating=4.4,
               neighborhood="Chinatown",
               description="Ten-hour bone broth, fresh herbs, and enough brisket to share. The best $12 date in the city."),
    Restaurant(name="Mezze Mediterranean", cuisine="Mediterranean", price_range=3, rating=4.3,
               neighborhood="Harbor District",
               description="Sharing plates of hummus, falafel, and grilled halloumi with a view of the water. Perfect for grazing."),
    Restaurant(name="The Burger Joint", cuisine="American", price_range=1, rating=4.1,
               neighborhood="Downtown",
               description="Smash burgers on a flattop, house pickles, hand-cut fries. No pretense, just great burgers."),
    Restaurant(name="Blue Fin Sushi Bar", cuisine="Japanese", price_range=4, rating=4.7,
               neighborhood="Waterfront",
               description="Chef's tasting omakase with fish flown in weekly. Worth every dollar for a memorable night out."),
    Restaurant(name="Mama Rosa's", cuisine="Italian", price_range=2, rating=4.2,
               neighborhood="North End",
               description="Red-sauce classics in a family-run trattoria that's been here 30 years. Loud, warm, and full of regulars."),
    Restaurant(name="Bombay Palace", cuisine="Indian", price_range=3, rating=4.6,
               neighborhood="Midtown",
               description="Elevated Indian cuisine — lamb rogan josh, paneer tikka, and a cocktail list that matches the food."),
    Restaurant(name="Greek House", cuisine="Greek", price_range=2, rating=4.3,
               neighborhood="Eastgate",
               description="Grilled octopus, spanakopita, and a lamb souvlaki that'll ruin all other souvlaki forever."),
    Restaurant(name="Peking Garden", cuisine="Chinese", price_range=2, rating=4.1,
               neighborhood="Chinatown",
               description="Peking duck carved tableside, mapo tofu with real Sichuan pepper. Order the family meal for two."),
    Restaurant(name="Smokehouse BBQ", cuisine="American", price_range=2, rating=4.5,
               neighborhood="West End",
               description="Low-and-slow brisket, pulled pork, and housemade hot sauce. The banana pudding is the secret star."),
    Restaurant(name="Chez Marie", cuisine="French", price_range=3, rating=4.4,
               neighborhood="Arts District",
               description="Neighborhood bistro with a blackboard menu that changes daily. The steak frites is a permanent fixture — justifiably."),
    Restaurant(name="Pad Thai Palace", cuisine="Thai", price_range=1, rating=4.2,
               neighborhood="University Ave",
               description="Perfectly balanced pad thai and massaman curry. Tiny space, big flavors, always worth the wait."),
    Restaurant(name="The Steakhouse", cuisine="American", price_range=4, rating=4.9,
               neighborhood="Financial District",
               description="Dry-aged prime cuts, a sommelier on staff, and tableside Caesar. The gold standard for a special dinner."),
    Restaurant(name="Hanoi House", cuisine="Vietnamese", price_range=2, rating=4.5,
               neighborhood="Midtown",
               description="Bun bo Hue and crispy spring rolls that take Vietnamese food beyond pho. Small, cozy, and reservations recommended."),
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        count = await session.scalar(select(func.count()).select_from(Restaurant))
        if count and count > 0:
            print(f"Already seeded ({count} restaurants). Skipping.")
            return

        session.add_all(RESTAURANTS)
        await session.commit()
        print(f"Seeded {len(RESTAURANTS)} restaurants.")


if __name__ == "__main__":
    asyncio.run(seed())
