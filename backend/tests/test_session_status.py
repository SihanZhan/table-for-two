import pytest

@pytest.mark.asyncio
async def test_session_marks_completed_after_both_participants_finish(client):
    create = await client.post("/sessions", json={"creator_name": "Alex", "location": "Boston"})
    assert create.status_code == 200
    creator = create.json()

    join = await client.post(
        "/sessions/join",
        json={"join_code": creator["join_code"], "name": "Jamie"},
    )
    assert join.status_code == 200
    partner = join.json()

    info = await client.get(f"/sessions/info/{creator['join_code']}")
    assert info.status_code == 200
    assert info.json()["status"] == "active"

    first_finish = await client.post(f"/swipes/finish/{creator['participant_id']}")
    assert first_finish.status_code == 200

    info = await client.get(f"/sessions/info/{creator['join_code']}")
    assert info.status_code == 200
    assert info.json()["status"] == "active"

    second_finish = await client.post(f"/swipes/finish/{partner['id']}")
    assert second_finish.status_code == 200

    info = await client.get(f"/sessions/info/{creator['join_code']}")
    assert info.status_code == 200
    assert info.json()["status"] == "completed"
