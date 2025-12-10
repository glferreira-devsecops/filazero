/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
    const collection = new Collection({
        name: "sequences",
        type: "base",
        schema: [
            {
                name: "clinicId",
                type: "text",
                required: true,
                options: {},
            },
            {
                name: "lastNumber",
                type: "number",
                required: true,
                options: {},
            }
        ],
        indexes: [
            "CREATE UNIQUE INDEX idx_sequences_clinic ON sequences (clinicId)"
        ]
    });

    return Dao(db).saveCollection(collection);
}, (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("sequences");

    return dao.deleteCollection(collection);
})
