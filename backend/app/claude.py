import os

import anthropic

_client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


async def generate_match_explanation(restaurant, partner_names: list[str]) -> str:
    names = " and ".join(partner_names)
    dollars = "$" * restaurant.price_range

    prompt = (
        f"You're helping a couple decide where to eat. Both {names} swiped right on "
        f"{restaurant.name}, a {restaurant.cuisine} restaurant in {restaurant.neighborhood} "
        f"({dollars}, {restaurant.rating}/5 stars). "
        f"About the place: {restaurant.description}\n\n"
        f"In 2–3 warm, conversational sentences explain why this is a great pick for their "
        f"date night. Sound like a knowledgeable friend, not a review site."
    )

    message = await _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=150,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text
