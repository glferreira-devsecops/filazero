/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("tickets");

    // Public Access
    collection.listRule = "";
    collection.viewRule = "";
    collection.createRule = "";

    // Strict Ownership
    // Only the clinic that owns the ticket (clinicId matches User ID) can update/delete.
    // Admins always bypass this.
    collection.updateRule = "clinicId = @request.auth.id";
    collection.deleteRule = "clinicId = @request.auth.id";

    return dao.saveCollection(collection);
}, (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("tickets");

    collection.listRule = "";
    collection.viewRule = "";
    collection.createRule = "";
    collection.updateRule = "";
    collection.deleteRule = "";

    return dao.saveCollection(collection);
})
