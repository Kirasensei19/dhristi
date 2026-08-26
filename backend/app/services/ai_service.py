import json
import os
import urllib.request
import urllib.error
from sqlalchemy.orm import Session
import app.models as models

os.environ.setdefault("OLLAMA_NUM_GPU", "0")

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "phi3"

def generate_chat_response(message: str, db: Session) -> str:
    try:
        hazards = db.query(models.HazardReport).all()
        vehicles = db.query(models.Vehicle).all()
        active_hazards = [h for h in hazards if h.status != "RESOLVED"]
    except Exception as e:
        return f"⚠️ Database error while fetching context: {str(e)}"

    # Build context string for LLM
    context_str = f"SYSTEM CONTEXT:\n- Active Hazards: {len(active_hazards)}\n"
    for h in active_hazards:
        context_str += f"  * Type: {h.hazard_type}, Severity: {h.severity}, Status: {h.status}, Desc: {h.description}\n"

    context_str += f"- Vehicles: {len(vehicles)}\n"
    for v in vehicles:
        context_str += f"  * ID: {v.vehicle_id}, Name: {v.name}, Status: {v.status}\n"

    system_prompt = (
        "You are the D.R.I.S.H.T.I AI Disaster Intelligence Assistant. "
        "Keep answers concise, tactical, and helpful. "
        "Use the provided SYSTEM CONTEXT to answer accurately.\n\n"
        f"{context_str}"
    )

    # Try Ollama
    try:
        data = {
            "model": MODEL_NAME,
            "prompt": message,
            "system": system_prompt,
            "stream": False
        }
        req = urllib.request.Request(
            OLLAMA_URL,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get('response', "Error: Empty response from LLM.")
    except Exception:
        # Ollama not available — use intelligent fallback
        return generate_fallback_response(message, active_hazards, vehicles)


def generate_fallback_response(message: str, hazards: list, vehicles: list) -> str:
    msg_lower = message.lower()

    if any(w in msg_lower for w in ["emergency", "summary", "situation", "overview", "status"]):
        if not hazards:
            return "✅ **All Clear**\n\nNo active hazards in the system. Situation is stable."
        critical = [h for h in hazards if h.severity == 'CRITICAL']
        blocked = [h for h in hazards if h.status == 'BLOCKADE_ACTIVE']
        res = "🚨 **D.R.I.S.H.T.I Emergency Summary**\n\n"
        res += f"- **Total Active Hazards:** {len(hazards)}\n"
        res += f"- **Critical:** {len(critical)}\n"
        res += f"- **Blockades Active:** {len(blocked)}\n\n"
        if blocked:
            res += "**🔴 Active Blockades:**\n"
            for h in blocked:
                res += f"  • {h.hazard_type} — {h.description or 'No description'}\n"
        return res

    elif any(w in msg_lower for w in ["critical", "hazard", "danger", "severe"]):
        critical = [h for h in hazards if h.severity == 'CRITICAL']
        if not critical:
            return f"⚠️ No CRITICAL hazards right now. {len(hazards)} lower-severity hazards are being monitored."
        res = f"🔴 **{len(critical)} Critical Hazard(s):**\n\n"
        for h in critical:
            res += f"• **{h.hazard_type}** — `{h.status}`\n  {h.description or ''}\n\n"
        return res

    elif any(w in msg_lower for w in ["blocked", "blockade", "closed"]):
        blocked = [h for h in hazards if h.status == 'BLOCKADE_ACTIVE']
        if not blocked:
            return "✅ No active road blockades detected."
        res = f"🚧 **{len(blocked)} Active Blockade(s):**\n\n"
        for h in blocked:
            res += f"• **{h.hazard_type}** — {h.description or 'No details'}\n"
        return res

    elif any(w in msg_lower for w in ["vehicle", "truck", "convoy", "fleet"]):
        if not vehicles:
            return "No vehicles registered in the system."
        res = f"🚛 **Fleet — {len(vehicles)} Vehicle(s):**\n\n"
        for v in vehicles[:5]:
            res += f"• **{v.vehicle_id}** ({v.name or 'Unknown'}) — `{v.status}`\n"
        return res

    elif "flood" in msg_lower:
        floods = [h for h in hazards if "FLOOD" in str(h.hazard_type).upper()]
        if not floods:
            return "🌊 No active flash flood incidents."
        res = f"🌊 **Flash Flood Incidents ({len(floods)}):**\n\n"
        for h in floods:
            res += f"• `{h.status}` — {h.description or 'No details'}\n"
        res += "\n**Action:** Evacuate low-lying areas. Alert NDRF teams."
        return res

    elif "landslide" in msg_lower:
        slides = [h for h in hazards if "LANDSLIDE" in str(h.hazard_type).upper()]
        if not slides:
            return "⛰️ No active landslide incidents."
        res = f"⛰️ **Landslide Incidents ({len(slides)}):**\n\n"
        for h in slides:
            res += f"• `{h.status}` — {h.description or 'No details'}\n"
        res += "\n**Action:** Close highway. Deploy geological survey teams."
        return res

    elif "bridge" in msg_lower:
        bridges = [h for h in hazards if "BRIDGE" in str(h.hazard_type).upper()]
        if not bridges:
            return "🌉 No damaged bridge incidents."
        res = f"🌉 **Damaged Bridge Incidents ({len(bridges)}):**\n\n"
        for h in bridges:
            res += f"• `{h.status}` — {h.description or 'No details'}\n"
        res += "\n**Action:** Divert heavy vehicles. Inspect structural integrity."
        return res

    else:
        return (
            "🤖 **D.R.I.S.H.T.I AI — Offline Mode**\n\n"
            "LLM engine not connected. Ask me:\n"
            "- 🚨 Emergency summary\n"
            "- 🔴 Critical hazards\n"
            "- 🚧 Blocked incidents\n"
            "- 🚛 Vehicle status\n"
            "- 🌊 Flash floods / ⛰️ Landslides / 🌉 Bridges"
        )
