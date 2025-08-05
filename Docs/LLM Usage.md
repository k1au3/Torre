🤖 LLM/AI Usage Documentation
This section documents the usage of large language models (LLMs) during development, particularly for diagnosing API-related issues.

🔍 API Error Debugging Prompts
Ask the LLM to debug a 401 Unauthorized error on job-search API
Tool: ChatGPT
Model: GPT-4o
Prompt:
I'm getting a 401 Unauthorized error when making a POST request to my backend /api/job-search which internally calls https://search.torre.co/opportunities/_search. Here's the Axios call from the client, and the Express route on the server. Help me:

Identify why this unauthorized error is happening

Determine if Torre's API requires an API key, token, or some other authentication

Suggest how to handle this in the backend properly

Recommend header or payload modifications if needed

Ask the LLM to clean up job search client/server flow with authentication in mind
Tool: ChatGPT
Model: GPT-4o
Prompt:
My React frontend makes a POST request to /api/job-search via Axios, but the response is a 401 Unauthorized. The server just proxies the request to Torre's public job-search API. Here's my full server-side proxy and the front-end logic.
Please help:

Diagnose if authentication is required

Propose a minimal Express middleware or service abstraction to inject the token

Refactor the code to separate Torre API interaction from Express routes

Make error handling consistent and clean in both layers

Ask the LLM to refactor the entire seeker-side application to resolve errors and improve architecture
Tool: ChatGPT
Model: GPT-4o
Prompt:
Here’s a full-stack application where the seeker-side functionality isn’t working correctly — job search throws a 401, and architecture is messy. Refactor the entire codebase focusing only on the seeker-side flow.

Ensure all API errors (like 401, 400) are properly handled

Provide a service layer for API interactions

Redesign the client to use hooks, clean routing, and good UX

Keep it in Express + React

Fix the 401 Unauthorized issue on the job-search API

These prompts were used during API diagnostics and debugging to guide the architecture, handle external API errors gracefully, and ensure correct Torre integration.

You can find this file in the repo at: docs/LLM_USAGE_README.md