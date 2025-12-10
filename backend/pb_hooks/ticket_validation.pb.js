/// <reference path="../pb_data/types.d.ts" />

onModelBeforeUpdate((e) => {
    if (e.model.tableName() !== "tickets") return;

    const oldStatus = e.model.original().get("status");
    const newStatus = e.model.get("status");

    // If status didn't change, ignore
    if (oldStatus === newStatus) return;

    const validTransitions = {
        "waiting": ["called", "cancelled"],
        "called": ["in_service", "cancelled", "waiting"], // re-queue allowed? maybe
        "in_service": ["done", "cancelled"],
        "done": [],
        "cancelled": []
    };

    const allowed = validTransitions[oldStatus];
    if (!allowed || !allowed.includes(newStatus)) {
        // Strict logic enforcement
        throw new BadRequestError(`Invalid status transition from ${oldStatus} to ${newStatus}`);
    }

    // Auto-update timestamps based on status
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ".000Z";

    if (newStatus === "called") e.model.set("calledAt", now);
    if (newStatus === "in_service") e.model.set("startedAt", now);
    if (newStatus === "done") e.model.set("finishedAt", now);

}, "tickets");
