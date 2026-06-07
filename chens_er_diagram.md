# RankMyList - Chen's ER Model

This diagram uses the classic **Chen's Notation** to represent the logical structure of the database.

```mermaid
flowchart TD
    %% Entities (Rectangles)
    User[<center><b>USER</b></center>]:::entity
    Review[<center><b>REVIEW</b></center>]:::entity
    MyList[<center><b>MYLIST</b></center>]:::entity
    TierList[<center><b>TIERLIST</b></center>]:::entity

    %% Relationships (Diamonds)
    Writes{<center>Writes</center>}:::relation
    Curates{<center>Curates</center>}:::relation
    Ranks{<center>Ranks</center>}:::relation

    %% Attributes for User (Ovals)
    U1((<u>_id</u>)):::attr --- User
    U2((username)):::attr --- User
    U3((email)):::attr --- User
    U4((password)):::attr --- User
    U5((role)):::attr --- User

    %% Attributes for Review
    R1((<u>_id</u>)):::attr --- Review
    R2((movieId)):::attr --- Review
    R3((rating)):::attr --- Review
    R4((comment)):::attr --- Review
    R5((userName)):::attr --- Review

    %% Attributes for MyList
    M1((<u>_id</u>)):::attr --- MyList
    M2((movieId)):::attr --- MyList
    M3((status)):::attr --- MyList
    M4((title)):::attr --- MyList
    M5((personalRating)):::attr --- MyList

    %% Attributes for TierList
    T1((<u>_id</u>)):::attr --- TierList
    T2((tiers)):::attr --- TierList
    T3((pool)):::attr --- TierList
    T4((name)):::attr --- TierList

    %% Connections (Relationships)
    User ===|1| Writes ===|N| Review
    User ===|1| Curates ===|N| MyList
    User ===|1| Ranks ===|1| TierList

    %% Styling
    classDef entity fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef relation fill:#fff9c4,stroke:#fbc02d,stroke-width:2px;
    classDef attr fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;
```

---

## 🧭 Legend of Symbols

| Shape | Meaning | Example in Diagram |
| :--- | :--- | :--- |
| **Rectangle** | **Entity**: A major object or "thing" in the system. | `USER`, `REVIEW` |
| **Diamond** | **Relationship**: How two entities connect or interact. | `Writes`, `Curates` |
| **Oval** | **Attribute**: A property or data field of an entity. | `email`, `rating` |
| **Double Oval** | **Multi-valued Attribute** | (e.g., if a user had multiple phone numbers) |
| **Underlined** | **Primary Key**: The unique identifier for the record. | `_id` |

---

## 📈 Relationship Summary

1.  **User Writes Review (1:N)**: A single user can author many reviews, but each review is tied to one specific user.
2.  **User Curates MyList (1:N)**: A user maintains a collection of "Watched" or "Plan to Watch" entries. Each entry is a unique record.
3.  **User Ranks TierList (1:1)**: Every user gets one personalized movie ranking board to organize their top picks.
