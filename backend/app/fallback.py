"""Seed restaurants used when Foursquare is unavailable."""
from .models import Restaurant


def _photo(keyword: str) -> str:
    return f"https://source.unsplash.com/featured/800x600/?{keyword}"


_DATA = [
    dict(name="The Italian Table", cuisine="Italian", price_range=3, rating=4.6, neighborhood="Downtown",
         description="Handmade pasta and wood-fired pizza in a candlelit trattoria. The carbonara alone is worth the trip.",
         image_url=_photo("italian,pasta,restaurant")),
    dict(name="Sakura Ramen & Sushi", cuisine="Japanese", price_range=2, rating=4.4, neighborhood="Midtown",
         description="Pillow-soft tonkotsu broth and crisp omakase rolls. Casual enough for a weeknight but special enough for a date.",
         image_url=_photo("sushi,japanese,ramen")),
    dict(name="El Patrón Taqueria", cuisine="Mexican", price_range=1, rating=4.5, neighborhood="East Side",
         description="Street-style tacos with house-made salsas. Loud, fun, and absurdly good for the price.",
         image_url=_photo("tacos,mexican,streetfood")),
    dict(name="Spice Garden", cuisine="Indian", price_range=2, rating=4.3, neighborhood="Little India",
         description="Slow-cooked curries and freshly baked naan. The butter chicken is a crowd-pleaser without being boring.",
         image_url=_photo("indian,curry,restaurant")),
    dict(name="Bangkok Street", cuisine="Thai", price_range=2, rating=4.2, neighborhood="Westside",
         description="Authentic pad see ew and green papaya salad with real heat. BYO wine and enjoy the no-frills vibe.",
         image_url=_photo("thai,food,noodles")),
    dict(name="Le Petit Bistro", cuisine="French", price_range=4, rating=4.8, neighborhood="Uptown",
         description="Classic French technique — duck confit, soufflé, a wine list curated with actual care.",
         image_url=_photo("french,bistro,fine+dining")),
    dict(name="Seoul Kitchen", cuisine="Korean", price_range=2, rating=4.5, neighborhood="Koreatown",
         description="Table BBQ grills and banchan that keep coming. The galbi short ribs are worth the wait.",
         image_url=_photo("korean,bbq,grill")),
    dict(name="Pho Saigon", cuisine="Vietnamese", price_range=1, rating=4.4, neighborhood="Chinatown",
         description="Ten-hour bone broth, fresh herbs, and enough brisket to share. The best $12 date in the city.",
         image_url=_photo("pho,vietnamese,soup")),
    dict(name="Mezze Mediterranean", cuisine="Mediterranean", price_range=3, rating=4.3, neighborhood="Harbor District",
         description="Sharing plates of hummus, falafel, and grilled halloumi with a view of the water.",
         image_url=_photo("mediterranean,mezze,hummus")),
    dict(name="The Burger Joint", cuisine="American", price_range=1, rating=4.1, neighborhood="Downtown",
         description="Smash burgers on a flattop, house pickles, hand-cut fries. No pretense, just great burgers.",
         image_url=_photo("burger,american,diner")),
    dict(name="Blue Fin Sushi Bar", cuisine="Japanese", price_range=4, rating=4.7, neighborhood="Waterfront",
         description="Chef's tasting omakase with fish flown in weekly. Worth every dollar for a memorable night out.",
         image_url=_photo("omakase,sushi,bar")),
    dict(name="Mama Rosa's", cuisine="Italian", price_range=2, rating=4.2, neighborhood="North End",
         description="Red-sauce classics in a family-run trattoria that's been here 30 years. Loud, warm, full of regulars.",
         image_url=_photo("italian,pizza,trattoria")),
    dict(name="Bombay Palace", cuisine="Indian", price_range=3, rating=4.6, neighborhood="Midtown",
         description="Elevated Indian cuisine — lamb rogan josh, paneer tikka, and a cocktail list that matches the food.",
         image_url=_photo("indian,tandoori,spices")),
    dict(name="Greek House", cuisine="Greek", price_range=2, rating=4.3, neighborhood="Eastgate",
         description="Grilled octopus, spanakopita, and a lamb souvlaki that'll ruin all other souvlaki forever.",
         image_url=_photo("greek,food,seafood")),
    dict(name="Peking Garden", cuisine="Chinese", price_range=2, rating=4.1, neighborhood="Chinatown",
         description="Peking duck carved tableside, mapo tofu with real Sichuan pepper. Order the family meal for two.",
         image_url=_photo("chinese,peking+duck,dumplings")),
    dict(name="Smokehouse BBQ", cuisine="American", price_range=2, rating=4.5, neighborhood="West End",
         description="Low-and-slow brisket, pulled pork, and housemade hot sauce. The banana pudding is the secret star.",
         image_url=_photo("bbq,brisket,smokehouse")),
    dict(name="Chez Marie", cuisine="French", price_range=3, rating=4.4, neighborhood="Arts District",
         description="Neighborhood bistro with a blackboard menu that changes daily. Steak frites is a permanent fixture.",
         image_url=_photo("french,cuisine,steak")),
    dict(name="Pad Thai Palace", cuisine="Thai", price_range=1, rating=4.2, neighborhood="University Ave",
         description="Perfectly balanced pad thai and massaman curry. Tiny space, big flavors, always worth the wait.",
         image_url=_photo("pad+thai,thai,wok")),
    dict(name="The Steakhouse", cuisine="American", price_range=4, rating=4.9, neighborhood="Financial District",
         description="Dry-aged prime cuts, a sommelier on staff, and tableside Caesar. The gold standard for a special dinner.",
         image_url=_photo("steakhouse,filet,fine+dining")),
    dict(name="Hanoi House", cuisine="Vietnamese", price_range=2, rating=4.5, neighborhood="Midtown",
         description="Bun bo Hue and crispy spring rolls that take Vietnamese food beyond pho. Cozy, reservations recommended.",
         image_url=_photo("vietnamese,springrolls,restaurant")),
]


def get_fallback_restaurants(session_id: int) -> list[Restaurant]:
    return [Restaurant(session_id=session_id, fsq_id=None, **d) for d in _DATA]
