# Analytical & Intelligence Microservices — SAKSHAM

## Architecture
This directory contains specialized, isolated intelligence microservices:

1. **`risk-engine/`**: Evaluates deterministic scoring rules across the 6 core risk dimensions and computes composite risk indexes.
2. **`fraud-graph/`**: Knowledge graph service performing entity resolution, clique identification, and cartel detection across procurement participants.
3. **`ocr-service/`**: Document analysis pipeline for Measurement Books, contractor invoices, and sanction orders.
4. **`cv-service/`**: Computer vision pipeline detecting image duplicates (`pHash`), EXIF integrity violations, and construction milestone stages.
5. **`llm-service/`**: Natural language synthesis layer producing grounded, citation-backed investigative dossiers for district magistrates.

All services operate asynchronously and degrade gracefully without producing synthetic data when unavailable.
