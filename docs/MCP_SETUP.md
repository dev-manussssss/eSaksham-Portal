# Model Context Protocol (MCP) Setup & Extensibility — SAKSHAM

## 1. Purpose

The Model Context Protocol (MCP) configuration establishes standardized, secure tool interfaces that permit autonomous agents and investigative assistants to query SAKSHAM's intelligence graph, search case dossiers, and inspect risk metrics under rigorous policy controls.

---

## 2. MCP Server Configuration

SAKSHAM exposes an internal MCP server (`saksham-mcp`) providing read-only analytical tool endpoints for authorized LLM assistants:

```json
{
  "mcpServers": {
    "saksham-intelligence": {
      "command": "python",
      "args": ["-m", "services.mcp_server"],
      "env": {
        "SAKSHAM_MODE": "READ_ONLY_AUDIT",
        "DATABASE_URL": "postgresql://saksham_reader@postgres:5432/saksham"
      }
    }
  }
}
```

---

## 3. Registered Tool Interfaces

1. `get_project_risk_dossier(project_id: str)`: Returns all computed risk signals, evidence links, and milestone timeline for a given project.
2. `search_vendor_cartels(vendor_id: str)`: Queries the Fraud Graph and returns connected vendor nodes sharing DIN, phone, or bank hashes.
3. `verify_image_hash(image_sha256: str)`: Checks image database for duplicate submissions across other constituency works.
4. `get_investigation_status(case_id: str)`: Retrieves officer activity logs and status of an active inquiry.

> **CRITICAL RESTRICTION**: MCP tools are strictly read-only. No generative model can invoke state-mutating actions (such as closing a case, modifying scores, or approving payments) through MCP.
