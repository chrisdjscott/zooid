---
'@zooid/acp-client': minor
'@zooid/transport-matrix': minor
---

Pass the Matrix sender to the agent with each prompt. A turn started by a message now sends `_meta: { zooid: { sender: "<mxid>" } }` on `session/prompt`, so an agent can keep per-person state. Handoff returns and task completions carry no sender. `PromptInput` gains an optional `meta`, sent as the ACP `_meta`.
