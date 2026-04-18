import re

from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


def _compact(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def _lang_text(lang: str, kk: str, ru: str, en: str) -> str:
    if lang == "ru":
        return ru
    if lang == "en":
        return en
    return kk


def _build_fallback_advice(symptom_codes, text: str, severity: str, start_date: str, lang: str) -> str:
    codes = {str(c).strip().lower() for c in (symptom_codes or []) if str(c).strip()}
    t = (text or "").lower()

    # --- Red flags ---
    red_flags = []
    if any(w in t for w in ["ентігу", "дем жетпе", "удуш", "одыш", "breath", "тұншығ"]):
        red_flags.append(_lang_text(lang,
            "Ентігу / дем жетпеу",
            "Одышка / затруднённое дыхание",
            "Shortness of breath",
        ))
    if any(w in t for w in ["ісі", "отек", "swelling", "квинке", "анаф"]):
        red_flags.append(_lang_text(lang,
            "Бет / ерін / тіл ісінуі (аллергиялық ісіну)",
            "Отёк лица / губ / языка (аллергический отёк)",
            "Face / lip / tongue swelling (allergic reaction)",
        ))
    if any(w in t for w in ["қан", "blood", "кров", "құсық", "рвот", "vomit"]):
        red_flags.append(_lang_text(lang,
            "Қан / қан аралас құсу",
            "Кровь / рвота с кровью",
            "Blood / vomiting blood",
        ))

    # --- Possible causes (non-diagnostic) ---
    possible = []
    if "allergy" in codes or "аллерг" in t:
        possible.append(_lang_text(lang,
            "Аллергиялық реакция (шаң, тағам, дәрі, жануар жүні)",
            "Аллергическая реакция (пыль, еда, лекарства, шерсть)",
            "Allergic reaction (dust, food, meds, pets)",
        ))
    if any(c in codes for c in ["runny_nose", "cough", "sore_throat", "fever"]):
        possible.append(_lang_text(lang,
            "Вирустық жұқпа / суық тию (диагноз емес)",
            "Вирусная инфекция / простуда (не диагноз)",
            "Viral infection / common cold (not a diagnosis)",
        ))
    if "abdominal_pain" in codes or "живот" in t or "іш ауру" in t:
        possible.append(_lang_text(lang,
            "Асқазан-ішек тітіркенуі / улану (диагноз емес)",
            "Раздражение ЖКТ / отравление (не диагноз)",
            "GI irritation / food poisoning (not a diagnosis)",
        ))

    # --- Home care ---
    care = []
    if "fever" in codes or "температур" in t or "қызу" in t:
        care.append(_lang_text(lang,
            "Сұйықтықты көп ішіңіз, демалыңыз. Температура жоғары болса — парацетамол / ибупрофен нұсқаулық бойынша (қарсы көрсетілім болмаса).",
            "Пейте больше жидкости, отдыхайте. При высокой температуре — парацетамол / ибупрофен по инструкции (если нет противопоказаний).",
            "Drink fluids, rest. For high fever: paracetamol / ibuprofen per label if safe for you.",
        ))
    if "sore_throat" in codes:
        care.append(_lang_text(lang,
            "Жылы сусын, тұзды сумен шайқау, ауа ылғалын көтеру көмектесуі мүмкін.",
            "Тёплое питьё, полоскание солёной водой, увлажнение воздуха могут помочь.",
            "Warm fluids, salt-water gargle, humidifier may help.",
        ))
    if "allergy" in codes:
        care.append(_lang_text(lang,
            "Аллергенді тоқтатыңыз / алыстаңыз (жаңа тағам / дәрі / мысық / шаң). Қышу / бөртпе болса — антигистамин нұсқаулық бойынша.",
            "Устраните возможный аллерген (новая еда / лекарство / животные / пыль). При зуде / сыпи — антигистамин по инструкции.",
            "Avoid the trigger (new food / med / pets / dust). For itch / rash: OTC antihistamine per label if appropriate.",
        ))

    if not care:
        care.append(_lang_text(lang,
            "Демалыңыз, сұйықтық ішіңіз, симптомдарды бақылаңыз. Жағдай нашарласа — дәрігерге көрініңіз.",
            "Отдыхайте, пейте жидкость, наблюдайте симптомы. При ухудшении — обратитесь к врачу.",
            "Rest, hydrate, monitor symptoms. If worsening, contact a clinician.",
        ))

    # --- Urgent signs (defaults if no red flags detected) ---
    red = red_flags or [
        _lang_text(lang, "Ентігу, кеуде ауыруы", "Одышка, боль в груди", "Shortness of breath, chest pain"),
        _lang_text(lang, "Есі жоғалту / шатасу", "Потеря сознания / спутанность", "Fainting / confusion"),
        _lang_text(lang, "Бет / тіл ісінуі, тұншығу", "Отёк лица / языка, удушье", "Face / tongue swelling, choking"),
    ]

    urgent_label = _lang_text(lang,
        "Шұғыл дәрігерге / 103 қоңырау шалу қажет болатын жағдайлар:",
        "Когда нужна срочная помощь / скорая (103):",
        "Seek urgent care / call emergency if:",
    )

    header = _lang_text(lang,
        "ИИ кеңесі (тегін режим) — бұл диагноз емес.",
        "Совет ИИ (бесплатный режим) — это не диагноз.",
        "AI Advice (free mode) — not a diagnosis.",
    )

    parts = [header]

    if possible:
        parts.append(_lang_text(lang, "\nМүмкін себептер:", "\nВозможные причины:", "\nPossible causes:"))
        parts.extend(f"- {p}" for p in possible[:3])

    parts.append(_lang_text(lang, "\nНе істеуге болады:", "\nЧто можно сделать:", "\nWhat you can do:"))
    parts.extend(f"- {c}" for c in care[:4])

    parts.append(f"\n{urgent_label}")
    parts.extend(f"- {r}" for r in red[:5])

    if start_date:
        parts.append(_lang_text(lang,
            f"\nБасталу күні: {start_date}",
            f"\nДата начала: {start_date}",
            f"\nStart date: {start_date}",
        ))
    if severity:
        parts.append(_lang_text(lang,
            f"Ауырлық деңгейі: {severity}",
            f"Тяжесть: {severity}",
            f"Severity: {severity}",
        ))

    return "\n".join(parts).strip()


@api_view(["POST"])
@permission_classes([AllowAny])
def ai_symptom_advice(request):
    """
    Returns safe, non-diagnostic guidance for symptoms.
    Expects: symptomCodes (list), text (str), severity (str), startDate (str), lang (kk|ru|en)
    """
    api_key = getattr(settings, "OPENAI_API_KEY", "") or ""
    data = request.data or {}

    symptom_codes = data.get("symptomCodes") or data.get("codes") or []
    text = _compact(str(data.get("text") or ""))
    severity = _compact(str(data.get("severity") or ""))
    start_date = _compact(str(data.get("startDate") or ""))
    lang = (data.get("lang") or "kk").strip().lower()
    if lang not in ("kk", "ru", "en"):
        lang = "kk"

    # Hard safety: no input → no response
    if not symptom_codes and not text:
        return Response({"advice": ""})

    # Free fallback if no API key
    if not api_key:
        return Response(
            {"advice": _build_fallback_advice(symptom_codes, text, severity, start_date, lang), "mode": "fallback"},
            status=200,
        )

    try:
        from openai import OpenAI  # type: ignore
    except ImportError:
        return Response(
            {"advice": _build_fallback_advice(symptom_codes, text, severity, start_date, lang), "mode": "fallback"},
            status=200,
        )

    client = OpenAI(api_key=api_key)

    system = (
        "You are a careful medical triage assistant. "
        "You must NOT give a diagnosis, must not prescribe controlled drugs, "
        "and must recommend professional care when red flags are present. "
        "Keep it practical and short."
    )

    user_prompt = f"""
Language: {lang}
Selected symptom codes: {symptom_codes}
User free-text: {text}
Severity: {severity}
Start date: {start_date}

Task:
- Provide short, safe guidance for next steps.
- Include: (1) possible common causes (not a diagnosis), (2) home care tips, (3) red flags — when to see a doctor urgently.
- Output plain text with clear bullet points.
"""

    try:
        resp = client.chat.completions.create(
            model=getattr(settings, "OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=450,
        )
        advice = resp.choices[0].message.content or ""
    except Exception as e:
        # Log the error and fall back gracefully
        import logging
        logging.getLogger(__name__).error("OpenAI API error: %s", e)
        advice = _build_fallback_advice(symptom_codes, text, severity, start_date, lang)
        return Response({"advice": advice, "mode": "fallback"}, status=200)

    return Response({"advice": advice, "mode": "openai"})