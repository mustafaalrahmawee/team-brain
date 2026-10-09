# TeamBrain – App Idea

As of: October 9, 2026

TeamBrain answers employees' questions from their company's documents, always with sources, and says honestly when the answer is not in the documents.

## Problem & Target Audience

Knowledge in small and medium-sized companies is buried in scattered PDFs, handbooks and wikis, so new employees keep asking the same colleagues.

Demo scenario: a fictional agency with about 20 employees. Typical questions: "How do I request vacation?", "How many home-office days do I get?", "How do I deploy project X?"

- **Target audience:** teams of 10 to 200 people without a dedicated knowledge-management department
- **Value for employees:** fast, verifiable answers instead of searching and asking around
- **Value for the company:** visibility into which questions come up often and which documents are missing

## Roles

Three roles are enough; permissions are attached to collections, not to individual documents.

| Role | Can | Cannot |
| --- | --- | --- |
| Employee | Ask questions, see own chats, give feedback | Upload documents, see collections they are not a member of |
| Collection admin | Upload, replace and delete documents in own collections; manage members | Manage other collections |
| Admin | Everything; insights, costs, evals, prompt versions | – |

## Domain Model

The core of the domain is the chain Collection → Document → Chunk; every answer points via MessageSource to the chunks it came from.

| Entity | Meaning | Key fields | Relationships |
| --- | --- | --- | --- |
| User | Person with a login | name, email, role | belongs to many collections; has many conversations |
| Collection | Knowledge area, e.g. "HR", "Engineering" | name, description | has many documents and members |
| Document | Uploaded file | title, mime_type, status (`processing`, `ready`, `failed`), uploaded_by | belongs to a collection; has many chunks |
| Chunk | Text section of a document | content, page, position, embedding (vector) | belongs to a document |
| Conversation | A chat | title, user_id | has many messages |
| Message | Question or answer | role, content, model, input_tokens, output_tokens | belongs to a conversation; has many sources |
| MessageSource | Source of an answer | message_id, chunk_id, cited_text | links message and chunk |
| Feedback | Rating of an answer | rating (up/down), comment | belongs to a message |
| PromptVersion | Stored system prompt | name, content, is_active | used by eval runs |
| EvalCase | Test question with expectation | question, expected_answer, expected_document_id | belongs to an eval set |
| EvalRun / EvalResult | A test run and its results | model, prompt_version_id, score, passed | an eval run has many eval results |

## Use Cases

Twelve use cases, ordered by stage; after stage 3 (UC-01 to UC-06) the app is already presentable.

| ID | Actor | Use case | Outcome | Stage |
| --- | --- | --- | --- | --- |
| UC-01 | All | Register, log in, log out | Bearer token; logout revokes it | 1 |
| UC-02 | Employee | Start a chat and talk freely with Claude | Streamed answer, history saved | 1 |
| UC-03 | Collection admin | Upload a document | Status changes live from "processing" to "ready" | 2 |
| UC-04 | Collection admin | Replace or delete a document | Old chunks are removed | 2 |
| UC-05 | Employee | Ask a question about company documents | Answer with clickable sources (document, page) | 3 |
| UC-06 | Employee | Ask a question whose answer is not in the documents | Honest "not found" answer; question is recorded as a knowledge gap | 3 |
| UC-07 | Employee | See only content they are authorized for | Search is filtered by the user's collections | 4 |
| UC-08 | Admin | Manage members of a collection | Access takes effect immediately | 4 |
| UC-09 | Employee | Ask a complex question that needs several searches | Claude calls the search tool multiple times; steps visible in the UI | 5 |
| UC-10 | Employee | Rate an answer | Feedback saved and included in insights | 6 |
| UC-11 | Admin | Start an eval run with a prompt version and model | Score per test question, comparison with earlier runs | 6 |
| UC-12 | Admin | View insights | Frequent questions, knowledge gaps, negative feedback, token costs | 7 |

## Core Flow: Asking a Question

UC-05 is the most important flow; RAG, permissions, streaming and sources all depend on it.

1. The employee types the question in the Vue chat; the SPA sends it via `fetch` with the bearer token to `POST /api/v1/conversations/{id}/messages`.
2. Laravel checks the token and policy and stores the question as a message.
3. Laravel creates an embedding of the question.
4. pgvector finds the most similar chunks, filtered to the user's collections.
5. The top hits are sent to Claude as documents, together with the system prompt (answer only from the sources, cite them).
6. Claude streams the answer; Laravel passes the tokens on to the SPA.
7. When the stream ends, Laravel stores the answer, token usage and message sources.
8. The SPA shows the sources as clickable chips (document, page).

If the search finds nothing relevant, Claude explicitly answers "not found in the documents", and the question is flagged as a knowledge gap (UC-06). From stage 5 on, Claude decides via a search tool when and how often to search.

## Coverage of Claude Topics

Not every topic has to be covered; the table shows where each one naturally appears in the project.

| Topic | Where in TeamBrain | Use case |
| --- | --- | --- |
| RAG | Ingestion, vector search, answers with sources | UC-03, UC-05 |
| Model capabilities | Streaming, citations, model choice Haiku/Sonnet/Opus, effort low to high | UC-02, UC-05 |
| Prompting | System prompt against hallucinations, prompt versions | UC-06, UC-11 |
| Context management | Only relevant chunks, summarizing long chats, prompt caching | UC-05 |
| Tools | Search tool `search_knowledge_base` (agentic RAG) | UC-09 |
| Tool infrastructure | Registry, validation and logging of tool calls | UC-09 |
| Agent workflow | Multi-step search with visible steps | UC-09 |
| Working with files | Upload, text extraction, Files API | UC-03 |
| Eval | Test questions, GLM 5.3 as independent judge, comparison of runs | UC-11 |
| MCP | Optional: external knowledge source or TeamBrain itself as an MCP server | Extension |
| Skills | Optional: e.g. answer as a formatted checklist | Extension |

## Out of Scope

TeamBrain stays a focused portfolio project; these points are deliberately not part of the scope.

- No real multi-tenancy (multiple companies); one company per installation
- No collaborative document editing; TeamBrain only reads
- No automatic sync with Google Drive, Notion or Confluence (at most later via MCP)
- No legal or HR advice; answers only reflect what is in the documents
- No mobile app; the SPA is responsive
