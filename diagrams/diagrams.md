# App Flow Diagrams

## 1. Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant App as Next.js App
    participant Auth as /api/auth/[...all]
    participant MS as Microsoft OAuth
    participant DB as PostgreSQL

    User->>App: Visit /
    App->>App: getSession()
    alt No session
        App-->>User: Show Hero page
        User->>App: Click "Sign In"
        App->>MS: Redirect to login.microsoftonline.com
        MS-->>User: Login prompt
        User->>MS: Credentials
        MS->>Auth: OAuth callback
        Auth->>DB: Upsert user, session, account
        Auth-->>App: Redirect to /
    else Has session
        App-->>User: Show Archive
    end
```

---

## 2. Incident Wizard Flow

```mermaid
flowchart TD
    HOME["Home / Archive"] --> FAB[Click + Button]
    FAB --> FETCH["/new - Load topics, persons, departments, reasons, presets"]
    FETCH --> S0

    S0["Step 0: Incident Details<br/>Date/Time, Department, Reason<br/>Topics + create new<br/>Preset templates"]

    S0 -->|Validate & Next| S1

    S1["Step 1: Participants<br/>Graph API teachers + DB persons<br/>Add temporary or permanent person<br/>Min 1 required"]

    S1 -->|Next| S2

    S2["Step 2: Summary<br/>Review all data<br/>Instructor signature required"]

    S2 -->|Instructor signed| S3

    S3["Step 3: Participant Signatures<br/>Sequential signing per person<br/>Progress bar, jump to participant<br/>Warning if incomplete"]

    S3 -->|Save incident transaction| DB[(PostgreSQL)]
    DB --> S4

    S4["Step 4: Done<br/>Download PDF, Email, Share<br/>Return home"]

    S4 --> HOME
```

---

## 3. Data & API Flow

```mermaid
flowchart LR
    subgraph Client
        WIZ[Wizard Context]
        COMP[Components]
    end

    subgraph Actions[Server Actions]
        CI[createIncident]
        CT[createTopic]
        CAP[createAdditionalPerson]
    end

    subgraph Routes[API Routes]
        PDF["GET /api/pdf"]
        OAUTH["/api/auth"]
    end

    subgraph External
        MS_GRAPH[Microsoft Graph API]
        MS_AUTH[Microsoft OAuth]
    end

    subgraph DB[PostgreSQL]
        INC[incident]
        SIG[signature]
        TOP[topic]
        DEP[department]
        REAS[incident_reason]
        PERS[additional_person]
        PRESET[topic_selection]
    end

    COMP -->|reads| WIZ
    WIZ -->|submit| CI
    CI -->|transaction| INC
    CI -->|transaction| SIG
    CT --> TOP
    CAP --> PERS

    COMP -->|GET incidentId| PDF
    PDF --> INC
    PDF --> SIG

    OAUTH --> MS_AUTH
    MS_GRAPH -->|getTeachers cached| COMP

    DEP -->|initial data| WIZ
    REAS -->|initial data| WIZ
    TOP -->|initial data| WIZ
    PRESET -->|initial data| WIZ
    PERS -->|initial data| WIZ
```

---

## 4. PDF Generation Flow

```mermaid
sequenceDiagram
    participant UI as PDFDownloadButton
    participant API as GET /api/pdf
    participant DB as PostgreSQL
    participant PDFGEN as pdfgen.ts

    UI->>API: GET /api/pdf?incidentId=xxx
    API->>API: getSession() - auth guard
    API->>DB: getIncidentById(id)
    DB-->>API: incident + topics + signatures
    API->>PDFGEN: generatePDF(incident)
    PDFGEN->>PDFGEN: Page 1 - details, reason, department, instructor sig
    PDFGEN->>PDFGEN: Page 2 - participant table with signatures
    PDFGEN-->>API: PDF bytes
    API-->>UI: Content-Disposition attachment, unterweisung-xxx.pdf
    UI->>UI: Trigger browser download
```

---

## 5. Participant Management Flow

```mermaid
flowchart TD
    S1[Step 1: Participants]

    S1 --> LOAD[Load persons]
    LOAD --> GRAPH["Microsoft Graph API<br/>getTeachers - cached"]
    LOAD --> DBPERS["DB additional_person<br/>getAdditionalPersons"]
    GRAPH & DBPERS --> LIST["Combined persons list<br/>with checkboxes"]

    LIST -->|Select checkbox| CTX["Update wizard context<br/>selectedPersonIds"]

    LIST --> ADD[Add Person button]
    ADD --> DIALOG[AddPersonDialog]
    DIALOG --> TEMP["Temporary<br/>In-memory only, not saved"]
    DIALOG --> PERM["Permanent<br/>createAdditionalPerson - saved to DB"]

    TEMP --> LIST
    PERM --> LIST
```

---

## 6. Home Page Routing

```mermaid
flowchart TD
    VISIT["Visit /"]
    VISIT --> CHECK{"Session?"}
    CHECK -->|No| HERO[Hero page - Sign In button]
    CHECK -->|Yes| ARCHIVE[Archive - Grid of past incidents]

    ARCHIVE --> CARD[Click incident card]
    CARD --> PDF_DL[Download PDF]

    ARCHIVE --> FAB[Click + FAB]
    FAB --> NEW["/new - Start wizard"]

    HERO --> SIGNIN[Sign In with Microsoft]
    SIGNIN --> OAUTH[OAuth flow - session created]
    OAUTH --> ARCHIVE
```
