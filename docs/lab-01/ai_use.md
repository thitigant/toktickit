# Lab 1 — AI Use and Reflection  

**LLM/agent used:** Gemini (via Antigravity IDE)

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | Asked the agent to get all Pull Request links, listed individually | Used the links to check the status of each PR |
| 2 | Asked the agent to test whether the system showed Online or Offline | Used the test result to check if the backend could connect to the database |
| 3 | Told the agent Docker was installed but Docker Desktop wasn't open yet, and asked it to set up a PostgreSQL container, run migrations, and seed data | Opened Docker Desktop as instructed, then had the agent run `docker run`, `prisma migrate dev`, and `prisma seed` until the system showed Online with 4 categories |
| 4 | Asked the agent to update the UI in App.tsx to match a design I sent | Checked the page at localhost:5173 after the edit and ran the 3 automated tests to confirm they passed |
| 5 | Asked to see what the UI looked like in the Offline state | Used the mockup as a reference before asking the agent to update the real code to match |
| 6 | Asked the agent to update the Offline-state UI to a red error box matching the reference image, and update the test file accordingly | Checked the result on the site and reran the tests until they passed (green) |
| 7 | Asked whether Docker needed to be stopped to test the Offline state | Followed the two methods the agent gave (stop the database container, or stop the backend server) to simulate Offline |
| 8 | Asked to confirm that starting Docker again would bring the system back Online | Started the container again and clicked "Check System" to confirm it returned to Online |

## Reflection
My prompts worked best when I gave the agent clear context about the current state of the system (e.g. "Docker is installed but not open yet") — this let it skip clarifying questions and jump straight to running the right commands. The part I had to double-check and correct was the Offline-state UI: I had to compare the agent's output against my reference image across a few iterations before the error message and styling actually matched what I wanted.
