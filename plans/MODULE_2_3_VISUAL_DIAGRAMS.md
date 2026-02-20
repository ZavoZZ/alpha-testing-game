# 🎨 MODULE 2.3: VISUAL ARCHITECTURE DIAGRAMS

**Project:** PROJECT OMEGA - PBBG Economy Simulator  
**Module:** 2.3 - Visual System Architecture  
**Date:** 2026-02-14

---

## 📊 SYSTEM OVERVIEW

### Complete Economic Flow

```mermaid
graph TB
    subgraph "PLAYERS"
        P1[Player 1]
        P2[Player 2]
        P3[Player N]
    end
    
    subgraph "COMPANIES"
        C1[Food Company]
        C2[News Company]
        C3[Production Co]
    end
    
    subgraph "MARKETPLACE"
        M[Global Market]
    end
    
    subgraph "GOVERNMENT"
        T[Treasury]
        G[Tax Collector]
    end
    
    subgraph "GAME SYSTEMS"
        W[Work System]
        I[Inventory System]
        ME[Metabolism Engine]
        GC[GameClock]
    end
    
    P1 -->|Works at| C1
    C1 -->|Pays Salary| P1
    C1 -->|Gives Items| P1
    
    P1 -->|Stores Items| I
    I -->|Consumes| ME
    ME -->|Restores Energy| P1
    
    C1 -->|Lists Items| M
    P2 -->|Buys Items| M
    M -->|Transfers Items| P2
    M -->|Collects VAT| T
    
    W -->|Withholds Tax| G
    G -->|Deposits| T
    
    GC -->|Hourly Tick| P1
    GC -->|Decay Energy| P1
    GC -->|Cleanup Expired| M
```

---

