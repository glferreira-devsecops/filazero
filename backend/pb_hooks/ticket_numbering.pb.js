/// <reference path="../pb_data/types.d.ts" />

onModelBeforeCreate((e) => {
    // Only for tickets collection
    if (e.model.tableName() !== "tickets") return;

    const clinicId = e.model.get("clinicId");
    if (!clinicId) throw new BadRequestError("clinicId required");

    // VALIDATION: Ensure clinic exists in users collection
    try {
        // We scan "users" collection (Clinics are users in this MVP)
        // If "clinics" collection existed separately, we'd check that.
        e.dao.findRecordById("users", clinicId);
    } catch (err) {
        throw new BadRequestError("Invalid clinicId: Clinic does not exist.");
    }

    try {
        // Try atomic update with RETURNING
        // We use e.dao to participate in the transaction (if any, though creates are usually transactional)
        // Note: SQLite RETURNING clause is standard in recent versions.

        try {
            const result = e.dao.db().newQuery(`
                UPDATE sequences
                SET lastNumber = lastNumber + 1, updated = datetime('now')
                WHERE clinicId = {:clinicId}
                RETURNING lastNumber
            `).bind({ clinicId: clinicId }).one();

            e.model.set("number", result["lastNumber"]);
            return; // Success
        } catch (err) {
            // If error is "sql: no rows in result set", it means sequence doesn't exist.
            // Proceed to create.
        }

        // Create new sequence
        // We use a random ID.
        const newId = $security.randomString(15);
        // We don't need manual dates if we rely on DB defaults, but PB expects them usually.
        // Use SQLite datetime('now') for cleaner SQL

        e.dao.db().newQuery(`
            INSERT INTO sequences (id, clinicId, lastNumber, created, updated)
            VALUES ({:id}, {:clinicId}, 1, datetime('now'), datetime('now'))
        `).bind({
            id: newId,
            clinicId: clinicId
        }).execute();

        e.model.set("number", 1);

    } catch (err) {
        $app.logger().error("Sequence generation failed:", err);
        // If Unique constraint on INSERT (race condition), the request will fail.
        // Users will get an error and retry. This is better than duplicates.
        // For Scale, maybe retry loop here?
        // We can just let it fail for now to verify "No Duplicates".
        throw new BadRequestError("System busy, please retry ticket creation.");
    }

}, "tickets");
