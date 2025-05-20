from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService, Session
from google.genai import types


from google.adk.tools import google_search
from config import settings


# Initialize main Travela agent
root_agent = Agent(
    name="travela_agent",
    model=settings.gemini_model,
    description="A travel assistant agent that can answer your travel questions.",
    instruction="""
    You are Travela, an AI travel assistant who can answer questions about travel destinations, provide travel tips, and help users plan their trips.
    """,
    tools=[google_search],
)

session_service = InMemorySessionService()

runner = Runner(
    app_name=settings.app_name,
    agent=root_agent,
    session_service=session_service,
)

def _get_or_create_session(user_id: str, session_id: str) -> Session:
    """Get or Create chat session"""
    session = session_service.get_session(
        app_name=settings.app_name, user_id=user_id, session_id=session_id
    )
    if session is None:
        session = session_service.create_session(
            app_name=settings.app_name, user_id=user_id, session_id=session_id
        )
    return session
    

def get_agent_response(user_id: str, user_query: str, session_id: str) -> str:
    """
    Run the Travela agent on the given prompt and return the response text.
    """
    session = session_service.get_session(
        app_name=settings.app_name, user_id=user_id, session_id=session_id
    )
    if session is None:
        session = session_service.create_session(
            app_name=settings.app_name, user_id=user_id, session_id=session_id
        )
    user_content = types.Content(role="user", parts=[types.Part(text=user_query)])
    final_response_content = "..."
    for event in runner.run(
        user_id=session.user_id, session_id=session.id, new_message=user_content
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_response_content = event.content.parts[0].text
    return final_response_content
