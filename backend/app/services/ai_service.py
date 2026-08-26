import json
import urllib.request
import urllib.error
from sqlalchemy.orm import Session
import app.models as models

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3" # You can change this to "mistral" or whatever Ollama model is installed

def generate_chat_response(message: str, db: Session) -> str:
    # 1. Gather context
    hazards = db.query(models.HazardReport).all()
    vehicles = db.query(models.Vehicle).all()
    
    active_hazards = [h for h in hazards if h.status != "RESOLVED"]
    
    context_str = f"SYSTEM CONTEXT:\n- Active Hazards: {len(active_hazards)}\n"
    for h in active_hazards:
        context_str += f"  * Type: {h.hazard_type}, Severity: {h.severity}, Status: {h.status}, Desc: {h.description}\n"
    
    context_str += f"- Active Vehicles: {len(vehicles)}\n"
    for v in vehicles:
        context_str += f"  * ID: {v.id}, Status: {v.status}, Fuel: {v.fuel_level}%\n"

    system_prompt = (
        "You are the D.R.I.S.H.T.I AI Disaster Intelligence Assistant. "
        "Keep your answers concise, tactical, and helpful. "
        "Use the provided SYSTEM CONTEXT to answer the user's question accurately. "
        "If the user asks about hazards or vehicles, refer to the data below. "
        "Do not invent data outside the context unless it's general advice.\n\n"
        f"{context_str}"
    )
    
    # 2. Try calling Ollama LLM
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
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get('response', "Error: Empty response from LLM.")
            
    except Exception as e:
        # 3. Fallback intelligence if Ollama is not running/installed
        return generate_fallback_response(message, active_hazards, vehicles)

def generate_fallback_response(message: str, hazards: list, vehicles: list) -> str:
    msg_lower = message.lower()
    
    if "hazard" in msg_lower or "critical" in msg_lower or "emergency" in msg_lower:
        if not hazards:
            return "There are currently no active hazards in the system. The area is secure."
        
        critical_count = len([h for h in hazards if h.severity == 'CRITICAL'])
        res = f"🚨 **Emergency Summary**\n\nThere are currently **{len(hazards)}** active hazards, including **{critical_count} CRITICAL** incidents.\n\n"
        
        for h in hazards[:3]:
            res += f"- **{h.hazard_type}** ({h.severity}): {h.description or 'No description'}\n"
            
        res += "\n*(Note: This is a fallback response. Install and run Ollama with a model to enable dynamic AI responses.)*"
        return res
        
    elif "vehicle" in msg_lower or "truck" in msg_lower:
        active = len([v for v in vehicles if v.status == 'ACTIVE'])
        res = f"🚛 **Vehicle Status**\n\nWe have **{len(vehicles)}** registered vehicles, with **{active}** currently active.\n\n"
        for v in vehicles[:3]:
            res += f"- **{v.id}**: {v.status} (Fuel: {v.fuel_level}%)\n"
        return res
        
    else:
        return (
            "I am the D.R.I.S.H.T.I Assistant.\n\n"
            "Currently, my AI engine (Ollama) is not reachable, so I am running in **Offline Fallback Mode**.\n\n"
            "You can ask me about:\n"
            "- 'Active hazards'\n"
            "- 'Critical emergencies'\n"
            "- 'Vehicle status'"
        )