## 🏗️ DATABASE ARCHITECTURE

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Inventory : owns
    User ||--o{ ConsumptionHistory : consumes
    User ||--o{ Ledger : participates
    User }o--|| Company : works_at
    
    Company ||--o{ Inventory : owns
    Company ||--o{ MarketplaceListing : sells
    Company ||--o{ User : employs
    
    ItemPrototype ||--o{ Inventory : defines
    ItemPrototype ||--o{ MarketplaceListing : describes
    
    Inventory ||--o| MarketplaceListing : listed_as
    
    Treasury ||--o{ Ledger : receives_tax
    
    User {
        ObjectId _id PK
        String username
        String email
        Decimal128 balance_euro
        Decimal128 balance_gold
        Number energy
        Number happiness
        ObjectId current_company_id FK
        Date work_cooldown_until
        Boolean is_frozen_for_fraud
    }
    
    Company {
        ObjectId _id PK
        String name
        Decimal128 funds_euro
        Decimal128 wage_offer
        Number employee_count
        Number max_employees
        ObjectId owner_id FK
    }
    
    ItemPrototype {
        ObjectId _id PK
        String item_code UK
        String name
        String category
        String rarity
        Object base_effects
        Decimal128 base_price_euro
        Boolean is_tradeable
        Boolean is_consumable
        Number consumption_cooldown_seconds
    }
    
    Inventory {
        ObjectId _id PK
        ObjectId owner_id FK
        String owner_type
        String item_code FK
        Number quality
        Decimal128 quantity
        Boolean is_listed
        Decimal128 listing_price_euro
        Date acquired_at
        Date expires_at
    }
    
    MarketplaceListing {
        ObjectId _id PK
        ObjectId seller_id FK
        String seller_type
        ObjectId inventory_id FK
        String item_code
        Number quality
        Decimal128 quantity
        Decimal128 price_per_unit_euro
        Date listed_at
        Date expires_at
    }
    
    ConsumptionHistory {
        ObjectId _id PK
        ObjectId user_id FK
        String item_code
        Number quality
        Decimal128 quantity_consumed
        Object effects_applied
        Object state_before
        Object state_after
        Date consumed_at
    }
    
    Treasury {
        ObjectId _id PK
        Decimal128 collected_work_tax_euro
        Decimal128 collected_market_tax_euro
        Decimal128 collected_transfer_tax_euro
        Decimal128 total_collected
        Boolean singleton
    }
    
    Ledger {
        ObjectId _id PK
        String type
        ObjectId from_user FK
        ObjectId to_user FK
        Decimal128 amount_euro
        Decimal128 tax_euro
        Decimal128 net_amount_euro
        String description
        Object metadata
        Date created_at
    }
```

---

## 🔄 TRANSACTION FLOWS

### Marketplace Purchase Flow

```mermaid
sequenceDiagram
    participant Player
    participant API
    participant DB
    participant EconomyEngine
    participant Treasury
    participant Seller
    
    Player->>API: POST /marketplace/purchase
    API->>DB: Start Transaction
    
    API->>DB: Validate Listing
    DB-->>API: Listing Found
    
    API->>DB: Check Player Balance
    DB-->>API: Balance OK
    
    API->>EconomyEngine: Calculate Costs
    EconomyEngine-->>API: Total: €1.10 (€1.00 + €0.10 VAT)
    
    API->>DB: Deduct from Player
    Note over DB: Player: €100 → €98.90
    
    API->>DB: Add to Seller
    Note over DB: Seller: €50 → €51.00
    
    API->>Treasury: Collect VAT
    Note over Treasury: Treasury: +€0.10
    
    API->>DB: Transfer Inventory
    Note over DB: Owner: Seller → Player
    
    API->>DB: Update/Delete Listing
    
    API->>DB: Create Ledger Entries
    Note over DB: 3 entries: Purchase, VAT, Transfer
    
    API->>DB: Commit Transaction
    DB-->>API: Success
    
    API-->>Player: Purchase Complete
```

### Consumption Flow

```mermaid
sequenceDiagram
    participant Player
    participant API
    participant DB
    participant ItemPrototype
    participant Inventory
    
    Player->>API: POST /consume
    API->>DB: Check Cooldown
    DB-->>API: Cooldown OK
    
    API->>Inventory: Find Item
    Inventory-->>API: Item Found (Q3 Bread)
    
    API->>ItemPrototype: Get Base Effects
    ItemPrototype-->>API: Energy: +5
    
    API->>API: Calculate Quality Multiplier
    Note over API: Q3 = 3.5x → +18 Energy
    
    API->>DB: Start Transaction
    
    API->>DB: Reduce Inventory
    Note over DB: Quantity: 5 → 4
    
    API->>DB: Update Player Stats
    Note over DB: Energy: 65 → 83 (capped at 100)
    
    API->>DB: Set Cooldown
    Note over DB: Cooldown: 5 minutes
    
    API->>DB: Create History Entry
    
    API->>DB: Commit Transaction
    DB-->>API: Success
    
    API-->>Player: Consumption Complete
```

### Work + Item Reward Flow

```mermaid
sequenceDiagram
    participant Player
    participant API
    participant WorkService
    participant Company
    participant Treasury
    participant Inventory
    
    Player->>API: POST /work
    API->>WorkService: Process Work
    
    WorkService->>Company: Check Funds
    Company-->>WorkService: Funds OK
    
    WorkService->>WorkService: Calculate Salary
    Note over WorkService: Gross: €10.00<br/>Tax: €1.50<br/>Net: €8.50
    
    WorkService->>Company: Deduct Salary
    Note over Company: Funds: €100 → €90
    
    WorkService->>Player: Add Net Salary
    Note over Player: Balance: €0 → €8.50
    
    WorkService->>Treasury: Collect Tax
    Note over Treasury: +€1.50
    
    WorkService->>Inventory: Grant Bonus Items
    Note over Inventory: +1 Q1 Bread
    
    WorkService->>Player: Deduct Energy
    Note over Player: Energy: 100 → 90
    
    WorkService->>Player: Set Cooldown
    Note over Player: Cooldown: 24 hours
    
    WorkService-->>API: Work Complete
    API-->>Player: Success + Items
```

---

## 🎮 USER JOURNEY FLOWS

### New Player Journey

```mermaid
graph TD
    A[New Player Joins] -->|Initial State| B[Energy: 100<br/>Balance: €0<br/>Inventory: Empty]
    B --> C[Works at Company]
    C --> D[Receives €8.50 + 1 Q1 Bread]
    D --> E[Energy: 90/100]
    E --> F{Wait 24h}
    F -->|Time Passes| G[Energy Decays to 65]
    G --> H[Eats Q1 Bread]
    H --> I[Energy: 70/100]
    I --> J[Works Again]
    J --> K[Receives €8.50 + 1 Q1 Bread]
    K --> L{Has €17.00}
    L --> M[Buys 2 Q1 Bread from Market]
    M --> N[Spends €2.20]
    N --> O[Balance: €14.80<br/>Inventory: 3 Breads]
    O --> P[Sustainable Loop Established]
    
    style A fill:#e1f5ff
    style P fill:#d4edda
```

### Daily Player Loop

```mermaid
graph LR
    A[Morning: Energy 65] --> B[Eat Bread +5]
    B --> C[Energy 70]
    C --> D[Work -10]
    D --> E[Earn €8.50 + Bread]
    E --> F[Energy 60]
    F --> G[Evening: Decay -5]
    G --> H[Energy 55]
    H --> I[Eat Bread +5]
    I --> J[Energy 60]
    J --> K[Night: Decay -10]
    K --> A
    
    style A fill:#fff3cd
    style E fill:#d4edda
```

---

## 🏪 MARKETPLACE ARCHITECTURE

### Listing Lifecycle

```mermaid
stateDiagram-v2
    [*] --> InInventory: Item Created
    InInventory --> Listed: Company Lists Item
    Listed --> Purchased: Player Buys
    Listed --> Delisted: Company Removes
    Listed --> Expired: Time Expires
    Purchased --> [*]: Item Destroyed
    Delisted --> InInventory: Back to Inventory
    Expired --> InInventory: Auto-Delist
    InInventory --> Consumed: Player Eats
    Consumed --> [*]: Item Destroyed
```

### Price Calculation Flow

```mermaid
graph TD
    A[Base Price: €1.00] --> B{Quality Tier?}
    B -->|Q1| C[€1.00 × 1.0 = €1.00]
    B -->|Q2| D[€1.00 × 2.5 = €2.50]
    B -->|Q3| E[€1.00 × 5.0 = €5.00]
    B -->|Q4| F[€1.00 × 10.0 = €10.00]
    B -->|Q5| G[€1.00 × 25.0 = €25.00]
    
    C --> H[Add VAT 10%]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Final Prices]
    I --> J[Q1: €1.10]
    I --> K[Q2: €2.75]
    I --> L[Q3: €5.50]
    I --> M[Q4: €11.00]
    I --> N[Q5: €27.50]
    
    style I fill:#d4edda
```

---

## ⚙️ SYSTEM INTEGRATION

### Module Dependencies

```mermaid
graph TB
    subgraph "Module 1: Infrastructure"
        M1A[FinancialMath]
        M1B[EconomyEngine]
        M1C[User Model]
        M1D[Treasury Model]
        M1E[Ledger Model]
    end
    
    subgraph "Module 2.1: Time & Entropy"
        M21A[GameClock]
        M21B[Life Engine]
        M21C[Macro Observer]
    end
    
    subgraph "Module 2.2: Work System"
        M22A[WorkCalculator]
        M22B[WorkService]
        M22C[Company Model]
    end
    
    subgraph "Module 2.3: Marketplace NEW"
        M23A[ItemPrototype]
        M23B[Inventory]
        M23C[Marketplace]
        M23D[Metabolism]
    end
    
    M23A --> M1A
    M23B --> M1A
    M23C --> M1B
    M23C --> M1D
    M23D --> M1C
    
    M22B --> M23B
    M21A --> M23C
    M21B --> M1C
    
    M23C --> M1E
    M23D --> M23B
    
    style M23A fill:#fff3cd
    style M23B fill:#fff3cd
    style M23C fill:#fff3cd
    style M23D fill:#fff3cd
```

### API Endpoint Map

```mermaid
graph LR
    subgraph "Client"
        UI[React Frontend]
    end
    
    subgraph "API Gateway Port 3000"
        GW[NGINX Proxy]
    end
    
    subgraph "Economy Server Port 3400"
        E1[/inventory]
        E2[/marketplace]
        E3[/consume]
        E4[/work]
        E5[/balance]
    end
    
    subgraph "Auth Server Port 3100"
        A1[/login]
        A2[/signup]
    end
    
    UI --> GW
    GW --> E1
    GW --> E2
    GW --> E3
    GW --> E4
    GW --> E5
    GW --> A1
    GW --> A2
    
    E1 --> DB[(MongoDB)]
    E2 --> DB
    E3 --> DB
    E4 --> DB
    E5 --> DB
    A1 --> DB
    A2 --> DB
```

---

## 📊 DATA FLOW DIAGRAMS

### Item Quality Scaling

```mermaid
graph TD
    A[ItemPrototype<br/>Base Effects] --> B{Quality Multiplier}
    
    B -->|Q1: 1.0x| C1[Energy: +5<br/>Price: €1.00]
    B -->|Q2: 2.0x| C2[Energy: +10<br/>Price: €2.50]
    B -->|Q3: 3.5x| C3[Energy: +18<br/>Price: €5.00]
    B -->|Q4: 5.5x| C4[Energy: +28<br/>Price: €10.00]
    B -->|Q5: 10.0x| C5[Energy: +50<br/>Price: €25.00]
    
    C1 --> D[Inventory Item]
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D
    
    D --> E[Player Consumes]
    E --> F[Energy Restored]
    
    style A fill:#e1f5ff
    style D fill:#fff3cd
    style F fill:#d4edda
```

### Money Flow Tracking

```mermaid
graph TD
    A[Company Treasury<br/>€1000] -->|Salary €10| B[Player Wallet<br/>€0]
    B -->|Tax €1.50| C[Government Treasury<br/>€0]
    B -->|Net €8.50| D[Player Balance<br/>€8.50]
    
    D -->|Purchase €1.10| E[Marketplace]
    E -->|Net €1.00| F[Seller Company<br/>€1000]
    E -->|VAT €0.10| C
    
    F -->|Salary €10| G[Another Player]
    
    C -->|Total Collected| H[€1.60 Tax Revenue]
    
    style A fill:#fff3cd
    style C fill:#d4edda
    style H fill:#d4edda
```

---

## 🔒 SECURITY LAYERS

### Anti-Fraud Architecture

```mermaid
graph TB
    A[User Request] --> B{Rate Limiter}
    B -->|Too Many| C[429 Error]
    B -->|OK| D{JWT Valid?}
    D -->|No| E[401 Error]
    D -->|Yes| F{Account Frozen?}
    F -->|Yes| G[403 Error]
    F -->|No| H{Input Valid?}
    H -->|No| I[400 Error]
    H -->|Yes| J{Balance Check}
    J -->|Insufficient| K[402 Error]
    J -->|OK| L[Start Transaction]
    L --> M{All Steps OK?}
    M -->|No| N[Rollback]
    M -->|Yes| O[Commit]
    O --> P[Create Ledger]
    P --> Q[Success Response]
    
    N --> R[Log Failure]
    R --> S[Alert Admin]
    
    style C fill:#f8d7da
    style E fill:#f8d7da
    style G fill:#f8d7da
    style I fill:#f8d7da
    style K fill:#f8d7da
    style Q fill:#d4edda
```

---

## 📱 FRONTEND COMPONENT HIERARCHY

### Dashboard Structure

```mermaid
graph TD
    A[Dashboard] --> B[Header]
    A --> C[Navigation Tabs]
    A --> D[Content Area]
    A --> E[Quick Stats Bar]
    
    B --> B1[User Info]
    B --> B2[Balance Display]
    B --> B3[Logout Button]
    
    C --> C1[Work Tab]
    C --> C2[Inventory Tab]
    C --> C3[Marketplace Tab]
    C --> C4[News Tab]
    
    D --> D1{Active Tab}
    D1 -->|Work| D2[WorkStation]
    D1 -->|Inventory| D3[InventoryPanel]
    D1 -->|Marketplace| D4[MarketplacePanel]
    D1 -->|News| D5[NewsFeed]
    
    D3 --> D3A[ItemCard]
    D3 --> D3B[ConsumeButton]
    D3 --> D3C[FilterDropdown]
    
    D4 --> D4A[ListingCard]
    D4 --> D4B[SearchBar]
    D4 --> D4C[CategoryTabs]
    D4 --> D4D[PurchaseModal]
    
    E --> E1[Money Icon]
    E --> E2[Energy Icon]
    E --> E3[Happiness Icon]
    E --> E4[Inventory Count]
    
    style A fill:#e1f5ff
    style D3 fill:#fff3cd
    style D4 fill:#fff3cd
```

---

## 🎯 IMPLEMENTATION PHASES

### Phase Timeline

```mermaid
gantt
    title Module 2.3 Implementation Timeline
    dateFormat YYYY-MM-DD
    section Phase 1: Foundation
    ItemPrototype Model           :a1, 2026-02-17, 2d
    Inventory Model               :a2, after a1, 2d
    Admin Endpoints               :a3, after a2, 2d
    InventoryPanel UI             :a4, after a3, 1d
    
    section Phase 2: Marketplace
    MarketplaceListing Model      :b1, after a4, 2d
    Marketplace Endpoints         :b2, after b1, 3d
    Purchase Transaction Logic    :b3, after b2, 2d
    MarketplacePanel UI           :b4, after b3, 2d
    
    section Phase 3: Consumption
    ConsumptionHistory Model      :c1, after b4, 1d
    Consumption Endpoints         :c2, after c1, 2d
    Metabolism Logic              :c3, after c2, 2d
    ConsumptionModal UI           :c4, after c3, 2d
    
    section Phase 4: Integration
    Work System Integration       :d1, after c4, 2d
    GameClock Integration         :d2, after d1, 2d
    Economic Balancing            :d3, after d2, 3d
    Admin Tools                   :d4, after d3, 2d
    
    section Phase 5: Testing
    Unit Tests                    :e1, after d4, 2d
    Integration Tests             :e2, after e1, 2d
    E2E Tests                     :e3, after e2, 2d
    Deployment                    :e4, after e3, 1d
```

---

## 📈 SUCCESS METRICS DASHBOARD

### Key Performance Indicators

```mermaid
graph LR
    subgraph "Technical KPIs"
        T1[API Response Time<br/>Target: <200ms]
        T2[Transaction Success<br/>Target: 100%]
        T3[Uptime<br/>Target: 99.9%]
    end
    
    subgraph "Economic KPIs"
        E1[Player Profit<br/>Target: +€5-10/day]
        E2[Treasury Growth<br/>Target: +€2-5/day]
        E3[Market Volume<br/>Target: €100+/day]
    end
    
    subgraph "User KPIs"
        U1[Session Time<br/>Target: 15+ min]
        U2[Daily Active<br/>Target: 50%+]
        U3[Retention<br/>Target: 60%+ at 7d]
    end
    
    T1 --> M[Monitoring<br/>Dashboard]
    T2 --> M
    T3 --> M
    E1 --> M
    E2 --> M
    E3 --> M
    U1 --> M
    U2 --> M
    U3 --> M
    
    M --> A[Alerts &<br/>Reports]
    
    style M fill:#d4edda
    style A fill:#fff3cd
```

---

## 🔄 CONTINUOUS IMPROVEMENT CYCLE

```mermaid
graph TD
    A[Deploy Module 2.3] --> B[Monitor Metrics]
    B --> C{Issues Found?}
    C -->|Yes| D[Analyze Root Cause]
    C -->|No| E[Gather Feedback]
    D --> F[Implement Fix]
    F --> A
    E --> G{Improvements Needed?}
    G -->|Yes| H[Plan Enhancement]
    G -->|No| I[Maintain Stability]
    H --> A
    I --> B
    
    style A fill:#e1f5ff
    style I fill:#d4edda
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-02-14  
**Purpose:** Visual reference for Module 2.3 architecture  
**Next Action:** Use these diagrams during implementation
