from typing import Any
from datetime import datetime
from api.app.services.topic_classifier import _extract_topics


def _topic_display_name(topic: str) -> str:
    return topic.title()


def _compute_streak(attempt_dates: set[str]) -> int:
    streak = 0
    cursor = datetime.utcnow().date()

    while cursor.isoformat() in attempt_dates:
        streak += 1
        cursor = cursor.fromordinal(cursor.toordinal() - 1)

    return streak


def _build_progress_payload(
    user_email: str,
    attempts: list[dict[str, Any]],
    joined_at: datetime | None,
) -> dict[str, Any]:

    subject_attempts = {"physics": [], "math": []}
    all_dates: set[str] = set()
    total_study_minutes = 0

    for attempt in attempts:
        subject = (attempt.get("subject") or "").lower()

        if subject in subject_attempts:
            subject_attempts[subject].append(attempt)

        created_at = attempt.get("created_at")
        if isinstance(created_at, datetime):
            all_dates.add(created_at.date().isoformat())

    def _new_subject_stats():
        return {
            "sessions": 0,
            "questions": 0,
            "studyMinutes": 0,
            "confidence": 0,
            "avgLatency": 0,
            "recentTopics": [],
            "weakAreas": [],
            "strongAreas": [],
            "weeklyActivity": [0] * 7,
            "topicFrequency": {},
        }

    result = {
        "userId": user_email,
        "physics": _new_subject_stats(),
        "math": _new_subject_stats(),
        "overallStreak": 0,
        "totalHours": 0,
        "joinedAt": joined_at.isoformat() if isinstance(joined_at, datetime) else "",
    }

    for subject in ("physics", "math"):
        atts = subject_attempts[subject]
        stats = _new_subject_stats()

        if not atts:
            result[subject] = stats
            continue

        unique_sessions = {a.get("chat_id") for a in atts if a.get("chat_id")}
        stats["sessions"] = len(unique_sessions) if unique_sessions else len(atts)
        stats["questions"] = len(atts)

        confidence_values = [float(a.get("confidence", 0) or 0) for a in atts]
        latency_values = [float(a.get("latency_seconds", 0) or 0) for a in atts]

        stats["confidence"] = round(sum(confidence_values) / len(confidence_values), 3)
        stats["avgLatency"] = round(sum(latency_values) / len(latency_values), 3)

        estimated_minutes = sum(max(2, round(lat / 20) + 1) for lat in latency_values)
        stats["studyMinutes"] = estimated_minutes
        total_study_minutes += estimated_minutes

        topic_counts = {}
        for a in atts:
            for t in _extract_topics(a.get("question", ""), subject, limit=3):
                topic_counts[t] = topic_counts.get(t, 0) + 1

        stats["topicFrequency"] = dict(
            sorted(topic_counts.items(), key=lambda x: -x[1])[:8]
        )

        sorted_atts = sorted(
            atts,
            key=lambda x: x.get("created_at")
            if isinstance(x.get("created_at"), datetime)
            else datetime.min,
            reverse=True,
        )

        seen_recent = []
        for a in sorted_atts:
            for t in _extract_topics(a.get("question", ""), subject, limit=2):
                if t not in seen_recent:
                    seen_recent.append(t)

            if len(seen_recent) >= 6:
                break

        stats["recentTopics"] = [_topic_display_name(t) for t in seen_recent]

        weak_topics = []
        strong_topics = []

        for a in atts:
            c = float(a.get("confidence", 0) or 0)

            for t in _extract_topics(a.get("question", ""), subject, limit=2):
                display = _topic_display_name(t)

                if c < 0.55 and display not in weak_topics:
                    weak_topics.append(display)
                elif c >= 0.75 and display not in strong_topics:
                    strong_topics.append(display)

        stats["weakAreas"] = weak_topics[:5]
        stats["strongAreas"] = strong_topics[:5]

        weekly_counts = [0] * 7
        seven_days_ago = datetime.utcnow().date().toordinal() - 6

        for a in atts:
            ca = a.get("created_at")

            if isinstance(ca, datetime) and ca.date().toordinal() >= seven_days_ago:
                weekly_counts[ca.date().weekday()] += 1

        stats["weeklyActivity"] = weekly_counts

        result[subject] = stats

    result["overallStreak"] = _compute_streak(all_dates)
    result["totalHours"] = round(total_study_minutes / 60.0, 1)

    return result